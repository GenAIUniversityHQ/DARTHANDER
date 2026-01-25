// DARTHANDER Visual Consciousness Engine
// Voice Input Component (Client-side Web Speech API)

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setIsProcessing(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      if (result.isFinal) {
        const transcript = result[0].transcript;
        onTranscription(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
      setIsRecording(false);
      setIsProcessing(false);
      onToggle();
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (isActive) {
        onToggle();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

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
    }
  }, [isActive, isSupported]);

  if (!isSupported) {
    return (
      <button
        disabled
        title="Speech recognition not supported in this browser"
        className="p-3.5 rounded-full glass-button text-neon-purple/30 cursor-not-allowed"
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      disabled={isProcessing && !isRecording}
      title={isActive ? 'Click to stop' : 'Click to speak'}
      className={`
        relative p-3.5 rounded-full transition-all duration-300
        ${isActive
          ? 'bg-neon-red/20 text-neon-red border border-neon-red/50 shadow-glow-red'
          : 'glass-button text-neon-purple/60 hover:text-neon-magenta hover:shadow-glow-magenta'}
        ${isProcessing && !isRecording ? 'opacity-50' : ''}
      `}
    >
      {/* Pulse ring when active */}
      {isActive && (
        <span className="absolute inset-0 rounded-full animate-ping bg-neon-red/30" />
      )}
      <span className="relative">
        {isProcessing && !isRecording ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : isActive ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </span>
    </button>
  );
}
