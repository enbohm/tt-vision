/**
 * Utilities for merging chunked analysis results.
 */

export interface PlayerStats {
  score: number;
  pointsWonOnServe: number;
  pointsWonOnReturn: number;
  forehandWinners: number;
  backhandWinners: number;
  topspinShots: number;
  netPoints: number;
  unforcedErrors: number;
  forcedErrors: number;
  underPressureErrors: number;
  tacticalErrors: number;
  fhForcedErrorsCreated: number;
  fhOpeningAttacks: number;
  fhOpeningAttackSuccess: number;
  bhOpeningAttacks: number;
  bhOpeningAttackSuccess: number;
}

export interface PlayerInsight {
  strength: string;
  weakness: string;
}

export interface AnalysisData {
  totalPoints: number;
  totalRallies: number;
  avgRallyLength: number;
  longestRally: number;
  serveSpeed: string;
  player1Color?: string;
  player2Color?: string;
  player1: PlayerStats;
  player2: PlayerStats;
  summary?: string;
  player1Insight?: PlayerInsight;
  player2Insight?: PlayerInsight;
}

const emptyPlayerStats = (): PlayerStats => ({
  score: 0,
  pointsWonOnServe: 0,
  pointsWonOnReturn: 0,
  forehandWinners: 0,
  backhandWinners: 0,
  topspinShots: 0,
  netPoints: 0,
  unforcedErrors: 0,
  forcedErrors: 0,
  underPressureErrors: 0,
  tacticalErrors: 0,
  fhForcedErrorsCreated: 0,
  fhOpeningAttacks: 0,
  fhOpeningAttackSuccess: 0,
  bhOpeningAttacks: 0,
  bhOpeningAttackSuccess: 0,
});

export function emptyAnalysis(): AnalysisData {
  return {
    totalPoints: 0,
    totalRallies: 0,
    avgRallyLength: 0,
    longestRally: 0,
    serveSpeed: "—",
    player1Color: "",
    player2Color: "",
    player1: emptyPlayerStats(),
    player2: emptyPlayerStats(),
    summary: "",
    player1Insight: { strength: "", weakness: "" },
    player2Insight: { strength: "", weakness: "" },
  };
}

function mergePlayer(acc: PlayerStats, chunk: PlayerStats): PlayerStats {
  return {
    score: acc.score + chunk.score,
    pointsWonOnServe: acc.pointsWonOnServe + chunk.pointsWonOnServe,
    pointsWonOnReturn: acc.pointsWonOnReturn + chunk.pointsWonOnReturn,
    forehandWinners: acc.forehandWinners + chunk.forehandWinners,
    backhandWinners: acc.backhandWinners + chunk.backhandWinners,
    topspinShots: acc.topspinShots + chunk.topspinShots,
    netPoints: acc.netPoints + chunk.netPoints,
    unforcedErrors: acc.unforcedErrors + chunk.unforcedErrors,
    forcedErrors: acc.forcedErrors + chunk.forcedErrors,
    underPressureErrors: acc.underPressureErrors + chunk.underPressureErrors,
    tacticalErrors: acc.tacticalErrors + chunk.tacticalErrors,
    fhForcedErrorsCreated: acc.fhForcedErrorsCreated + chunk.fhForcedErrorsCreated,
    fhOpeningAttacks: acc.fhOpeningAttacks + chunk.fhOpeningAttacks,
    fhOpeningAttackSuccess: 0, // recalculated after
    bhOpeningAttacks: acc.bhOpeningAttacks + chunk.bhOpeningAttacks,
    bhOpeningAttackSuccess: 0, // recalculated after
  };
}

export function mergeChunkIntoAnalysis(
  acc: AnalysisData,
  chunk: AnalysisData
): AnalysisData {
  const totalRallies = acc.totalRallies + chunk.totalRallies;
  const avgRallyLength =
    totalRallies > 0
      ? (acc.avgRallyLength * acc.totalRallies + chunk.avgRallyLength * chunk.totalRallies) / totalRallies
      : 0;

  const p1 = mergePlayer(acc.player1, chunk.player1);
  const p2 = mergePlayer(acc.player2, chunk.player2);

  // Weighted average for opening attack success
  if (p1.fhOpeningAttacks > 0) {
    p1.fhOpeningAttackSuccess = Math.round(
      (acc.player1.fhOpeningAttackSuccess * acc.player1.fhOpeningAttacks +
        chunk.player1.fhOpeningAttackSuccess * chunk.player1.fhOpeningAttacks) /
        p1.fhOpeningAttacks
    );
  }
  if (p1.bhOpeningAttacks > 0) {
    p1.bhOpeningAttackSuccess = Math.round(
      (acc.player1.bhOpeningAttackSuccess * acc.player1.bhOpeningAttacks +
        chunk.player1.bhOpeningAttackSuccess * chunk.player1.bhOpeningAttacks) /
        p1.bhOpeningAttacks
    );
  }
  if (p2.fhOpeningAttacks > 0) {
    p2.fhOpeningAttackSuccess = Math.round(
      (acc.player2.fhOpeningAttackSuccess * acc.player2.fhOpeningAttacks +
        chunk.player2.fhOpeningAttackSuccess * chunk.player2.fhOpeningAttacks) /
        p2.fhOpeningAttacks
    );
  }
  if (p2.bhOpeningAttacks > 0) {
    p2.bhOpeningAttackSuccess = Math.round(
      (acc.player2.bhOpeningAttackSuccess * acc.player2.bhOpeningAttacks +
        chunk.player2.bhOpeningAttackSuccess * chunk.player2.bhOpeningAttacks) /
        p2.bhOpeningAttacks
    );
  }

  // Collect summaries
  const summaries = [acc.summary, chunk.summary].filter(Boolean);

  // Use the latest chunk's insights (last segment gives best overall picture)
  const player1Insight = chunk.player1Insight?.strength
    ? chunk.player1Insight
    : acc.player1Insight;
  const player2Insight = chunk.player2Insight?.strength
    ? chunk.player2Insight
    : acc.player2Insight;

  return {
    totalPoints: acc.totalPoints + chunk.totalPoints,
    totalRallies,
    avgRallyLength: Math.round(avgRallyLength * 10) / 10,
    longestRally: Math.max(acc.longestRally, chunk.longestRally),
    serveSpeed: chunk.serveSpeed || acc.serveSpeed,
    player1Color: chunk.player1Color || acc.player1Color,
    player2Color: chunk.player2Color || acc.player2Color,
    player1: p1,
    player2: p2,
    summary: summaries.join(" "),
    player1Insight,
    player2Insight,
  };
}
