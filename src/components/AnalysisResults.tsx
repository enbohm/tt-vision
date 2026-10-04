import StatCard from "./StatCard";
import { Activity, Target, Zap, BarChart3, AlertTriangle, Trophy, Crosshair } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTranslations, translateDetectedValue, type Language, type Translations } from "@/lib/i18n";

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
  player1Color?: string;
  player2Color?: string;
  player1Position?: string;
  player2Position?: string;
  player1: PlayerStats;
  player2: PlayerStats;
  summary?: string;
}

interface AnalysisResultsProps {
  data: AnalysisData | null;
  isLoading?: boolean;
  statusText?: string;
  language: Language;
}

const PlayerStatsSection = ({ stats, baseDelay = 0, t }: { stats: PlayerStats; baseDelay?: number; t: Translations }) => (
  <div className="space-y-6">
    {/* Points */}
    <div>
      <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: `${baseDelay}ms` }}>
        <div className="p-2 rounded-lg bg-primary/10">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{t.points}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t.wonOnServe} value={stats.pointsWonOnServe} color="green" delay={baseDelay + 50} />
        <StatCard label={t.wonOnReturn} value={stats.pointsWonOnReturn} color="blue" delay={baseDelay + 100} />
      </div>
    </div>

    {/* Errors */}
    <div>
      <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: `${baseDelay + 150}ms` }}>
        <div className="p-2 rounded-lg bg-primary/10">
          <AlertTriangle className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{t.errors}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={t.unforced} value={stats.unforcedErrors} color="red" delay={baseDelay + 200} />
        <StatCard label={t.forced} value={stats.forcedErrors} color="amber" delay={baseDelay + 250} />
        <StatCard label={t.underPressure} value={stats.underPressureErrors} color="red" delay={baseDelay + 300} />
        <StatCard label={t.tactical} value={stats.tacticalErrors} color="amber" delay={baseDelay + 350} />
      </div>
    </div>

    {/* Shots */}
    <div>
      <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: `${baseDelay + 400}ms` }}>
        <div className="p-2 rounded-lg bg-primary/10">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{t.shots}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={t.fhWinners} value={stats.forehandWinners} color="green" delay={baseDelay + 450} />
        <StatCard label={t.bhWinners} value={stats.backhandWinners} color="blue" delay={baseDelay + 500} />
        <StatCard label={t.topspin} value={stats.topspinShots} color="amber" delay={baseDelay + 550} />
        <StatCard label={t.netPoints} value={stats.netPoints} color="primary" delay={baseDelay + 600} />
      </div>
    </div>

    {/* Attacking Play */}
    <div>
      <div className="flex items-center gap-3 mb-4 animate-slide-up" style={{ animationDelay: `${baseDelay + 650}ms` }}>
        <div className="p-2 rounded-lg bg-primary/10">
          <Crosshair className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{t.attackingPlay}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label={t.fhForcedErrors} value={stats.fhForcedErrorsCreated} subtitle={t.createdViaForehand} color="green" delay={baseDelay + 700} />
        <StatCard label={t.fhOpeningAttack} value={stats.fhOpeningAttacks} subtitle={`${stats.fhOpeningAttackSuccess}% ${t.success}`} color="primary" delay={baseDelay + 750} />
        <StatCard label={t.bhOpeningAttack} value={stats.bhOpeningAttacks} subtitle={`${stats.bhOpeningAttackSuccess}% ${t.success}`} color="blue" delay={baseDelay + 800} />
      </div>
    </div>
  </div>
);

export const FUNNY_NAMES = [
  "Lightning Jane", "Speedy John", "Smash Karen", "Topspin Tony",
  "Backhand Betty", "Slice Sam", "Loop Larry", "Rocket Rachel",
  "Spin Doctor Dave", "Ace Alice", "Thunder Tom", "Whiplash Wendy",
  "Blitz Boris", "Chop Chloe", "Fury Frank", "Turbo Tina",
];

let _cachedNames: [string, string] | null = null;
let _cachedMinute = -1;

const SWEDISH_NAMES = ["Blixten Bea", "Snabba Sven", "Smash-Sara", "Topspin-Tobbe", "Backhand-Britta", "Slice-Simon", "Loop-Lisa", "Raket-Robin"];

export function getPlayerNames(language: Language = "en"): [string, string] {
  const minute = Math.floor(Date.now() / 60000);
  if (_cachedNames && _cachedMinute === minute) return _cachedNames;
  const names = language === "sv" ? SWEDISH_NAMES : FUNNY_NAMES;
  const i1 = minute % names.length;
  let i2 = (minute * 7 + 3) % names.length;
  if (i2 === i1) i2 = (i2 + 1) % names.length;
  _cachedNames = [names[i1], names[i2]];
  _cachedMinute = minute;
  return _cachedNames;
}

export function playerLabel(base: string, color?: string, position?: string): string {
  const parts: string[] = [];
  if (color) parts.push(color);
  if (position) parts.push(position);
  if (parts.length > 0) return `${base} (${parts.join(", ")})`;
  return base;
}

const AnalysisResults = ({ data, isLoading, statusText, language }: AnalysisResultsProps) => {
  const t = getTranslations(language);
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 animate-pulse-glow">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t.analyzingMatch}</h2>
            <p className="text-sm text-muted-foreground">{statusText || t.processingFrames}</p>
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

  const [name1, name2] = getPlayerNames(language);
  const p1Label = playerLabel(name1, translateDetectedValue(data.player1Color, language), translateDetectedValue(data.player1Position, language));
  const p2Label = playerLabel(name2, translateDetectedValue(data.player2Color, language), translateDetectedValue(data.player2Position, language));

  return (
    <div className="space-y-6">
      {/* Score */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">{t.matchScore}</h2>
        </div>
        <div className="bg-gradient-card rounded-lg border border-border p-6 flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1">{p1Label}</p>
            <p className="text-5xl font-bold font-mono text-primary">{data.player1.score}</p>
          </div>
          <div className="text-2xl text-muted-foreground font-mono">—</div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1">{p2Label}</p>
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
          <h2 className="text-lg font-semibold text-foreground">{t.rallyOverview}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label={t.totalPoints} value={data.totalPoints} color="primary" delay={150} />
          <StatCard label={t.totalRallies} value={data.totalRallies} color="blue" delay={200} />
          <StatCard label={t.avgRally} value={`${data.avgRallyLength}s`} color="green" delay={250} />
          <StatCard label={t.longestRally} value={`${data.longestRally}s`} color="amber" delay={300} />
        </div>
      </div>

      {/* Serve Speed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "350ms" }}>
        <StatCard label={t.serveSpeed} value={data.serveSpeed} subtitle={t.motionAnalysis} color="primary" delay={350} />
      </div>

      {/* Per-Player Tabs */}
      <Tabs defaultValue="player1" className="animate-slide-up" style={{ animationDelay: "400ms" }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="player1">{p1Label}</TabsTrigger>
          <TabsTrigger value="player2">{p2Label}</TabsTrigger>
        </TabsList>
        <TabsContent value="player1" className="mt-4">
          <PlayerStatsSection stats={data.player1} baseDelay={450} t={t} />
        </TabsContent>
        <TabsContent value="player2" className="mt-4">
          <PlayerStatsSection stats={data.player2} baseDelay={450} t={t} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisResults;
