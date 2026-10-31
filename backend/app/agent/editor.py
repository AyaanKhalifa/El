import difflib
from pathlib import Path
from typing import Dict, Any, Optional

def read_file(file_path: str) -> Dict[str, Any]:
    path = Path(file_path).resolve()
    if not path.exists():
        return {"error": f"File '{file_path}' does not exist"}
    if not path.is_file():
        return {"error": f"'{file_path}' is not a regular file"}
    
    try:
        content = path.read_text(encoding="utf-8", errors="replace")
        return {
            "file_path": str(path),
            "content": content,
            "lines": len(content.splitlines()),
            "size": path.stat().st_size
        }
    except Exception as e:
        return {"error": str(e)}

def write_file(file_path: str, content: str, overwrite: bool = True) -> Dict[str, Any]:
    path = Path(file_path).resolve()
    if path.exists() and not overwrite:
        return {"error": f"File '{file_path}' already exists and overwrite is False"}
    
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return {
            "success": True,
            "file_path": str(path),
            "bytes_written": len(content.encode("utf-8"))
        }
    except Exception as e:
        return {"error": str(e)}

def replace_in_file(file_path: str, target_content: str, replacement_content: str) -> Dict[str, Any]:
    path = Path(file_path).resolve()
    if not path.exists() or not path.is_file():
        return {"error": f"File '{file_path}' not found"}

    try:
        current_content = path.read_text(encoding="utf-8")
        if target_content not in current_content:
            return {"error": f"Target content block not found in '{file_path}'"}
        
        new_content = current_content.replace(target_content, replacement_content, 1)
        
        # Generate unified diff
        diff_lines = list(difflib.unified_diff(
            current_content.splitlines(keepends=True),
            new_content.splitlines(keepends=True),
            fromfile=f"a/{path.name}",
            tofile=f"b/{path.name}"
        ))
        
        path.write_text(new_content, encoding="utf-8")
        return {
            "success": True,
            "file_path": str(path),
            "diff": "".join(diff_lines)
        }
    except Exception as e:
        return {"error": str(e)}
