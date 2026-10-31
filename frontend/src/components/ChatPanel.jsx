import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  Mic,
  Volume2,
  VolumeX,
  Copy,
  Check,
  History,
  Plus,
  Trash2,
  X,
  ChevronDown,
  Heart,
  Globe,
  Code,
  FileText
} from 'lucide-react';
import { useVoice, isVoiceFemale, WORLD_LANGUAGES } from '../hooks/useVoice';
import { cyberAudio } from '../utils/cyberAudio';

// High-tech Code Snippet component with 1-click Copy
function CodeSnippetBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    cyberAudio.click();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        margin: '10px 0',
        background: 'rgba(3, 6, 15, 0.95)',
        border: '1px solid rgba(0, 242, 254, 0.35)',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.6)'
      }}
    >
      <div
        style={{
          padding: '6px 12px',
          background: 'rgba(10, 18, 38, 0.85)',
          borderBottom: '1px solid rgba(0, 242, 254, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code size={13} color="var(--neon-cyan)" />
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-cyan)',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}
          >
            {language ? language.toUpperCase() : 'CODE'}
          </span>
        </div>

        <button
          onClick={handleCopyCode}
          style={{
            background: copied ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 242, 254, 0.1)',
            border: `1px solid ${copied ? 'var(--neon-green)' : 'var(--neon-cyan)'}`,
            color: copied ? 'var(--neon-green)' : 'var(--neon-cyan)',
            padding: '2px 8px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            borderRadius: '2px',
            transition: 'all 0.2s'
          }}
          title="Copy this code block"
        >
          {copied ? <Check size={11} color="var(--neon-green)" /> : <Copy size={11} />}
          <span>{copied ? 'COPIED!' : 'COPY CODE'}</span>
        </button>
      </div>

      <pre
        style={{
          margin: 0,
          padding: '12px 14px',
          overflowX: 'auto',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          color: '#e2e8f0',
          lineHeight: 1.55,
          background: 'rgba(2, 4, 10, 0.95)'
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Markdown link & text formatter (supporting tel:, whatsapp:, and web links)
function renderTextWithLinks(text, baseKey) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const elements = [];
  let lastIdx = 0;
  let match;
  let k = 0;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      elements.push(
        <span key={`${baseKey}-t-${k++}`}>
          {text.substring(lastIdx, match.index)}
        </span>
      );
    }
    const label = match[1];
    const href = match[2];
    const isTel = href.startsWith('tel:');
    const isWhatsApp = href.includes('whatsapp');

    elements.push(
      <a
        key={`${baseKey}-l-${k++}`}
        href={href}
        target={isTel ? '_self' : '_blank'}
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          margin: '4px 2px',
          background: isTel
            ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.25), rgba(0, 242, 254, 0.2))'
            : isWhatsApp
            ? 'rgba(37, 211, 102, 0.2)'
            : 'rgba(0, 242, 254, 0.12)',
          border: `1.5px solid ${isTel || isWhatsApp ? 'var(--neon-green)' : 'var(--neon-cyan)'}`,
          color: isTel || isWhatsApp ? 'var(--neon-green)' : 'var(--neon-cyan)',
          borderRadius: '4px',
          fontWeight: 700,
          textDecoration: 'none',
          fontSize: '12px',
          fontFamily: 'var(--font-hud)',
          boxShadow: isTel || isWhatsApp ? '0 0 14px rgba(0, 255, 136, 0.35)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        {label}
      </a>
    );
    lastIdx = linkRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    elements.push(
      <span key={`${baseKey}-t-${k++}`}>{text.substring(lastIdx)}</span>
    );
  }

  return elements;
}

// Markdown formatter with code block detection and link rendering
function renderFormattedContent(content) {
  if (!content) return null;
  const parts = [];
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let idx = 0;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${idx++}`}>
          {renderTextWithLinks(content.substring(lastIndex, match.index), `txt-${idx}`)}
        </span>
      );
    }
    const lang = match[1] || '';
    const code = match[2];
    parts.push(
      <CodeSnippetBlock key={`code-${idx++}`} language={lang} code={code} />
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${idx++}`}>
        {renderTextWithLinks(content.substring(lastIndex), `txt-${idx}`)}
      </span>
    );
  }

  return parts;
}

