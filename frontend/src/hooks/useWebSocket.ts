import { useCallback, useEffect, useRef, useState } from "react";
import { WS_URL } from "@/services/env";
import type { ConnectionStatus, ServerMessage } from "@/types/translation";

interface UseTranslationSocketResult {
  status: ConnectionStatus;
  lastMessage: ServerMessage | null;
  connect: () => void;
  disconnect: () => void;
  sendFrame: (dataUrl: string) => void;
  endSentence: () => void;
}

/**
 * Owns the single WebSocket connection to /ws/translate. Frame-sending is
 * fire-and-forget over an open socket - callers don't await anything, they
 * just push frames and read `lastMessage` for whatever came back.
 */
export function useTranslationSocket(): UseTranslationSocketResult {
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState <= WebSocket.OPEN) {
      return; // already connecting/connected
    }

    setStatus("connecting");
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => setStatus("connected");

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as ServerMessage;
        setLastMessage(parsed);
      } catch {
        console.error("Received malformed WS message:", event.data);
      }
    };

    ws.onerror = () => setStatus("error");

    ws.onclose = () => {
      setStatus("disconnected");
      socketRef.current = null;
    };

    socketRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
    setStatus("disconnected");
  }, []);

  useEffect(() => disconnect, [disconnect]);

  const sendFrame = useCallback((dataUrl: string) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "frame", data: dataUrl }));
  }, []);

  const endSentence = useCallback(() => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "end_sentence" }));
  }, []);

  return { status, lastMessage, connect, disconnect, sendFrame, endSentence };
}