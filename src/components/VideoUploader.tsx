import { useCallback, useState } from "react";
import { Upload, Film, X } from "lucide-react";

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const VideoUploader = ({ onVideoSelect, selectedFile, onClear }: VideoUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("video/")) onVideoSelect(file);
    },
    [onVideoSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onVideoSelect(file);
  };

  if (selectedFile) {
    return (
      <div className="relative rounded-lg border border-border bg-card overflow-hidden">
        <video
          src={URL.createObjectURL(selectedFile)}
          controls
          className="w-full max-h-[400px] object-contain bg-background"
        />
        <div className="flex items-center justify-between p-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <Film className="w-4 h-4 text-primary" />
            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
            <span className="text-xs">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
          </div>
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <label
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`
        group relative flex flex-col items-center justify-center gap-5 p-14
        rounded-xl border-2 border-dashed cursor-pointer
        transition-all duration-300
        ${
          isDragging
            ? "border-primary bg-primary/5 glow-primary scale-[1.01]"
            : "border-border hover:border-primary/40 hover:bg-card/50"
        }
      `}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        className="hidden"
      />
      <div
        className={`p-5 rounded-2xl transition-all duration-300 ${
          isDragging
            ? "bg-primary/20 glow-primary"
            : "bg-secondary group-hover:bg-primary/10"
        }`}
      >
        <Upload className={`w-8 h-8 transition-colors duration-300 ${isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-foreground font-medium text-base">
          {isDragging ? "Drop your video here" : "Drop your match clip here"}
        </p>
        <p className="text-sm text-muted-foreground">
          or <span className="text-primary/80 underline underline-offset-2">browse files</span> · MP4, MOV, WebM · Max 250 MB
        </p>
      </div>
      <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground/60">
        <span>720p+ recommended</span>
        <span className="w-0.5 h-3 bg-border rounded-full" />
        <span>Both players visible</span>
        <span className="w-0.5 h-3 bg-border rounded-full" />
        <span>Steady camera</span>
      </div>
    </label>
  );
};

export default VideoUploader;
