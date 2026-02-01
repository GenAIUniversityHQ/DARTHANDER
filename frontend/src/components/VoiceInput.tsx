// DARTHANDER Visual Consciousness Engine
// Voice Input Component - Real-time speech recognition using Web Speech API

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

// Web Speech API type declarations
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

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface VoiceInputProps {
  isActive: boolean;
  onToggle: () => void;
  onTranscription: (text: string) => void;
}

export function VoiceInput({ isActive, onToggle, onTranscription }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // CRITICAL: Use refs for callbacks to avoid stale closure issues
  // The speech recognition event handlers capture closure values when created,
  // so we use refs that always point to the latest callback functions
  const isActiveRef = useRef(isActive);
  const onToggleRef = useRef(onToggle);
  const onTranscriptionRef = useRef(onTranscription);

  // Keep refs in sync with props
  useEffect(() => {
    isActiveRef.current = isActive;
    onToggleRef.current = onToggle;
    onTranscriptionRef.current = onTranscription;
  }, [isActive, onToggle, onTranscription]);

  // Initialize speech recognition
  // IMPORTANT: Uses refs for callbacks to avoid stale closures
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      // Show interim results
      if (interim) {
        setInterimText(interim);
      }

      // Send final results to be processed
      // CRITICAL: Use ref to get latest callback to avoid stale closure
      if (final.trim()) {
        console.log('🎤 Final transcription:', final.trim());
        setInterimText('');
        // Use ref to always call the latest callback
        onTranscriptionRef.current(final.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'not-allowed') {
        setError('Microphone access denied');
        // Use ref to get latest toggle callback
        onToggleRef.current();
      } else if (event.error === 'no-speech') {
        // This is normal, just restart if still active
        console.log('No speech detected, continuing...');
      } else if (event.error === 'network') {
        setError('Network error - check connection');
      } else if (event.error === 'aborted') {
        // Recognition was aborted, this is normal when stopping
        console.log('Recognition aborted');
      } else {
        setError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      setIsListening(false);

      // Auto-restart if still active (continuous listening)
      // CRITICAL: Use ref to get latest isActive value
      if (isActiveRef.current && recognitionRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.log('Could not restart recognition');
          }
        }, 100);
      }
    };

    return recognition;
  }, []); // Empty deps - handlers use refs for latest values

  // Start/stop based on isActive
  useEffect(() => {
    if (isActive) {
      // Start listening - always create fresh recognition for reliable operation
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
        recognitionRef.current = null;
      }

      // Create new recognition instance
      recognitionRef.current = initRecognition();

      if (recognitionRef.current) {
        try {
          console.log('🎤 Starting speech recognition...');
          recognitionRef.current.start();
        } catch (e) {
          console.error('Failed to start recognition:', e);
        }
      }
    } else {
      // Stop listening
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Already stopped, that's ok
        }
        recognitionRef.current = null;
      }
      setInterimText('');
      setIsListening(false);
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [isActive, initRecognition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        className={`
          p-3 rounded-full transition-all relative
          ${isActive
            ? 'bg-red-500 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}
          ${isListening ? 'animate-pulse' : ''}
        `}
        title={isActive ? 'Stop listening' : 'Start voice input'}
      >
        {isActive ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}

        {/* Listening indicator */}
        {isListening && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
        )}
      </button>

      {/* Show interim text while speaking */}
      {interimText && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/80 rounded-lg max-w-xs">
          <Loader className="w-3 h-3 animate-spin text-zinc-500" />
          <span className="text-xs text-zinc-400 italic truncate">{interimText}</span>
        </div>
      )}

      {/* Show error if any */}
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}
