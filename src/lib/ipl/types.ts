// IPL Match Predictor Types

export interface LiveScore {
  matchId: string;
  status: "not_started" | "live" | "innings_break" | "completed";
  venue: string;
  toss: string;

  team1: {
    name: string;
    shortName: string;
    score: number;
    wickets: number;
    overs: number;
    runRate: number;
    extras: number;
  };

  team2: {
    name: string;
    shortName: string;
    score: number;
    wickets: number;
    overs: number;
    runRate: number;
    extras: number;
  };

  currentInnings: 1 | 2;
  battingTeam: string;
  bowlingTeam: string;

  currentBatsmen: {
    striker: { name: string; runs: number; balls: number; fours: number; sixes: number };
    nonStriker: { name: string; runs: number; balls: number; fours: number; sixes: number };
  };

  currentBowler: {
    name: string;
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
    economy: number;
  };

  recentOvers: string[];
  lastWicket?: string;
  requiredRunRate?: number;
  target?: number;

  lastUpdated: string;
}

export interface BallPrediction {
  over: number;
  ball: number;
  prediction: "dot" | "1" | "2" | "3" | "4" | "6" | "wicket" | "wide" | "no_ball";
  confidence: number;
  reasoning: string;
  expectedScore: number;
  winProbability: { team1: number; team2: number };
}

export interface MatchPrediction {
  winner: string;
  winProbability: number;
  predictedScore1: { runs: number; wickets: number; overs: number };
  predictedScore2?: { runs: number; wickets: number; overs: number };
  keyFactors: string[];
  manOfTheMatch: string;
  ballByBall: BallPrediction[];
  overSummary: OverPrediction[];
  momentum: "team1" | "team2" | "even";
  lastUpdated: string;
}

export interface OverPrediction {
  overNumber: number;
  predictedRuns: number;
  predictedWickets: number;
  bowler: string;
  phase: "powerplay" | "middle" | "death";
}

export interface PredictionUpdate {
  type: "score_update" | "prediction_update" | "ball_prediction" | "match_status";
  data: LiveScore | MatchPrediction | BallPrediction;
  timestamp: string;
}
