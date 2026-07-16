import { useMemo, useState } from "react";
import { SignAvatar3D } from "@/components/avatar/SignAvatar3D";
import { getGesture, type HandPose } from "@/data/gestureLibrary";

export function TextToSign() {
  const [text, setText] = useState("");
  const [queue, setQueue] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentPoses: HandPose[] = useMemo(() => {
    if (!isPlaying || queue.length === 0) return [];
    return getGesture(queue[activeIndex]).poses;
  }, [queue, activeIndex, isPlaying]);

  const play = () => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return;
    setQueue(words);
    setActiveIndex(0);
    setIsPlaying(true);
  };

  const handleWordComplete = () => {
    setActiveIndex((i) => {
      const next = i + 1;
      if (next >= queue.length) {
        setIsPlaying(false);
        return i;
      }
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Text to Sign</h1>
        <p className="mt-1 text-sm text-muted dark:text-muted-dark">
          Type a phrase and watch it signed word by word.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Hello, how are you?"
            rows={4}
            className="w-full resize-none rounded-card border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark p-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
          <button
            onClick={play}
            disabled={isPlaying || text.trim().length === 0}
            className="rounded-full bg-accent-600 px-5 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-40 disabled:hover:bg-accent-600 transition-colors"
          >
            {isPlaying ? "Signing…" : "Sign it"}
          </button>

          {queue.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {queue.map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className={`rounded-full px-3 py-1 text-xs ${
                    i === activeIndex && isPlaying
                      ? "bg-accent-600 text-white"
                      : i < activeIndex
                        ? "bg-accent-100 dark:bg-accent-700/20 text-accent-700 dark:text-accent-300"
                        : "bg-black/5 dark:bg-white/5 text-muted dark:text-muted-dark"
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-muted dark:text-muted-dark pt-2">
            Demo gesture set covers a small vocabulary (hello, thank you, please, yes, no,
            help, my, name, nice, meet, you, how, are). Unrecognized words fall back to a
            generic gesture.
          </p>
        </div>

        <div className="aspect-square rounded-card border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark">
          {currentPoses.length > 0 ? (
            <SignAvatar3D poses={currentPoses} onSequenceComplete={handleWordComplete} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted dark:text-muted-dark">
              Sign animation will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}