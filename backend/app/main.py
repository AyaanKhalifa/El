from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db
from app.routers import chat, agent, projects, system, device

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schemas on startup
    await init_db()
    yield

app = FastAPI(
    title="EL AI Backend & Coding Agent",
    description="The intelligent backend powering EL: Windows assistant, local/cloud AI orchestration, and automated software development.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite port 5173 / localhost)
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(system.router)
app.include_router(chat.router)
app.include_router(agent.router)
app.include_router(projects.router)
app.include_router(device.router)

@app.get("/")
async def root():
    return {
        "name": "EL AI Backend API",
        "version": "2.0.0",
        "docs_url": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)
