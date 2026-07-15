import { useWebcam } from "@/hooks/useWebcam";
import { useEffect, useImperativeHandle, forwardRef } from "react";

export interface WebcamFeedHandle {
  captureFrame: (quality?: number) => string | null;
}

interface WebcamFeedProps {
  onReady?: (active: boolean) => void;
  autoStart?: boolean;
}

export const WebcamFeed = forwardRef<WebcamFeedHandle, WebcamFeedProps>(
  ({ onReady, autoStart = true }, ref) => {
    const { videoRef, isActive, error, start, stop, captureFrame } = useWebcam();

    useEffect(() => {
      if (autoStart) start();
      return () => stop();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      onReady?.(isActive);
    }, [isActive, onReady]);

    useImperativeHandle(ref, () => ({ captureFrame }), [captureFrame]);

    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-surface dark:bg-surface-dark border border-black/10 dark:border-white/10">
        <video
          ref={videoRef}
          muted
          playsInline
          className="h-full w-full object-cover -scale-x-100"
          aria-label="Live webcam feed for sign language recognition"
        />

        {!isActive && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-muted dark:text-muted-dark text-sm">
            Starting camera…
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface dark:bg-surface-dark px-6 text-center">
            <p className="text-sm text-ink dark:text-ink-dark">{error}</p>
            <button
              onClick={start}
              className="rounded-full bg-accent-600 px-4 py-1.5 text-sm text-white hover:bg-accent-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }
);

WebcamFeed.displayName = "WebcamFeed";