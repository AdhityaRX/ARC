// Comprehensive IPL 2026 Player Data for KKR and Mumbai Indians
// Based on historical performance, recent form, and career statistics

export interface PlayerStats {
  name: string;
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper";
  battingStyle: string;
  bowlingStyle?: string;
  nationality: string;
  isCaptain?: boolean;
  isKeeper?: boolean;

  // Batting Stats
  batting: {
    matches: number;
    innings: number;
    runs: number;
    highScore: number;
    average: number;
    strikeRate: number;
    fifties: number;
    hundreds: number;
    fours: number;
    sixes: number;
    dotBallPct: number;
    boundaryPct: number;
  };

  // Bowling Stats (if applicable)
  bowling?: {
    matches: number;
    innings: number;
    wickets: number;
    economy: number;
    average: number;
    strikeRate: number;
    bestFigures: string;
    dotBallPct: number;
    foursConceded: number;
    sixesConceded: number;
  };

  // Recent Form (last 5 matches)
  recentForm: {
    scores: number[];
    wickets?: number[];
    avgLast5: number;
    srLast5: number;
    trend: "rising" | "stable" | "declining";
  };

  // Matchup Data
  matchups: {
    vsTeam: string;
    matches: number;
    runs: number;
    average: number;
    strikeRate: number;
    wickets?: number;
  };

  // Phase Performance
  phases: {
    powerplay: { sr: number; avg: number };
    middle: { sr: number; avg: number };
    death: { sr: number; avg: number };
  };
}

export interface TeamData {
  name: string;
  shortName: string;
  color: string;
  secondaryColor: string;
  logo: string;
  captain: string;
  coach: string;

  // Team Stats
  stats: {
    totalMatches: number;
    wins: number;
    losses: number;
    winPct: number;
    avgFirstInningsScore: number;
    avgSecondInningsScore: number;
    avgPowerplayScore: number;
    avgDeathOverRuns: number;
    highestTotal: number;
    lowestTotal: number;
    titlesWon: number;
  };

  // Head to Head
  h2h: {
    matches: number;
    wins: number;
    losses: number;
    lastResult: string;
  };

  players: PlayerStats[];
}

