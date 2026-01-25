// DARTHANDER Visual Consciousness Engine
// Audio Source Selector Component (Client-side)

import { useRef, useState, useEffect } from 'react';
import { Radio, Upload, Play, Pause, Square } from 'lucide-react';
import { useStore } from '../store';

export function AudioSourceSelector() {
  const { audioSource, setAudioSource, setAudioState } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceCreatedRef = useRef(false);
  const animationRef = useRef<number | null>(null);

  // Audio analysis loop
  const analyzeAudio = () => {
    if (!analyserRef.current || !isPlaying) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const subBass = avg(dataArray, 0, 4) / 255;
    const bass = avg(dataArray, 4, 12) / 255;
    const lowMid = avg(dataArray, 12, 24) / 255;
    const mid = avg(dataArray, 24, 48) / 255;
    const highMid = avg(dataArray, 48, 96) / 255;
    const presence = avg(dataArray, 96, 128) / 255;
    const brilliance = avg(dataArray, 128, 256) / 255;
    const overall = avg(dataArray, 0, dataArray.length) / 255;
    const peak = Math.max(...Array.from(dataArray)) / 255;

    setAudioState({
      subBass, bass, lowMid, mid, highMid, presence, brilliance,
      overallAmplitude: overall,
      peakAmplitude: peak,
      detectedBpm: 0,
      beatIntensity: bass > 0.6 ? 1 : bass,
      spectralCentroid: (highMid + presence) / 2,
      spectralFlux: Math.abs(overall - peak),
    });

    animationRef.current = requestAnimationFrame(analyzeAudio);
  };

  // Start analysis when playing changes
  useEffect(() => {
    if (isPlaying) {
      analyzeAudio();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Stop current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);

    // Revoke old URL
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    // Create new URL and update state
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setFileName(file.name);
    setAudioSource('upload');
    sourceCreatedRef.current = false; // Reset for new audio
  };

  const setupAudioContext = () => {
    const audio = audioRef.current;
    if (!audio || sourceCreatedRef.current) return;

    // Create AudioContext on first play (user gesture required)
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    // Create source and analyser
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    source.connect(analyser);
    analyser.connect(ctx.destination);
    sourceCreatedRef.current = true;
  };

  const handlePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    try {
      // Resume AudioContext if suspended
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Setup audio nodes on first play
      setupAudioContext();

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Play failed:', err);
    }
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleLive = async () => {
    handleStop();
    setAudioSource('live');
    setFileName(null);
    setAudioUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      setIsPlaying(true);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          preload="auto"
        />
      )}

      {/* LIVE button */}
      <button
        onClick={handleLive}
        className={`px-2.5 py-1.5 text-[10px] rounded-lg flex items-center gap-1.5 transition-all
          ${audioSource === 'live' && isPlaying
            ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40 shadow-glow-purple'
            : 'glass-button text-neon-purple/50 hover:text-neon-purple'}`}
      >
        <Radio className="w-3 h-3" />
        LIVE
      </button>

      {/* FILE button */}
      <button
        onClick={handleFileClick}
        className={`px-2.5 py-1.5 text-[10px] rounded-lg flex items-center gap-1.5 transition-all
          ${audioSource === 'upload'
            ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 shadow-glow-cyan'
            : 'glass-button text-neon-purple/50 hover:text-neon-cyan'}`}
      >
        <Upload className="w-3 h-3" />
        FILE
      </button>

      {/* Playback controls - show when file is selected */}
      {audioSource === 'upload' && audioUrl && (
        <>
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="px-2.5 py-1.5 text-[10px] rounded-lg flex items-center gap-1.5
                bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40
                hover:shadow-glow-magenta transition-all"
            >
              <Play className="w-3 h-3" />
              PLAY
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="px-2.5 py-1.5 text-[10px] rounded-lg flex items-center gap-1.5
                  bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40
                  shadow-glow-magenta transition-all"
              >
                <Pause className="w-3 h-3" />
                PAUSE
              </button>
              <button
                onClick={handleStop}
                className="px-2 py-1.5 text-[10px] rounded-lg glass-button text-neon-red/60 hover:text-neon-red transition-all"
              >
                <Square className="w-3 h-3" />
              </button>
            </>
          )}
          <span className="text-[9px] text-neon-cyan/60 truncate max-w-[80px]" title={fileName || ''}>
            {fileName}
          </span>
        </>
      )}
    </div>
  );
}

function avg(arr: Uint8Array, start: number, end: number): number {
  let sum = 0;
  const e = Math.min(end, arr.length);
  for (let i = start; i < e; i++) sum += arr[i];
  return sum / (e - start);
}
