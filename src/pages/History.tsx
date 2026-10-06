import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n";
import { deleteFromHistory, loadHistory, loadLanguage, type HistoryEntry } from "@/lib/history";

const pct = (a: number, b: number) => (a + b > 0 ? Math.round((a / (a + b)) * 100) : 0);

const History = () => {
  const language = loadLanguage();
  const t = getTranslations(language);
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);
  const [open, setOpen] = useState<string | null>(null);
  const fmt = new Intl.DateTimeFormat(language === "sv" ? "sv-SE" : "en-GB", { dateStyle: "medium", timeStyle: "short" });

  // Oldest -> newest for trend
  const trend = [...entries].reverse();
  const maxErr = Math.max(1, ...trend.map((e) => e.data.player1.unforcedErrors));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 sticky top-0 z-10 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" />{t.back}</Link>
          </Button>
          <h1 className="text-lg font-bold">{t.matchHistory}</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">{t.noHistory}</p>
        ) : (
          <>
            {trend.length > 1 && (
              <section className="bg-gradient-card rounded-lg border border-border p-5">
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-4">{t.progressTrend}</h2>
                <div className="flex items-end gap-2 h-32">
                  {trend.map((e) => (
                    <div key={e.id} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                      <span className="text-xs font-mono text-primary">{pct(e.data.player1.score, e.data.player2.score)}%</span>
                      <div className="w-full bg-stat-red/70 rounded-t" style={{ height: `${(e.data.player1.unforcedErrors / maxErr) * 70 + 4}px` }} title={`${t.unforced}: ${e.data.player1.unforcedErrors}`} />
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">{new Date(e.date).toLocaleDateString(language === "sv" ? "sv-SE" : "en-GB")}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">{t.trendLegend}</p>
              </section>
            )}

            <section className="space-y-3">
              {entries.map((e) => {
                const d = e.data;
                const isOpen = open === e.id;
                return (
                  <div key={e.id} className="bg-gradient-card rounded-lg border border-border">
                    <button className="w-full text-left p-4 flex items-center gap-4" onClick={() => setOpen(isOpen ? null : e.id)}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{e.fileName}</p>
                        <p className="text-xs text-muted-foreground">{fmt.format(new Date(e.date))}</p>
                      </div>
                      <p className="text-2xl font-bold font-mono text-primary">{d.player1.score}–{d.player2.score}</p>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 space-y-4 text-sm border-t border-border pt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                          <div>{t.totalRallies}: <b>{d.totalRallies}</b></div>
                          <div>{t.avgRally}: <b>{d.avgRallyLength}s</b></div>
                          <div>{t.unforced} P1/P2: <b>{d.player1.unforcedErrors}/{d.player2.unforcedErrors}</b></div>
                          <div>{t.fhWinners} P1/P2: <b>{d.player1.forehandWinners}/{d.player2.forehandWinners}</b></div>
                        </div>
                        {d.summary && <p className="text-muted-foreground">{d.summary}</p>}
                        {[d.player1Insight, d.player2Insight].map((ins, i) => ins?.strength ? (
                          <div key={i} className="space-y-1">
                            <p className="font-semibold">P{i + 1}</p>
                            <p><span className="text-stat-green">+</span> {ins.strength}</p>
                            <p><span className="text-stat-red">−</span> {ins.weakness}</p>
                            {ins.drillRecommendation && <p className="text-stat-amber">{t.practiceDrills}: {ins.drillRecommendation}</p>}
                          </div>
                        ) : null)}
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { deleteFromHistory(e.id); setEntries(loadHistory()); }}>
                          <Trash2 className="h-4 w-4 mr-1" />{t.delete}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default History;