// ============================================================
// KOLKATA KNIGHT RIDERS (KKR) — IPL 2026 Squad
// ============================================================
export const kkrData: TeamData = {
  name: "Kolkata Knight Riders",
  shortName: "KKR",
  color: "#3A225D",
  secondaryColor: "#D4AF37",
  logo: "/kkr-logo.png",
  captain: "Venkatesh Iyer",
  coach: "Chandrakant Pandit",

  stats: {
    totalMatches: 258,
    wins: 138,
    losses: 115,
    winPct: 54.5,
    avgFirstInningsScore: 172,
    avgSecondInningsScore: 165,
    avgPowerplayScore: 48,
    avgDeathOverRuns: 56,
    highestTotal: 272,
    lowestTotal: 84,
    titlesWon: 3,
  },

  h2h: {
    matches: 36,
    wins: 16,
    losses: 18,
    lastResult: "KKR won by 24 runs",
  },

  players: [
    {
      name: "Venkatesh Iyer",
      role: "All-rounder",
      battingStyle: "Left-hand bat",
      bowlingStyle: "Right-arm medium",
      nationality: "Indian",
      isCaptain: true,
      batting: {
        matches: 52, innings: 48, runs: 1340, highScore: 104,
        average: 30.5, strikeRate: 138.5, fifties: 8, hundreds: 1,
        fours: 128, sixes: 54, dotBallPct: 32, boundaryPct: 42,
      },
      bowling: {
        matches: 52, innings: 38, wickets: 18, economy: 8.9,
        average: 38.2, strikeRate: 25.8, bestFigures: "3/20",
        dotBallPct: 35, foursConceded: 45, sixesConceded: 22,
      },
      recentForm: {
        scores: [45, 28, 67, 12, 55],
        wickets: [0, 1, 0, 2, 0],
        avgLast5: 41.4, srLast5: 142.0, trend: "stable",
      },
      matchups: {
        vsTeam: "MI", matches: 10, runs: 285,
        average: 31.7, strikeRate: 135.7, wickets: 3,
      },
      phases: {
        powerplay: { sr: 145, avg: 28 },
        middle: { sr: 132, avg: 34 },
        death: { sr: 155, avg: 22 },
      },
    },
    {
      name: "Sunil Narine",
      role: "All-rounder",
      battingStyle: "Left-hand bat",
      bowlingStyle: "Right-arm off-break",
      nationality: "West Indian",
      batting: {
        matches: 178, innings: 150, runs: 3200, highScore: 109,
        average: 24.8, strikeRate: 168.5, fifties: 12, hundreds: 1,
        fours: 280, sixes: 210, dotBallPct: 28, boundaryPct: 48,
      },
      bowling: {
        matches: 178, innings: 170, wickets: 165, economy: 6.6,
        average: 26.3, strikeRate: 23.9, bestFigures: "4/21",
        dotBallPct: 48, foursConceded: 120, sixesConceded: 85,
      },
      recentForm: {
        scores: [38, 85, 22, 44, 61],
        wickets: [2, 1, 3, 0, 2],
        avgLast5: 50.0, srLast5: 175.2, trend: "rising",
      },
      matchups: {
        vsTeam: "MI", matches: 25, runs: 580,
        average: 26.4, strikeRate: 172.0, wickets: 28,
      },
      phases: {
        powerplay: { sr: 185, avg: 22 },
        middle: { sr: 148, avg: 28 },
        death: { sr: 165, avg: 18 },
      },
    },
    {
      name: "Angkrish Raghuvanshi",
      role: "Batsman",
      battingStyle: "Left-hand bat",
      nationality: "Indian",
      batting: {
        matches: 18, innings: 16, runs: 380, highScore: 68,
        average: 25.3, strikeRate: 142.8, fifties: 3, hundreds: 0,
        fours: 42, sixes: 16, dotBallPct: 30, boundaryPct: 40,
      },
      recentForm: {
        scores: [32, 15, 68, 44, 8],
        avgLast5: 33.4, srLast5: 138.5, trend: "stable",
      },
      matchups: {
        vsTeam: "MI", matches: 3, runs: 72,
        average: 24.0, strikeRate: 130.9,
      },
      phases: {
        powerplay: { sr: 148, avg: 26 },
        middle: { sr: 135, avg: 28 },
        death: { sr: 155, avg: 18 },
      },
    },
    {
      name: "Rinku Singh",
      role: "Batsman",
      battingStyle: "Left-hand bat",
      nationality: "Indian",
      batting: {
        matches: 65, innings: 58, runs: 1450, highScore: 82,
        average: 32.2, strikeRate: 148.6, fifties: 10, hundreds: 0,
        fours: 118, sixes: 72, dotBallPct: 26, boundaryPct: 45,
      },
      recentForm: {
        scores: [42, 58, 33, 71, 25],
        avgLast5: 45.8, srLast5: 155.2, trend: "rising",
      },
      matchups: {
        vsTeam: "MI", matches: 12, runs: 310,
        average: 34.4, strikeRate: 152.7,
      },
      phases: {
        powerplay: { sr: 130, avg: 22 },
        middle: { sr: 142, avg: 35 },
        death: { sr: 178, avg: 28 },
      },
    },
    {
      name: "Andre Russell",
      role: "All-rounder",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm fast",
      nationality: "West Indian",
      batting: {
        matches: 118, innings: 102, runs: 2400, highScore: 88,
        average: 28.6, strikeRate: 177.3, fifties: 10, hundreds: 0,
        fours: 165, sixes: 195, dotBallPct: 24, boundaryPct: 52,
      },
      bowling: {
        matches: 118, innings: 95, wickets: 95, economy: 9.2,
        average: 28.5, strikeRate: 18.6, bestFigures: "5/15",
        dotBallPct: 38, foursConceded: 88, sixesConceded: 62,
      },
      recentForm: {
        scores: [55, 12, 38, 62, 18],
        wickets: [1, 2, 0, 3, 1],
        avgLast5: 37.0, srLast5: 185.0, trend: "stable",
      },
      matchups: {
        vsTeam: "MI", matches: 18, runs: 480,
        average: 32.0, strikeRate: 182.5, wickets: 15,
      },
      phases: {
        powerplay: { sr: 160, avg: 20 },
        middle: { sr: 165, avg: 30 },
        death: { sr: 205, avg: 25 },
      },
    },
    {
      name: "Ramandeep Singh",
      role: "All-rounder",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm medium",
      nationality: "Indian",
      batting: {
        matches: 28, innings: 22, runs: 380, highScore: 56,
        average: 21.1, strikeRate: 152.6, fifties: 2, hundreds: 0,
        fours: 35, sixes: 22, dotBallPct: 30, boundaryPct: 42,
      },
      bowling: {
        matches: 28, innings: 15, wickets: 8, economy: 9.5,
        average: 35.0, strikeRate: 22.1, bestFigures: "2/18",
        dotBallPct: 30, foursConceded: 18, sixesConceded: 12,
      },
      recentForm: {
        scores: [18, 42, 8, 56, 22],
        avgLast5: 29.2, srLast5: 158.0, trend: "stable",
      },
      matchups: {
        vsTeam: "MI", matches: 5, runs: 85,
        average: 21.3, strikeRate: 145.0,
      },
      phases: {
        powerplay: { sr: 140, avg: 18 },
        middle: { sr: 148, avg: 24 },
        death: { sr: 175, avg: 20 },
      },
    },
    {
      name: "Varun Chakravarthy",
      role: "Bowler",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm leg-break",
      nationality: "Indian",
      batting: {
        matches: 62, innings: 12, runs: 45, highScore: 12,
        average: 5.0, strikeRate: 85.0, fifties: 0, hundreds: 0,
        fours: 4, sixes: 1, dotBallPct: 55, boundaryPct: 15,
      },
      bowling: {
        matches: 62, innings: 60, wickets: 78, economy: 7.2,
        average: 23.8, strikeRate: 19.8, bestFigures: "5/17",
        dotBallPct: 45, foursConceded: 58, sixesConceded: 38,
      },
      recentForm: {
        scores: [0, 2, 0, 0, 4],
        wickets: [3, 1, 2, 4, 1],
        avgLast5: 1.2, srLast5: 60.0, trend: "stable",
      },
      matchups: {
        vsTeam: "MI", matches: 12, runs: 8,
        average: 2.0, strikeRate: 65.0, wickets: 16,
      },
      phases: {
        powerplay: { sr: 0, avg: 0 },
        middle: { sr: 0, avg: 0 },
        death: { sr: 0, avg: 0 },
      },
    },
    {
      name: "Harshit Rana",
      role: "Bowler",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm fast",
      nationality: "Indian",
      batting: {
        matches: 22, innings: 8, runs: 65, highScore: 22,
        average: 10.8, strikeRate: 120.0, fifties: 0, hundreds: 0,
        fours: 6, sixes: 3, dotBallPct: 40, boundaryPct: 30,
      },
      bowling: {
        matches: 22, innings: 22, wickets: 28, economy: 9.1,
        average: 28.2, strikeRate: 18.6, bestFigures: "3/24",
        dotBallPct: 38, foursConceded: 32, sixesConceded: 18,
      },
      recentForm: {
        scores: [4, 0, 12, 0, 2],
        wickets: [2, 1, 3, 0, 2],
        avgLast5: 3.6, srLast5: 90.0, trend: "stable",
      },
      matchups: {
        vsTeam: "MI", matches: 5, runs: 12,
        average: 6.0, strikeRate: 100.0, wickets: 7,
      },
      phases: {
        powerplay: { sr: 0, avg: 0 },
        middle: { sr: 0, avg: 0 },
        death: { sr: 0, avg: 0 },
      },
    },
    {
      name: "Mitchell Starc",
      role: "Bowler",
      battingStyle: "Left-hand bat",
      bowlingStyle: "Left-arm fast",
      nationality: "Australian",
      batting: {
        matches: 42, innings: 15, runs: 120, highScore: 28,
        average: 10.0, strikeRate: 130.0, fifties: 0, hundreds: 0,
        fours: 12, sixes: 5, dotBallPct: 35, boundaryPct: 32,
      },
      bowling: {
        matches: 42, innings: 42, wickets: 55, economy: 8.5,
        average: 25.6, strikeRate: 18.1, bestFigures: "4/22",
        dotBallPct: 42, foursConceded: 52, sixesConceded: 30,
      },
      recentForm: {
        scores: [2, 0, 8, 0, 0],
        wickets: [3, 2, 1, 4, 2],
        avgLast5: 2.0, srLast5: 80.0, trend: "rising",
      },
      matchups: {
        vsTeam: "MI", matches: 8, runs: 18,
        average: 6.0, strikeRate: 110.0, wickets: 12,
      },
      phases: {
        powerplay: { sr: 0, avg: 0 },
        middle: { sr: 0, avg: 0 },
        death: { sr: 0, avg: 0 },
      },
    },
    {
      name: "Vaibhav Arora",
      role: "Bowler",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm medium-fast",
      nationality: "Indian",
      batting: {
        matches: 15, innings: 5, runs: 22, highScore: 12,
        average: 5.5, strikeRate: 95.0, fifties: 0, hundreds: 0,
        fours: 2, sixes: 1, dotBallPct: 50, boundaryPct: 20,
      },
      bowling: {
        matches: 15, innings: 15, wickets: 18, economy: 8.2,
        average: 24.5, strikeRate: 17.9, bestFigures: "3/18",
        dotBallPct: 40, foursConceded: 22, sixesConceded: 10,
      },
      recentForm: {
        scores: [0, 4, 0, 0, 2],
        wickets: [2, 0, 3, 1, 2],
        avgLast5: 1.2, srLast5: 70.0, trend: "rising",
      },
      matchups: {
        vsTeam: "MI", matches: 3, runs: 4,
        average: 2.0, strikeRate: 80.0, wickets: 4,
      },
      phases: {
        powerplay: { sr: 0, avg: 0 },
        middle: { sr: 0, avg: 0 },
        death: { sr: 0, avg: 0 },
      },
    },
    {
      name: "Phil Salt",
      role: "Wicket-keeper",
      battingStyle: "Right-hand bat",
      nationality: "English",
      isKeeper: true,
      batting: {
        matches: 35, innings: 35, runs: 1150, highScore: 98,
        average: 34.8, strikeRate: 165.2, fifties: 9, hundreds: 0,
        fours: 120, sixes: 65, dotBallPct: 22, boundaryPct: 50,
      },
      recentForm: {
        scores: [72, 18, 55, 88, 32],
        avgLast5: 53.0, srLast5: 172.0, trend: "rising",
      },
      matchups: {
        vsTeam: "MI", matches: 6, runs: 215,
        average: 35.8, strikeRate: 168.0,
      },
      phases: {
        powerplay: { sr: 178, avg: 38 },
        middle: { sr: 152, avg: 32 },
        death: { sr: 180, avg: 24 },
      },
    },
  ],
};

