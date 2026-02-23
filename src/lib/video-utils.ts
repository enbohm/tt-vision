/**
 * Extract evenly-spaced frames from a video file as base64 data URLs.
 */
export async function extractFrames(file: File, count = 6): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas not supported"));

    video.onloadedmetadata = () => {
      const duration = video.duration;
      // Cap dimensions for smaller payloads
      const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const times: number[] = [];
      for (let i = 0; i < count; i++) {
        times.push((duration / (count + 1)) * (i + 1));
      }

      const frames: string[] = [];
      let idx = 0;

      const captureFrame = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.7));
        idx++;
        if (idx < times.length) {
          video.currentTime = times[idx];
        } else {
          URL.revokeObjectURL(video.src);
          resolve(frames);
        }
      };

      video.onseeked = captureFrame;
      video.currentTime = times[0];
    };

    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = URL.createObjectURL(file);
  });
}
