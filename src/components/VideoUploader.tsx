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
        relative flex flex-col items-center justify-center gap-4 p-12
        rounded-lg border-2 border-dashed cursor-pointer
        transition-all duration-300
        ${
          isDragging
            ? "border-primary bg-primary/5 glow-primary"
            : "border-border hover:border-primary/50 hover:bg-card"
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
        className={`p-4 rounded-full transition-all duration-300 ${
          isDragging ? "bg-primary/20 glow-primary" : "bg-secondary"
        }`}
      >
        <Upload className={`w-8 h-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-foreground font-medium">
          {isDragging ? "Drop your video here" : "Drag & drop your match clip"}
        </p>
        <p className="text-sm text-muted-foreground">
          or click to browse · MP4, MOV, WebM · Max 250 MB
        </p>
        <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto leading-relaxed">
          For best results: good resolution (720p+), both players visible, steady camera, and good lighting
        </p>
      </div>
    </label>
  );
};

export default VideoUploader;
