import re
from typing import Dict, Any, List

def analyze_error_log(error_output: str) -> Dict[str, Any]:
    issues = []
    
    # Python Traceback detection
    if "Traceback (most recent call last):" in error_output:
        file_matches = re.findall(r'File "([^"]+)", line (\d+), in (.+)', error_output)
        error_lines = [line.strip() for line in error_output.splitlines() if line.strip()]
        last_error = error_lines[-1] if error_lines else "Unknown Python Error"
        
        issues.append({
            "type": "python_traceback",
            "message": last_error,
            "locations": [{"file": m[0], "line": int(m[1]), "scope": m[2]} for m in file_matches],
            "suggestion": f"Check error cause in '{last_error}' and examine referenced line numbers."
        })
        
    # JavaScript / Node stack trace
    elif "Error:" in error_output or "SyntaxError:" in error_output:
        issues.append({
            "type": "javascript_error",
            "message": error_output.splitlines()[0] if error_output.splitlines() else "JS Error",
            "suggestion": "Verify module imports, syntax, and package dependencies in package.json."
        })
        
    # Missing command / dependency
    elif "not recognized" in error_output or "command not found" in error_output:
        issues.append({
            "type": "missing_binary",
            "message": "CLI utility or executable is missing from system PATH.",
            "suggestion": "Ensure the requested software is installed and available in the environment."
        })
    else:
        issues.append({
            "type": "general_failure",
            "message": error_output[:300],
            "suggestion": "Inspect log output for failed test assertion or runtime exit code."
        })

    return {
        "detected_issues": issues,
        "raw_error_preview": error_output[:1000]
    }
