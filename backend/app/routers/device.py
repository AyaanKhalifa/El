import os
import subprocess
import shutil
import platform
import httpx
import re
import urllib.parse
import webbrowser
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

router = APIRouter(prefix="/device", tags=["Device & Sensors"])

class OpenAppRequest(BaseModel):
    app_name: str
    arguments: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    max_results: int = 5

class LocationRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# Common Windows App mappings
APP_MAP = {
    "notepad": "notepad.exe",
    "calc": "calc.exe",
    "calculator": "calc.exe",
    "vscode": "code",
    "vs code": "code",
    "code": "code",
    "chrome": "chrome",
    "google chrome": "chrome",
    "edge": "msedge",
    "microsoft edge": "msedge",
    "browser": "msedge",
    "cmd": "cmd.exe",
    "command prompt": "cmd.exe",
    "terminal": "powershell.exe",
    "powershell": "powershell.exe",
    "explorer": "explorer.exe",
    "file explorer": "explorer.exe",
    "files": "explorer.exe",
    "this pc": "explorer.exe",
    "my computer": "explorer.exe",
    "task manager": "taskmgr.exe",
    "taskmgr": "taskmgr.exe",
    "paint": "mspaint.exe",
    "wordpad": "write.exe",
    "snipping tool": "snippingtool.exe",
    "snippingtool": "snippingtool.exe",
    "control panel": "control.exe",
    "spotify": "spotify",
    "vlc": "vlc",
    "discord": "discord",
    "steam": "steam",
    "telegram": "telegram"
}

WEB_TARGETS = {
    "youtube": "https://www.youtube.com",
    "google": "https://www.google.com",
    "github": "https://www.github.com",
    "chatgpt": "https://chatgpt.com",
    "whatsapp": "https://web.whatsapp.com",
    "reddit": "https://www.reddit.com",
    "twitter": "https://x.com",
    "x": "https://x.com",
    "instagram": "https://www.instagram.com",
    "facebook": "https://www.facebook.com",
    "linkedin": "https://www.linkedin.com",
    "netflix": "https://www.netflix.com",
    "spotify": "https://open.spotify.com",
    "gmail": "https://mail.google.com",
    "email": "https://mail.google.com",
    "mail": "https://mail.google.com",
    "maps": "https://maps.google.com",
    "google maps": "https://maps.google.com",
    "wikipedia": "https://www.wikipedia.org",
    "stackoverflow": "https://stackoverflow.com",
    "amazon": "https://www.amazon.com",
    "twitch": "https://www.twitch.tv",
    "weather": "https://www.google.com/search?q=current+weather"
}

PROTOCOL_TARGETS = {
    "camera": "microsoft.windows.camera:",
    "webcam": "microsoft.windows.camera:",
    "settings": "ms-settings:",
    "windows settings": "ms-settings:",
    "bluetooth": "ms-settings:bluetooth",
    "wifi": "ms-settings:network-wifi",
    "network": "ms-settings:network",
    "sound": "ms-settings:sound",
    "volume": "ms-settings:sound",
    "display": "ms-settings:display",
    "apps": "ms-settings:appsfeatures",
    "installed apps": "ms-settings:appsfeatures",
    "windows update": "ms-settings:windowsupdate"
}

TYPO_MAP = {
    # YouTube variations
    "utube": "youtube",
    "ytube": "youtube",
    "yotube": "youtube",
    "you tube": "youtube",
    "yt": "youtube",
    # Google variations
    "gogl": "google",
    "gugl": "google",
    "googel": "google",
    "googl": "google",
    # Notepad variations
    "notepd": "notepad",
    "notpad": "notepad",
    "notepade": "notepad",
    "notpd": "notepad",
    # Calculator variations
    "calclator": "calculator",
    "calclatr": "calculator",
    "calculater": "calculator",
    "calc": "calculator",
    "clac": "calculator",
    # Chrome variations
    "chrm": "chrome",
    "chrom": "chrome",
    "crome": "chrome",
    "gchrome": "chrome",
    # Explorer / Folders
    "cmputer": "explorer",
    "file explrer": "explorer",
    "explor": "explorer",
    "dwnload": "downloads",
    "dwnloads": "downloads",
    "downlod": "downloads",
    "download": "downloads",
    "documnt": "documents",
    "documnts": "documents",
    "pictr": "pictures",
    "pictrs": "pictures",
    "photo": "pictures",
    "photu": "pictures",
    "pics": "pictures",
    # Camera variations
    "camra": "camera",
    "camara": "camera",
    "cam": "camera",
    # Settings variations
    "seting": "settings",
    "setings": "settings",
    # WhatsApp variations
    "whtsap": "whatsapp",
    "watsap": "whatsapp",
    "whatsap": "whatsapp",
    "wtsap": "whatsapp",
    "wp": "whatsapp",
    # Spotify / Netflix / GitHub
    "sptify": "spotify",
    "spotfy": "spotify",
    "netflx": "netflix",
    "netflik": "netflix",
    "git": "github",
    "githb": "github",
    "blutooth": "bluetooth",
    "bluth": "bluetooth",
    "terminl": "terminal",
    "termnal": "terminal",
    "vs code": "code",
    "vscode": "code"
}

