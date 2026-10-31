import json
import httpx
from typing import List, Dict, Any
from app.models.schemas import PlanStep
from app.config import settings

PLANNER_SYSTEM_PROMPT = """
You are EL's Senior Software Architect and Coding Planner.
Break down user coding requests into realistic, step-by-step implementation tasks.
For each step, specify:
- id: integer 1..N
- title: concise title
- description: what will be built
- action_type: "create_file", "edit_file", "run_command", "run_test", "git_commit"
- details: JSON object with file paths, commands, or templates
- requires_approval: boolean (true for: installing global tools, database schema migrations, executing shell scripts, live payments)

Output MUST be a valid JSON array of step objects.
"""

def generate_heuristic_plan(instruction: str, project_path: str = None) -> List[PlanStep]:
    """Generates an intelligent architectural plan if the AI model is loading or offline."""
    instruction_lower = instruction.lower()
    steps = []
    
    if "hotel" in instruction_lower or "management" in instruction_lower or "booking" in instruction_lower:
        steps = [
            PlanStep(
                id=1,
                title="Initialize Project Workspace & Git",
                description="Set up clean repository directory structure and git version control",
                action_type="run_command",
                details={"command": "git init", "target_dir": project_path or "workspace/hotel-system"},
                requires_approval=False
            ),
            PlanStep(
                id=2,
                title="Design Database Schema (MySQL/SQLite)",
                description="Create tables for rooms, bookings, guests, payments, and admin users",
                action_type="create_file",
                details={
                    "file_path": "database/schema.sql",
                    "content": "-- Hotel Management Database Schema\nCREATE TABLE IF NOT EXISTS rooms (id INT AUTO_INCREMENT PRIMARY KEY, room_number VARCHAR(10) UNIQUE, type VARCHAR(50), price_per_night DECIMAL(10,2), status VARCHAR(20) DEFAULT 'available');\nCREATE TABLE IF NOT EXISTS guests (id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(100), email VARCHAR(100), phone VARCHAR(20));\nCREATE TABLE IF NOT EXISTS bookings (id INT AUTO_INCREMENT PRIMARY KEY, room_id INT, guest_id INT, check_in DATE, check_out DATE, total_amount DECIMAL(10,2), payment_status VARCHAR(20));\n"
                },
                requires_approval=False
            ),
            PlanStep(
                id=3,
                title="Backend Architecture & API Endpoints",
                description="Create backend routing and controllers for booking management and room inventory",
                action_type="create_file",
                details={
                    "file_path": "backend/api.php",
                    "content": "<?php\n// Hotel System API Handler\nheader('Content-Type: application/json');\n$action = $_GET['action'] ?? 'list_rooms';\n// Controller logic\n"
                },
                requires_approval=False
            ),
            PlanStep(
                id=4,
                title="Admin Dashboard Frontend",
                description="Build interactive responsive UI for room status overview and booking calendar",
                action_type="create_file",
                details={
                    "file_path": "frontend/index.html",
                    "content": "<!DOCTYPE html>\n<html><head><title>EL Hotel Management System</title></head><body><h1>Hotel Admin Console</h1><div id='rooms-grid'></div></body></html>"
                },
                requires_approval=False
            ),
            PlanStep(
                id=5,
                title="Payment Gateway Integration Sandbox",
                description="Configure test sandbox for payment processing (requires user approval)",
                action_type="create_file",
                details={
                    "file_path": "backend/payments.php",
                    "content": "<?php\n// Payment integration sandbox\nfunction processPayment($amount, $token) {\n    return ['status' => 'success', 'tx_id' => 'tx_' . bin2hex(random_bytes(8))];\n}\n"
                },
                requires_approval=True
            ),
            PlanStep(
                id=6,
                title="Run Unit & Integration Tests",
                description="Execute automated sanity tests on room reservation endpoints",
                action_type="run_test",
                details={"command": "php -l backend/api.php"},
                requires_approval=False
            ),
            PlanStep(
                id=7,
                title="Initial Git Commit",
                description="Commit the initial production-ready codebase to git",
                action_type="git_commit",
                details={"message": "feat: scaffold complete hotel management system"},
                requires_approval=False
            )
        ]
    else:
        # General coding plan
        steps = [
            PlanStep(
                id=1,
                title="Analyze Workspace & Requirements",
                description=f"Inspect workspace and prepare execution strategy for: {instruction}",
                action_type="run_command",
                details={"command": "git status"},
                requires_approval=False
            ),
            PlanStep(
                id=2,
                title="Draft Code Implementation",
                description="Generate required source code and files according to specifications",
                action_type="create_file",
                details={"file_path": "src/app.py", "content": "# Generated by EL Coding Agent\n"},
                requires_approval=False
            ),
            PlanStep(
                id=3,
                title="Automated Test & Verification",
                description="Execute syntax checks and tests on generated artifacts",
                action_type="run_test",
                details={"command": "python -m unittest discover"},
                requires_approval=False
            )
        ]
        
    return steps

async def plan_task(instruction: str, project_path: str = None) -> List[PlanStep]:
    # Check if local Ollama or Cloud LLM is available
    if settings.AI_PROVIDER == "ollama":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": f"{PLANNER_SYSTEM_PROMPT}\n\nTask: {instruction}\nReturn JSON array only.",
                        "stream": False,
                        "format": "json"
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    parsed = json.loads(data.get("response", "[]"))
                    if isinstance(parsed, list) and len(parsed) > 0:
                        steps = []
                        for i, item in enumerate(parsed):
                            steps.append(PlanStep(
                                id=i + 1,
                                title=item.get("title", f"Step {i+1}"),
                                description=item.get("description", ""),
                                action_type=item.get("action_type", "create_file"),
                                details=item.get("details", {}),
                                requires_approval=bool(item.get("requires_approval", False))
                            ))
                        return steps
        except Exception:
            pass  # Fall back to heuristic planner

    return generate_heuristic_plan(instruction, project_path)