// Extracts pure content (clean code without fences, or clean text without conversational intro/outro/markdown)
function extractPureContent(rawText) {
  if (!rawText) return '';

  // 1. Check for code blocks
  const codeBlockRegex = /```(?:[a-zA-Z0-9_-]*\n)?([\s\S]*?)```/g;
  const codeBlocks = [];
  let match;
  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    if (match[1] && match[1].trim()) {
      codeBlocks.push(match[1].trim());
    }
  }

  if (codeBlocks.length > 0) {
    // Return pure code only
    return codeBlocks.join('\n\n');
  }

  // 2. Check for poetry, notes, or structured text
  let cleaned = rawText;

  // Remove common AI footer notes
  cleaned = cleaned.replace(/\n*\*\s*\([✨💖].*?\)\s*\*/gi, '');
  cleaned = cleaned.replace(/\n*💖\s*\*.*?\*\s*$/gi, '');

  // If there's an intro like "Here is a poem...:\n\n", extract the substantive body
  const introMatch = cleaned.match(/^([^\n]+:\s*\n+)([\s\S]+)$/);
  if (
    introMatch &&
    (introMatch[1].toLowerCase().includes('poem') ||
      introMatch[1].toLowerCase().includes('कविता') ||
      introMatch[1].toLowerCase().includes('here is'))
  ) {
    cleaned = introMatch[2];
  }

  // Remove markdown bold / italic markers
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');

  // Clean markdown links [label](url) -> label (url) or just label for protocols
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => {
    if (url.startsWith('tel:') || url.startsWith('whatsapp:')) return label;
    return `${label} (${url})`;
  });

  // Strip blockquote '>' prefixes
  cleaned = cleaned.replace(/^>\s*/gm, '');

  // Strip markdown headers
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  return cleaned.trim();
}

