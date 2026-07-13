## 📁 Project Structure

```text
signbridge-ai/
│
├── frontend/                     # React + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── webcam/           # Live webcam & landmark overlay
│   │   │   ├── translation/      # Sign ↔ Text interface
│   │   │   ├── avatar/           # 3D sign language avatar
│   │   │   ├── conversation/     # Live conversation mode
│   │   │   ├── layout/           # Navbar, Sidebar, Theme
│   │   │   └── ui/               # Shared UI components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # Application pages
│   │   ├── services/             # API & WebSocket clients
│   │   ├── store/                # Zustand state management
│   │   ├── types/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── api/                  # REST & WebSocket routes
│   │   ├── core/                 # Configuration & logging
│   │   ├── ml/                   # AI inference pipeline
│   │   ├── speech/               # Speech-to-Text & Text-to-Speech
│   │   ├── schemas/              # Pydantic models
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── models/                       # Model training & checkpoints
│
├── datasets/                     # Dataset loaders & preprocessing
│
├── animations/                   # Gesture animation library
│
├── docs/                         # Architecture & API documentation
│
├── .gitignore
├── docker-compose.yml
└── README.md
```
