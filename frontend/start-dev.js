import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_DIR = path.resolve(__dirname, '..', 'backend');
const VENV_PYTHON = path.join(BACKEND_DIR, '.venv', 'Scripts', 'python.exe');
const FALLBACK_PYTHON = 'python';

console.log('\x1b[36m%s\x1b[0m', '===================================================');
console.log('\x1b[36m%s\x1b[0m', '   EL Cyberpunk 3D Assistant: Unified Dev Server   ');
console.log('\x1b[36m%s\x1b[0m', '   Auto-starting Backend (:8000) + Frontend (:5173)');
console.log('\x1b[36m%s\x1b[0m', '===================================================\n');

function checkBackendHealth() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:8000/system/status', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1200, () => {
      req.destroy();
      resolve(false);
    });
  });
}

let backendProcess = null;

async function startBackend() {
  const isAlreadyRunning = await checkBackendHealth();
  if (isAlreadyRunning) {
    console.log('\x1b[32m%s\x1b[0m', '[BACKEND] FastAPI server already live on http://127.0.0.1:8000');
    return;
  }

  const pythonCmd = fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : FALLBACK_PYTHON;
  console.log('\x1b[33m%s\x1b[0m', `[BACKEND] Launching FastAPI (:8000) using ${pythonCmd}...`);

  backendProcess = spawn(
    pythonCmd,
    ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'],
    {
      cwd: BACKEND_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    }
  );

  backendProcess.stdout.on('data', (data) => {
    const line = data.toString().trim();
    if (line) console.log('\x1b[35m[BACKEND]\x1b[0m', line);
  });

  backendProcess.stderr.on('data', (data) => {
    const line = data.toString().trim();
    if (line) console.error('\x1b[31m[BACKEND ERR]\x1b[0m', line);
  });

  backendProcess.on('close', (code) => {
    console.log('\x1b[33m%s\x1b[0m', `[BACKEND] Process exited with code ${code}`);
  });
}

function startVite() {
  console.log('\x1b[34m%s\x1b[0m', '[FRONTEND] Starting Vite Development Server on http://127.0.0.1:5173...\n');

  const isWindows = process.platform === 'win32';
  const viteCmd = isWindows ? 'npx.cmd' : 'npx';

  const vite = spawn(viteCmd, ['vite', '--host', '127.0.0.1', '--port', '5173'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  vite.on('close', (code) => {
    if (backendProcess) {
      console.log('\x1b[33m%s\x1b[0m', '[UNIFIED] Shutting down backend process...');
      try {
        process.kill(backendProcess.pid);
      } catch (e) {}
    }
    process.exit(code || 0);
  });
}

// Clean termination handling
process.on('SIGINT', () => {
  console.log('\n\x1b[36m%s\x1b[0m', '[UNIFIED] Gracefully shutting down all processes...');
  if (backendProcess) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', backendProcess.pid.toString(), '/f', '/t']);
      } else {
        process.kill(backendProcess.pid);
      }
    } catch (e) {}
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (backendProcess) {
    try {
      process.kill(backendProcess.pid);
    } catch (e) {}
  }
  process.exit(0);
});

// Run sequence
(async () => {
  await startBackend();
  // Brief delay to allow FastAPI socket to bind before Vite starts
  setTimeout(() => {
    startVite();
  }, 1200);
})();

