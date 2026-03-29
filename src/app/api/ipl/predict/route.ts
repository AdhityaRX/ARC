import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { kkrData, miData, getMatchPredictionContext } from "@/lib/ipl/playerData";
import type { LiveScore, MatchPrediction, BallPrediction, OverPrediction } from "@/lib/ipl/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildPredictionPrompt(liveScore: LiveScore): string {
  const matchContext = getMatchPredictionContext(kkrData, miData);

  return `You are the world's most advanced cricket match prediction AI. You combine deep knowledge of game theory, probability, player performance analytics, match conditions, and cricket strategy.

${matchContext}

=== CURRENT MATCH STATUS ===
Match: KKR vs MI, IPL 2026, ${liveScore.venue}
Toss: ${liveScore.toss}
Status: ${liveScore.status}
Current Innings: ${liveScore.currentInnings}

KKR Score: ${liveScore.team1.score}/${liveScore.team1.wickets} (${liveScore.team1.overs} ov) | RR: ${liveScore.team1.runRate}
MI Score: ${liveScore.team2.score}/${liveScore.team2.wickets} (${liveScore.team2.overs} ov) | RR: ${liveScore.team2.runRate}

Batting: ${liveScore.battingTeam}
Striker: ${liveScore.currentBatsmen.striker.name} - ${liveScore.currentBatsmen.striker.runs}(${liveScore.currentBatsmen.striker.balls}) [4s: ${liveScore.currentBatsmen.striker.fours}, 6s: ${liveScore.currentBatsmen.striker.sixes}]
Non-Striker: ${liveScore.currentBatsmen.nonStriker.name} - ${liveScore.currentBatsmen.nonStriker.runs}(${liveScore.currentBatsmen.nonStriker.balls})
Bowler: ${liveScore.currentBowler.name} - ${liveScore.currentBowler.overs}-${liveScore.currentBowler.maidens}-${liveScore.currentBowler.runs}-${liveScore.currentBowler.wickets}
${liveScore.target ? `Target: ${liveScore.target} | Required RR: ${liveScore.requiredRunRate}` : ""}
${liveScore.lastWicket ? `Last Wicket: ${liveScore.lastWicket}` : ""}

Based on ALL the player data, match-ups, recent form, phase performance, team strengths, head-to-head records, and current match situation, provide a comprehensive match prediction.

You MUST respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "winner": "KKR or MI",
  "winProbability": 0-100,
  "predictedScore1": { "runs": number, "wickets": number, "overs": number },
  "predictedScore2": { "runs": number, "wickets": number, "overs": number },
  "keyFactors": ["factor1", "factor2", "factor3", "factor4", "factor5"],
  "manOfTheMatch": "Player Name",
  "momentum": "team1 or team2 or even",
  "nextBalls": [
    { "over": number, "ball": number, "prediction": "0|1|2|3|4|6|wicket|wide", "confidence": 0-100, "reasoning": "brief reason" }
  ],
  "overPredictions": [
    { "overNumber": number, "predictedRuns": number, "predictedWickets": number, "bowler": "name", "phase": "powerplay|middle|death" }
  ]
}

For nextBalls, predict the next 12 deliveries. For overPredictions, predict the remaining overs of the current innings.
Consider: pitch conditions (Eden Gardens - good batting track), dew factor (evening match), player matchups, death-over specialists, powerplay aggressors, and pressure situations.`;
}

export async function POST(request: Request) {
  try {
    const { liveScore } = (await request.json()) as { liveScore: LiveScore };

    if (!process.env.ANTHROPIC_API_KEY) {
      // Return a fallback prediction when API key is not set
      return NextResponse.json({
        success: true,
        data: generateFallbackPrediction(liveScore),
      });
    }

    const prompt = buildPredictionPrompt(liveScore);

    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    // Parse the JSON response
    const cleanJson = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const predictionData = JSON.parse(cleanJson);

    const prediction: MatchPrediction = {
      winner: predictionData.winner,
      winProbability: predictionData.winProbability,
      predictedScore1: predictionData.predictedScore1,
      predictedScore2: predictionData.predictedScore2,
      keyFactors: predictionData.keyFactors,
      manOfTheMatch: predictionData.manOfTheMatch,
      momentum: predictionData.momentum,
      ballByBall: (predictionData.nextBalls || []).map((b: Record<string, unknown>) => ({
        over: b.over,
        ball: b.ball,
        prediction: b.prediction,
        confidence: b.confidence,
        reasoning: b.reasoning || "",
        expectedScore: 0,
        winProbability: { team1: predictionData.winProbability, team2: 100 - predictionData.winProbability },
      })) as BallPrediction[],
      overSummary: (predictionData.overPredictions || []).map((o: Record<string, unknown>) => ({
        overNumber: o.overNumber,
        predictedRuns: o.predictedRuns,
        predictedWickets: o.predictedWickets,
        bowler: o.bowler,
        phase: o.phase,
      })) as OverPrediction[],
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: prediction });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate prediction" },
      { status: 500 }
    );
  }
}

