import { useState, useRef } from "react";
import { Activity } from "lucide-react";
import VideoUploader from "@/components/VideoUploader";
import AnalysisResults from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";
import { extractFramesInChunks } from "@/lib/video-utils";
import { emptyAnalysis, mergeChunkIntoAnalysis, type AnalysisData } from "@/lib/analysis-utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AppState = "upload" | "extracting" | "analyzing" | "results" | "error";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, setState] = useState<AppState>("upload");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0, retrying: false, retryDelay: 0 });
  const { toast } = useToast();
  const cancelRef = useRef(false);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    cancelRef.current = false;

    try {
      setState("extracting");
      setAnalysis(null);

      const chunks = await extractFramesInChunks(selectedFile, 30, 1);

      setState("analyzing");
      setProgress({ current: 0, total: chunks.length, retrying: false, retryDelay: 0 });

      let accumulated = emptyAnalysis();

      for (let i = 0; i < chunks.length; i++) {
        if (cancelRef.current) return;

        setProgress({ current: i + 1, total: chunks.length, retrying: false, retryDelay: 0 });

        let chunkData: any = null;
        const maxRetries = 5;
        const backoffDelays = [15000, 30000, 45000, 60000, 60000];
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          const { data, error } = await supabase.functions.invoke("analyze-match", {
            body: {
              frames: chunks[i].frames,
              chunkIndex: chunks[i].chunkIndex,
              totalChunks: chunks[i].totalChunks,
              startTime: chunks[i].startTime,
              endTime: chunks[i].endTime,
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

          if (error) throw new Error(error.message || "Analysis failed");
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
      const msg = err?.message || "Something went wrong";
      setErrorMsg(msg);
      setState("error");
      toast({
        title: "Analysis Failed",
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
    setProgress({ current: 0, total: 0, retrying: false, retryDelay: 0 });
  };

  const statusText =
    state === "extracting"
      ? "Extracting video frames..."
      : state === "analyzing"
      ? progress.retrying
        ? `Rate limited — retrying segment ${progress.current} of ${progress.total} in ${progress.retryDelay}s...`
        : `Analyzing segment ${progress.current} of ${progress.total}...`
      : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-3xl mx-auto flex items-center gap-3 py-4 px-4">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Ping<span className="text-gradient-primary">Analyst</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono">TABLE TENNIS MATCH ANALYZER</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        <VideoUploader
          onVideoSelect={(file) => {
            setSelectedFile(file);
            setState("upload");
            setAnalysis(null);
            setErrorMsg("");
          }}
          selectedFile={selectedFile}
          onClear={handleReset}
        />

        {/* Action Button */}
        {selectedFile && state === "upload" && (
          <div className="flex justify-center animate-slide-up">
            <Button
              onClick={handleAnalyze}
              size="lg"
              className="px-8 font-semibold glow-primary hover:glow-primary-intense transition-shadow"
            >
              <Activity className="w-4 h-4 mr-2" />
              Analyze Match
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
                  <h2 className="text-lg font-semibold text-foreground">Analyzing Match...</h2>
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
            {analysis && <AnalysisResults data={analysis} />}
          </>
        )}

        {/* Extracting */}
        {state === "extracting" && (
          <AnalysisResults data={null} isLoading statusText={statusText} />
        )}

        {/* Error */}
        {state === "error" && (
          <div className="text-center space-y-4 animate-slide-up">
            <p className="text-destructive font-mono text-sm">{errorMsg}</p>
            <Button variant="outline" onClick={handleReset}>
              Try Again
            </Button>
          </div>
        )}

        {/* Final Results */}
        {state === "results" && analysis && (
          <>
            <AnalysisResults data={analysis} />
            {analysis.summary && (
              <div className="bg-gradient-card rounded-lg border border-border p-5 animate-slide-up" style={{ animationDelay: "600ms" }}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">AI Summary</p>
                <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
              </div>
            )}
            <div className="flex justify-center pt-4 animate-slide-up" style={{ animationDelay: "700ms" }}>
              <Button variant="outline" onClick={handleReset}>
                Analyze Another Clip
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
