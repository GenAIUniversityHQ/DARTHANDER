// DARTHANDER Visual Consciousness Engine
// Voice Input Component

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface VoiceInputProps {
  isActive: boolean;
  onToggle: () => void;
  onTranscription: (text: string) => void;
}

export function VoiceInput({ isActive, onToggle, onTranscription }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isActive && !isRecording) {
      startRecording();
    } else if (!isActive && isRecording) {
      stopRecording();
    }
  }, [isActive]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 10000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onToggle(); // Turn off if failed
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${API_URL}/api/prompt/voice`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.transcription) {
        onTranscription(data.transcription);
      }
    } catch (error) {
      console.error('Voice processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={onToggle}
      disabled={isProcessing}
      className={`
        p-3 rounded-full transition-all
        ${isActive 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}
        ${isProcessing ? 'opacity-50' : ''}
      `}
    >
      {isProcessing ? (
        <Loader className="w-5 h-5 animate-spin" />
      ) : isActive ? (
        <Mic className="w-5 h-5" />
      ) : (
        <MicOff className="w-5 h-5" />
      )}
    </button>
  );
}
