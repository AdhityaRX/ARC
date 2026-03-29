import { NextResponse } from "next/server";
import type { LiveScore } from "@/lib/ipl/types";

// Simulated live score that updates realistically
// In production, this would fetch from a cricket API like CricAPI or ESPNcricinfo
let matchState: LiveScore = {
  matchId: "ipl-2026-kkr-vs-mi",
  status: "live",
  venue: "Eden Gardens, Kolkata",
  toss: "KKR won the toss and elected to bat first",

  team1: {
    name: "Kolkata Knight Riders",
    shortName: "KKR",
    score: 0,
    wickets: 0,
    overs: 0,
    runRate: 0,
    extras: 0,
  },

  team2: {
    name: "Mumbai Indians",
    shortName: "MI",
    score: 0,
    wickets: 0,
    overs: 0,
    runRate: 0,
    extras: 0,
  },

  currentInnings: 1,
  battingTeam: "KKR",
  bowlingTeam: "MI",

  currentBatsmen: {
    striker: { name: "Phil Salt", runs: 0, balls: 0, fours: 0, sixes: 0 },
    nonStriker: { name: "Sunil Narine", runs: 0, balls: 0, fours: 0, sixes: 0 },
  },

  currentBowler: {
    name: "Jasprit Bumrah",
    overs: 0,
    maidens: 0,
    runs: 0,
    wickets: 0,
    economy: 0,
  },

  recentOvers: [],
  lastUpdated: new Date().toISOString(),
};

let ballCount = 0;
let lastUpdateTime = Date.now();

const KKR_BATTING_ORDER = [
  "Phil Salt", "Sunil Narine", "Venkatesh Iyer", "Rinku Singh",
  "Andre Russell", "Angkrish Raghuvanshi", "Ramandeep Singh",
  "Varun Chakravarthy", "Harshit Rana", "Mitchell Starc", "Vaibhav Arora"
];

const MI_BOWLERS = [
  { name: "Jasprit Bumrah", style: "fast", economy: 7.4 },
  { name: "Trent Boult", style: "fast", economy: 8.1 },
  { name: "Deepak Chahar", style: "medium-fast", economy: 7.8 },
  { name: "Gerald Coetzee", style: "fast", economy: 9.5 },
  { name: "Piyush Chawla", style: "spin", economy: 7.8 },
  { name: "Hardik Pandya", style: "medium", economy: 8.8 },
];

function simulateBall(): string {
  const rand = Math.random();
  if (rand < 0.30) return "0"; // dot ball 30%
  if (rand < 0.50) return "1"; // single 20%
  if (rand < 0.60) return "2"; // double 10%
  if (rand < 0.62) return "3"; // triple 2%
  if (rand < 0.76) return "4"; // four 14%
  if (rand < 0.86) return "6"; // six 10%
  if (rand < 0.92) return "W"; // wicket 6%
  if (rand < 0.96) return "wd"; // wide 4%
  return "nb"; // no ball 4%
}

