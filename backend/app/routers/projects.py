from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pathlib import Path
from typing import List
from pydantic import BaseModel

from app.database import get_db, Project
from app.config import settings

router = APIRouter(prefix="/projects", tags=["Projects"])

class CreateProjectRequest(BaseModel):
    name: str
    description: str = ""

@router.get("")
async def list_projects(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Project).order_by(Project.id.desc()))
    projects = res.scalars().all()
    return projects

@router.post("")
async def create_project(req: CreateProjectRequest, db: AsyncSession = Depends(get_db)):
    proj_dir = Path(settings.WORKSPACE_ROOT) / req.name
    proj_dir.mkdir(parents=True, exist_ok=True)
    
    proj = Project(
        name=req.name,
        path=str(proj_dir),
        description=req.description
    )
    db.add(proj)
    await db.commit()
    await db.refresh(proj)
    return proj
