/**
 * Central place for reading Vite env vars, so a missing .env fails loudly
 * at startup instead of silently hitting the wrong URL.
 */

function requireEnv(key: string, fallback: string): string {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(`[env] ${key} is not set, falling back to ${fallback}`);
    return fallback;
  }
  return value;
}

export const API_BASE_URL = requireEnv("VITE_API_URL", "http://localhost:8000");
export const WS_URL = requireEnv("VITE_WS_URL", "ws://localhost:8000/ws/translate");