// ============================================================
// MUMBAI INDIANS (MI) — IPL 2026 Squad
// ============================================================
export const miData: TeamData = {
  name: "Mumbai Indians",
  shortName: "MI",
  color: "#004BA0",
  secondaryColor: "#D4AF37",
  logo: "/mi-logo.png",
  captain: "Hardik Pandya",
  coach: "Mark Boucher",

  stats: {
    totalMatches: 268,
    wins: 148,
    losses: 116,
    winPct: 56.0,
    avgFirstInningsScore: 175,
    avgSecondInningsScore: 168,
    avgPowerplayScore: 50,
    avgDeathOverRuns: 58,
    highestTotal: 235,
    lowestTotal: 94,
    titlesWon: 5,
  },

  h2h: {
    matches: 36,
    wins: 18,
    losses: 16,
    lastResult: "KKR won by 24 runs",
  },

  players: [
    {
      name: "Rohit Sharma",
      role: "Batsman",
      battingStyle: "Right-hand bat",
      nationality: "Indian",
      batting: {
        matches: 248, innings: 240, runs: 6500, highScore: 109,
        average: 29.5, strikeRate: 131.2, fifties: 42, hundreds: 2,
        fours: 560, sixes: 260, dotBallPct: 30, boundaryPct: 42,
      },
      recentForm: {
        scores: [35, 62, 18, 45, 28],
        avgLast5: 37.6, srLast5: 138.5, trend: "stable",
      },
      matchups: {
        vsTeam: "KKR", matches: 32, runs: 920,
        average: 31.7, strikeRate: 134.5,
      },
      phases: {
        powerplay: { sr: 142, avg: 32 },
        middle: { sr: 128, avg: 30 },
        death: { sr: 145, avg: 22 },
      },
    },
    {
      name: "Hardik Pandya",
      role: "All-rounder",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm fast-medium",
      nationality: "Indian",
      isCaptain: true,
      batting: {
        matches: 132, innings: 120, runs: 2450, highScore: 91,
        average: 28.5, strikeRate: 153.8, fifties: 12, hundreds: 0,
        fours: 185, sixes: 130, dotBallPct: 25, boundaryPct: 46,
      },
      bowling: {
        matches: 132, innings: 80, wickets: 62, economy: 8.8,
        average: 30.2, strikeRate: 20.6, bestFigures: "3/14",
        dotBallPct: 36, foursConceded: 65, sixesConceded: 42,
      },
      recentForm: {
        scores: [42, 18, 55, 38, 72],
        wickets: [1, 0, 2, 1, 0],
        avgLast5: 45.0, srLast5: 162.0, trend: "rising",
      },
      matchups: {
        vsTeam: "KKR", matches: 18, runs: 420,
        average: 30.0, strikeRate: 158.5, wickets: 10,
      },
      phases: {
        powerplay: { sr: 148, avg: 25 },
        middle: { sr: 145, avg: 32 },
        death: { sr: 185, avg: 22 },
      },
    },
    {
      name: "Suryakumar Yadav",
      role: "Batsman",
      battingStyle: "Right-hand bat",
      nationality: "Indian",
      batting: {
        matches: 155, innings: 148, runs: 4200, highScore: 103,
        average: 31.6, strikeRate: 148.2, fifties: 28, hundreds: 1,
        fours: 380, sixes: 195, dotBallPct: 25, boundaryPct: 48,
      },
      recentForm: {
        scores: [55, 78, 12, 45, 88],
        avgLast5: 55.6, srLast5: 165.0, trend: "rising",
      },
      matchups: {
        vsTeam: "KKR", matches: 22, runs: 680,
        average: 34.0, strikeRate: 152.8,
      },
      phases: {
        powerplay: { sr: 155, avg: 28 },
        middle: { sr: 145, avg: 38 },
        death: { sr: 172, avg: 25 },
      },
    },
    {
      name: "Ishan Kishan",
      role: "Wicket-keeper",
      battingStyle: "Left-hand bat",
      nationality: "Indian",
      isKeeper: true,
      batting: {
        matches: 105, innings: 100, runs: 2600, highScore: 99,
        average: 28.3, strikeRate: 136.8, fifties: 15, hundreds: 0,
        fours: 240, sixes: 110, dotBallPct: 28, boundaryPct: 44,
      },
      recentForm: {
        scores: [38, 25, 52, 8, 45],
        avgLast5: 33.6, srLast5: 142.0, trend: "stable",
      },
      matchups: {
        vsTeam: "KKR", matches: 14, runs: 380,
        average: 29.2, strikeRate: 138.5,
      },
      phases: {
        powerplay: { sr: 148, avg: 30 },
        middle: { sr: 132, avg: 28 },
        death: { sr: 152, avg: 22 },
      },
    },
    {
      name: "Tilak Varma",
      role: "Batsman",
      battingStyle: "Left-hand bat",
      bowlingStyle: "Right-arm off-break",
      nationality: "Indian",
      batting: {
        matches: 48, innings: 44, runs: 1280, highScore: 84,
        average: 32.0, strikeRate: 142.5, fifties: 9, hundreds: 0,
        fours: 115, sixes: 52, dotBallPct: 28, boundaryPct: 42,
      },
      bowling: {
        matches: 48, innings: 12, wickets: 5, economy: 8.5,
        average: 42.0, strikeRate: 29.6, bestFigures: "2/15",
        dotBallPct: 32, foursConceded: 8, sixesConceded: 5,
      },
      recentForm: {
        scores: [48, 62, 22, 35, 84],
        avgLast5: 50.2, srLast5: 155.0, trend: "rising",
      },
      matchups: {
        vsTeam: "KKR", matches: 8, runs: 220,
        average: 31.4, strikeRate: 145.0,
      },
      phases: {
        powerplay: { sr: 130, avg: 25 },
        middle: { sr: 140, avg: 35 },
        death: { sr: 165, avg: 28 },
      },
    },
    {
      name: "Naman Dhir",
      role: "All-rounder",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm off-break",
      nationality: "Indian",
      batting: {
        matches: 12, innings: 10, runs: 285, highScore: 62,
        average: 31.7, strikeRate: 155.0, fifties: 2, hundreds: 0,
        fours: 28, sixes: 15, dotBallPct: 25, boundaryPct: 45,
      },
      bowling: {
        matches: 12, innings: 6, wickets: 3, economy: 8.8,
        average: 35.0, strikeRate: 23.8, bestFigures: "1/12",
        dotBallPct: 30, foursConceded: 5, sixesConceded: 4,
      },
      recentForm: {
        scores: [35, 62, 15, 28, 42],
        avgLast5: 36.4, srLast5: 148.0, trend: "stable",
      },
      matchups: {
        vsTeam: "KKR", matches: 2, runs: 55,
        average: 27.5, strikeRate: 150.0,
      },
      phases: {
        powerplay: { sr: 145, avg: 28 },
        middle: { sr: 150, avg: 32 },
        death: { sr: 175, avg: 22 },
      },
    },
    {
      name: "Jasprit Bumrah",
      role: "Bowler",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm fast",
      nationality: "Indian",
      batting: {
        matches: 140, innings: 22, runs: 65, highScore: 16,
        average: 4.6, strikeRate: 85.0, fifties: 0, hundreds: 0,
        fours: 5, sixes: 2, dotBallPct: 55, boundaryPct: 15,
      },
      bowling: {
        matches: 140, innings: 138, wickets: 175, economy: 7.4,
        average: 24.2, strikeRate: 19.6, bestFigures: "5/10",
        dotBallPct: 50, foursConceded: 110, sixesConceded: 55,
      },
      recentForm: {
        scores: [0, 2, 0, 0, 4],
        wickets: [3, 2, 4, 1, 3],
        avgLast5: 1.2, srLast5: 60.0, trend: "rising",
      },
      matchups: {
        vsTeam: "KKR", matches: 20, runs: 12,
        average: 3.0, strikeRate: 70.0, wickets: 25,
      },
      phases: {
        powerplay: { sr: 0, avg: 0 },
        middle: { sr: 0, avg: 0 },
        death: { sr: 0, avg: 0 },
      },
    },
    {
      name: "Trent Boult",
      role: "Bowler",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Left-arm fast",
      nationality: "New Zealander",
      batting: {
        matches: 78, innings: 18, runs: 85, highScore: 18,
        average: 6.1, strikeRate: 95.0, fifties: 0, hundreds: 0,
        fours: 8, sixes: 3, dotBallPct: 48, boundaryPct: 22,
      },
      bowling: {
        matches: 78, innings: 78, wickets: 95, economy: 8.1,
        average: 26.8, strikeRate: 19.8, bestFigures: "4/18",
        dotBallPct: 42, foursConceded: 72, sixesConceded: 38,
      },
      recentForm: {
        scores: [0, 4, 2, 0, 0],
        wickets: [2, 1, 3, 2, 1],
        avgLast5: 1.2, srLast5: 65.0, trend: "stable",
      },
      matchups: {
        vsTeam: "KKR", matches: 12, runs: 15,
        average: 5.0, strikeRate: 80.0, wickets: 15,
      },
      phases: {
        powerplay: { sr: 0, avg: 0 },
        middle: { sr: 0, avg: 0 },
        death: { sr: 0, avg: 0 },
      },
    },
    {
      name: "Deepak Chahar",
      role: "Bowler",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm medium-fast",
      nationality: "Indian",
      batting: {
        matches: 82, innings: 35, runs: 280, highScore: 39,
        average: 12.2, strikeRate: 118.0, fifties: 0, hundreds: 0,
        fours: 28, sixes: 10, dotBallPct: 38, boundaryPct: 30,
      },
      bowling: {
        matches: 82, innings: 80, wickets: 85, economy: 7.8,
        average: 27.5, strikeRate: 21.2, bestFigures: "4/13",
        dotBallPct: 44, foursConceded: 62, sixesConceded: 28,
      },
      recentForm: {
        scores: [8, 0, 12, 0, 4],
        wickets: [2, 3, 1, 2, 1],
        avgLast5: 4.8, srLast5: 95.0, trend: "stable",
      },
      matchups: {
        vsTeam: "KKR", matches: 10, runs: 35,
        average: 7.0, strikeRate: 100.0, wickets: 12,
      },
      phases: {
        powerplay: { sr: 0, avg: 0 },
        middle: { sr: 0, avg: 0 },
        death: { sr: 0, avg: 0 },
      },
    },
    {
      name: "Piyush Chawla",
      role: "Bowler",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm leg-break",
      nationality: "Indian",
      batting: {
        matches: 175, innings: 48, runs: 360, highScore: 28,
        average: 10.3, strikeRate: 105.0, fifties: 0, hundreds: 0,
        fours: 32, sixes: 12, dotBallPct: 42, boundaryPct: 25,
      },
      bowling: {
        matches: 175, innings: 172, wickets: 168, economy: 7.8,
        average: 28.5, strikeRate: 21.9, bestFigures: "4/17",
        dotBallPct: 42, foursConceded: 130, sixesConceded: 78,
      },
      recentForm: {
        scores: [2, 0, 8, 0, 4],
        wickets: [1, 2, 0, 3, 1],
        avgLast5: 2.8, srLast5: 75.0, trend: "stable",
      },
      matchups: {
        vsTeam: "KKR", matches: 22, runs: 45,
        average: 5.0, strikeRate: 85.0, wickets: 22,
      },
      phases: {
        powerplay: { sr: 0, avg: 0 },
        middle: { sr: 0, avg: 0 },
        death: { sr: 0, avg: 0 },
      },
    },
    {
      name: "Gerald Coetzee",
      role: "Bowler",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm fast",
      nationality: "South African",
      batting: {
        matches: 18, innings: 8, runs: 95, highScore: 32,
        average: 13.6, strikeRate: 155.0, fifties: 0, hundreds: 0,
        fours: 8, sixes: 6, dotBallPct: 32, boundaryPct: 38,
      },
      bowling: {
        matches: 18, innings: 18, wickets: 22, economy: 9.5,
        average: 27.0, strikeRate: 17.1, bestFigures: "3/22",
        dotBallPct: 36, foursConceded: 22, sixesConceded: 15,
      },
      recentForm: {
        scores: [12, 0, 32, 0, 8],
        wickets: [2, 1, 0, 3, 2],
        avgLast5: 10.4, srLast5: 140.0, trend: "stable",
      },
      matchups: {
        vsTeam: "KKR", matches: 3, runs: 18,
        average: 9.0, strikeRate: 145.0, wickets: 4,
      },
      phases: {
        powerplay: { sr: 0, avg: 0 },
        middle: { sr: 0, avg: 0 },
        death: { sr: 0, avg: 0 },
      },
    },
  ],
};

