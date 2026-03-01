# Rocket Mortgage FAQ Bot — Frontend

React + TypeScript + Tailwind CSS frontend for the Rocket Mortgage FAQ chatbot. Provides a modern chat interface where users can ask questions about Rocket Mortgage services, and an evaluation dashboard to measure RAG pipeline quality.

---

## Features

- **Chat interface** with suggestion buttons for common questions
- **Source citations** — expandable panel showing which FAQ entries were used and their relevance scores
- **Evaluation dashboard** — run retrieval metrics (Precision, Recall, MRR) and LLM-as-judge evaluations directly from the UI
- **Responsive design** with Rocket Mortgage brand styling

### Screenshots

**Chat tab** — ask questions, view answers with source citations

**Evaluation tab** — run retrieval and LLM-as-judge metrics against a test dataset

---

## Tech Stack

- **React 19** + TypeScript
- **Tailwind CSS 4** (via Vite plugin)
- **Vite 7** (dev server + build)

---

## Prerequisites

- Node.js 18+
- The [rocket-faq-backend](https://github.com/darde/rocket-faq-backend) running locally or deployed

---

## Getting Started

**1. Clone the repo**

```bash
git clone git@github.com:darde/rocket-faq-frontend.git
cd rocket-faq-frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure the API URL**

This project uses environment-specific files:

- `.env.development` for local development
- `.env.production` for production builds

For **local development**, we keep:

```
VITE_API_URL=/api
```

Vite's dev proxy forwards `/api` requests to `http://localhost:8000` (the backend). Make sure the backend is running.

For **production**, we use:

```
VITE_API_URL=https://rocket-faq-backend.onrender.com/
```

**4. Start the dev server**

```bash
npm run dev
```

The app is available at **http://localhost:5173**.

---

## Build for Production

```bash
npm run build
```

Output is in `dist/`. Deploy this directory to any static hosting service (Vercel, Netlify, etc.).

When deploying, set the `VITE_API_URL` environment variable to point to your deployed backend.

---

## Project Structure

```
rocket-faq-frontend/
├── index.html
├── vite.config.ts               # Vite config with dev proxy to backend
├── .env.example                 # Environment variable template
└── src/
    ├── main.tsx                 # React entry point
    ├── index.css                # Tailwind imports
    ├── App.tsx                  # Tab navigation (Chat / Evaluation)
    ├── api/
    │   └── client.ts            # API client (uses VITE_API_URL)
    └── components/
        ├── Header.tsx           # App header with tab navigation
        ├── ChatWindow.tsx       # Chat interface with suggestions
        ├── ChatMessage.tsx      # Message bubble with source citations
        └── EvalPanel.tsx        # Evaluation dashboard
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api` (dev), `https://rocket-faq-backend.onrender.com/` (prod) | Backend API base URL. Use `/api` for local dev (proxied), or a full URL for production |

---

## Related

- **Backend**: [rocket-faq-backend](https://github.com/darde/rocket-faq-backend)
