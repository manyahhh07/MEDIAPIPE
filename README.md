# SignBridge AI

Real-time translation between sign language and spoken/written language.

This README tracks two things: the **target structure** the full product
is being built toward, and the **current progress** against it.

---

## Target Structure

```
signbridge-ai/
├── frontend/
│   ├── public/assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── webcam/          WebcamFeed, LandmarkOverlay
│   │   │   ├── translation/     SignToText, TextToSign, ConfidenceMeter
│   │   │   ├── avatar/          SignAvatar3D (Three.js)
│   │   │   ├── conversation/    ConversationMode
│   │   │   ├── layout/          Sidebar, Navbar, ThemeToggle
│   │   │   └── ui/              shared buttons/cards/modals
│   │   ├── hooks/               useWebcam, useWebSocket, useSpeechRecognition, useMediaPipe
│   │   ├── pages/               Dashboard, LiveTranslate, Conversation, Settings
│   │   ├── services/            api.ts, websocket.ts
│   │   ├── store/                state management
│   │   ├── types/
│   │   ├── styles/
│   │   └── App.tsx, main.tsx
│   └── package.json, tailwind.config.ts, tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/                 routes_translate, routes_speech, routes_ws
│   │   ├── core/                config, logger
│   │   ├── ml/                  landmark_extractor, sequence_buffer, sign_recognizer,
│   │   │                        sentence_builder, model_loader
│   │   ├── speech/              stt, tts
│   │   └── schemas/             translation
│   └── requirements.txt, .env.example
│
├── models/
│   ├── sign_recognition/        train.py, model_def.py, checkpoints/
│   └── README.md
│
├── datasets/
│   ├── loaders/                 wlasl_loader, base_loader (+ more per dataset)
│   └── README.md
│
├── animations/gesture_library/   real motion-capture / keyframe data
├── docs/                         ARCHITECTURE, API, DEPLOYMENT, etc.
└── .gitignore, docker-compose.yml, README.md
```

---

## Current Progress

**67 files total.** Legend: ✅ done & verified · ⚠️ partial / stubbed · ❌ not started.

### `backend/` — ✅ complete (18 files)

```
backend/
├── requirements.txt, .env.example
└── app/
    ├── main.py                     wires all 3 routers
    ├── core/
    │   ├── config.py               env-based settings
    │   └── logger.py
    ├── api/
    │   ├── routes_translate.py     /status (live), text-to-sign (501 stub — not built)
    │   ├── routes_ws.py            /ws/translate — full live recognition pipeline
    │   └── routes_speech.py        /speech/speech-to-text, /speech/text-to-speech
    ├── ml/
    │   ├── landmark_extractor.py   MediaPipe Holistic wrapper
    │   ├── sequence_buffer.py      rolling window + idle-gating
    │   ├── model_loader.py         SignLSTM definition + checkpoint loading
    │   ├── sign_recognizer.py      inference + confidence gating
    │   └── sentence_builder.py     punctuation / dedup / capitalization
    ├── speech/
    │   ├── stt.py                  Whisper wrapper
    │   └── tts.py                  espeak-ng wrapper
    └── schemas/translation.py
```

Verified by actually running it: server boots, `/status` responds, WebSocket
streams real landmarks and gates idle frames correctly, TTS produces valid
WAV over HTTP, STT is correct up to the point of downloading Whisper's
weights (blocked by this sandbox's network policy, not a code issue).

### `frontend/` — ✅ complete (27 files)

```
frontend/
├── package.json, vite/tailwind/tsconfig
└── src/
    ├── components/
    │   ├── webcam/WebcamFeed.tsx
    │   ├── avatar/SignAvatar3D.tsx      Three.js skeletal hand
    │   ├── translation/ConfidenceMeter.tsx
    │   ├── layout/Navbar.tsx, ThemeToggle.tsx
    │   └── ui/StatusPill.tsx
    ├── hooks/useWebcam.ts, useWebSocket.ts, useSpeechRecognition.ts
    ├── pages/Dashboard, LiveTranslate, TextToSign, Conversation, Settings.tsx
    ├── services/api.ts, env.ts
    ├── data/gestureLibrary.ts           demo pose keyframes
    ├── types/translation.ts
    └── styles/index.css                 neutral/minimal theme, a11y base styles
```

⚠️ Not built: `LandmarkOverlay` and `useMediaPipe` (unneeded — extraction
happens server-side, not in-browser), `Sidebar` (nav is a top navbar
instead), `store/` (zustand is installed but nothing has needed
cross-page state yet).

Verified by actually running it: `npm install`, `tsc` typecheck, and
`vite build` all pass clean; dev server serves all 5 routes with `200`.

### `models/` — ✅ complete, functionally verified

```
models/
├── sign_recognition/
│   ├── model_def.py, train.py       trained end-to-end on synthetic data;
│   │                                 resulting checkpoint confirmed loadable
│   │                                 by the backend's inference path
│   └── checkpoints/                 empty (.gitkeep) — no real checkpoint ships
└── README.md
```

### `datasets/` — ✅ complete for WLASL + synthetic

```
datasets/
├── loaders/base_loader.py, wlasl_loader.py, synthetic_loader.py
└── README.md
```

⚠️ Not built: ASLLVD, AUTSL, Indian Sign Language loaders — `README.md`
documents the interface to implement them against.

### `animations/gesture_library/` — ⚠️ README only

Real gesture data currently lives inline in
`frontend/src/data/gestureLibrary.ts` as a small, hand-authored placeholder
vocabulary (rest / open palm / fist / point poses) — not real ASL. This
folder's `README.md` documents how to graduate to real motion-capture or
dataset-derived keyframes later.

### `docs/` — ❌ not started

No `ARCHITECTURE.md`, `API.md`, `DEPLOYMENT.md`, or setup guides yet.

### Repo root — ❌ not started

This file is the first piece. Still missing: `docker-compose.yml`, a
top-level `.gitignore` (backend/ and frontend/ each have their own).

---

## Known honest gaps

- **No trained model ships.** The backend runs with an untrained
  `SignLSTM` until `models/sign_recognition/train.py` is run against a
  real dataset — predictions are meaningless until then (the backend logs
  a warning about this on startup).
- **Gesture library is a placeholder**, not linguistically accurate ASL.
- **Whisper weights require internet access** on first run (not bundled).
