import type { ConnectionStatus } from "@/types/translation";

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; dot: string }> = {
  idle: { label: "Not connected", dot: "bg-muted" },
  connecting: { label: "Connecting…", dot: "bg-signal-low animate-pulse" },
  connected: { label: "Connected", dot: "bg-signal-high" },
  disconnected: { label: "Disconnected", dot: "bg-muted" },
  error: { label: "Connection error", dot: "bg-red-500" },
};

export function StatusPill({ status }: { status: ConnectionStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-sm text-muted dark:text-muted-dark">
      <span className={`h-2 w-2 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}