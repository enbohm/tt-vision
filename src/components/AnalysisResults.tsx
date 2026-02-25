import StatCard from "./StatCard";
import { Activity, Target, Zap, BarChart3, AlertTriangle, Trophy, Crosshair } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlayerStats {
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

interface AnalysisData {
  totalPoints: number;
  totalRallies: number;
  avgRallyLength: number;
  longestRally: number;
  serveSpeed: string;
  player1: PlayerStats;
  player2: PlayerStats;
  summary?: string;
}

interface AnalysisResultsProps {
  data: AnalysisData | null;
  isLoading?: boolean;
  statusText?: string;
}

const PlayerStatsSection = ({ stats, label, baseDelay = 0 }: { stats: PlayerStats; label: string; baseDelay?: number }) => (
  <div className="space-y-6">
    {/* Points */}
    <div>
      <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: `${baseDelay}ms` }}>
        <div className="p-2 rounded-lg bg-primary/10">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Points</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Won on Serve" value={stats.pointsWonOnServe} color="green" delay={baseDelay + 50} />
        <StatCard label="Won on Return" value={stats.pointsWonOnReturn} color="blue" delay={baseDelay + 100} />
      </div>
    </div>

    {/* Errors */}
    <div>
      <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: `${baseDelay + 150}ms` }}>
        <div className="p-2 rounded-lg bg-primary/10">
          <AlertTriangle className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Errors</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Unforced" value={stats.unforcedErrors} color="red" delay={baseDelay + 200} />
        <StatCard label="Forced" value={stats.forcedErrors} color="amber" delay={baseDelay + 250} />
        <StatCard label="Under Pressure" value={stats.underPressureErrors} color="red" delay={baseDelay + 300} />
        <StatCard label="Tactical" value={stats.tacticalErrors} color="amber" delay={baseDelay + 350} />
      </div>
    </div>

    {/* Shots */}
    <div>
      <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: `${baseDelay + 400}ms` }}>
        <div className="p-2 rounded-lg bg-primary/10">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Shots</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="FH Winners" value={stats.forehandWinners} color="green" delay={baseDelay + 450} />
        <StatCard label="BH Winners" value={stats.backhandWinners} color="blue" delay={baseDelay + 500} />
        <StatCard label="Topspin" value={stats.topspinShots} color="amber" delay={baseDelay + 550} />
        <StatCard label="Net Points" value={stats.netPoints} color="primary" delay={baseDelay + 600} />
      </div>
    </div>

    {/* Attacking Play */}
    <div>
      <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: `${baseDelay + 650}ms` }}>
        <div className="p-2 rounded-lg bg-primary/10">
          <Crosshair className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Attacking Play</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="FH Forced Errors" value={stats.fhForcedErrorsCreated} subtitle="Created via forehand" color="green" delay={baseDelay + 700} />
        <StatCard label="FH Opening Atk" value={stats.fhOpeningAttacks} subtitle={`${stats.fhOpeningAttackSuccess}% success`} color="primary" delay={baseDelay + 750} />
        <StatCard label="BH Opening Atk" value={stats.bhOpeningAttacks} subtitle={`${stats.bhOpeningAttackSuccess}% success`} color="blue" delay={baseDelay + 800} />
      </div>
    </div>
  </div>
);

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
            <p className="text-5xl font-bold font-mono text-primary">{data.player1.score}</p>
          </div>
          <div className="text-2xl text-muted-foreground font-mono">—</div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1">Player 2</p>
            <p className="text-5xl font-bold font-mono text-foreground">{data.player2.score}</p>
          </div>
        </div>
      </div>

      {/* Overall Rally Stats */}
      <div>
        <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Rally Overview</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Points" value={data.totalPoints} color="primary" delay={150} />
          <StatCard label="Total Rallies" value={data.totalRallies} color="blue" delay={200} />
          <StatCard label="Avg Rally" value={`${data.avgRallyLength}s`} color="green" delay={250} />
          <StatCard label="Longest Rally" value={`${data.longestRally}s`} color="amber" delay={300} />
        </div>
      </div>

      {/* Serve Speed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "350ms" }}>
        <StatCard label="Est. Serve Speed" value={data.serveSpeed} subtitle="Based on motion analysis" color="primary" delay={350} />
      </div>

      {/* Per-Player Tabs */}
      <Tabs defaultValue="player1" className="animate-slide-up" style={{ animationDelay: "400ms" }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="player1">Player 1</TabsTrigger>
          <TabsTrigger value="player2">Player 2</TabsTrigger>
        </TabsList>
        <TabsContent value="player1" className="mt-4">
          <PlayerStatsSection stats={data.player1} label="Player 1" baseDelay={450} />
        </TabsContent>
        <TabsContent value="player2" className="mt-4">
          <PlayerStatsSection stats={data.player2} label="Player 2" baseDelay={450} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisResults;
