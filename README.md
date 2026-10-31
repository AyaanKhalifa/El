# EL — Emotive Neural Assistant & Autonomous Coding Studio 🌸

**EL** is a high-tech Cyberpunk 3D AI companion, empathetic software architect, and desktop automation engine. Built with **React + Three.js** on the frontend and **FastAPI** on the backend.

---

## 🌟 Key Features

- **Broken English & Phonetic Comprehension**: Deduces user intent seamlessly from colloquial or broken phrasing without criticism (`opn utube`, `writ cod`, `helo dad on wp`).
- **WhatsApp Automation Engine**:
  - Direct messaging (`say hello to Dad on WhatsApp`, `dad ko whatsapp pe hello bhejo`).
  - Voice and Video calling (`video call Dad on WhatsApp`).
  - Auto-routing to WhatsApp Desktop App (`whatsapp://`) with fallback to WhatsApp Web.
- **Mobile Calling Engine**: 1-tap `tel:` protocol URI for phone dialing (`call Dad on mobile`).
- **1-Click Copy Buttons**:
  - **`COPY CONTENT`**: Extracts pure substantive payload (raw code without markdown fences, or clean poem/notes without chat intros/outros).
  - **`COPY REPLY`**: Copies complete verbatim chat message with full formatting.
  - **`COPY CODE`**: Per-block copy on every code block.
- **Emotive Female Voice by Default**: Auto-selects female TTS voice (`Microsoft Zira`, `Google UK English Female`, etc.) with 35+ name heuristics, persisted in `localStorage`.
- **Worldwide Multilingual Support**: 19 global languages with speech recognition and speech synthesis.
- **Persistent Chat History Drawer**: Save, reload, and manage conversation sessions with context memory.
- **Fully Responsive Mobile Interface**: Cyberpunk UI with adaptive drawer and hamburger navigation for screens `< 860px`.
- **Unified Dev Server**: `npm run dev` in frontend automatically launches both backend and frontend together.

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- (Optional) [Ollama](https://ollama.ai) with `llama3.2:3b`

### Quick Start (Windows)
Double-click `run_el.bat` or run:
```cmd
run_el.bat
```

### Manual Start

1. **Backend**:
   ```bash
   cd backend
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🌐 Deploying to Vercel

### Option 1: Automatic Root Deployment (Recommended)
This repository includes a root `vercel.json` configured for zero-config Vercel deployment:
1. Push this repository to GitHub: `https://github.com/AyaanKhalifa/El`
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"**.
4. Import your **`AyaanKhalifa/El`** repository.
5. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `.` (or `frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**! 🚀

### Option 2: Environment Variables (Optional)
If your backend is hosted separately (e.g. on Render, Railway, or Fly.io):
- Add the environment variable in Vercel Project Settings:
  - `VITE_BACKEND_URL`: `https://your-backend-api-url.com`

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Three.js, Lucide Icons, Cyber Audio API, Web Speech API
- **Backend**: FastAPI, SQLAlchemy (Async SQLite), Pydantic v2, Uvicorn, HTTPX
