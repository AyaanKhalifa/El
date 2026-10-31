import os
import platform
import shutil
import httpx
from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/system", tags=["System"])

@router.get("/status")
async def get_system_status():
    ollama_online = False
    ollama_models = []
    
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            res = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if res.status_code == 200:
                ollama_online = True
                ollama_models = [m.get("name") for m in res.json().get("models", [])]
    except Exception:
        ollama_online = False

    # Check disk space
    total, used, free = shutil.disk_usage("d:\\" if os.path.exists("d:\\") else "c:\\")

    return {
        "status": "healthy",
        "app_name": "EL Phase 2 Advanced Assistant & Coding Agent",
        "environment": settings.EL_ENV,
        "os": platform.platform(),
        "python_version": platform.python_version(),
        "ai_engine": {
            "provider": settings.AI_PROVIDER,
            "ollama_online": ollama_online,
            "ollama_endpoint": settings.OLLAMA_BASE_URL,
            "configured_model": settings.OLLAMA_MODEL,
            "available_local_models": ollama_models,
            "cloud_configured": bool(settings.CLOUD_API_KEY)
        },
        "database": {
            "type": "SQLite (Phase 1/2 Foundation)",
            "url": settings.DATABASE_URL
        },
        "disk": {
            "total_gb": round(total / (1024**3), 2),
            "free_gb": round(free / (1024**3), 2)
        }
    }
