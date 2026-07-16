import { useEffect, useState } from "react";

interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
}

const STORAGE_KEY = "signbridge-accessibility";

function loadSettings(): AccessibilitySettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AccessibilitySettings;
  } catch {
    // fall through to defaults
  }
  return { largeText: false, highContrast: false };
}

export function Settings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);

  useEffect(() => {
    document.documentElement.classList.toggle("large-text", settings.largeText);
    document.documentElement.classList.toggle("high-contrast", settings.highContrast);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggle = (key: keyof AccessibilitySettings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-muted dark:text-muted-dark mb-8">
        Accessibility and display preferences, saved on this device.
      </p>

      <div className="space-y-4">
        <SettingRow
          label="Large text"
          description="Increase base font size across the app."
          checked={settings.largeText}
          onChange={() => toggle("largeText")}
        />
        <SettingRow
          label="High contrast"
          description="Maximum contrast between text and background."
          checked={settings.highContrast}
          onChange={() => toggle("highContrast")}
        />
      </div>

      <div className="mt-10 rounded-card border border-black/10 dark:border-white/10 p-5">
        <h2 className="text-sm font-medium mb-3">Keyboard shortcuts</h2>
        <dl className="space-y-2 text-sm">
          <ShortcutRow keys="Ctrl / Cmd + K" desc="Open quick navigation" />
          <ShortcutRow keys="Space" desc="Start / stop live translation (on Live Translate page)" />
          <ShortcutRow keys="Ctrl / Cmd + Enter" desc="Sign current text (on Text to Sign page)" />
          <ShortcutRow keys="Esc" desc="Close any open dialog" />
        </dl>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-card border border-black/10 dark:border-white/10 p-4 cursor-pointer">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted dark:text-muted-dark mt-0.5">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 accent-accent-600"
      />
    </label>
  );
}

function ShortcutRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted dark:text-muted-dark">{desc}</dt>
      <dd>
        <kbd className="rounded border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-2 py-0.5 font-mono text-xs">
          {keys}
        </kbd>
      </dd>
    </div>
  );
}