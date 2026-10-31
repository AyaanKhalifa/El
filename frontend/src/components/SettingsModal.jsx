import React from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, Database, HardDrive, Key, Cpu, Zap } from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

export default function SettingsModal({ isOpen, onClose, systemStatus }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 4, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div
        className="cyber-panel"
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'rgba(6, 11, 23, 0.96)',
          border: '1.5px solid var(--neon-cyan)',
          boxShadow: '0 0 40px rgba(0, 242, 254, 0.25)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="font-cyber neon-text-cyan" style={{ fontSize: '17px', fontWeight: 800 }}>
              // SYSTEM SPECIFICATIONS & MANUAL BOUNDS
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              DIAGNOSTIC TRACE // HARDWARE & AUTONOMOUS BOUNDARIES
            </p>
          </div>
          <button
            onClick={() => { cyberAudio.click(); onClose(); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--neon-pink)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section: What EL Does Automatically */}
          <div style={{ background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.3)', borderLeft: '3px solid var(--neon-green)', padding: '16px' }}>
            <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-cyber)', color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle size={16} /> AUTONOMOUS PROTOCOLS (AUTOMATED)
            </h4>
            <ul style={{ fontSize: '13px', fontFamily: 'var(--font-hud)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '20px' }}>
              <li><strong>Local GPU Intelligence:</strong> Executes Llama 3.2 3B on your RTX 3050 CUDA cores.</li>
              <li><strong>FastAPI Core:</strong> Automatic lifespan initialization, CORS, and REST routing.</li>
              <li><strong>SQLite Async Engine:</strong> Auto-provisions conversations, tasks, and project states.</li>
              <li><strong>Autonomous Coding Agent:</strong> Project scanner, mission planner, diff editor & git agent.</li>
              <li><strong>Neural Voice Engine:</strong> Real-time Speech-to-Text & synthesized Voice Output.</li>
              <li><strong>3D Cyberpunk Hologram:</strong> Real-time WebGL audio-reactive visualizer.</li>
            </ul>
          </div>

          {/* Section: What EL CANNOT Do (What you must bring manually) */}
          <div style={{ background: 'rgba(255, 0, 127, 0.05)', border: '1px solid rgba(255, 0, 127, 0.3)', borderLeft: '3px solid var(--neon-pink)', padding: '16px' }}>
            <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-cyber)', color: 'var(--neon-pink)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle size={16} /> MANUAL PREREQUISITES (YOU BRING MANUALLY)
            </h4>
            <div style={{ fontSize: '13px', fontFamily: 'var(--font-hud)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <strong style={{ color: '#fff' }}>1. Windows UAC Administrator Approvals</strong>
                <p>Windows security blocks scripts from bypassing UAC prompts. Root-level installer dialogs require your manual click on "Yes".</p>
              </div>
              <div>
                <strong style={{ color: '#fff' }}>2. Secret Cloud API Keys</strong>
                <p>Private keys (OpenAI GPT-4o, Anthropic Claude, Gemini) should never be shared. Add your private key into <code>backend/.env</code> if using cloud providers.</p>
              </div>
              <div>
                <strong style={{ color: '#fff' }}>3. Docker Desktop (Future Phase 3 PostgreSQL)</strong>
                <p>Phase 1/2 uses zero-cost native SQLite. When upgrading to PostgreSQL + <code>pgvector</code> in Phase 3, you launch Docker Desktop.</p>
              </div>
              <div>
                <strong style={{ color: '#fff' }}>4. Production Payment Credentials</strong>
                <p>EL will build booking and payment modules, but real money transfers require merchant developer tokens and user sign-off.</p>
              </div>
            </div>
          </div>

          {/* Configuration Inspector */}
          <div style={{ background: 'rgba(8, 16, 32, 0.8)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--neon-yellow)', padding: '16px' }}>
            <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-cyber)', color: 'var(--neon-yellow)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} /> TELEMETRY & HARDWARE MATRIX
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              <div><strong>API HOST:</strong> 127.0.0.1:8000</div>
              <div><strong>WEB UI:</strong> 127.0.0.1:5173</div>
              <div><strong>DATABASE:</strong> SQLite (el_database.sqlite)</div>
              <div><strong>NEURAL ENGINE:</strong> Ollama (llama3.2:3b)</div>
              <div><strong>GPU ACCEL:</strong> RTX 3050 Laptop CUDA</div>
              <div><strong>WORKSPACE:</strong> d:\El\workspace</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(4, 7, 16, 0.8)' }}>
          <button className="btn-cyber-secondary" onClick={() => { cyberAudio.click(); onClose(); }}>
            CLOSE SPECIFICATIONS
          </button>
        </div>
      </div>
    </div>
  );
}
