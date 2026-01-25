// DARTHANDER Visual Consciousness Engine
// Voice Input Component - LIVE PERFORMANCE MODE
// Continuous listening with auto-detect when you stop speaking

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader, Radio } from 'lucide-react';

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
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function VoiceInput({ isActive, onToggle, onTranscription }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [liveMode, setLiveMode] = useState(false); // Continuous listening mode

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());

  // CRITICAL: Use refs to avoid stale closure - always get latest values
  const onTranscriptionRef = useRef(onTranscription);
  onTranscriptionRef.current = onTranscription;

  const liveModeRef = useRef(liveMode);
  liveModeRef.current = liveMode;

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show words as you speak
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('[VOICE] Recognition started - LISTENING');
      setIsRecording(true);
      setIsProcessing(false);
      lastSpeechTimeRef.current = Date.now();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      lastSpeechTimeRef.current = Date.now();

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Show interim text (what you're currently saying)
      setInterimText(interimTranscript);

      // When a phrase is finalized, submit it
      if (finalTranscript) {
        console.log('[VOICE] Sending transcription:', finalTranscript.trim());
        onTranscriptionRef.current(finalTranscript.trim());
        setInterimText('');

        // In live mode, restart listening (use ref to avoid stale closure!)
        if (liveModeRef.current) {
          // Brief pause before accepting next command
          setTimeout(() => {
            lastSpeechTimeRef.current = Date.now();
          }, 500);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.log('[VOICE] Error:', event.error);

      // Ignore no-speech errors - just keep listening
      if (event.error === 'no-speech') {
        console.log('[VOICE] No speech detected, continuing to listen...');
        // Auto-restart after no-speech
        try {
          setTimeout(() => {
            if (isActiveRef.current) {
              recognition.start();
            }
          }, 100);
        } catch (e) {
          // Ignore
        }
        return;
      }

      // Ignore aborted errors (happens when stopping)
      if (event.error === 'aborted') {
        return;
      }

      console.error('[VOICE] Speech recognition error:', event.error);
      setIsRecording(false);
      setIsProcessing(false);
      if (!liveModeRef.current) {
        onToggle();
      }
    };

    recognition.onend = () => {
      console.log('[VOICE] Recognition ended');
      setIsRecording(false);
      setInterimText('');

      // Auto-restart recognition when active (keep listening until user turns it off)
      if (isActiveRef.current) {
        console.log('[VOICE] Auto-restarting recognition...');
        try {
          setTimeout(() => {
            if (isActiveRef.current) {
              recognition.start();
            }
          }, 100);
        } catch (e) {
          console.log('[VOICE] Restart error:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
    };
  }, []); // No dependencies - use refs for current values

  // Handle active state changes
  useEffect(() => {
    if (!isSupported) return;

    if (isActive && !isRecording) {
      try {
        setIsProcessing(true);
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setIsProcessing(false);
        onToggle();
      }
    } else if (!isActive && isRecording) {
      recognitionRef.current?.stop();
      setLiveMode(false);
    }
  }, [isActive, isSupported]);

  // Toggle live mode
  const toggleLiveMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      setLiveMode(!liveMode);
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        title="Speech recognition not supported"
        className="p-2.5 rounded-full bg-white/5 text-white/30 cursor-not-allowed"
      >
        <MicOff className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {/* Main mic button */}
      <button
        onClick={onToggle}
        disabled={isProcessing && !isRecording}
        title={isActive ? 'Click to stop' : 'Click to speak (M)'}
        className={`
          relative p-2.5 rounded-full transition-all duration-300
          ${isActive
            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
            : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'}
          ${isProcessing && !isRecording ? 'opacity-50' : ''}
        `}
      >
        {isActive && (
          <span className="absolute inset-0 rounded-full animate-ping bg-red-500/30" />
        )}
        <span className="relative">
          {isProcessing && !isRecording ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : isActive ? (
            <Mic className="w-4 h-4" />
          ) : (
            <MicOff className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* Live mode toggle - continuous listening for performance */}
      {isActive && (
        <button
          onClick={toggleLiveMode}
          title={liveMode ? 'Live mode ON - continuous listening' : 'Enable live mode for performance'}
          className={`
            p-2 rounded-full transition-all text-[10px] font-bold
            ${liveMode
              ? 'bg-green-500/20 text-green-400 border border-green-500/50 animate-pulse'
              : 'bg-white/10 text-white/40 hover:text-white'}
          `}
        >
          <Radio className="w-3 h-3" />
        </button>
      )}

      {/* Status indicator */}
      {isActive && !interimText && isRecording && (
        <span className="text-[10px] text-green-400 animate-pulse font-bold">
          LISTENING...
        </span>
      )}

      {/* Show what you're saying */}
      {interimText && (
        <span className="text-[10px] text-cyan-400 animate-pulse max-w-[150px] truncate font-bold">
          "{interimText}"
        </span>
      )}
    </div>
  );
}
