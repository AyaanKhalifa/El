import asyncio
import shlex
import subprocess
from pathlib import Path
from typing import Dict, Any, List

DANGEROUS_PATTERNS = [
    "format ", "rmdir /s /q c:", "rm -rf /", "del /f /q c:",
    "drop database", "shutdown", "powershell -enc", "Invoke-Expression"
]

def is_command_safe(command: str) -> bool:
    cmd_lower = command.lower()
    for pattern in DANGEROUS_PATTERNS:
        if pattern in cmd_lower:
            return False
    return True

async def execute_command(command: str, cwd: str = None, timeout_seconds: int = 60) -> Dict[str, Any]:
    if not is_command_safe(command):
        return {
            "success": False,
            "error": "Command blocked: contains potentially hazardous instructions requiring manual admin override.",
            "stdout": "",
            "stderr": "BLOCKED_BY_SAFETY_GUARD"
        }

    working_dir = Path(cwd).resolve() if cwd else Path.cwd()
    if not working_dir.exists():
        working_dir.mkdir(parents=True, exist_ok=True)

    try:
        process = await asyncio.create_subprocess_shell(
            command,
            cwd=str(working_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await asyncio.wait_for(
            process.communicate(),
            timeout=timeout_seconds
        )
        
        return {
            "success": process.returncode == 0,
            "returncode": process.returncode,
            "stdout": stdout.decode("utf-8", errors="replace"),
            "stderr": stderr.decode("utf-8", errors="replace")
        }
    except asyncio.TimeoutError:
        try:
            process.kill()
        except Exception:
            pass
        return {
            "success": False,
            "error": f"Execution timed out after {timeout_seconds} seconds",
            "stdout": "",
            "stderr": "TIMEOUT"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "stdout": "",
            "stderr": str(e)
        }
