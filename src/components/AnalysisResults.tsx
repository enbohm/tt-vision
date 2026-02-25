import StatCard from "./StatCard";
import { Activity, Target, Zap, BarChart3, AlertTriangle, Trophy, Crosshair } from "lucide-react";

interface AnalysisData {
  totalRallies: number;
  avgRallyLength: number;
  longestRally: number;
  player1Score: number;
  player2Score: number;
  serveSpeed: string;
  topspinShots: number;
  backhandWinners: number;
  forehandWinners: number;
  netPoints: number;
  unforcedErrors: number;
  forcedErrors: number;
  underPressureErrors: number;
  tacticalErrors: number;
  pointsWon: number;
  pointsLost: number;
  pointsWonOnServe: number;
  pointsWonOnReturn: number;
  fhForcedErrorsCreated: number;
  fhOpeningAttacks: number;
  fhOpeningAttackSuccess: number;
  bhOpeningAttacks: number;
  bhOpeningAttackSuccess: number;
}

interface AnalysisResultsProps {
  data: AnalysisData | null;
  isLoading?: boolean;
  statusText?: string;
}

const AnalysisResults = ({ data, isLoading, statusText }: AnalysisResultsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 animate-pulse-glow">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Analyzing Match...</h2>
            <p className="text-sm text-muted-foreground">{statusText || "Processing video frames"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-5 animate-pulse">
              <div className="h-3 w-16 bg-secondary rounded mb-3" />
              <div className="h-8 w-12 bg-secondary rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Score */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Match Score</h2>
        </div>
        <div className="bg-gradient-card rounded-lg border border-border p-6 flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1">Player 1</p>
            <p className="text-5xl font-bold font-mono text-primary">{data.player1Score}</p>
          </div>
          <div className="text-2xl text-muted-foreground font-mono">—</div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1">Player 2</p>
            <p className="text-5xl font-bold font-mono text-foreground">{data.player2Score}</p>
          </div>
        </div>
      </div>

      {/* Points Breakdown */}
      <div>
        <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="p-2 rounded-lg bg-primary/10">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Points Breakdown</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Points Won" value={data.pointsWon} color="green" delay={150} />
          <StatCard label="Points Lost" value={data.pointsLost} color="red" delay={200} />
          <StatCard label="Won on Serve" value={data.pointsWonOnServe} color="primary" delay={250} />
          <StatCard label="Won on Return" value={data.pointsWonOnReturn} color="blue" delay={300} />
        </div>
      </div>

      {/* Rally Stats */}
      <div>
        <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: "350ms" }}>
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Rally Analysis</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Total Rallies" value={data.totalRallies} color="primary" delay={400} />
          <StatCard label="Avg Rally Length" value={`${data.avgRallyLength}s`} color="blue" delay={450} />
          <StatCard label="Longest Rally" value={`${data.longestRally}s`} color="green" delay={500} />
        </div>
      </div>

      {/* Error Analysis */}
      <div>
        <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: "550ms" }}>
          <div className="p-2 rounded-lg bg-primary/10">
            <AlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Error Analysis</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Unforced Errors" value={data.unforcedErrors} color="red" delay={600} />
          <StatCard label="Forced Errors" value={data.forcedErrors} color="amber" delay={650} />
          <StatCard label="Under Pressure" value={data.underPressureErrors} color="red" delay={700} />
          <StatCard label="Tactical Errors" value={data.tacticalErrors} color="amber" delay={750} />
        </div>
      </div>

      {/* Shot Analysis */}
      <div>
        <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: "800ms" }}>
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Shot Breakdown</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="FH Winners" value={data.forehandWinners} color="green" delay={850} />
          <StatCard label="BH Winners" value={data.backhandWinners} color="blue" delay={900} />
          <StatCard label="Topspin Shots" value={data.topspinShots} color="amber" delay={950} />
          <StatCard label="Net Points" value={data.netPoints} color="primary" delay={1000} />
        </div>
      </div>

      {/* Opening Attacks */}
      <div>
        <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: "1050ms" }}>
          <div className="p-2 rounded-lg bg-primary/10">
            <Crosshair className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Attacking Play</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="FH Forced Errors" value={data.fhForcedErrorsCreated} subtitle="Created via forehand" color="green" delay={1100} />
          <StatCard label="FH Opening Atk" value={data.fhOpeningAttacks} subtitle={`${data.fhOpeningAttackSuccess}% success`} color="primary" delay={1150} />
          <StatCard label="BH Opening Atk" value={data.bhOpeningAttacks} subtitle={`${data.bhOpeningAttackSuccess}% success`} color="blue" delay={1200} />
        </div>
      </div>

      {/* Serve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <StatCard label="Est. Serve Speed" value={data.serveSpeed} subtitle="Based on motion analysis" color="primary" delay={1250} />
      </div>
    </div>
  );
};

export default AnalysisResults;
