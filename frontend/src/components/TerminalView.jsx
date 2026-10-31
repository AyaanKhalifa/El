import React, { useState } from 'react';
import { Terminal as TermIcon, Play, Trash2, ShieldCheck, Cpu } from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

export default function TerminalView({ backendUrl }) {
  const [cmd, setCmd] = useState('');
  const [history, setHistory] = useState([
    {
      command: 'echo "CYBERDECK SHELL ACTIVE // GPU ACCELERATED"',
      stdout: 'CYBERDECK SHELL ACTIVE // GPU ACCELERATED\nKERNEL: WINDOWS 11 // SANDBOX PERMISSIONS: STRICT\n',
      stderr: '',
      success: true
    }
  ]);
  const [running, setRunning] = useState(false);

  const runCommand = async (commandToRun) => {
    const finalCmd = commandToRun || cmd;
    if (!finalCmd.trim() || running) return;

    cyberAudio.click();
    setRunning(true);
    try {
      const res = await fetch(`${backendUrl}/agent/terminal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: finalCmd })
      });
      const data = await res.json();
      if (data.success) {
        cyberAudio.confirm();
      } else {
        cyberAudio.alert();
      }
      setHistory((prev) => [
        ...prev,
        {
          command: finalCmd,
          stdout: data.stdout || '',
          stderr: data.stderr || '',
          error: data.error,
          success: data.success
        }
      ]);
      setCmd('');
    } catch (err) {
      cyberAudio.alert();
      setHistory((prev) => [
        ...prev,
        {
          command: finalCmd,
          stdout: '',
          stderr: err.message,
          success: false
        }
      ]);
    } finally {
      setRunning(false);
    }
  };

  const quickCommands = [
    'git status',
    'python --version',
    'ollama --version',
    'dir'
  ];

  return (
    <div
      className="cyber-panel cyber-panel-pink"
      style={{
        margin: '0 20px',
        height: 'calc(100vh - 110px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 5
      }}
    >
      {/* Top Cyberdeck Header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 8, 17, 0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TermIcon size={18} color="var(--neon-pink)" />
          <span className="font-cyber neon-text-pink" style={{ fontSize: '14px', fontWeight: 700 }}>
            CYBERDECK // CLI MATRIX
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', background: 'rgba(0, 255, 136, 0.1)', padding: '2px 8px', border: '1px solid var(--neon-green)', borderRadius: '2px' }}>
            <ShieldCheck size={12} /> SECURE_SANDBOX
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {quickCommands.map((qc) => (
            <button
              key={qc}
              onClick={() => runCommand(qc)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                background: 'rgba(0, 242, 254, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--neon-cyan)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--neon-cyan)', e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 242, 254, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)', e.currentTarget.style.boxShadow = 'none')}
            >
              $ {qc}
            </button>
          ))}
          <button
            onClick={() => { cyberAudio.click(); setHistory([]); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
          >
            <Trash2 size={13} /> CLEAR
          </button>
        </div>
      </div>

      {/* Cyber Terminal Output Console */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#020409', fontFamily: 'var(--font-mono)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {history.map((h, i) => (
          <div key={i}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: 'var(--neon-green)', fontWeight: 700 }}>el@cyberdeck:~$</span>
              <span style={{ color: 'var(--neon-cyan)' }}>{h.command}</span>
            </div>
            {h.stdout && (
              <pre style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', marginTop: '4px', lineHeight: 1.4, paddingLeft: '8px', borderLeft: '2px solid rgba(0, 255, 136, 0.3)' }}>
                {h.stdout}
              </pre>
            )}
            {h.stderr && (
              <pre style={{ color: 'var(--neon-pink)', whiteSpace: 'pre-wrap', marginTop: '4px', paddingLeft: '8px', borderLeft: '2px solid var(--neon-pink)' }}>
                {h.stderr}
              </pre>
            )}
            {h.error && (
              <div style={{ color: 'var(--neon-pink)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                ⚠️ SYS_ERROR: {h.error}
              </div>
            )}
          </div>
        ))}
        {running && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'var(--neon-green)' }}>el@cyberdeck:~$</span>
            <span style={{ color: 'var(--neon-yellow)' }}>{cmd} [EXECUTING SHELL COMMAND...]</span>
          </div>
        )}
      </div>

      {/* Input Prompt */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(3, 6, 13, 0.95)' }}>
        <form onSubmit={(e) => { e.preventDefault(); runCommand(); }} style={{ display: 'flex', gap: '10px' }}>
          <span style={{ color: 'var(--neon-green)', fontFamily: 'var(--font-mono)', alignSelf: 'center', fontSize: '15px', fontWeight: 700 }}>$</span>
          <input
            id="term-input"
            type="text"
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="Input PowerShell / CLI instruction..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button id="term-run-btn" type="submit" className="btn-cyber-primary" style={{ padding: '6px 16px' }} disabled={running || !cmd.trim()}>
            <Play size={13} /> EXEC
          </button>
        </form>
      </div>
    </div>
  );
}
