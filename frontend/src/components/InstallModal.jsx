import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Share2
} from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

export default function InstallModal({ isOpen, onClose }) {
  const [canInstallNative, setCanInstallNative] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.deferredPrompt) {
      setCanInstallNative(true);
    }
    const handler = () => setCanInstallNative(true);
    window.addEventListener('pwa-installable', handler);
    return () => window.removeEventListener('pwa-installable', handler);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    cyberAudio.confirm();
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const choice = await window.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        window.deferredPrompt = null;
        setCanInstallNative(false);
      }
    } else {
      // Fallback: alert instructions for Chrome mobile
      alert(
        "To install on Chrome:\n\n1. Tap the 3-dot menu (⋮) in the top right of Chrome.\n2. Tap 'Install app' or 'Add to Home screen'.\n\nChrome will automatically generate and install the native Android APK!"
      );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(2, 6, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="cyber-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(5, 10, 24, 0.98)',
          border: '1.5px solid var(--neon-cyan)',
          boxShadow: '0 0 35px rgba(0, 242, 254, 0.35)',
          padding: '24px',
          borderRadius: '4px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            cyberAudio.click();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.3), rgba(255, 0, 127, 0.3))',
              border: '1.5px solid var(--neon-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Smartphone size={22} color="var(--neon-cyan)" />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontFamily: 'var(--font-cyber)',
                color: 'var(--neon-cyan)',
                letterSpacing: '0.05em'
              }}
            >
              INSTALL EL APK / APP
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              CHROME WEBAPK // NATIVE ANDROID EXPERIENCE
            </p>
          </div>
        </div>

        {/* Body content */}
        <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '20px' }}>
          <p style={{ marginTop: 0 }}>
            You can run **EL** as a native standalone app on Android and PC directly via Google Chrome!
            Chrome compiles and installs it as a genuine <strong>Android WebAPK</strong> with full fullscreen, offline capability, and home screen launch.
          </p>

          {/* Quick Step Guide */}
          <div
            style={{
              background: 'rgba(8, 16, 36, 0.8)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              borderRadius: '4px',
              padding: '14px',
              margin: '14px 0'
            }}
          >
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-pink)', fontWeight: 700, marginBottom: '8px' }}>
              // CHROME ONE-TAP INSTALLATION GUIDE:
            </div>
            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1' }}>
              <li style={{ marginBottom: '6px' }}>
                Open this app URL in <strong>Google Chrome</strong> on your phone.
              </li>
              <li style={{ marginBottom: '6px' }}>
                Tap the <strong>"INSTALL APP (APK)"</strong> button below, <em>OR</em> tap Chrome's <strong>3 dots (⋮)</strong> menu.
              </li>
              <li style={{ marginBottom: '6px' }}>
                Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </li>
              <li>
                Chrome will automatically mint and install the native <strong>WebAPK</strong> on your Android phone!
              </li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} color="var(--neon-green)" /> Verified Safe
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={12} color="var(--neon-yellow)" /> Zero PlayStore lag
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={12} color="var(--neon-cyan)" /> Live Auto-Sync
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleInstallClick}
            style={{
              background: installed
                ? 'rgba(0, 255, 136, 0.2)'
                : 'linear-gradient(135deg, var(--neon-cyan), var(--neon-pink))',
              border: `1.5px solid ${installed ? 'var(--neon-green)' : 'var(--neon-cyan)'}`,
              color: installed ? 'var(--neon-green)' : '#fff',
              padding: '12px 18px',
              fontSize: '13px',
              fontFamily: 'var(--font-hud)',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '2px',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {installed ? (
              <>
                <CheckCircle size={16} color="var(--neon-green)" />
                <span>APP INSTALLED SUCCESSFULLY!</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>{canInstallNative ? '📲 1-TAP INSTALL WEBAPK IN CHROME' : '📲 INSTALL APP / APK VIA CHROME'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              cyberAudio.click();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              padding: '8px 12px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              borderRadius: '2px'
            }}
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
