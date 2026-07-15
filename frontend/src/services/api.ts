import { API_BASE_URL } from "./env";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || res.statusText);
  }

  return res.json() as Promise<T>;
}

export interface StatusResponse {
  status: string;
  app_name: string;
  environment: string;
}

export const api = {
  getStatus: () => request<StatusResponse>("/api/v1/status"),

  textToSpeech: async (text: string): Promise<Blob> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/speech/text-to-speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ApiError(res.status, body || res.statusText);
    }
    return res.blob();
  },

  speechToText: async (audioBlob: Blob): Promise<{ text: string }> => {
    const form = new FormData();
    form.append("audio", audioBlob, "recording.webm");
    const res = await fetch(`${API_BASE_URL}/api/v1/speech/speech-to-text`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ApiError(res.status, body || res.statusText);
    }
    return res.json();
  },
};