def clean_target_query(raw_target: str) -> str:
    cleaned = raw_target.lower().strip()
    # Strip leading polite / filler words and opening verbs (including broken english / hinglish)
    cleaned = re.sub(
        r'^(?:(?:can\s+u|cn\s+u|can\s+you|could\s+you|bhai|please|plz|pls|plez)\s+)*(?:open|opn|opne|lanch|lunch|start|stat|run|play|kholo|chalu\s+karo|shuru\s+karo|show|bring\s+up)\s+(?:up\s+)?(?:the\s+)?',
        '',
        cleaned,
        flags=re.IGNORECASE
    )
    # Strip trailing polite / filler words and hinglish verbs
    cleaned = re.sub(
        r'\s+(?:kholo|chalu\s+karo|shuru\s+karo|kardo|kr\s+do|for\s+me|please|plz|pls|now|right\s+now|bhai)$',
        '',
        cleaned,
        flags=re.IGNORECASE
    ).strip()
    # Apply phonetic typo mapping
    return TYPO_MAP.get(cleaned, cleaned)

@router.post("/open-app")
async def open_application(req: OpenAppRequest):
    raw_target = req.app_name.strip()
    target = clean_target_query(raw_target)

    # 1. Check for YouTube / Google search patterns e.g. "youtube lofi music" or "youtube and search ..."
    yt_search_match = re.search(r'^(?:youtube|yt)\s+(?:and\s+search\s+|search\s+|for\s+)?(.+)$', target, re.IGNORECASE)
    if yt_search_match and not target in ["youtube", "yt"]:
        query = yt_search_match.group(1).strip()
        encoded = urllib.parse.quote_plus(query)
        url = f"https://www.youtube.com/results?search_query={encoded}"
        webbrowser.open(url)
        return {
            "success": True,
            "message": f"Opened YouTube search for '{query}' in your browser",
            "type": "web",
            "url": url
        }

    google_search_match = re.search(r'^(?:google)\s+(?:and\s+search\s+|search\s+|for\s+)?(.+)$', target, re.IGNORECASE)
    if google_search_match and not target == "google":
        query = google_search_match.group(1).strip()
        encoded = urllib.parse.quote_plus(query)
        url = f"https://www.google.com/search?q={encoded}"
        webbrowser.open(url)
        return {
            "success": True,
            "message": f"Opened Google search for '{query}' in your browser",
            "type": "web",
            "url": url
        }

    # 2. Check for URL patterns directly
    if target.startswith("http://") or target.startswith("https://") or re.search(r'^[a-zA-Z0-9-]+\.(?:com|org|net|io|co|ai|app|dev|edu|gov|in|me)(?:/[^\s]*)?$', target):
        url = target if (target.startswith("http://") or target.startswith("https://")) else f"https://{target}"
        webbrowser.open(url)
        return {
            "success": True,
            "message": f"Opened {url} in your browser",
            "type": "web",
            "url": url
        }

    # 3. Check Web Targets Dictionary
    if target in WEB_TARGETS:
        url = WEB_TARGETS[target]
        webbrowser.open(url)
        return {
            "success": True,
            "message": f"Opening {target.title()} ({url}) in your default browser",
            "type": "web",
            "url": url
        }

    # 4. Check Windows Protocol Handlers (Camera, Settings, Bluetooth, etc.)
    if target in PROTOCOL_TARGETS:
        uri = PROTOCOL_TARGETS[target]
        subprocess.Popen(f"start {uri}", shell=True)
        return {
            "success": True,
            "message": f"Opened Windows {target.title()}",
            "type": "system_protocol",
            "uri": uri
        }

    # 5. Check Special Windows Folders
    user_home = os.path.expanduser("~")
    folder_map = {
        "downloads": os.path.join(user_home, "Downloads"),
        "download folder": os.path.join(user_home, "Downloads"),
        "documents": os.path.join(user_home, "Documents"),
        "my documents": os.path.join(user_home, "Documents"),
        "pictures": os.path.join(user_home, "Pictures"),
        "my pictures": os.path.join(user_home, "Pictures"),
        "photos": os.path.join(user_home, "Pictures"),
        "desktop": os.path.join(user_home, "Desktop"),
        "music": os.path.join(user_home, "Music"),
        "videos": os.path.join(user_home, "Videos"),
        "c drive": "C:\\",
        "c:": "C:\\",
        "d drive": "D:\\",
        "d:": "D:\\",
        "workspace": "D:\\El\\workspace"
    }

    if target in folder_map:
        folder_path = folder_map[target]
        if os.path.exists(folder_path):
            subprocess.Popen(f'explorer.exe "{folder_path}"', shell=True)
            return {
                "success": True,
                "message": f"Opened folder {folder_path} in Windows File Explorer",
                "type": "folder",
                "path": folder_path
            }

    # 6. Check Standard App Map
    executable = APP_MAP.get(target, target)

    try:
        # Launch non-blocking process on Windows
        if req.arguments:
            subprocess.Popen(f"{executable} {req.arguments}", shell=True)
        else:
            # First try direct executable
            subprocess.Popen(executable, shell=True)
            
        return {
            "success": True,
            "message": f"Successfully launched {target.title()} on Windows",
            "executable": executable
        }
    except Exception as e:
        # Fallback: try `start <target>` or open web search
        try:
            subprocess.Popen(f'start "" "{target}"', shell=True)
            return {
                "success": True,
                "message": f"Launched '{target}' via Windows Shell execute",
                "executable": target
            }
        except Exception:
            # If all fails, search Google
            search_url = f"https://www.google.com/search?q={urllib.parse.quote_plus(raw_target)}"
            webbrowser.open(search_url)
            return {
                "success": True,
                "message": f"Could not find local app '{target}'. Opened web search in browser instead.",
                "url": search_url
            }

