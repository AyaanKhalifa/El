import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import CodingAgentPanel from './components/CodingAgentPanel';
import TerminalView from './components/TerminalView';
import SettingsModal from './components/SettingsModal';
import CyberCanvas3D from './components/CyberCanvas3D';
import CyberVisionPanel from './components/CyberVisionPanel';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); // Default to Neural Assistant with 3D Core
  const [systemStatus, setSystemStatus] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/system/status`);
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      } else {
        setSystemStatus({ status: 'offline' });
      }
    } catch (err) {
      setSystemStatus({ status: 'offline' });
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
      {/* 3D Cyberpunk Holographic Canvas */}
      <CyberCanvas3D isListening={isListening} isSpeaking={isSpeaking} />

      {/* Futuristic Cyberpunk HUD Header */}
      <Header
        systemStatus={systemStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Panel Viewport */}
      <main style={{ flex: 1, position: 'relative', zIndex: 5 }}>
        {activeTab === 'chat' && (
          <ChatPanel
            backendUrl={BACKEND_URL}
            isListeningExternal={isListening}
            setIsListeningExternal={setIsListening}
            isSpeakingExternal={isSpeaking}
            setIsSpeakingExternal={setIsSpeaking}
          />
        )}
        {activeTab === 'vision' && <CyberVisionPanel backendUrl={BACKEND_URL} />}
        {activeTab === 'agent' && <CodingAgentPanel backendUrl={BACKEND_URL} />}
        {activeTab === 'terminal' && <TerminalView backendUrl={BACKEND_URL} />}
      </main>

      {/* System Specifications Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemStatus={systemStatus}
      />
    </div>
  );
}
