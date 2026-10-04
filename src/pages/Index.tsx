import { useState, useRef } from "react";
import { Activity } from "lucide-react";
import bgPlayers from "@/assets/bg-players.jpg";
import PingPongIcon from "@/components/PingPongIcon";
import VideoUploader from "@/components/VideoUploader";
import AnalysisResults from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";
import { extractFramesInChunks } from "@/lib/video-utils";
import { emptyAnalysis, mergeChunkIntoAnalysis, type AnalysisData } from "@/lib/analysis-utils";
import { getPlayerNames, playerLabel } from "@/components/AnalysisResults";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getTranslations, translateDetectedValue, type Language } from "@/lib/i18n";

type AppState = "upload" | "extracting" | "analyzing" | "results" | "error";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, setState] = useState<AppState>("upload");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, retrying: false, retryDelay: 0 });
  const [language, setLanguage] = useState<Language>("en");
  const { toast } = useToast();
  const cancelRef = useRef(false);
  const t = getTranslations(language);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    cancelRef.current = false;

    try {
      setState("extracting");
      setAnalysis(null);

      const chunks = await extractFramesInChunks(selectedFile, 30, 2);

      // Warn if video was trimmed (check if last chunk ends before full duration)
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(selectedFile);
      await new Promise((r) => { video.onloadedmetadata = r; });
      const fullDuration = video.duration;
      URL.revokeObjectURL(video.src);
      if (fullDuration > 360) {
        toast({
          title: `⚠️ ${t.videoTrimmed}`,
          description: t.trimToast(Math.round(fullDuration / 60)),
        });
      }

      setState("analyzing");
      setProgress({ current: 0, total: chunks.length, retrying: false, retryDelay: 0 });

      let accumulated = emptyAnalysis();

      for (let i = 0; i < chunks.length; i++) {
        if (cancelRef.current) return;

        setProgress({ current: i + 1, total: chunks.length, retrying: false, retryDelay: 0 });

        let chunkData: any = null;
        const maxRetries = 3;
        const backoffDelays = [15000, 30000, 300000];
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          const { data, error } = await supabase.functions.invoke("analyze-match", {
            body: {
              frames: chunks[i].frames,
              chunkIndex: chunks[i].chunkIndex,
              totalChunks: chunks[i].totalChunks,
              startTime: chunks[i].startTime,
              endTime: chunks[i].endTime,
              language,
            },
          });

          const errorMsg = error?.message?.toLowerCase() || "";
          const dataError = data?.error?.toLowerCase?.() || "";
          const isRetryable =
            errorMsg.includes("429") ||
            errorMsg.includes("rate limit") ||
            errorMsg.includes("non-2xx") ||
            errorMsg.includes("timeout") ||
            errorMsg.includes("failed to fetch") ||
            dataError.includes("rate limit");

          if (isRetryable && attempt < maxRetries - 1) {
            const delay = backoffDelays[attempt];
            setProgress((prev) => ({ ...prev, retrying: true, retryDelay: Math.round(delay / 1000) }));
            await new Promise((r) => setTimeout(r, delay));
            setProgress((prev) => ({ ...prev, retrying: false }));
            continue;
          }

          if (error) throw new Error(error.message || t.genericError);
          if (data?.error) throw new Error(data.error);
          chunkData = data;
          break;
        }

        accumulated = mergeChunkIntoAnalysis(accumulated, chunkData);
        setAnalysis({ ...accumulated });
      }

      setState("results");
    } catch (err: any) {
      if (cancelRef.current) return;
      console.error("Analysis error:", err);
      const msg = err?.message || t.genericError;
      setErrorMsg(msg);
      setState("error");
      toast({
        title: t.analysisFailed,
        description: msg,
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    cancelRef.current = true;
    setSelectedFile(null);
    setState("upload");
    setAnalysis(null);
    setErrorMsg("");
    setVideoDuration(null);
    setProgress({ current: 0, total: 0, retrying: false, retryDelay: 0 });
  };

  const statusText =
    state === "extracting"
      ? t.extractingFrames
      : state === "analyzing"
      ? progress.retrying
        ? t.retrying(progress.current, progress.total, progress.retryDelay)
        : t.analyzingSegment(progress.current, progress.total)
      : "";

  const showHero = state === "upload" && !selectedFile;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: `url(${bgPlayers})` }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/30 via-background/60 to-background/95" />
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <div className="container max-w-3xl mx-auto flex items-center gap-3 py-3 px-4">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <PingPongIcon className="w-5 h-5 text-red-500" />
            <span className="text-lg leading-none">🇸🇪</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Ping<span className="text-gradient-primary">Analyst</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono">{t.appSubtitle}</p>
          </div>
          <div className="ml-auto flex items-center rounded-md border border-border bg-secondary/60 p-1" aria-label={t.language}>
            <Button variant={language === "en" ? "secondary" : "ghost"} size="sm" className="h-7 px-2.5 text-xs" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>
              EN
            </Button>
            <Button variant={language === "sv" ? "secondary" : "ghost"} size="sm" className="h-7 px-2.5 text-xs" onClick={() => setLanguage("sv")} aria-pressed={language === "sv"}>
              SV
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6 relative z-[1]">
        {/* Hero Section - only when no file selected */}
        {showHero && (
          <div className="text-center space-y-4 pt-8 pb-4 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {t.heroTitle}<br />
              <span className="text-gradient-primary">{t.heroAccent}</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
              {t.heroBody}
            </p>
            <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground/70 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500" /> {t.scoreTracking}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary" /> {t.strokeAnalysis}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-500" /> {t.drillTips}
              </span>
            </div>
          </div>
        )}

        <VideoUploader
          onVideoSelect={(file) => {
            setSelectedFile(file);
            setState("upload");
            setAnalysis(null);
            setErrorMsg("");
            // Check video duration
            const vid = document.createElement("video");
            vid.preload = "metadata";
            vid.src = URL.createObjectURL(file);
            vid.onloadedmetadata = () => {
              setVideoDuration(vid.duration);
              URL.revokeObjectURL(vid.src);
            };
          }}
          selectedFile={selectedFile}
          onClear={handleReset}
          language={language}
        />

        {/* Duration warning */}
        {videoDuration !== null && videoDuration > 360 && state === "upload" && (
          <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 animate-slide-up">
            <span className="text-yellow-500 text-lg shrink-0">⚠️</span>
            <div className="text-sm">
              <p className="font-medium text-foreground">
                 {t.videoLength(Math.round(videoDuration / 60))}
              </p>
              <p className="text-muted-foreground mt-1">
                 {t.trimWarning}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        {selectedFile && state === "upload" && (
          <div className="flex justify-center animate-slide-up">
            <Button
              onClick={handleAnalyze}
              size="lg"
              className="px-8 font-semibold glow-primary hover:glow-primary-intense transition-shadow"
            >
              <Activity className="w-4 h-4 mr-2" />
              {t.analyzeMatch}
            </Button>
          </div>
        )}

        {/* Loading + live results */}
        {state === "analyzing" && (
          <>
            <div className="space-y-3 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 animate-pulse-glow">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t.analyzingMatch}</h2>
                  <p className="text-sm text-muted-foreground">{statusText}</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            {analysis && <AnalysisResults data={analysis} language={language} />}
          </>
        )}

        {/* Extracting */}
        {state === "extracting" && (
          <AnalysisResults data={null} isLoading statusText={statusText} language={language} />
        )}

        {/* Error */}
        {state === "error" && (
          <div className="text-center space-y-4 animate-slide-up">
            <p className="text-destructive font-mono text-sm">{errorMsg}</p>
            <Button variant="outline" onClick={handleReset}>
              {t.tryAgain}
            </Button>
          </div>
        )}

        {/* Final Results */}
        {state === "results" && analysis && (
          <>
            <AnalysisResults data={analysis} language={language} />
            {/* Player Insights */}
            {(() => {
               const [n1, n2] = getPlayerNames(language);
               const p1Label = playerLabel(n1, translateDetectedValue(analysis.player1Color, language), translateDetectedValue(analysis.player1Position, language));
               const p2Label = playerLabel(n2, translateDetectedValue(analysis.player2Color, language), translateDetectedValue(analysis.player2Position, language));
              const hasInsights = analysis.player1Insight?.strength || analysis.player2Insight?.strength;
              const hasDrills = analysis.player1Insight?.drillRecommendation || analysis.player2Insight?.drillRecommendation;
              return (
                <>
                  {hasInsights && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "550ms" }}>
                      {analysis.player1Insight?.strength && (
                        <div className="bg-gradient-card rounded-lg border border-border p-5">
                          <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">
                             {p1Label} · {t.playerInsight}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold text-sm shrink-0">+</span>
                              <p className="text-sm text-foreground">{analysis.player1Insight.strength}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-destructive font-bold text-sm shrink-0">−</span>
                              <p className="text-sm text-foreground">{analysis.player1Insight.weakness}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {analysis.player2Insight?.strength && (
                        <div className="bg-gradient-card rounded-lg border border-border p-5">
                          <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">
                             {p2Label} · {t.playerInsight}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold text-sm shrink-0">+</span>
                              <p className="text-sm text-foreground">{analysis.player2Insight.strength}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-destructive font-bold text-sm shrink-0">−</span>
                              <p className="text-sm text-foreground">{analysis.player2Insight.weakness}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Practice Drills - separate section */}
                  {hasDrills && (
                    <div className="animate-slide-up" style={{ animationDelay: "600ms" }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <span className="text-lg">🏓</span>
                        </div>
                         <h2 className="text-lg font-semibold text-foreground">{t.practiceDrills}</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysis.player1Insight?.drillRecommendation && (
                          <div className="bg-gradient-card rounded-lg border border-border p-5">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">
                              {p1Label}
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">
                              {analysis.player1Insight.drillRecommendation}
                            </p>
                          </div>
                        )}
                        {analysis.player2Insight?.drillRecommendation && (
                          <div className="bg-gradient-card rounded-lg border border-border p-5">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">
                              {p2Label}
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">
                              {analysis.player2Insight.drillRecommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            {analysis.summary && (
              <div className="bg-gradient-card rounded-lg border border-border p-5 animate-slide-up" style={{ animationDelay: "650ms" }}>
                 <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">{t.aiSummary}</p>
                <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
              </div>
            )}
            <div className="flex justify-center pt-4 animate-slide-up" style={{ animationDelay: "700ms" }}>
              <Button variant="outline" onClick={handleReset}>
                 {t.analyzeAnother}
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12 relative z-[1]">
        <div className="container max-w-3xl mx-auto px-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60 font-mono">
          <span>{t.builtIn}</span>
          <span>🇸🇪</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
