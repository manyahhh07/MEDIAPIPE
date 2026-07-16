/**
 * Demo gesture library: a small, hand-authored set of keyframe hand poses
 * for the words the backend's untrained model vocabulary also covers
 * (see backend/app/ml/model_loader.py DEFAULT_VOCAB). This is a stand-in
 * for a real motion-captured gesture library - it's enough to drive the
 * animation pipeline end-to-end, but the poses themselves are illustrative,
 * not linguistically accurate ASL. Swap this out for real motion-capture
 * data (or a WLASL-derived keyframe export) before using this for anything
 * beyond a demo.
 *
 * Each pose is 21 hand landmarks (matching MediaPipe Hands ordering) as
 * [x, y, z] in a normalized -1..1 space, wrist-relative.
 */

export type HandPose = [number, number, number][];

export interface GestureKeyframes {
  word: string;
  /** Poses to interpolate through, in order. Held briefly at the last pose. */
  poses: HandPose[];
}

function restPose(): HandPose {
  // A relaxed, slightly curled hand - the shared starting/ending pose.
  return [
    [0, 0, 0],
    [-0.25, 0.35, 0.05], [-0.35, 0.6, 0.1], [-0.4, 0.8, 0.12], [-0.42, 0.95, 0.13],
    [-0.1, 0.5, 0.05], [-0.12, 0.85, 0.08], [-0.13, 1.05, 0.1], [-0.14, 1.2, 0.11],
    [0.05, 0.52, 0.05], [0.05, 0.88, 0.08], [0.05, 1.08, 0.1], [0.05, 1.22, 0.11],
    [0.2, 0.48, 0.05], [0.22, 0.8, 0.08], [0.23, 1.0, 0.1], [0.23, 1.13, 0.11],
    [0.34, 0.4, 0.05], [0.37, 0.62, 0.07], [0.39, 0.78, 0.09], [0.4, 0.9, 0.1],
  ];
}

function openPalmPose(): HandPose {
  // Fingers extended and spread - used for "hello" wave and "please"/"thank you" flat palm.
  return [
    [0, 0, 0],
    [-0.3, 0.3, 0.05], [-0.45, 0.7, 0.1], [-0.55, 1.05, 0.15], [-0.62, 1.35, 0.18],
    [-0.12, 0.5, 0.02], [-0.15, 1.05, 0.02], [-0.17, 1.45, 0.02], [-0.18, 1.75, 0.02],
    [0.05, 0.55, 0.0], [0.05, 1.15, 0.0], [0.05, 1.55, 0.0], [0.05, 1.85, 0.0],
    [0.22, 0.5, 0.0], [0.25, 1.05, 0.0], [0.27, 1.4, 0.0], [0.28, 1.65, 0.0],
    [0.38, 0.4, 0.0], [0.44, 0.75, 0.0], [0.48, 1.0, 0.0], [0.5, 1.2, 0.0],
  ];
}

function fistPose(): HandPose {
  // Closed hand - used for "no" and as a base for "yes" (nodding fist).
  return [
    [0, 0, 0],
    [-0.2, 0.3, 0.05], [-0.3, 0.42, 0.15], [-0.28, 0.4, 0.28], [-0.24, 0.35, 0.36],
    [-0.1, 0.45, 0.05], [-0.12, 0.55, 0.22], [-0.11, 0.4, 0.3], [-0.1, 0.28, 0.32],
    [0.04, 0.48, 0.05], [0.04, 0.6, 0.24], [0.04, 0.42, 0.32], [0.04, 0.3, 0.34],
    [0.18, 0.44, 0.05], [0.19, 0.55, 0.22], [0.19, 0.38, 0.3], [0.19, 0.26, 0.32],
    [0.3, 0.36, 0.05], [0.34, 0.44, 0.18], [0.35, 0.32, 0.24], [0.35, 0.22, 0.26],
  ];
}

function pointPose(): HandPose {
  // Index extended, rest curled - used for "my"/"name" pointing gestures.
  return fistPose().map((p, i) =>
    i >= 5 && i <= 8 ? ([p[0], p[1] * 2.2, p[2] * 0.3] as [number, number, number]) : p
  );
}

const rest = restPose();
const open = openPalmPose();
const fist = fistPose();
const point = pointPose();

export const GESTURE_LIBRARY: Record<string, GestureKeyframes> = {
  HELLO: { word: "HELLO", poses: [rest, open, rest] },
  THANK_YOU: { word: "THANK_YOU", poses: [rest, open, rest] },
  PLEASE: { word: "PLEASE", poses: [rest, open, open, rest] },
  YES: { word: "YES", poses: [rest, fist, rest, fist, rest] },
  NO: { word: "NO", poses: [rest, fist, rest] },
  HELP: { word: "HELP", poses: [rest, open, fist, rest] },
  MY: { word: "MY", poses: [rest, point, rest] },
  NAME: { word: "NAME", poses: [rest, point, point, rest] },
  NICE: { word: "NICE", poses: [rest, open, rest] },
  MEET: { word: "MEET", poses: [rest, point, open, rest] },
  YOU: { word: "YOU", poses: [rest, point, rest] },
  HOW: { word: "HOW", poses: [rest, open, rest] },
  ARE: { word: "ARE", poses: [rest, open, rest] },
};

/** Falls back to a neutral shrug-like pose sequence for unknown words. */
export function getGesture(word: string): GestureKeyframes {
  return GESTURE_LIBRARY[word.toUpperCase()] ?? { word, poses: [rest, open, rest] };
}

/** MediaPipe Hands connections, used to draw bones between landmarks. */
export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];