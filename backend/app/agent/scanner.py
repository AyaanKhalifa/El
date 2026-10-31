import os
from pathlib import Path
from typing import Dict, Any, List

def scan_project_directory(base_path: str, max_depth: int = 3, max_files: int = 300) -> Dict[str, Any]:
    target_path = Path(base_path).resolve()
    if not target_path.exists():
        return {"error": f"Path '{target_path}' does not exist"}

    total_files = 0
    extensions_count: Dict[str, int] = {}
    
    def build_tree(current: Path, depth: int):
        nonlocal total_files
        if depth > max_depth or total_files >= max_files:
            return None
            
        items = []
        try:
            entries = sorted(list(current.iterdir()), key=lambda e: (not e.is_dir(), e.name.lower()))
            for entry in entries:
                if entry.name in {".git", ".venv", "node_modules", "__pycache__", "dist", "build", ".next", ".vscode"}:
                    continue
                
                if entry.is_dir():
                    subtree = build_tree(entry, depth + 1)
                    items.append({
                        "name": entry.name,
                        "path": str(entry),
                        "type": "directory",
                        "children": subtree if subtree is not None else []
                    })
                else:
                    total_files += 1
                    ext = entry.suffix.lower() or "no_ext"
                    extensions_count[ext] = extensions_count.get(ext, 0) + 1
                    items.append({
                        "name": entry.name,
                        "path": str(entry),
                        "type": "file",
                        "size": entry.stat().st_size
                    })
        except PermissionError:
            pass
        return items

    tree = build_tree(target_path, 0)
    
    # Identify project type
    project_types = []
    if (target_path / "package.json").exists():
        project_types.append("Node.js / React / Web")
    if (target_path / "requirements.txt").exists() or (target_path / "pyproject.toml").exists():
        project_types.append("Python")
    if (target_path / "composer.json").exists():
        project_types.append("PHP")
    if (target_path / "Cargo.toml").exists():
        project_types.append("Rust")
        
    return {
        "project_name": target_path.name,
        "base_path": str(target_path),
        "detected_types": project_types or ["General / Unknown"],
        "file_extensions": extensions_count,
        "tree": tree
    }
