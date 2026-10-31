from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    stream: bool = False

class ChatResponse(BaseModel):
    reply: str
    conversation_id: int
    provider_used: str

class PlanStep(BaseModel):
    id: int
    title: str
    description: str
    action_type: str  # "create_file", "edit_file", "run_command", "run_test", "git_commit"
    details: Dict[str, Any] = Field(default_factory=dict)
    requires_approval: bool = False
    status: str = "pending"  # "pending", "approved", "running", "completed", "failed", "rejected"

class CodeTaskRequest(BaseModel):
    instruction: str
    project_path: Optional[str] = None
    auto_execute_safe: bool = True

class CodeTaskResponse(BaseModel):
    task_id: int
    instruction: str
    status: str
    plan: List[PlanStep]

class ExecuteStepRequest(BaseModel):
    task_id: int
    step_id: int
    user_approved: bool = True

class FileOperationRequest(BaseModel):
    file_path: str
    content: Optional[str] = None
    target_content: Optional[str] = None
    replacement_content: Optional[str] = None

class CommandRequest(BaseModel):
    command: str
    cwd: Optional[str] = None
