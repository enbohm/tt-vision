import { useState } from "react";
import { Activity } from "lucide-react";
import VideoUploader from "@/components/VideoUploader";
import AnalysisResults from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";

const mockAnalysis = {
  totalRallies: 18,
  avgRallyLength: 4.2,
  longestRally: 12,
  player1Score: 11,
  player2Score: 7,
  serveSpeed: "~45 km/h",
  topspinShots: 34,
  backhandWinners: 5,
  forehandWinners: 8,
  netPoints: 3,
};

type AppState = "upload" | "analyzing" | "results";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, setState] = useState<AppState>("upload");

  const handleAnalyze = () => {
    setState("analyzing");
    // Simulate analysis — will be replaced with real AI backend
    setTimeout(() => setState("results"), 3000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setState("upload");
  };

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
        {/* Upload Section */}
        <VideoUploader
          onVideoSelect={(file) => {
            setSelectedFile(file);
            setState("upload");
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

        {/* Results */}
        {(state === "analyzing" || state === "results") && (
          <AnalysisResults
            data={mockAnalysis}
            isLoading={state === "analyzing"}
          />
        )}

        {state === "results" && (
          <div className="flex justify-center pt-4 animate-slide-up" style={{ animationDelay: "600ms" }}>
            <Button variant="outline" onClick={handleReset}>
              Analyze Another Clip
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
