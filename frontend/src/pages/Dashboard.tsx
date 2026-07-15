import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";

export function Dashboard() {
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    api
      .getStatus()
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("down"));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="text-3xl font-semibold font-display tracking-tight max-w-2xl">
        Real-time translation between sign and spoken language.
      </h1>
      <p className="mt-3 max-w-xl text-muted dark:text-muted-dark">
        SignBridge AI reads sign language through your camera and speaks it aloud, and
        listens to speech and signs it back — all in one continuous conversation.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/translate"
          className="rounded-full bg-accent-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-700 transition-colors"
        >
          Start live translation
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 px-4 py-2 text-sm text-muted dark:text-muted-dark">
          <span
            className={`h-2 w-2 rounded-full ${
              apiStatus === "ok"
                ? "bg-signal-high"
                : apiStatus === "down"
                  ? "bg-red-500"
                  : "bg-muted animate-pulse"
            }`}
          />
          API {apiStatus === "checking" ? "checking…" : apiStatus === "ok" ? "online" : "unreachable"}
        </span>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          { title: "Sign → Text", desc: "Continuous recognition from your webcam, buffered into full sentences." },
          { title: "Speech → Sign", desc: "Speak naturally; it's converted to sign animation in real time." },
          { title: "Sign → Speech", desc: "What you sign is read aloud, so the conversation runs both ways." },
        ].map((card) => (
          <div key={card.title} className="rounded-card border border-black/10 dark:border-white/10 p-5">
            <h3 className="font-medium">{card.title}</h3>
            <p className="mt-1.5 text-sm text-muted dark:text-muted-dark">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}