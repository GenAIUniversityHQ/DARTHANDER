// DARTHANDER Visual Consciousness Engine
// Voice Input Component - Real-time Speech Recognition with Gemini

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

interface VoiceInputProps {
  isActive: boolean;
  onToggle: () => void;
  onTranscription: (text: string) => void;
}

// Web Speech API types
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
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function VoiceInput({ isActive, onToggle, onTranscription }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // CRITICAL: Refs to avoid stale closure issues in event handlers
  // Event handlers capture values at creation time - refs always have current values
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
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('🎤 Voice recognition started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      // Show interim results for visual feedback
      setInterimTranscript(interim);

      // Process final results immediately
      if (finalTranscript.trim()) {
        console.log('🎤 Final transcript:', finalTranscript);
        setIsProcessing(true);
        setInterimTranscript('');

        // Send to parent for Gemini processing - USE REF for current callback
        onTranscriptionRef.current(finalTranscript.trim());

        // Brief delay to show processing state
        setTimeout(() => setIsProcessing(false), 500);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'not-allowed') {
        setError('Microphone access denied');
        onToggleRef.current(); // USE REF for current callback
      } else if (event.error === 'no-speech') {
        // No speech detected, will auto-restart
        setError(null);
      } else if (event.error === 'network') {
        setError('Network error - check connection');
      } else {
        setError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Voice recognition ended');

      // Auto-restart if still active - USE REF for current isActive value
      if (isActiveRef.current && recognitionRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.log('Restart failed, will retry');
          }
        }, 100);
      }
    };

    return recognition;
  }, []); // Empty deps - handlers use refs for current values

  // Start/stop based on isActive prop
  useEffect(() => {
    if (isActive) {
      // Start recognition
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }

      if (recognitionRef.current && !isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started, ignore
        }
      }
    } else {
      // Stop recognition
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Already stopped, ignore
        }
      }

      setIsListening(false);
      setInterimTranscript('');
      setError(null);
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
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        disabled={isProcessing}
        className={`
          p-3 rounded-full transition-all relative
          ${isActive
            ? 'bg-red-500 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}
          ${isProcessing ? 'opacity-50' : ''}
        `}
        title={isActive ? 'Stop voice input' : 'Start voice input (speak prompts)'}
      >
        {isProcessing ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : isActive ? (
          <>
            <Mic className="w-5 h-5" />
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </>
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </button>

      {/* Show interim transcript or status */}
      {isActive && (
        <div className="text-xs max-w-[200px]">
          {error ? (
            <span className="text-red-400">{error}</span>
          ) : interimTranscript ? (
            <span className="text-yellow-400 italic">"{interimTranscript}"</span>
          ) : isListening ? (
            <span className="text-green-400">Listening...</span>
          ) : (
            <span className="text-zinc-500">Starting...</span>
          )}
        </div>
      )}
    </div>
  );
}
