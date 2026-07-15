interface ConfidenceMeterProps {
  confidence: number; // 0-1
}

export function ConfidenceMeter({ confidence }: ConfidenceMeterProps) {
  const pct = Math.round(confidence * 100);
  const color = confidence >= 0.75 ? "bg-signal-high" : "bg-signal-low";

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-24 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Recognition confidence"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted dark:text-muted-dark">{pct}%</span>
    </div>
  );
}