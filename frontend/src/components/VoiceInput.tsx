// DARTHANDER Visual Consciousness Engine
// Voice Input Component - LIVE PERFORMANCE MODE
// Continuous listening with real-time transcription

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  isActive: boolean;
  onToggle: () => void;
  onTranscription: (text: string) => void;
}

// Extend window for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onspeechstart?: (() => void) | null;
  onspeechend?: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function VoiceInput({ isActive, onToggle, onTranscription }: VoiceInputProps) {
  const [status, setStatus] = useState<'idle' | 'starting' | 'listening' | 'processing' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [interimText, setInterimText] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isStartingRef = useRef(false);
  const shouldRestartRef = useRef(false);

  // Refs for callbacks to avoid stale closures
  const onTranscriptionRef = useRef(onTranscription);
  onTranscriptionRef.current = onTranscription;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  // Request microphone permission
  const requestMicPermission = useCallback(async () => {
    try {
      console.log('[VOICE] Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      setHasMicPermission(true);
      console.log('[VOICE] Microphone permission granted');
      return true;
    } catch (err) {
      console.error('[VOICE] Microphone permission denied:', err);
      setHasMicPermission(false);
      setErrorMsg('Mic access denied');
      setStatus('error');
      return false;
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.error('[VOICE] Speech recognition not supported');
      setIsSupported(false);
      return;
    }

    console.log('[VOICE] Initializing speech recognition...');
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('[VOICE] >>> RECOGNITION STARTED <<<');
      isStartingRef.current = false;
      setStatus('listening');
      setErrorMsg('');
    };

    recognition.onspeechstart = () => {
      console.log('[VOICE] Speech detected!');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
          console.log('[VOICE] Final transcript:', transcript);
        } else {
          interimTranscript += transcript;
        }
      }

      // Update interim display
      if (interimTranscript) {
        setInterimText(interimTranscript);
      }

      // Send final transcript to handler
      if (finalTranscript.trim()) {
        console.log('[VOICE] >>> SENDING TO HANDLER:', finalTranscript.trim());
        setStatus('processing');
        onTranscriptionRef.current(finalTranscript.trim());
        setInterimText('');

        // Return to listening state
        setTimeout(() => {
          if (isActiveRef.current) {
            setStatus('listening');
          }
        }, 300);
      }
    };

    recognition.onerror = (event: any) => {
      const error = event.error;
      console.log('[VOICE] Error event:', error);
      isStartingRef.current = false;

      // Handle different error types
      switch (error) {
        case 'no-speech':
          // No speech detected - this is normal, just restart
          console.log('[VOICE] No speech detected, will restart...');
          shouldRestartRef.current = true;
          return;

        case 'aborted':
          // User or system aborted - don't show error
          console.log('[VOICE] Recognition aborted');
          return;

        case 'not-allowed':
          setErrorMsg('Mic blocked');
          setHasMicPermission(false);
          setStatus('error');
          onToggle();
          return;

        case 'network':
          setErrorMsg('Network error');
          setStatus('error');
          shouldRestartRef.current = true;
          return;

        default:
          console.error('[VOICE] Recognition error:', error);
          setErrorMsg(error);
          setStatus('error');
      }
    };

    recognition.onend = () => {
      console.log('[VOICE] Recognition ended, isActive:', isActiveRef.current, 'shouldRestart:', shouldRestartRef.current);
      isStartingRef.current = false;

      // Auto-restart if still active
      if (isActiveRef.current && (shouldRestartRef.current || status === 'listening')) {
        shouldRestartRef.current = false;
        console.log('[VOICE] Auto-restarting in 200ms...');
        setTimeout(() => {
          if (isActiveRef.current && !isStartingRef.current) {
            try {
              isStartingRef.current = true;
              recognition.start();
            } catch (e) {
              console.log('[VOICE] Restart failed:', e);
              isStartingRef.current = false;
            }
          }
        }, 200);
      } else {
        setStatus('idle');
        setInterimText('');
      }
    };

    recognitionRef.current = recognition;
    console.log('[VOICE] Speech recognition initialized');

    return () => {
      console.log('[VOICE] Cleaning up...');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  // Start/stop based on isActive prop
  useEffect(() => {
    if (!isSupported || !recognitionRef.current) return;

    const startRecognition = async () => {
      // First check/request mic permission
      if (hasMicPermission === null || hasMicPermission === false) {
        const granted = await requestMicPermission();
        if (!granted) return;
      }

      if (isStartingRef.current) {
        console.log('[VOICE] Already starting, skipping...');
        return;
      }

      try {
        console.log('[VOICE] Starting recognition...');
        isStartingRef.current = true;
        shouldRestartRef.current = true;
        setStatus('starting');
        recognitionRef.current?.start();
      } catch (error: any) {
        console.error('[VOICE] Start failed:', error);
        isStartingRef.current = false;

        // If already running, that's fine
        if (error.message?.includes('already started')) {
          setStatus('listening');
          return;
        }

        setErrorMsg('Start failed');
        setStatus('error');
        onToggle();
      }
    };

    const stopRecognition = () => {
      console.log('[VOICE] Stopping recognition...');
      shouldRestartRef.current = false;
      isStartingRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // Ignore
      }
      setStatus('idle');
      setInterimText('');
    };

    if (isActive) {
      startRecognition();
    } else {
      stopRecognition();
    }
  }, [isActive, isSupported, hasMicPermission, requestMicPermission, onToggle]);

  // Not supported
  if (!isSupported) {
    return (
      <button
        disabled
        title="Speech recognition not supported in this browser"
        className="p-2.5 rounded-full bg-red-500/20 text-red-400 cursor-not-allowed flex items-center gap-2"
      >
        <AlertCircle className="w-4 h-4" />
        <span className="text-[10px] font-bold">NO SPEECH API</span>
      </button>
    );
  }

  // Get status display
  const getStatusDisplay = () => {
    switch (status) {
      case 'starting':
        return <span className="text-[10px] text-yellow-400 animate-pulse font-bold">STARTING...</span>;
      case 'listening':
        return interimText
          ? <span className="text-[10px] text-cyan-400 font-bold max-w-[200px] truncate">"{interimText}"</span>
          : <span className="text-[10px] text-green-400 animate-pulse font-bold">LISTENING...</span>;
      case 'processing':
        return <span className="text-[10px] text-purple-400 font-bold">PROCESSING...</span>;
      case 'error':
        return <span className="text-[10px] text-red-400 font-bold">{errorMsg || 'ERROR'}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Main mic button */}
      <button
        onClick={onToggle}
        title={isActive ? 'Click to stop voice input' : 'Click to start voice input (M)'}
        className={`
          relative p-2.5 rounded-full transition-all duration-300
          ${isActive
            ? status === 'error'
              ? 'bg-red-500/30 text-red-400 border border-red-500/50'
              : 'bg-green-500/20 text-green-400 border border-green-500/50'
            : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20 border border-transparent'}
        `}
      >
        {/* Pulse animation when listening */}
        {isActive && status === 'listening' && (
          <span className="absolute inset-0 rounded-full animate-ping bg-green-500/30" />
        )}

        <span className="relative">
          {status === 'starting' ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : status === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : isActive ? (
            <Mic className="w-4 h-4" />
          ) : (
            <MicOff className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* Status text */}
      {isActive && getStatusDisplay()}

      {/* Permission denied hint */}
      {hasMicPermission === false && !isActive && (
        <span className="text-[10px] text-red-400 font-bold">ALLOW MIC</span>
      )}
    </div>
  );
}
