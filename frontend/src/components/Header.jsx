import React, { useState } from 'react';
import {
  Cpu,
  Terminal,
  FolderTree,
  Settings,
  ShieldCheck,
  Volume2,
  VolumeX,
  Activity,
  Zap,
  Menu,
  X,
  Smartphone,
  Download
} from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

export default function Header({ systemStatus, activeTab, setActiveTab, onOpenSettings, onOpenInstall }) {
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ollamaOnline = systemStatus?.ai_engine?.ollama_online;
  const backendOnline = systemStatus?.status === 'healthy';

  const handleTabClick = (tab) => {
    cyberAudio.click();
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleToggleSfx = () => {
    const isNowOn = cyberAudio.toggleSound();
    setSfxEnabled(isNowOn);
    if (isNowOn) cyberAudio.confirm();
  };

  return (
    <header
      className="cyber-panel cyber-header-responsive"
      style={{
        margin: '10px 16px 8px 16px',
        padding: '10px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 40
      }}
    >
      {/* Left: Cyberpunk Emblem & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(255, 0, 127, 0.25))',
              border: '1.5px solid var(--neon-cyan)',
              boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontFamily: 'var(--font-cyber)',
              fontWeight: 900,
              fontSize: '16px',
              textShadow: '0 0 10px var(--neon-cyan)',
              flexShrink: 0
            }}
          >
            EL
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className="font-cyber neon-text-cyan brand-title"
                style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.1em' }}
              >
                EL // NEURAL HUD
              </span>
              <span
                className="brand-badge-desktop"
                style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 6px',
                  borderRadius: '2px',
                  background: 'rgba(255, 0, 127, 0.15)',
                  border: '1px solid var(--neon-pink)',
                  color: 'var(--neon-pink)'
                }}
              >
                PHASE 2
              </span>
            </div>

            <div
              className="brand-specs-desktop"
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                gap: '6px',
                marginTop: '1px'
              }}
            >
              <span>WIN_11</span>
              <span>•</span>
              <span style={{ color: 'var(--neon-green)' }}>RTX 3050 CUDA</span>
              <span>•</span>
              <span style={{ color: 'var(--neon-yellow)' }}>FEMALE VOICE READY</span>
            </div>
          </div>
        </div>

        <div className="header-divider-desktop" style={{ height: '28px', width: '1px', background: 'var(--border-subtle)', margin: '0 2px' }} />

        {/* Live System Diagnostics Badges (Desktop) */}
        <div className="header-diagnostics-desktop" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              background: backendOnline ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 0, 127, 0.15)',
              border: `1px solid ${backendOnline ? 'var(--neon-green)' : 'var(--neon-pink)'}`,
              color: backendOnline ? 'var(--neon-green)' : 'var(--neon-pink)'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: backendOnline ? 'var(--neon-green)' : 'var(--neon-pink)',
                boxShadow: `0 0 8px ${backendOnline ? 'var(--neon-green)' : 'var(--neon-pink)'}`
              }}
            />
            <span>{systemStatus?.mode || (backendOnline ? 'API:ONLINE' : 'API:OFFLINE')}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              background: ollamaOnline || systemStatus?.mode?.includes('Cloud') ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 230, 0, 0.15)',
              border: `1px solid ${ollamaOnline || systemStatus?.mode?.includes('Cloud') ? 'var(--neon-cyan)' : 'var(--neon-yellow)'}`,
              color: ollamaOnline || systemStatus?.mode?.includes('Cloud') ? 'var(--neon-cyan)' : 'var(--neon-yellow)'
            }}
          >
            <Zap size={12} color={ollamaOnline || systemStatus?.mode?.includes('Cloud') ? 'var(--neon-cyan)' : 'var(--neon-yellow)'} />
            <span>{systemStatus?.mode?.includes('Cloud') ? 'CLOUD NEURAL' : (ollamaOnline ? 'OLLAMA: ON' : 'LOCAL CORE')}</span>
          </div>
        </div>
      </div>

      {/* Right: Cyber Nav Tabs & Controls (Desktop) */}
      <div className="header-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          id="btn-tab-chat"
          className={activeTab === 'chat' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
          onClick={() => handleTabClick('chat')}
          style={{ padding: '6px 12px', fontSize: '11px' }}
        >
          <Cpu size={14} /> Neural Assistant
        </button>

        <button
          id="btn-tab-vision"
          className={activeTab === 'vision' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
          onClick={() => handleTabClick('vision')}
          style={{ padding: '6px 12px', fontSize: '11px' }}
        >
          <Activity size={14} /> Cyber-Vision
        </button>

        <button
          id="btn-tab-agent"
          className={activeTab === 'agent' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
          onClick={() => handleTabClick('agent')}
          style={{ padding: '6px 12px', fontSize: '11px' }}
        >
          <FolderTree size={14} /> Coding Studio
        </button>

        <button
          id="btn-tab-terminal"
          className={activeTab === 'terminal' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
          onClick={() => handleTabClick('terminal')}
          style={{ padding: '6px 12px', fontSize: '11px' }}
        >
          <Terminal size={14} /> Terminal
        </button>

        {/* INSTALL APP / APK BUTTON (Desktop) */}
        <button
          id="btn-open-install"
          className="btn-cyber-secondary"
          onClick={() => {
            cyberAudio.click();
            onOpenInstall();
          }}
          style={{
            padding: '6px 12px',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(255, 0, 127, 0.15))',
            border: '1px solid var(--neon-cyan)',
            color: 'var(--neon-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 700
          }}
          title="Install WebAPK on Android Chrome or Download App"
        >
          <Smartphone size={14} color="var(--neon-cyan)" />
          <span>INSTALL APK</span>
        </button>

        {/* SFX Audio Toggle */}
        <button
          id="btn-toggle-sfx"
          className="btn-cyber-secondary"
          onClick={handleToggleSfx}
          style={{ padding: '6px 10px' }}
          title={sfxEnabled ? 'Mute Cyber Audio SFX' : 'Enable Cyber Audio SFX'}
        >
          {sfxEnabled ? <Volume2 size={14} color="var(--neon-cyan)" /> : <VolumeX size={14} color="var(--text-dim)" />}
        </button>

        <button
          id="btn-open-settings"
          className="btn-cyber-secondary"
          onClick={() => {
            cyberAudio.click();
            onOpenSettings();
          }}
          style={{ padding: '6px 10px' }}
          title="System Architecture & Diagnostics"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Mobile Header Right Icons (APK, SFX, Settings, Hamburger Toggle) */}
      <div className="header-nav-mobile" style={{ display: 'none', alignItems: 'center', gap: '6px' }}>
        <button
          className="btn-cyber-secondary"
          onClick={() => {
            cyberAudio.click();
            onOpenInstall();
          }}
          style={{
            padding: '6px 8px',
            background: 'rgba(0, 242, 254, 0.15)',
            border: '1px solid var(--neon-cyan)',
            color: 'var(--neon-cyan)'
          }}
          title="Install Android WebAPK via Chrome"
        >
          <Smartphone size={14} />
        </button>

        <button
          className="btn-cyber-secondary"
          onClick={handleToggleSfx}
          style={{ padding: '6px 8px' }}
          title="SFX"
        >
          {sfxEnabled ? <Volume2 size={14} color="var(--neon-cyan)" /> : <VolumeX size={14} color="var(--text-dim)" />}
        </button>

        <button
          className="btn-cyber-secondary"
          onClick={() => {
            cyberAudio.click();
            onOpenSettings();
          }}
          style={{ padding: '6px 8px' }}
          title="Settings"
        >
          <Settings size={14} />
        </button>

        <button
          className="btn-cyber-secondary"
          onClick={() => {
            cyberAudio.click();
            setMobileMenuOpen((prev) => !prev);
          }}
          style={{
            padding: '6px 8px',
            borderColor: mobileMenuOpen ? 'var(--neon-cyan)' : 'var(--border-subtle)',
            color: mobileMenuOpen ? 'var(--neon-cyan)' : 'var(--text-main)'
          }}
          title="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-dropdown-menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'rgba(5, 8, 20, 0.98)',
            border: '1px solid var(--neon-cyan)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 242, 254, 0.2)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 100,
            backdropFilter: 'blur(20px)'
          }}
        >
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', marginBottom: '4px' }}>
            // SELECT HUD SUBSYSTEM
          </div>

          <button
            className="btn-cyber-primary"
            onClick={() => {
              cyberAudio.click();
              setMobileMenuOpen(false);
              onOpenInstall();
            }}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(255, 0, 127, 0.25))',
              border: '1.5px solid var(--neon-cyan)',
              color: 'var(--neon-cyan)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Smartphone size={16} /> 📲 Install APK / App on Chrome
          </button>

          <button
            className={activeTab === 'chat' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            onClick={() => handleTabClick('chat')}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
          >
            <Cpu size={16} /> Neural Assistant
          </button>

          <button
            className={activeTab === 'vision' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            onClick={() => handleTabClick('vision')}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
          >
            <Activity size={16} /> Cyber-Vision & Sensors
          </button>

          <button
            className={activeTab === 'agent' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            onClick={() => handleTabClick('agent')}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
          >
            <FolderTree size={16} /> Coding Studio
          </button>

          <button
            className={activeTab === 'terminal' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
            onClick={() => handleTabClick('terminal')}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
          >
            <Terminal size={16} /> Cyberdeck CLI
          </button>

          {/* Quick status in mobile menu */}
          <div
            style={{
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)'
            }}
          >
            <span style={{ color: backendOnline ? 'var(--neon-green)' : 'var(--neon-pink)' }}>
              ● API {backendOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
            <span style={{ color: 'var(--neon-pink)' }}>♀ FEMALE VOICE ON</span>
          </div>
        </div>
      )}
    </header>
  );
}
