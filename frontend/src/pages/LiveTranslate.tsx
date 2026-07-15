import { useCallback, useEffect, useRef, useState } from "react";
import { WebcamFeed, type WebcamFeedHandle } from "@/components/webcam/WebcamFeed";
import { ConfidenceMeter } from "@/components/translation/ConfidenceMeter";
import { StatusPill } from "@/components/ui/StatusPill";
import { useTranslationSocket } from "@/hooks/useWebSocket";
import type { RecognizedEntry } from "@/types/translation";

const CAPTURE_INTERVAL_MS = 150; // ~6-7 fps upload; buffer window is 45 frames server-side

export function LiveTranslate() {
  const webcamRef = useRef<WebcamFeedHandle>(null);
  const { status, lastMessage, connect, disconnect, sendFrame, endSentence } =
    useTranslationSocket();

  const [bufferProgress, setBufferProgress] = useState(0);
  const [windowSize, setWindowSize] = useState(45);
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [history, setHistory] = useState<RecognizedEntry[]>([]);
  const [sentence, setSentence] = useState("");

  useEffect(() => {
    connect();
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "landmarks":
        setBufferProgress(lastMessage.buffer_progress);
        setWindowSize(lastMessage.window_size);
        break;
      case "prediction":
        setCurrentConfidence(lastMessage.confidence);
        setSentence(lastMessage.sentence_so_far);
        setHistory((prev) => [
          {
            id: `${Date.now()}-${lastMessage.gloss}`,
            gloss: lastMessage.gloss,
            confidence: lastMessage.confidence,
            timestamp: Date.now(),
          },
          ...prev,
        ].slice(0, 20));
        break;
      case "prediction_below_threshold":
        setCurrentConfidence(lastMessage.confidence);
        break;
      case "sentence_complete":
        setSentence(lastMessage.sentence);
        break;
      case "error":
        console.error("Server error:", lastMessage.message);
        break;
    }
  }, [lastMessage]);

  useEffect(() => {
    if (status !== "connected") return;
    const interval = setInterval(() => {
      const frame = webcamRef.current?.captureFrame();
      if (frame) sendFrame(frame);
    }, CAPTURE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, sendFrame]);

  const handleEndSentence = useCallback(() => endSentence(), [endSentence]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Live Translate</h1>
          <p className="mt-1 text-sm text-muted dark:text-muted-dark">
            Sign in view of the camera. Recognized words build into a sentence below.
          </p>
        </div>
        <StatusPill status={status} />
      </header>

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <WebcamFeed ref={webcamRef} />

          <div className="flex items-center justify-between rounded-card border border-black/10 dark:border-white/10 px-4 py-3 text-sm">
            <span className="text-muted dark:text-muted-dark">
              Buffer: {bufferProgress}/{windowSize} frames
            </span>
            <ConfidenceMeter confidence={currentConfidence} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-card border border-black/10 dark:border-white/10 p-5">
            <h2 className="text-sm font-medium text-muted dark:text-muted-dark mb-2">
              Detected sentence
            </h2>
            <p className="min-h-[3rem] text-lg leading-relaxed">
              {sentence || <span className="text-muted dark:text-muted-dark">Waiting for signs…</span>}
            </p>
            <button
              onClick={handleEndSentence}
              className="mt-4 rounded-full bg-accent-600 px-4 py-1.5 text-sm text-white hover:bg-accent-700 transition-colors"
            >
              End sentence
            </button>
          </div>

          <div className="rounded-card border border-black/10 dark:border-white/10 p-5 flex-1">
            <h2 className="text-sm font-medium text-muted dark:text-muted-dark mb-3">
              Recognition log
            </h2>
            {history.length === 0 ? (
              <p className="text-sm text-muted dark:text-muted-dark">
                Recognized signs will appear here as they're detected.
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between text-sm border-b border-black/5 dark:border-white/5 pb-2 last:border-0"
                  >
                    <span className="font-medium">{entry.gloss.toLowerCase()}</span>
                    <ConfidenceMeter confidence={entry.confidence} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}