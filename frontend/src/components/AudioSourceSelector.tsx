// DARTHANDER Visual Consciousness Engine
// Audio Source Selector Component (Client-side)

import { useRef, useState } from 'react';
import { Radio, Upload, Play, Pause, Volume2 } from 'lucide-react';
import { useStore } from '../store';

export function AudioSourceSelector() {
  const { audioSource, setAudioSource, setAudioState } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setAudioSource('upload');

    // Create audio element
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }

    const audio = new Audio(URL.createObjectURL(file));
    audioRef.current = audio;

    // Set up Web Audio API for analysis
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    source.connect(analyser);
    analyser.connect(ctx.destination);

    audio.onended = () => {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Map frequency bands to audio state
    const subBass = average(dataArray, 0, 4) / 255;
    const bass = average(dataArray, 4, 12) / 255;
    const lowMid = average(dataArray, 12, 24) / 255;
    const mid = average(dataArray, 24, 48) / 255;
    const highMid = average(dataArray, 48, 96) / 255;
    const presence = average(dataArray, 96, 128) / 255;
    const brilliance = average(dataArray, 128, 256) / 255;
    const overall = average(dataArray, 0, bufferLength) / 255;
    const peak = Math.max(...Array.from(dataArray)) / 255;

    setAudioState({
      subBass,
      bass,
      lowMid,
      mid,
      highMid,
      presence,
      brilliance,
      overallAmplitude: overall,
      peakAmplitude: peak,
      detectedBpm: 0,
      beatIntensity: bass > 0.6 ? 1 : bass,
      spectralCentroid: (highMid + presence) / 2,
      spectralFlux: Math.abs(overall - peak),
    });

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      analyzeAudio();
    }
  };

  const handleLiveMode = async () => {
    setAudioSource('live');
    setFileName(null);

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Request microphone access for live audio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      source.connect(analyser);
      // Don't connect to destination (would cause feedback)

      setIsPlaying(true);
      analyzeAudio();
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Live Mic Button */}
      <button
        onClick={handleLiveMode}
        className={`
          px-2.5 py-1.5 text-[10px] rounded-lg flex items-center gap-1.5 transition-all duration-200
          ${audioSource === 'live'
            ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40 shadow-glow-purple'
            : 'glass-button text-neon-purple/50 hover:text-neon-purple'}
        `}
      >
        <Radio className="w-3 h-3" />
        LIVE
      </button>

      {/* File Upload Button */}
      <button
        onClick={handleFileSelect}
        className={`
          px-2.5 py-1.5 text-[10px] rounded-lg flex items-center gap-1.5 transition-all duration-200
          ${audioSource === 'upload'
            ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 shadow-glow-cyan'
            : 'glass-button text-neon-purple/50 hover:text-neon-cyan'}
        `}
      >
        <Upload className="w-3 h-3" />
        FILE
      </button>

      {/* Play/Pause when file is loaded */}
      {audioSource === 'upload' && fileName && (
        <>
          <button
            onClick={togglePlayback}
            className={`
              px-2.5 py-1.5 text-[10px] rounded-lg flex items-center gap-1.5 transition-all duration-200
              ${isPlaying
                ? 'bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40'
                : 'glass-button text-neon-purple/50 hover:text-neon-magenta'}
            `}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
          <span className="text-[9px] text-neon-purple/40 truncate max-w-[80px]" title={fileName}>
            <Volume2 className="w-3 h-3 inline mr-1" />
            {fileName}
          </span>
        </>
      )}
    </div>
  );
}

// Helper to calculate average of array slice
function average(arr: Uint8Array, start: number, end: number): number {
  let sum = 0;
  const actualEnd = Math.min(end, arr.length);
  for (let i = start; i < actualEnd; i++) {
    sum += arr[i];
  }
  return sum / (actualEnd - start);
}