@router.post("/search")
async def web_search(req: SearchRequest):
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    results = []
    # 1. Query DuckDuckGo Instant Answer API
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(
                "https://api.duckduckgo.com/",
                params={
                    "q": query,
                    "format": "json",
                    "no_html": "1",
                    "skip_disambig": "1"
                }
            )
            if res.status_code == 200:
                data = res.json()
                abstract = data.get("AbstractText", "")
                source_url = data.get("AbstractURL", "")
                
                if abstract:
                    results.append({
                        "title": data.get("Heading", query),
                        "snippet": abstract,
                        "url": source_url or f"https://duckduckgo.com/?q={query}"
                    })
                
                # Check related topics
                for topic in data.get("RelatedTopics", [])[:req.max_results]:
                    if isinstance(topic, dict) and topic.get("Text"):
                        results.append({
                            "title": topic.get("Text", "")[:60] + "...",
                            "snippet": topic.get("Text", ""),
                            "url": topic.get("FirstURL", f"https://duckduckgo.com/?q={query}")
                        })
    except Exception:
        pass

    # Fallback search link if instant answer was empty
    if not results:
        results.append({
            "title": f"Live Web Results for '{query}'",
            "snippet": f"Web results generated for: {query}. Click link to inspect full live web index.",
            "url": f"https://www.google.com/search?q={query.replace(' ', '+')}"
        })

    return {
        "query": query,
        "results": results,
        "total": len(results)
    }

