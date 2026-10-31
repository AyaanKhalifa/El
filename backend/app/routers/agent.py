import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any

from app.database import get_db, TaskPlan
from app.models.schemas import (
    CodeTaskRequest, CodeTaskResponse, ExecuteStepRequest,
    PlanStep, FileOperationRequest, CommandRequest
)
from app.agent.scanner import scan_project_directory
from app.agent.planner import plan_task
from app.agent.editor import read_file, write_file, replace_in_file
from app.agent.executor import execute_command
from app.agent.git_agent import git_status, git_init, git_commit, git_diff
from app.agent.debugger import analyze_error_log
from app.config import settings

router = APIRouter(prefix="/agent", tags=["Coding Agent"])

@router.post("/plan", response_model=CodeTaskResponse)
async def create_plan(req: CodeTaskRequest, db: AsyncSession = Depends(get_db)):
    target_path = req.project_path or settings.WORKSPACE_ROOT
    steps = await plan_task(req.instruction, target_path)
    
    task_record = TaskPlan(
        prompt=req.instruction,
        status="planning",
        steps_json=json.dumps([s.model_dump() for s in steps])
    )
    db.add(task_record)
    await db.commit()
    await db.refresh(task_record)
    
    return CodeTaskResponse(
        task_id=task_record.id,
        instruction=req.instruction,
        status="ready",
        plan=steps
    )

@router.post("/execute-step")
async def execute_step(req: ExecuteStepRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TaskPlan).where(TaskPlan.id == req.task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    steps_data = json.loads(task.steps_json)
    target_step = None
    step_index = -1
    for i, s in enumerate(steps_data):
        if s["id"] == req.step_id:
            target_step = s
            step_index = i
            break
            
    if not target_step:
        raise HTTPException(status_code=404, detail="Step not found in task")
        
    if target_step["requires_approval"] and not req.user_approved:
        return {
            "status": "waiting_approval",
            "message": "This operation requires explicit user authorization before execution.",
            "step": target_step
        }

    # Execute action
    action = target_step["action_type"]
    details = target_step.get("details", {})
    exec_result: Dict[str, Any] = {}
    
    if action == "create_file":
        file_path = details.get("file_path", "")
        # Resolve path relative to workspace if not absolute
        if not file_path.startswith("d:") and not file_path.startswith("c:"):
            file_path = f"{settings.WORKSPACE_ROOT}/{file_path}"
        exec_result = write_file(file_path, details.get("content", ""))
        
    elif action == "edit_file":
        file_path = details.get("file_path", "")
        if not file_path.startswith("d:") and not file_path.startswith("c:"):
            file_path = f"{settings.WORKSPACE_ROOT}/{file_path}"
        exec_result = replace_in_file(
            file_path,
            details.get("target_content", ""),
            details.get("replacement_content", "")
        )
        
    elif action in {"run_command", "run_test"}:
        cmd = details.get("command", "")
        cwd = details.get("target_dir") or settings.WORKSPACE_ROOT
        exec_result = await execute_command(cmd, cwd=cwd)
        
    elif action == "git_commit":
        msg = details.get("message", "automated commit by EL")
        exec_result = await git_commit(settings.WORKSPACE_ROOT, msg)
        
    else:
        exec_result = {"status": "unsupported_action", "action": action}

    # Update step status in DB
    target_step["status"] = "completed" if exec_result.get("success", True) else "failed"
    target_step["execution_output"] = exec_result
    steps_data[step_index] = target_step
    task.steps_json = json.dumps(steps_data)
    await db.commit()

    return {
        "task_id": req.task_id,
        "step_id": req.step_id,
        "status": target_step["status"],
        "result": exec_result
    }

@router.post("/scan")
async def scan_project(path: str = None):
    scan_dir = path or settings.WORKSPACE_ROOT
    return scan_project_directory(scan_dir)

@router.post("/file/read")
async def api_read_file(req: FileOperationRequest):
    return read_file(req.file_path)

@router.post("/file/write")
async def api_write_file(req: FileOperationRequest):
    return write_file(req.file_path, req.content or "")

@router.post("/terminal")
async def run_terminal(req: CommandRequest):
    cwd = req.cwd or settings.WORKSPACE_ROOT
    return await execute_command(req.command, cwd=cwd)

@router.post("/git/status")
async def get_git_status(path: str = None):
    target = path or settings.WORKSPACE_ROOT
    return await git_status(target)

@router.post("/debug")
async def debug_log(error_log: str):
    return analyze_error_log(error_log)
