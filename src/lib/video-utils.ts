/**
 * Extract evenly-spaced frames from a video file as base64 data URLs.
 * Returns frames grouped into chunks for progressive analysis.
 */

export interface FrameChunk {
  chunkIndex: number;
  totalChunks: number;
  startTime: number;
  endTime: number;
  frames: string[];
}

export async function extractFramesInChunks(
  file: File,
  chunkDurationSec = 30,
  framesPerSecond = 1
): Promise<FrameChunk[]> {
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
      const totalChunks = Math.max(1, Math.ceil(duration / chunkDurationSec));

      // Cap dimensions for smaller payloads
      const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      // Build all frame times grouped by chunk
      const chunkTimesMap: { startTime: number; endTime: number; times: number[] }[] = [];
      for (let c = 0; c < totalChunks; c++) {
        const startTime = c * chunkDurationSec;
        const endTime = Math.min((c + 1) * chunkDurationSec, duration);
        const segDuration = endTime - startTime;
        const count = Math.max(3, Math.ceil(segDuration * framesPerSecond));
        const times: number[] = [];
        for (let i = 0; i < count; i++) {
          times.push(startTime + (segDuration / (count + 1)) * (i + 1));
        }
        chunkTimesMap.push({ startTime, endTime, times });
      }

      // Flatten all times for sequential seeking
      const allTimes = chunkTimesMap.flatMap((c) => c.times);
      const allFrames: string[] = [];
      let idx = 0;

      const captureFrame = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        allFrames.push(canvas.toDataURL("image/jpeg", 0.7));
        idx++;
        if (idx < allTimes.length) {
          video.currentTime = allTimes[idx];
        } else {
          URL.revokeObjectURL(video.src);
          // Split frames back into chunks
          const chunks: FrameChunk[] = [];
          let frameIdx = 0;
          for (let c = 0; c < chunkTimesMap.length; c++) {
            const count = chunkTimesMap[c].times.length;
            chunks.push({
              chunkIndex: c,
              totalChunks,
              startTime: chunkTimesMap[c].startTime,
              endTime: chunkTimesMap[c].endTime,
              frames: allFrames.slice(frameIdx, frameIdx + count),
            });
            frameIdx += count;
          }
          resolve(chunks);
        }
      };

      video.onseeked = captureFrame;
      video.currentTime = allTimes[0];
    };

    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = URL.createObjectURL(file);
  });
}