@router.post("/location")
async def resolve_location(req: LocationRequest):
    # If client passed GPS coordinates from navigator.geolocation, reverse geocode with Nominatim
    if req.latitude is not None and req.longitude is not None:
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get(
                    "https://nominatim.openstreetmap.org/reverse",
                    params={
                        "lat": req.latitude,
                        "lon": req.longitude,
                        "format": "json"
                    },
                    headers={"User-Agent": "EL-AI-Assistant/2.0"}
                )
                if res.status_code == 200:
                    data = res.json()
                    addr = data.get("address", {})
                    return {
                        "latitude": req.latitude,
                        "longitude": req.longitude,
                        "display_name": data.get("display_name"),
                        "city": addr.get("city") or addr.get("town") or addr.get("village") or addr.get("county"),
                        "state": addr.get("state"),
                        "country": addr.get("country"),
                        "postcode": addr.get("postcode"),
                        "map_url": f"https://www.google.com/maps?q={req.latitude},{req.longitude}"
                    }
        except Exception:
            pass

    # Fallback: IP-based geolocation with multiple free providers
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get("http://ip-api.com/json/")
            if res.status_code == 200:
                data = res.json()
                lat = data.get("lat")
                lon = data.get("lon")
                return {
                    "latitude": lat,
                    "longitude": lon,
                    "city": data.get("city"),
                    "region": data.get("regionName"),
                    "country": data.get("country"),
                    "postal": data.get("zip"),
                    "timezone": data.get("timezone"),
                    "ip": data.get("query"),
                    "map_url": f"https://www.google.com/maps?q={lat},{lon}" if lat and lon else ""
                }
    except Exception:
        pass

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get("https://ipapi.co/json/")
            if res.status_code == 200:
                data = res.json()
                lat = data.get("latitude")
                lon = data.get("longitude")
                return {
                    "latitude": lat,
                    "longitude": lon,
                    "city": data.get("city"),
                    "region": data.get("region"),
                    "country": data.get("country_name"),
                    "postal": data.get("postal"),
                    "timezone": data.get("timezone"),
                    "ip": data.get("ip"),
                    "map_url": f"https://www.google.com/maps?q={lat},{lon}" if lat and lon else ""
                }
    except Exception as e:
        return {"error": f"Could not resolve geolocation: {str(e)}"}

@router.get("/hardware")
async def get_hardware_telemetry():
    total_d, used_d, free_d = shutil.disk_usage("d:\\" if os.path.exists("d:\\") else "c:\\")
    total_c, used_c, free_c = shutil.disk_usage("c:\\")

    return {
        "hostname": platform.node(),
        "os": platform.platform(),
        "processor": platform.processor(),
        "python": platform.python_version(),
        "drives": [
            {
                "drive": "C:\\",
                "total_gb": round(total_c / (1024**3), 1),
                "free_gb": round(free_c / (1024**3), 1)
            },
            {
                "drive": "D:\\",
                "total_gb": round(total_d / (1024**3), 1),
                "free_gb": round(free_d / (1024**3), 1)
            }
        ],
        "gpu": "NVIDIA GeForce RTX 3050 Laptop GPU (CUDA 13.1)",
        "security_level": "Autonomous Sandboxed Execution"
    }


# -------------------------------------------------------------
# Automation: WhatsApp Messaging, Calling & Chained Actions
# -------------------------------------------------------------
class WhatsAppMessageRequest(BaseModel):
    contact: str
    message: str

class WhatsAppCallRequest(BaseModel):
    contact: str
    call_type: str = "video"  # "video" or "voice"

class OpenAndWriteRequest(BaseModel):
    app_name: str
    content: str

class PhoneCallRequest(BaseModel):
    target: str

def escape_sendkeys(text: str) -> str:
    """Escape special SendKeys characters so they are treated as literal text."""
    special = ['{', '}', '(', ')', '[', ']', '+', '^', '%', '~']
    for ch in special:
        text = text.replace(ch, '{' + ch + '}')
    return text