// ============================================================
// Utility Functions
// ============================================================
export function getTeamStrength(team: TeamData): {
  battingStrength: number;
  bowlingStrength: number;
  overall: number;
} {
  const batsmen = team.players.filter(
    (p) => p.role === "Batsman" || p.role === "All-rounder" || p.role === "Wicket-keeper"
  );
  const bowlers = team.players.filter(
    (p) => p.role === "Bowler" || p.role === "All-rounder"
  );

  const battingStrength =
    batsmen.reduce((sum, p) => sum + p.batting.average * p.batting.strikeRate / 100, 0) /
    batsmen.length;

  const bowlingStrength =
    bowlers.reduce((sum, p) => {
      if (!p.bowling) return sum;
      return sum + (30 - p.bowling.economy) * (p.bowling.wickets / p.bowling.matches);
    }, 0) / bowlers.length;

  return {
    battingStrength: Math.round(battingStrength * 10) / 10,
    bowlingStrength: Math.round(bowlingStrength * 10) / 10,
    overall: Math.round(((battingStrength + bowlingStrength) / 2) * 10) / 10,
  };
}

export function getMatchPredictionContext(kkr: TeamData, mi: TeamData): string {
  const kkrStrength = getTeamStrength(kkr);
  const miStrength = getTeamStrength(mi);

  const kkrPlayers = kkr.players
    .map(
      (p) =>
        `${p.name} (${p.role}): Avg ${p.batting.average}, SR ${p.batting.strikeRate}, Recent form: ${p.recentForm.scores.join(",")}, vs MI: avg ${p.matchups.average} sr ${p.matchups.strikeRate}${p.bowling ? `, Bowling: ${p.bowling.wickets}wkts @ ${p.bowling.economy}econ` : ""}`
    )
    .join("\n");

  const miPlayers = mi.players
    .map(
      (p) =>
        `${p.name} (${p.role}): Avg ${p.batting.average}, SR ${p.batting.strikeRate}, Recent form: ${p.recentForm.scores.join(",")}, vs KKR: avg ${p.matchups.average} sr ${p.matchups.strikeRate}${p.bowling ? `, Bowling: ${p.bowling.wickets}wkts @ ${p.bowling.economy}econ` : ""}`
    )
    .join("\n");

  return `
=== IPL 2026: KKR vs MI Match Analysis ===

KOLKATA KNIGHT RIDERS:
Team Record: ${kkr.stats.wins}W/${kkr.stats.losses}L (Win%: ${kkr.stats.winPct}%)
Avg 1st Innings: ${kkr.stats.avgFirstInningsScore} | Avg 2nd Innings: ${kkr.stats.avgSecondInningsScore}
Avg Powerplay: ${kkr.stats.avgPowerplayScore} | Avg Death Overs: ${kkr.stats.avgDeathOverRuns}
Batting Strength: ${kkrStrength.battingStrength} | Bowling Strength: ${kkrStrength.bowlingStrength}
Captain: ${kkr.captain}
Titles: ${kkr.stats.titlesWon}

KKR Players:
${kkrPlayers}

Head-to-Head vs MI: ${kkr.h2h.wins}W/${kkr.h2h.losses}L in ${kkr.h2h.matches} matches
Last Result: ${kkr.h2h.lastResult}

MUMBAI INDIANS:
Team Record: ${mi.stats.wins}W/${mi.stats.losses}L (Win%: ${mi.stats.winPct}%)
Avg 1st Innings: ${mi.stats.avgFirstInningsScore} | Avg 2nd Innings: ${mi.stats.avgSecondInningsScore}
Avg Powerplay: ${mi.stats.avgPowerplayScore} | Avg Death Overs: ${mi.stats.avgDeathOverRuns}
Batting Strength: ${miStrength.battingStrength} | Bowling Strength: ${miStrength.bowlingStrength}
Captain: ${mi.captain}
Titles: ${mi.stats.titlesWon}

MI Players:
${miPlayers}

Head-to-Head vs KKR: ${mi.h2h.wins}W/${mi.h2h.losses}L in ${mi.h2h.matches} matches
`;
}
