import { useCallback, useEffect, useMemo, useState } from "react";
import { Upload, Film, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations, type Language } from "@/lib/i18n";

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  language: Language;
}

const VideoUploader = ({ onVideoSelect, selectedFile, onClear, language }: VideoUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const t = getTranslations(language);
  const videoUrl = useMemo(() => selectedFile ? URL.createObjectURL(selectedFile) : "", [selectedFile]);

  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("video/")) onVideoSelect(file);
  }, [onVideoSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onVideoSelect(file);
  };

  if (selectedFile) {
    return (
      <div className="relative rounded-lg border border-border bg-card overflow-hidden">
        <video src={videoUrl} controls className="w-full max-h-[400px] object-contain bg-background" />
        <div className="flex items-center justify-between p-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono min-w-0">
            <Film className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
            <span className="text-xs shrink-0">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClear} aria-label={t.removeVideo}>
            <X className="w-4 h-4" />
          </Button>
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
      className={`group relative flex flex-col items-center justify-center gap-5 p-8 sm:p-14 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-300 ${
        isDragging ? "border-primary bg-primary/5 glow-primary scale-[1.01]" : "border-border hover:border-primary/40 hover:bg-card/50"
      }`}
    >
      <input type="file" accept="video/*" onChange={handleFileInput} className="hidden" />
      <div className={`p-5 rounded-lg transition-all duration-300 ${isDragging ? "bg-primary/20 glow-primary" : "bg-secondary group-hover:bg-primary/10"}`}>
        <Upload className={`w-8 h-8 transition-colors duration-300 ${isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-foreground font-medium text-base">{isDragging ? t.dropHere : t.dropClip}</p>
        <p className="text-sm text-muted-foreground">
          {t.or} <span className="text-primary/80 underline underline-offset-2">{t.browseFiles}</span> · MP4, MOV, WebM · {t.maxFile}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 text-xs text-muted-foreground/60">
        <span>{t.recommended}</span><span className="w-0.5 h-3 bg-border rounded-full" />
        <span>{t.bothVisible}</span><span className="w-0.5 h-3 bg-border rounded-full" />
        <span>{t.steadyCamera}</span>
      </div>
    </label>
  );
};

export default VideoUploader;