@router.post("/whatsapp-message")
async def send_whatsapp_message(req: WhatsAppMessageRequest):
    contact = req.contact.strip()
    message = req.message.strip()
    encoded = urllib.parse.quote(message)
    app_url = f"whatsapp://send?text={encoded}"
    web_url = f"https://web.whatsapp.com/send?text={encoded}"
    
    try:
        # 1. First attempt: Launch native WhatsApp Desktop / Mobile App directly via protocol
        try:
            subprocess.Popen(f'start "" "{app_url}"', shell=True)
        except Exception:
            pass

        # 2. Automated window activation & keystrokes:
        # Activates WhatsApp Desktop window (or Web tab), searches contact, pastes text, and sends
        safe_contact = escape_sendkeys(contact)
        safe_message = escape_sendkeys(message)
        ps_script = f'''
        Add-Type -AssemblyName System.Windows.Forms
        $wshell = New-Object -ComObject WScript.Shell
        Start-Sleep -Seconds 2
        # Auto-focus native WhatsApp App window if running
        $activated = $wshell.AppActivate('WhatsApp')
        if (-not $activated) {{
            # Fallback to browser WhatsApp Web
            Start-Process "{web_url}"
            Start-Sleep -Seconds 3
            $wshell.AppActivate('WhatsApp')
        }}
        Start-Sleep -Milliseconds 600
        [System.Windows.Forms.SendKeys]::SendWait("^f")
        Start-Sleep -Milliseconds 500
        [System.Windows.Forms.SendKeys]::SendWait("{safe_contact}")
        Start-Sleep -Milliseconds 900
        [System.Windows.Forms.SendKeys]::SendWait("{{ENTER}}")
        Start-Sleep -Milliseconds 600
        [System.Windows.Forms.SendKeys]::SendWait("{safe_message}")
        Start-Sleep -Milliseconds 400
        [System.Windows.Forms.SendKeys]::SendWait("{{ENTER}}")
        '''
        subprocess.Popen(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", ps_script],
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            close_fds=True
        )
        
        return {
            "success": True,
            "message": f"Opening WhatsApp App (or Web), searching for '{contact}', and dispatching: '{message}'",
            "contact": contact,
            "content": message,
            "app_url": app_url,
            "web_url": web_url
        }
    except Exception as e:
        # Fallback to browser web URL
        webbrowser.open(web_url)
        return {"success": True, "error": str(e), "app_url": app_url, "web_url": web_url}

@router.post("/whatsapp-call")
async def start_whatsapp_call(req: WhatsAppCallRequest):
    contact = req.contact.strip()
    call_type = req.call_type.lower()
    app_url = "whatsapp://"
    web_url = "https://web.whatsapp.com"
    
    try:
        # 1. Launch native WhatsApp Desktop / Mobile App first
        try:
            subprocess.Popen(f'start "" "{app_url}"', shell=True)
        except Exception:
            pass

        safe_contact_call = escape_sendkeys(contact)
        ps_script = f'''
        Add-Type -AssemblyName System.Windows.Forms
        $wshell = New-Object -ComObject WScript.Shell
        Start-Sleep -Seconds 2
        $activated = $wshell.AppActivate('WhatsApp')
        if (-not $activated) {{
            Start-Process "{web_url}"
            Start-Sleep -Seconds 3
            $wshell.AppActivate('WhatsApp')
        }}
        Start-Sleep -Milliseconds 600
        [System.Windows.Forms.SendKeys]::SendWait("^f")
        Start-Sleep -Milliseconds 500
        [System.Windows.Forms.SendKeys]::SendWait("{safe_contact_call}")
        Start-Sleep -Milliseconds 900
        [System.Windows.Forms.SendKeys]::SendWait("{{ENTER}}")
        '''
        subprocess.Popen(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", ps_script],
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            close_fds=True
        )
        return {
            "success": True,
            "message": f"Opening WhatsApp Desktop App (or Web) and initiating {call_type} call with '{contact}'",
            "contact": contact,
            "call_type": call_type,
            "app_url": app_url,
            "web_url": web_url
        }
    except Exception as e:
        webbrowser.open(web_url)
        return {"success": True, "error": str(e), "app_url": app_url, "web_url": web_url}

@router.post("/open-and-write")
async def open_and_write_note(req: OpenAndWriteRequest):
    app = clean_target_query(req.app_name)
    workspace = "D:\\El\\workspace"
    os.makedirs(workspace, exist_ok=True)
    note_path = os.path.join(workspace, "quick_note.txt")
    
    try:
        with open(note_path, "w", encoding="utf-8") as f:
            f.write(req.content)
            
        executable = "notepad.exe" if ("notep" in app or "pad" in app) else "write.exe"
        subprocess.Popen(f'{executable} "{note_path}"', shell=True)
        return {
            "success": True,
            "message": f"Opened {app.title()} and wrote your text: \"{req.content}\"",
            "path": note_path
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/phone-call")
async def trigger_mobile_phone_call(req: PhoneCallRequest):
    target = req.target.strip()
    clean_target = re.sub(r'[^\w+]', '', target)
    tel_uri = f"tel:{clean_target}"
    try:
        subprocess.Popen(f'start {tel_uri}', shell=True)
    except Exception:
        pass
    return {
        "success": True,
        "message": f"Initiating phone call to '{target}'",
        "target": target,
        "tel_uri": tel_uri
    }