export default function ChatPanel({
  backendUrl,
  isListeningExternal,
  setIsListeningExternal,
  isSpeakingExternal,
  setIsSpeakingExternal
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        "NEURAL CORE ONLINE // EL v2.0 READY 🌸\n\nI am EL, your emotionally expressive neural companion and autonomous software architect! My female voice synthesis, worldwide multilingual support, broken English understanding, and easy code writer are active.\n\n✨ Ask me in English, broken English, Hindi, or any language to:\n- Write poetry with deep emotion\n- Write code easily with 1-click copy\n- Open YouTube, Notepad, Calculator, or Folders\n- Chat and share feelings\n\nHow may I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState(() => {
    const saved = localStorage.getItem('el_active_conv_id');
    return saved ? parseInt(saved, 10) : null;
  });
  const [copiedStatus, setCopiedStatus] = useState({ id: null, type: null });
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const scrollRef = useRef(null);

  const {
    selectedLanguage,
    setLanguage,
    isListening,
    transcript,
    startListening,
    stopListening,
    isSpeaking,
    speak,
    stopSpeaking,
    autoSpeak,
    toggleAutoSpeak,
    availableVoices,
    selectedVoice,
    selectVoiceByName
  } = useVoice();

  // Sync voice states with parent for 3D canvas reactivity
  useEffect(() => {
    if (setIsListeningExternal) setIsListeningExternal(isListening);
  }, [isListening, setIsListeningExternal]);

  useEffect(() => {
    if (setIsSpeakingExternal) setIsSpeakingExternal(isSpeaking);
  }, [isSpeaking, setIsSpeakingExternal]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load conversations list for history drawer
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${backendUrl}/chat/conversations`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.warn('Could not fetch conversations:', e);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Load existing active conversation messages if available
  useEffect(() => {
    if (activeConvId) {
      const loadConv = async () => {
        try {
          const res = await fetch(`${backendUrl}/chat/conversations/${activeConvId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.messages && data.messages.length > 0) {
              setMessages(data.messages);
            }
          }
        } catch (e) {
          console.warn('Could not load active conversation:', e);
        }
      };
      loadConv();
    }
  }, [activeConvId]);

  const handleMicToggle = () => {
    if (isListening) {
      cyberAudio.click();
      stopListening();
    } else {
      cyberAudio.pulse();
      startListening();
    }
  };

  const handleCopyReply = (msgId, rawContent) => {
    cyberAudio.click();
    navigator.clipboard.writeText(rawContent);
    setCopiedStatus({ id: msgId, type: 'reply' });
    setTimeout(() => {
      setCopiedStatus({ id: null, type: null });
    }, 2000);
  };

  const handleCopyContent = (msgId, rawContent) => {
    cyberAudio.click();
    const pure = extractPureContent(rawContent);
    navigator.clipboard.writeText(pure);
    setCopiedStatus({ id: msgId, type: 'content' });
    setTimeout(() => {
      setCopiedStatus({ id: null, type: null });
    }, 2000);
  };

  const handleNewChat = async () => {
    cyberAudio.confirm();
    stopSpeaking();
    try {
      const res = await fetch(`${backendUrl}/chat/conversations`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setActiveConvId(data.id);
        localStorage.setItem('el_active_conv_id', data.id.toString());
        setMessages([
          {
            id: Date.now(),
            role: 'assistant',
            content: "✨ New neural session ready! You can speak or type in any language, broken English, or request poetry and code.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        fetchConversations();
        setShowHistory(false);
      }
    } catch (e) {
      setActiveConvId(null);
      localStorage.removeItem('el_active_conv_id');
      setMessages([
        {
          id: Date.now(),
          role: 'assistant',
          content: "✨ New session started.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setShowHistory(false);
    }
  };

  const handleSelectConv = async (id) => {
    cyberAudio.click();
    stopSpeaking();
    try {
      const res = await fetch(`${backendUrl}/chat/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConvId(id);
        localStorage.setItem('el_active_conv_id', id.toString());
        setMessages(data.messages.length > 0 ? data.messages : [
          {
            id: Date.now(),
            role: 'assistant',
            content: "✨ Loaded conversation session.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setShowHistory(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConv = async (id, e) => {
    e.stopPropagation();
    cyberAudio.alert();
    try {
      const res = await fetch(`${backendUrl}/chat/conversations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConvId === id) {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    cyberAudio.confirm();
    stopSpeaking();

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_id: activeConvId
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setActiveConvId(data.conversation_id);
      localStorage.setItem('el_active_conv_id', data.conversation_id.toString());
      fetchConversations();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.reply,
          provider: data.provider_used,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (autoSpeak) {
        speak(data.reply);
      }
    } catch (err) {
      cyberAudio.alert();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          isError: true,
          content: `⚠️ [SYS_CRITICAL] Backend Connection Failure: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Say hello to Dad on WhatsApp",
    "Video call Dad on WhatsApp",
    "Call Dad on mobile",
    "Open Notepad and write my ideas",
    "Write an emotional poem about midnight rain",
    "Write HTML and CSS code for modern login card",
    "opn utube plz"
  ];

  const currentVoiceName = selectedVoice?.name || 'Female Voice (Default)';
  const isCurrentFemale = isVoiceFemale(selectedVoice);
  const activeLangObj = WORLD_LANGUAGES.find((l) => l.code === selectedLanguage) || WORLD_LANGUAGES[0];

  return (
    <div
      className="cyber-panel chat-container-responsive"
      style={{
        height: 'calc(100dvh - 105px)',
        margin: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 5
      }}
    >
      {/* Dialogue Sub-header: Spectrum, Language Selector, Female Voice Pill, History */}
      <div
        className="dialogue-sub-header"
        style={{
          padding: '8px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(5, 8, 17, 0.85)',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        {/* Left Section: History, New Chat, Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              cyberAudio.click();
              setShowHistory((prev) => !prev);
              fetchConversations();
            }}
            style={{
              background: showHistory ? 'rgba(0, 242, 254, 0.2)' : 'rgba(14, 24, 46, 0.7)',
              border: `1px solid ${showHistory ? 'var(--neon-cyan)' : 'var(--border-subtle)'}`,
              color: showHistory ? 'var(--neon-cyan)' : 'var(--text-main)',
              padding: '5px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '2px',
              transition: 'all 0.2s'
            }}
            title="Open Chat History (Past Conversations)"
          >
            <History size={13} />
            <span>HISTORY</span>
          </button>

          <button
            onClick={handleNewChat}
            style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid var(--neon-green)',
              color: 'var(--neon-green)',
              padding: '5px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              borderRadius: '2px'
            }}
            title="Start a fresh chat conversation"
          >
            <Plus size={13} />
            <span>NEW CHAT</span>
          </button>

          {/* Voice Indicator Badge */}
          {isSpeaking ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '3px 8px',
                background: 'rgba(0, 242, 254, 0.1)',
                border: '1px solid var(--neon-cyan)',
                borderRadius: '2px'
              }}
            >
              <div className="cyber-spectrum">
                <span /><span /><span /><span /><span />
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>
                FEMALE VOICE ACTIVE
              </span>
            </div>
          ) : isListening ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                background: 'rgba(255, 0, 127, 0.15)',
                border: '1px solid var(--neon-pink)',
                borderRadius: '2px'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--neon-pink)',
                  boxShadow: '0 0 10px var(--neon-pink)'
                }}
              />
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-pink)' }}>
                LISTENING ({activeLangObj.code})
              </span>
            </div>
          ) : (
            <span
              className="hidden-on-mobile"
              style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
            >
              EL // MULTILINGUAL // BROKEN-EN OK
            </span>
          )}
        </div>

        {/* Right Section: Worldwide Language Selector & Female Voice Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Worldwide Language Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                cyberAudio.click();
                setShowLangMenu((prev) => !prev);
                setShowVoiceMenu(false);
              }}
              style={{
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                padding: '4px 9px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                borderRadius: '2px'
              }}
              title="Select Worldwide Language for Speech & Voice"
            >
              <Globe size={12} />
              <span>{activeLangObj.flag} {activeLangObj.label.split(' ')[0]}</span>
              <ChevronDown size={11} />
            </button>

            {/* Language Dropdown Popover */}
            {showLangMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '6px',
                  width: '220px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  background: 'rgba(5, 8, 20, 0.98)',
                  border: '1px solid var(--neon-cyan)',
                  boxShadow: '0 8px 30px rgba(0, 242, 254, 0.3)',
                  zIndex: 60,
                  padding: '6px',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--neon-cyan)',
                    padding: '4px',
                    fontWeight: 700,
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '4px'
                  }}
                >
                  // WORLDWIDE LANGUAGES
                </div>

                {WORLD_LANGUAGES.map((lang) => {
                  const isSelected = lang.code === selectedLanguage;
                  return (
                    <div
                      key={lang.code}
                      onClick={() => {
                        cyberAudio.click();
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      style={{
                        padding: '6px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontFamily: 'var(--font-hud)',
                        color: isSelected ? 'var(--neon-cyan)' : 'var(--text-main)',
                        background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Female Voice Selector Toggle */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                cyberAudio.click();
                setShowVoiceMenu((prev) => !prev);
                setShowLangMenu(false);
              }}
              style={{
                background: 'rgba(255, 0, 127, 0.12)',
                border: '1px solid var(--neon-pink)',
                color: '#fbcfe8',
                padding: '4px 9px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                borderRadius: '2px'
              }}
              title="Select Female TTS Voice"
            >
              <Heart size={12} color="var(--neon-pink)" />
              <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isCurrentFemale ? '♀ ' : ''}{currentVoiceName.split(' ')[0] || 'Female Voice'}
              </span>
              <ChevronDown size={11} />
            </button>

            {/* Voice Dropdown Popover */}
            {showVoiceMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '6px',
                  width: '260px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  background: 'rgba(5, 8, 20, 0.98)',
                  border: '1px solid var(--neon-pink)',
                  boxShadow: '0 8px 30px rgba(255, 0, 127, 0.3)',
                  zIndex: 60,
                  padding: '8px',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--neon-pink)',
                    padding: '4px',
                    fontWeight: 700,
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '4px'
                  }}
                >
                  // FEMALE TTS VOICES (DEFAULT)
                </div>

                {availableVoices.length === 0 ? (
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', padding: '6px' }}>
                    Loading system voices...
                  </div>
                ) : (
                  availableVoices.map((v, i) => {
                    const isFem = isVoiceFemale(v);
                    const isSelected = selectedVoice?.name === v.name;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          cyberAudio.click();
                          selectVoiceByName(v.name);
                          setShowVoiceMenu(false);
                          speak("Hello! I am EL. This is my voice.");
                        }}
                        style={{
                          padding: '6px 8px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontFamily: 'var(--font-hud)',
                          color: isSelected ? 'var(--neon-cyan)' : isFem ? '#fbcfe8' : 'var(--text-muted)',
                          background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                          borderLeft: isSelected ? '2px solid var(--neon-cyan)' : '2px solid transparent',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {isFem ? '♀ ' : '♂ '}{v.name}
                        </span>
                        {isFem && (
                          <span style={{ fontSize: '9px', background: 'rgba(255,0,127,0.2)', color: 'var(--neon-pink)', padding: '1px 4px', borderRadius: '2px' }}>
                            FEMALE
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {isSpeaking && (
            <button
              onClick={() => {
                cyberAudio.click();
                stopSpeaking();
              }}
              style={{
                background: 'rgba(255, 0, 127, 0.15)',
                border: '1px solid var(--neon-pink)',
                color: 'var(--neon-pink)',
                padding: '4px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <VolumeX size={12} /> <span className="hidden-on-mobile">SILENCE</span>
            </button>
          )}

          <button
            id="btn-toggle-autospeak"
            onClick={() => {
              cyberAudio.click();
              toggleAutoSpeak();
            }}
            style={{
              background: autoSpeak ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${autoSpeak ? 'var(--neon-green)' : 'var(--border-subtle)'}`,
              color: autoSpeak ? 'var(--neon-green)' : 'var(--text-muted)',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Toggle Automatic Speech Synthesis for AI Replies"
          >
            {autoSpeak ? <Volume2 size={12} /> : <VolumeX size={12} />}
            <span>VOICE: {autoSpeak ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Body: includes collapsible Chat History Drawer + Messages Feed */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Chat History Slide-out Drawer */}
        {showHistory && (
          <div
            className="chat-history-drawer"
            style={{
              width: '280px',
              maxWidth: '85vw',
              background: 'rgba(4, 8, 18, 0.96)',
              borderRight: '1px solid var(--neon-cyan)',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 30,
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(8, 16, 32, 0.9)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={15} color="var(--neon-cyan)" />
                <span className="font-cyber neon-text-cyan" style={{ fontSize: '12px', fontWeight: 700 }}>
                  CHAT HISTORY
                </span>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* List of past sessions */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              <button
                onClick={handleNewChat}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  marginBottom: '10px',
                  background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(255, 0, 127, 0.15))',
                  border: '1px solid var(--neon-cyan)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-hud)',
                  fontWeight: 600
                }}
              >
                <Plus size={14} color="var(--neon-cyan)" />
                <span>START NEW CHAT</span>
              </button>

              {conversations.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', padding: '24px 10px' }}>
                  No previous sessions saved yet.
                </div>
              ) : (
                conversations.map((c) => {
                  const isActive = activeConvId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectConv(c.id)}
                      style={{
                        padding: '10px 12px',
                        marginBottom: '6px',
                        background: isActive ? 'rgba(0, 242, 254, 0.12)' : 'rgba(10, 18, 36, 0.6)',
                        border: `1px solid ${isActive ? 'var(--neon-cyan)' : 'var(--border-subtle)'}`,
                        borderLeft: `3px solid ${isActive ? 'var(--neon-cyan)' : 'transparent'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isActive ? 'var(--neon-cyan)' : 'var(--text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {c.title}
                        </div>
                        <div
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-dim)',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {c.last_snippet || 'Active conversation'}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteConv(c.id, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Delete chat session"
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--neon-pink)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* History Backdrop for Mobile */}
        {showHistory && (
          <div
            onClick={() => setShowHistory(false)}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              zIndex: 20
            }}
          />
        )}

        {/* Messages Scroll Feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {messages.map((m) => {
            const isUser = m.role === 'user';
            const isCopiedReply = copiedStatus.id === m.id && copiedStatus.type === 'reply';
            const isCopiedContent = copiedStatus.id === m.id && copiedStatus.type === 'content';

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  maxWidth: '92%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      background: m.isError ? 'rgba(255, 0, 127, 0.2)' : 'rgba(0, 242, 254, 0.15)',
                      border: `1px solid ${m.isError ? 'var(--neon-pink)' : 'var(--neon-cyan)'}`,
                      boxShadow: `0 0 10px ${m.isError ? 'var(--neon-pink)' : 'var(--neon-cyan)'}`,
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: m.isError ? 'var(--neon-pink)' : 'var(--neon-cyan)',
                      flexShrink: 0
                    }}
                  >
                    {m.isError ? <AlertCircle size={16} /> : <Bot size={16} />}
                  </div>
                )}

                <div
                  style={{
                    background: isUser ? 'rgba(255, 0, 127, 0.08)' : 'rgba(8, 16, 32, 0.88)',
                    border: `1px solid ${isUser ? 'rgba(255, 0, 127, 0.4)' : 'rgba(0, 242, 254, 0.25)'}`,
                    borderLeft: `3px solid ${isUser ? 'var(--neon-pink)' : 'var(--neon-cyan)'}`,
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                    padding: '12px 16px',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    position: 'relative',
                    wordBreak: 'break-word'
                  }}
                >
                  {/* Message Formatted Content (with syntax code blocks) */}
                  <div>{renderFormattedContent(m.content)}</div>

                  {/* Message Footer: Provider info, Copy Button & Voice Speak */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '10px',
                      paddingTop: '6px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: isUser ? '#fbcfe8' : 'var(--text-dim)',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}
                  >
                    <span>{m.provider ? `// ${m.provider.toUpperCase()}` : ''}</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ marginRight: '2px' }}>{m.timestamp}</span>

                      {/* 1. COPY CONTENT BUTTON: extracts pure code without fences, or clean text without chat filler */}
                      <button
                        onClick={() => handleCopyContent(m.id, m.content)}
                        style={{
                          background: isCopiedContent ? 'rgba(0, 255, 136, 0.25)' : 'rgba(0, 242, 254, 0.1)',
                          border: `1.5px solid ${isCopiedContent ? 'var(--neon-green)' : 'var(--neon-cyan)'}`,
                          color: isCopiedContent ? 'var(--neon-green)' : 'var(--neon-cyan)',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-hud)',
                          fontWeight: 700,
                          borderRadius: '2px',
                          transition: 'all 0.2s',
                          boxShadow: isCopiedContent ? '0 0 10px rgba(0, 255, 136, 0.4)' : 'none'
                        }}
                        title="Copy pure content: extracts only the raw code without markdown, or clean payload without chat intro/outro"
                      >
                        {isCopiedContent ? <Check size={11} color="var(--neon-green)" /> : <FileText size={11} />}
                        <span>{isCopiedContent ? 'CONTENT COPIED!' : 'COPY CONTENT'}</span>
                      </button>

                      {/* 2. COPY REPLY BUTTON: copies entire chat reply verbatim */}
                      <button
                        onClick={() => handleCopyReply(m.id, m.content)}
                        style={{
                          background: isCopiedReply ? 'rgba(0, 255, 136, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                          border: `1.5px solid ${isCopiedReply ? 'var(--neon-green)' : 'rgba(255, 255, 255, 0.2)'}`,
                          color: isCopiedReply ? 'var(--neon-green)' : 'var(--text-main)',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-hud)',
                          fontWeight: 700,
                          borderRadius: '2px',
                          transition: 'all 0.2s',
                          boxShadow: isCopiedReply ? '0 0 10px rgba(0, 255, 136, 0.4)' : 'none'
                        }}
                        title="Copy complete chat reply with full markdown, links, and conversational text"
                      >
                        {isCopiedReply ? <Check size={11} color="var(--neon-green)" /> : <Copy size={11} />}
                        <span>{isCopiedReply ? 'REPLY COPIED!' : 'COPY REPLY'}</span>
                      </button>

                      {/* REPLAY VOICE BUTTON */}
                      {!isUser && !m.isError && (
                        <button
                          onClick={() => {
                            cyberAudio.click();
                            speak(m.content);
                          }}
                          style={{
                            background: 'rgba(0, 242, 254, 0.08)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--neon-cyan)',
                            cursor: 'pointer',
                            padding: '3px 7px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10px',
                            borderRadius: '2px'
                          }}
                          title="Speak transmission in Female Voice"
                        >
                          <Volume2 size={12} />
                          <span>SPEAK</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isUser && (
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      background: 'rgba(255, 0, 127, 0.15)',
                      border: '1px solid var(--neon-pink)',
                      boxShadow: '0 0 10px var(--neon-pink)',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--neon-pink)',
                      flexShrink: 0
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  background: 'rgba(0, 242, 254, 0.15)',
                  border: '1px solid var(--neon-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--neon-cyan)'
                }}
              >
                <Bot size={16} />
              </div>
              <div
                style={{
                  background: 'rgba(8, 16, 32, 0.85)',
                  border: '1px solid var(--neon-cyan)',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={14} className="animate-spin" color="var(--neon-cyan)" />
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>
                  NEURAL EMOTIVE CORE INFERENCE...
                </span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Suggested Quick Prompts (Poetry, Code Writing, Open Actions, Emotions) */}
      {messages.length <= 2 && (
        <div
          style={{
            padding: '4px 16px 8px 16px',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              id={`chip-${idx}`}
              onClick={() => {
                cyberAudio.click();
                sendMessage(p);
              }}
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                padding: '5px 10px',
                background: 'rgba(0, 242, 254, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                e.currentTarget.style.color = 'var(--neon-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              ✨ {p}
            </button>
          ))}
        </div>
      )}

      {/* Cyberdeck Input Terminal - Touch Friendly on Mobile */}
      <div
        className="chat-input-bar"
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(3, 6, 13, 0.95)'
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {/* Cyber Microphone Toggle */}
          <button
            type="button"
            id="btn-voice-input"
            onClick={handleMicToggle}
            className={isListening ? 'cyber-mic-active' : 'btn-cyber-secondary'}
            style={{
              padding: '10px 12px',
              minWidth: '42px',
              minHeight: '42px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title={isListening ? 'Neural microphone listening... click to stop' : 'Speak with EL (Speech Recognition)'}
          >
            <Mic size={17} color={isListening ? '#fff' : 'var(--neon-pink)'} />
          </button>

          <div style={{ flex: 1, position: 'relative' }}>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? `Neural speech streaming (${activeLangObj.code})... speak now`
                  : 'Talk to EL, ask poetry, write code, opn utube/apps...'
              }
              style={{
                width: '100%',
                background: 'rgba(8, 16, 32, 0.95)',
                border: isListening ? '1.5px solid var(--neon-pink)' : '1px solid var(--border-subtle)',
                padding: '11px 14px',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-hud)',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxShadow: isListening ? '0 0 15px rgba(255, 0, 127, 0.3)' : 'none',
                minHeight: '42px'
              }}
              onFocus={(e) =>
                !isListening &&
                ((e.target.style.borderColor = 'var(--neon-cyan)'),
                (e.target.style.boxShadow = '0 0 12px rgba(0, 242, 254, 0.25)'))
              }
              onBlur={(e) =>
                !isListening && ((e.target.style.borderColor = 'var(--border-subtle)'), (e.target.style.boxShadow = 'none'))
              }
            />

            {isListening && (
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--neon-pink)',
                  fontWeight: 700
                }}
              >
                ● REC
              </span>
            )}
          </div>

          <button
            id="chat-submit-btn"
            type="submit"
            className="btn-cyber-primary"
            disabled={loading || !input.trim()}
            style={{
              padding: '10px 14px',
              minHeight: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Send size={15} /> <span className="hidden-on-mobile">TRANSMIT</span>
          </button>
        </form>
      </div>
    </div>
  );
}