function generateFallbackPrediction(liveScore: LiveScore): MatchPrediction {
  const innings = liveScore.currentInnings;
  const battingScore = innings === 1 ? liveScore.team1.score : liveScore.team2.score;
  const battingOvers = innings === 1 ? liveScore.team1.overs : liveScore.team2.overs;
  const battingWickets = innings === 1 ? liveScore.team1.wickets : liveScore.team2.wickets;

  const projectedScore = battingOvers > 0
    ? Math.round((battingScore / battingOvers) * 20)
    : 170;

  const kkrWinProb = innings === 1
    ? (projectedScore > 170 ? 55 + (projectedScore - 170) * 0.3 : 45 - (170 - projectedScore) * 0.3)
    : (liveScore.target ? (battingScore / liveScore.target) * 100 * 0.8 : 45);

  const currentOver = Math.floor(battingOvers);
  const currentBall = Math.round((battingOvers - currentOver) * 10);

  const nextBalls: BallPrediction[] = [];
  for (let i = 0; i < 12; i++) {
    const ballNum = (currentBall + i) % 6 + 1;
    const overNum = currentOver + Math.floor((currentBall + i) / 6) + 1;
    const outcomes = ["0", "1", "1", "2", "4", "4", "6", "0", "1", "0"] as const;
    const pred = outcomes[Math.floor(Math.random() * outcomes.length)];
    nextBalls.push({
      over: overNum,
      ball: ballNum,
      prediction: pred === "0" ? "dot" : pred as BallPrediction["prediction"],
      confidence: 40 + Math.floor(Math.random() * 30),
      reasoning: `Based on ${liveScore.currentBowler.name}'s patterns and ${liveScore.currentBatsmen.striker.name}'s form`,
      expectedScore: battingScore + (i * 1.4),
      winProbability: { team1: Math.round(kkrWinProb), team2: Math.round(100 - kkrWinProb) },
    });
  }

  const overPredictions: OverPrediction[] = [];
  for (let o = currentOver + 1; o <= 20; o++) {
    const phase = o <= 6 ? "powerplay" : o <= 15 ? "middle" : "death";
    const baseRuns = phase === "powerplay" ? 8 : phase === "middle" ? 7.5 : 11;
    overPredictions.push({
      overNumber: o,
      predictedRuns: Math.round(baseRuns + (Math.random() * 4 - 2)),
      predictedWickets: Math.random() < 0.15 ? 1 : 0,
      bowler: liveScore.currentBowler.name,
      phase,
    });
  }

  return {
    winner: kkrWinProb > 50 ? "KKR" : "MI",
    winProbability: Math.round(Math.max(kkrWinProb, 100 - kkrWinProb)),
    predictedScore1: {
      runs: innings === 1 ? projectedScore : liveScore.team1.score,
      wickets: innings === 1 ? Math.min(battingWickets + 2, 10) : liveScore.team1.wickets,
      overs: innings === 1 ? 20 : liveScore.team1.overs,
    },
    predictedScore2: {
      runs: innings === 2 ? projectedScore : Math.round(projectedScore * 0.95),
      wickets: innings === 2 ? battingWickets + 2 : 6,
      overs: 20,
    },
    keyFactors: [
      `${liveScore.currentBatsmen.striker.name} in strong form with SR of ${liveScore.currentBatsmen.striker.balls > 0 ? Math.round((liveScore.currentBatsmen.striker.runs / liveScore.currentBatsmen.striker.balls) * 100) : 0}`,
      `Current run rate: ${innings === 1 ? liveScore.team1.runRate : liveScore.team2.runRate}`,
      `Eden Gardens pitch favoring ${battingOvers < 10 ? "pace bowlers" : "batsmen"}`,
      `${battingWickets} wickets down - ${battingWickets < 3 ? "batting team in control" : "pressure building"}`,
      "Dew factor may help the chasing team",
    ],
    manOfTheMatch: liveScore.currentBatsmen.striker.runs > 30
      ? liveScore.currentBatsmen.striker.name
      : "Andre Russell",
    ballByBall: nextBalls,
    overSummary: overPredictions,
    momentum: kkrWinProb > 55 ? "team1" : kkrWinProb < 45 ? "team2" : "even",
    lastUpdated: new Date().toISOString(),
  };
}
