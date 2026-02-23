import { useState } from "react";
import { Activity } from "lucide-react";
import VideoUploader from "@/components/VideoUploader";
import AnalysisResults from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";
import { extractFrames } from "@/lib/video-utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AppState = "upload" | "extracting" | "analyzing" | "results" | "error";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, setState] = useState<AppState>("upload");
  const [analysis, setAnalysis] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setState("extracting");

      const frames = await extractFrames(selectedFile, 6);

      setState("analyzing");

      const { data, error } = await supabase.functions.invoke("analyze-match", {
        body: { frames },
      });

      if (error) {
        throw new Error(error.message || "Analysis failed");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      setState("results");
    } catch (err: any) {
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
    setSelectedFile(null);
    setState("upload");
    setAnalysis(null);
    setErrorMsg("");
  };

  const statusText =
    state === "extracting"
      ? "Extracting video frames..."
      : state === "analyzing"
      ? "AI is analyzing your match..."
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

        {/* Loading States */}
        {(state === "extracting" || state === "analyzing") && (
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

        {/* Results */}
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