function advanceMatch() {
  const now = Date.now();
  // Auto-advance every 10 seconds
  if (now - lastUpdateTime < 8000) return;
  lastUpdateTime = now;

  if (matchState.status !== "live") return;

  const battingTeam = matchState.currentInnings === 1 ? matchState.team1 : matchState.team2;
  const currentOver = Math.floor(battingTeam.overs);
  const currentBallInOver = Math.round((battingTeam.overs - currentOver) * 10);

  if (battingTeam.overs >= 20 || battingTeam.wickets >= 10) {
    if (matchState.currentInnings === 1) {
      matchState.currentInnings = 2;
      matchState.battingTeam = "MI";
      matchState.bowlingTeam = "KKR";
      matchState.target = battingTeam.score + 1;
      matchState.status = "live";
      matchState.currentBatsmen = {
        striker: { name: "Rohit Sharma", runs: 0, balls: 0, fours: 0, sixes: 0 },
        nonStriker: { name: "Ishan Kishan", runs: 0, balls: 0, fours: 0, sixes: 0 },
      };
      matchState.currentBowler = {
        name: "Mitchell Starc", overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0,
      };
      matchState.recentOvers = [];
    } else {
      matchState.status = "completed";
    }
    matchState.lastUpdated = new Date().toISOString();
    return;
  }

  // Simulate a ball
  const result = simulateBall();
  ballCount++;

  let runs = 0;
  let isExtra = false;
  let isWicket = false;

  switch (result) {
    case "0": runs = 0; break;
    case "1": runs = 1; break;
    case "2": runs = 2; break;
    case "3": runs = 3; break;
    case "4": runs = 4; matchState.currentBatsmen.striker.fours++; break;
    case "6": runs = 6; matchState.currentBatsmen.striker.sixes++; break;
    case "W": isWicket = true; break;
    case "wd": runs = 1; isExtra = true; battingTeam.extras++; break;
    case "nb": runs = 1; isExtra = true; battingTeam.extras++; break;
  }

  battingTeam.score += runs;
  if (!isExtra && !isWicket) {
    matchState.currentBatsmen.striker.runs += runs;
    matchState.currentBatsmen.striker.balls++;
  }

  if (isWicket) {
    battingTeam.wickets++;
    matchState.currentBatsmen.striker.balls++;
    const wicketNum = battingTeam.wickets;
    matchState.lastWicket = `${matchState.currentBatsmen.striker.name} ${matchState.currentBatsmen.striker.runs}(${matchState.currentBatsmen.striker.balls})`;

    matchState.currentBowler.wickets++;

    if (matchState.currentInnings === 1 && wicketNum < 10) {
      const nextBatter = KKR_BATTING_ORDER[wicketNum + 1] || "Unknown";
      matchState.currentBatsmen.striker = { name: nextBatter, runs: 0, balls: 0, fours: 0, sixes: 0 };
    } else if (wicketNum < 10) {
      const MI_BATTING = ["Rohit Sharma", "Ishan Kishan", "Suryakumar Yadav", "Tilak Varma", "Hardik Pandya", "Naman Dhir", "Deepak Chahar", "Gerald Coetzee", "Piyush Chawla", "Trent Boult", "Jasprit Bumrah"];
      const nextBatter = MI_BATTING[wicketNum + 1] || "Unknown";
      matchState.currentBatsmen.striker = { name: nextBatter, runs: 0, balls: 0, fours: 0, sixes: 0 };
    }
  }

  // Update overs (not for wides/no-balls)
  if (!isExtra) {
    const newBallInOver = currentBallInOver + 1;
    if (newBallInOver >= 6) {
      battingTeam.overs = currentOver + 1;
      // Rotate strike
      const temp = matchState.currentBatsmen.striker;
      matchState.currentBatsmen.striker = matchState.currentBatsmen.nonStriker;
      matchState.currentBatsmen.nonStriker = temp;
      // Change bowler
      const bowlerIdx = (currentOver + 1) % MI_BOWLERS.length;
      const nextBowler = matchState.currentInnings === 1 ? MI_BOWLERS[bowlerIdx] : { name: KKR_BATTING_ORDER[7 + (bowlerIdx % 4)], style: "varies", economy: 8.5 };
      matchState.currentBowler = {
        name: nextBowler.name,
        overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0,
      };
      matchState.recentOvers.push(result);
      if (matchState.recentOvers.length > 30) matchState.recentOvers.shift();
    } else {
      battingTeam.overs = currentOver + newBallInOver / 10;
    }
  }

  // Rotate strike on odd runs
  if (runs % 2 === 1 && !isExtra) {
    const temp = matchState.currentBatsmen.striker;
    matchState.currentBatsmen.striker = matchState.currentBatsmen.nonStriker;
    matchState.currentBatsmen.nonStriker = temp;
  }

  battingTeam.runRate = battingTeam.overs > 0
    ? Math.round((battingTeam.score / battingTeam.overs) * 100) / 100
    : 0;

  if (matchState.currentInnings === 2 && matchState.target) {
    const remainingRuns = matchState.target - battingTeam.score;
    const remainingOvers = 20 - battingTeam.overs;
    matchState.requiredRunRate = remainingOvers > 0
      ? Math.round((remainingRuns / remainingOvers) * 100) / 100
      : 0;

    // Check if chasing team won
    if (battingTeam.score >= matchState.target) {
      matchState.status = "completed";
    }
  }

  // Update bowler stats
  matchState.currentBowler.runs += runs;
  if (!isExtra) {
    const bowlerBalls = Math.round(matchState.currentBowler.overs * 10) % 10;
    if (bowlerBalls + 1 >= 6) {
      matchState.currentBowler.overs = Math.floor(matchState.currentBowler.overs) + 1;
    } else {
      matchState.currentBowler.overs = Math.floor(matchState.currentBowler.overs) + (bowlerBalls + 1) / 10;
    }
    matchState.currentBowler.economy = matchState.currentBowler.overs > 0
      ? Math.round((matchState.currentBowler.runs / matchState.currentBowler.overs) * 100) / 100
      : 0;
  }

  matchState.lastUpdated = new Date().toISOString();
}

export async function GET() {
  advanceMatch();

  return NextResponse.json({
    success: true,
    data: matchState,
    ballCount,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.reset) {
      ballCount = 0;
      lastUpdateTime = Date.now();
      matchState = {
        matchId: "ipl-2026-kkr-vs-mi",
        status: "live",
        venue: "Eden Gardens, Kolkata",
        toss: "KKR won the toss and elected to bat first",
        team1: {
          name: "Kolkata Knight Riders", shortName: "KKR",
          score: 0, wickets: 0, overs: 0, runRate: 0, extras: 0,
        },
        team2: {
          name: "Mumbai Indians", shortName: "MI",
          score: 0, wickets: 0, overs: 0, runRate: 0, extras: 0,
        },
        currentInnings: 1,
        battingTeam: "KKR",
        bowlingTeam: "MI",
        currentBatsmen: {
          striker: { name: "Phil Salt", runs: 0, balls: 0, fours: 0, sixes: 0 },
          nonStriker: { name: "Sunil Narine", runs: 0, balls: 0, fours: 0, sixes: 0 },
        },
        currentBowler: {
          name: "Jasprit Bumrah",
          overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0,
        },
        recentOvers: [],
        lastUpdated: new Date().toISOString(),
      };
    }
    return NextResponse.json({ success: true, data: matchState });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
