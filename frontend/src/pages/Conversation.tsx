import { useEffect, useMemo, useRef, useState } from "react";
import { WebcamFeed, type WebcamFeedHandle } from "@/components/webcam/WebcamFeed";
import { SignAvatar3D } from "@/components/avatar/SignAvatar3D";
import { StatusPill } from "@/components/ui/StatusPill";
import { useTranslationSocket } from "@/hooks/useWebSocket";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { getGesture, type HandPose } from "@/data/gestureLibrary";

interface ChatMessage {
  id: string;
  from: "signer" | "speaker";
  text: string;
  timestamp: number;
}

const CAPTURE_INTERVAL_MS = 150;

export function Conversation() {
  const webcamRef = useRef<WebcamFeedHandle>(null);
  const { status, lastMessage, connect, disconnect, sendFrame } = useTranslationSocket();
  const speech = useSpeechRecognition();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [signQueue, setSignQueue] = useState<string[]>([]);
  const [signIndex, setSignIndex] = useState(0);

  useEffect(() => {
    connect();
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Person A (signer) side: append completed sentences to the chat
  useEffect(() => {
    if (lastMessage?.type === "sentence_complete" && lastMessage.sentence) {
      setMessages((prev) => [
        ...prev,
        { id: `signer-${Date.now()}`, from: "signer", text: lastMessage.sentence, timestamp: Date.now() },
      ]);
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

  // Person B (speaker) side: push finished speech into chat, then sign it back
  const lastSpokenRef = useRef("");
  useEffect(() => {
    const text = speech.transcript.trim();
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;

    setMessages((prev) => [...prev, { id: `speaker-${Date.now()}`, from: "speaker", text, timestamp: Date.now() }]);
    setSignQueue(text.split(/\s+/).filter(Boolean));
    setSignIndex(0);
  }, [speech.transcript]);

  const currentPoses: HandPose[] = useMemo(() => {
    if (signQueue.length === 0) return [];
    return getGesture(signQueue[signIndex]).poses;
  }, [signQueue, signIndex]);

  const handleSignComplete = () => {
    setSignIndex((i) => {
      const next = i + 1;
      if (next >= signQueue.length) {
        setSignQueue([]);
        return 0;
      }
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Conversation Mode</h1>
          <p className="mt-1 text-sm text-muted dark:text-muted-dark">
            One person signs, the other speaks — both sides translated live.
          </p>
        </div>
        <StatusPill status={status} />
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: signer side */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted dark:text-muted-dark">Person A — signs</p>
          <WebcamFeed ref={webcamRef} />
        </div>

        {/* Right: speaker side, with sign playback */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted dark:text-muted-dark">Person B — speaks</p>
            {speech.isSupported ? (
              <button
                onClick={speech.isListening ? speech.stop : speech.start}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  speech.isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-accent-600 text-white hover:bg-accent-700"
                }`}
              >
                {speech.isListening ? "Stop listening" : "Start speaking"}
              </button>
            ) : (
              <span className="text-xs text-muted dark:text-muted-dark">
                Speech recognition isn't supported in this browser
              </span>
            )}
          </div>

          <div className="aspect-[4/3] rounded-card border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark">
            {currentPoses.length > 0 ? (
              <SignAvatar3D poses={currentPoses} onSequenceComplete={handleSignComplete} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted dark:text-muted-dark">
                {speech.isListening ? "Listening…" : "Sign playback appears here"}
              </div>
            )}
          </div>
          {speech.error && <p className="text-xs text-red-500">{speech.error}</p>}
        </div>
      </div>

      {/* Chat transcript spanning both sides */}
      <div className="mt-6 rounded-card border border-black/10 dark:border-white/10 p-5">
        <h2 className="text-sm font-medium text-muted dark:text-muted-dark mb-3">Conversation</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-muted dark:text-muted-dark">
            Messages from both sides will appear here as the conversation happens.
          </p>
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`flex ${m.from === "signer" ? "justify-start" : "justify-end"}`}
              >
                <span
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    m.from === "signer"
                      ? "bg-black/5 dark:bg-white/5"
                      : "bg-accent-600 text-white"
                  }`}
                >
                  {m.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}