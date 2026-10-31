import { useState, useEffect, useRef, useCallback } from 'react';

// Worldwide languages supported for Speech Recognition & Voice Synthesis
export const WORLD_LANGUAGES = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-IN', label: 'English (India)', flag: '🇮🇳' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'es-ES', label: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'Français (French)', flag: '🇫🇷' },
  { code: 'de-DE', label: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'zh-CN', label: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ja-JP', label: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ru-RU', label: 'Русский (Russian)', flag: '🇷🇺' },
  { code: 'ar-SA', label: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'pt-BR', label: 'Português (Portuguese)', flag: '🇧🇷' },
  { code: 'it-IT', label: 'Italiano (Italian)', flag: '🇮🇹' },
  { code: 'ko-KR', label: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'tr-TR', label: 'Türkçe (Turkish)', flag: '🇹🇷' },
  { code: 'bn-IN', label: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'ur-PK', label: 'اردو (Urdu)', flag: '🇵🇰' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)', flag: '🇮🇳' }
];

// Female voice keywords across major OS engines (Windows, Edge, Chrome, Android, Apple)
const FEMALE_HINTS = [
  'zira', 'jenny', 'aria', 'samantha', 'victoria', 'karen', 'susan', 'hazel',
  'catherine', 'linda', 'eva', 'serena', 'female', 'ava', 'allison', 'amy',
  'michelle', 'stephanie', 'emily', 'helena', 'natasha', 'sonia', 'neerja',
  'heera', 'priya', 'swara', 'kalpana', 'clara', 'alice', 'veena', 'fiona',
  'moira', 'tessa', 'siri', 'laura', 'hortense', 'julie', 'hedda', 'katja',
  'haruka', 'ayumi', 'huihui', 'yaoyao', 'xiaoxiao', 'irina', 'dariya',
  'hoda', 'fatima', 'maria', 'francisca', 'elsa', 'sunhi', 'filiz'
];

const MALE_HINTS = [
  'david', 'guy', 'mark', 'george', 'james', 'richard', 'male', 'ravi',
  'stefan', 'daniel', 'oliver', 'thomas', 'alex', 'fred', 'bruce', 'ralph',
  'hemant', 'pavel', 'naayf', 'alvaro', 'paul'
];

export function isVoiceFemale(voice) {
  if (!voice) return false;
  const name = (voice.name || '').toLowerCase();
  if (FEMALE_HINTS.some((h) => name.includes(h))) return true;
  if (MALE_HINTS.some((h) => name.includes(h))) return false;
  if (voice.gender === 'female') return true;
  return false;
}

export function useVoice() {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('el_preferred_language') || 'en-US';
  });
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [femaleVoices, setFemaleVoices] = useState([]);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition with selected language
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API is not supported in this browser.');
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedLanguage]);

  // Pick the best female voice matching the language code
  const pickBestFemaleVoice = useCallback((voices, langCode) => {
    if (!voices || voices.length === 0) return null;

    const langPrefix = langCode.split('-')[0].toLowerCase();

    // 1. Exact language match + Female
    let match = voices.find(
      (v) =>
        v.lang.toLowerCase().replace('_', '-') === langCode.toLowerCase() &&
        isVoiceFemale(v)
    );

    // 2. Language prefix match (e.g. 'hi', 'es', 'fr', 'zh') + Female
    if (!match) {
      match = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langPrefix) &&
          isVoiceFemale(v)
      );
    }

    // 3. Language prefix match (any gender)
    if (!match) {
      match = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    }

    // 4. Default high-quality English female voice
    if (!match) {
      match = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('en') &&
          isVoiceFemale(v) &&
          (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Zira') || v.name.includes('Jenny'))
      );
    }

    // 5. Any female voice
    if (!match) {
      match = voices.find(isVoiceFemale);
    }

    // 6. First available
    return match || voices[0];
  }, []);

  // Initialize Speech Synthesis & Load Voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      setAvailableVoices(voices);

      const fVoices = voices.filter(isVoiceFemale);
      setFemaleVoices(fVoices);

      // Check if user previously saved a custom voice
      const savedVoiceName = localStorage.getItem('el_preferred_voice');
      if (savedVoiceName) {
        const foundSaved = voices.find((v) => v.name === savedVoiceName);
        if (foundSaved) {
          setSelectedVoice(foundSaved);
          return;
        }
      }

      // Default to female voice matching selected language
      const best = pickBestFemaleVoice(voices, selectedLanguage);
      if (best) {
        setSelectedVoice(best);
        localStorage.setItem('el_preferred_voice', best.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedLanguage, pickBestFemaleVoice]);

  // Language change handler
  const setLanguage = useCallback((langCode) => {
    setSelectedLanguage(langCode);
    localStorage.setItem('el_preferred_language', langCode);

    if (availableVoices.length > 0) {
      const best = pickBestFemaleVoice(availableVoices, langCode);
      if (best) {
        setSelectedVoice(best);
        localStorage.setItem('el_preferred_voice', best.name);
      }
    }
  }, [availableVoices, pickBestFemaleVoice]);

  const selectVoiceByName = useCallback(
    (voiceName) => {
      const match = availableVoices.find((v) => v.name === voiceName);
      if (match) {
        setSelectedVoice(match);
        localStorage.setItem('el_preferred_voice', match.name);
      }
    },
    [availableVoices]
  );

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    setTranscript('');
    try {
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.start();
    } catch (e) {
      console.error('Recognition start error:', e);
    }
  }, [selectedLanguage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Recognition stop error:', e);
      }
    }
  }, []);

  // Clean markdown for pleasant speech synthesis
  const cleanMarkdownForSpeech = (text) => {
    if (!text) return '';
    return text
      .replace(/```[\s\S]*?```/g, ' [code snippet omitted] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_~#]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/[^\p{L}\p{N}\s.,!?'"-\/]/gu, '') // Keep letters/numbers in all worldwide scripts, strip symbols/emojis
      .trim();
  };

  const speak = useCallback(
    (text) => {
      if (!('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();

      const cleaned = cleanMarkdownForSpeech(text);
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang || selectedLanguage;
      } else {
        utterance.lang = selectedLanguage;
      }

      const isFem = isVoiceFemale(selectedVoice);
      utterance.rate = 1.0;
      utterance.pitch = isFem ? 1.05 : 1.15;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, selectedLanguage]
  );

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak((prev) => {
      if (prev && isSpeaking) {
        stopSpeaking();
      }
      return !prev;
    });
  }, [isSpeaking, stopSpeaking]);

  return {
    selectedLanguage,
    setLanguage,
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    isSpeaking,
    speak,
    stopSpeaking,
    autoSpeak,
    toggleAutoSpeak,
    voiceSupported,
    availableVoices,
    femaleVoices,
    selectedVoice,
    setSelectedVoice,
    selectVoiceByName,
    isVoiceFemale
  };
}
