import asyncio
from pathlib import Path
from typing import Dict, Any
from app.agent.executor import execute_command

async def git_status(repo_path: str) -> Dict[str, Any]:
    res = await execute_command("git status --short", cwd=repo_path)
    branch = await execute_command("git branch --show-current", cwd=repo_path)
    return {
        "branch": branch.get("stdout", "").strip(),
        "status": res.get("stdout", "").strip(),
        "is_clean": len(res.get("stdout", "").strip()) == 0
    }

async def git_init(repo_path: str) -> Dict[str, Any]:
    res = await execute_command("git init", cwd=repo_path)
    return res

async def git_commit(repo_path: str, message: str) -> Dict[str, Any]:
    add_res = await execute_command("git add .", cwd=repo_path)
    if not add_res.get("success"):
        return add_res
    commit_res = await execute_command(f'git commit -m "{message}"', cwd=repo_path)
    return commit_res

async def git_diff(repo_path: str) -> Dict[str, Any]:
    res = await execute_command("git diff", cwd=repo_path)
    return res
