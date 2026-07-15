// Mirrors backend/app/schemas/translation.py and the WS protocol in
// backend/app/api/routes_ws.py. Keep these in sync manually - if the
// backend contract changes, update both sides.

export interface LandmarksMessage {
  type: "landmarks";
  meta: {
    has_pose: boolean;
    has_left_hand: boolean;
    has_right_hand: boolean;
    has_face: boolean;
  };
  buffer_progress: number;
  window_size: number;
}

export interface ReadyForPredictionMessage {
  type: "ready_for_prediction";
}

export interface PredictionMessage {
  type: "prediction";
  gloss: string;
  confidence: number;
  sentence_so_far: string;
}

export interface PredictionBelowThresholdMessage {
  type: "prediction_below_threshold";
  confidence: number;
}

export interface SentenceCompleteMessage {
  type: "sentence_complete";
  sentence: string;
}

export interface WSErrorMessage {
  type: "error";
  message: string;
}

export type ServerMessage =
  | LandmarksMessage
  | ReadyForPredictionMessage
  | PredictionMessage
  | PredictionBelowThresholdMessage
  | SentenceCompleteMessage
  | WSErrorMessage;

export type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface RecognizedEntry {
  id: string;
  gloss: string;
  confidence: number;
  timestamp: number;
}