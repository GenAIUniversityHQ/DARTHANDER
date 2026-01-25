// DARTHANDER Visual Consciousness Engine
// Audio Source Selector Component (Client-side)

import { useRef, useState, useEffect } from 'react';
import { Radio, Upload, Play, Pause, Square } from 'lucide-react';
import { useStore } from '../store';

export function AudioSourceSelector() {
  const { audioSource, setAudioSource, setAudioState, setAudioStream } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const sourceCreatedRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

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

  // Clear audio stream when not playing
  useEffect(() => {
    if (!isPlaying) {
      setAudioStream(null);
    }
  }, [isPlaying, setAudioStream]);

  // Format time as MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle seeking via progress bar click/drag
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percent * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeekStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    handleSeek(e);
  };

  const handleSeekMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSeeking) {
      handleSeek(e);
    }
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  // Update time display
  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      console.log('[AUDIO] Metadata loaded, duration:', audioRef.current.duration);
      setDuration(audioRef.current.duration);
      setCurrentTime(0);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('[AUDIO] File selected:', file?.name);
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
    console.log('[AUDIO] Created blob URL:', url);
    setAudioUrl(url);
    setFileName(file.name);
    setAudioSource('upload');
    setDuration(0); // Reset duration for new file
    setCurrentTime(0); // Reset time for new file
    sourceCreatedRef.current = false; // Reset for new audio
    console.log('[AUDIO] State updated, sourceCreatedRef reset to false');
  };

  const setupAudioContext = () => {
    const audio = audioRef.current;
    console.log('[AUDIO] setupAudioContext called, audio:', audio, 'sourceCreated:', sourceCreatedRef.current);
    if (!audio || sourceCreatedRef.current) {
      console.log('[AUDIO] Skipping setup - audio missing or source already created');
      return;
    }

    try {
      // Create AudioContext on first play (user gesture required)
      if (!audioContextRef.current) {
        console.log('[AUDIO] Creating new AudioContext');
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      console.log('[AUDIO] AudioContext state:', ctx.state);

      // Create source, analyser, and destination for recording
      console.log('[AUDIO] Creating MediaElementSource...');
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Create a destination node for capturing audio stream
      const destination = ctx.createMediaStreamDestination();
      destinationRef.current = destination;

      // Connect: source -> analyser -> destination (for recording)
      //          analyser -> speakers (for playback)
      source.connect(analyser);
      analyser.connect(ctx.destination); // Play through speakers
      analyser.connect(destination); // Capture for recording
      console.log('[AUDIO] Audio nodes connected successfully');

      // Store the audio stream for recording
      setAudioStream(destination.stream);

      sourceCreatedRef.current = true;
    } catch (err) {
      console.error('[AUDIO] setupAudioContext error:', err);
    }
  };

  const handlePlay = async () => {
    const audio = audioRef.current;
    console.log('[AUDIO] handlePlay called, audioRef:', audio, 'audioUrl:', audioUrl);
    if (!audio || !audioUrl) {
      console.log('[AUDIO] Early return - no audio element or URL');
      return;
    }

    try {
      // Resume AudioContext if suspended
      if (audioContextRef.current?.state === 'suspended') {
        console.log('[AUDIO] Resuming suspended AudioContext');
        await audioContextRef.current.resume();
      }

      // Setup audio nodes on first play
      console.log('[AUDIO] Setting up audio context, sourceCreated:', sourceCreatedRef.current);
      setupAudioContext();

      // Update stream in store (in case it was cleared)
      if (destinationRef.current) {
        setAudioStream(destinationRef.current.stream);
      }

      console.log('[AUDIO] Calling audio.play()...');
      await audio.play();
      console.log('[AUDIO] Play succeeded!');
      setIsPlaying(true);
    } catch (err) {
      console.error('[AUDIO] Play failed:', err);
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
    setAudioStream(null);
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

      // Create destination for recording
      const destination = ctx.createMediaStreamDestination();
      destinationRef.current = destination;

      source.connect(analyser);
      analyser.connect(destination); // Capture for recording (no speakers for mic to avoid feedback)

      // Store the audio stream for recording
      setAudioStream(destination.stream);

      setIsPlaying(true);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 flex-wrap">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden audio element - key forces new element when URL changes */}
      {audioUrl && (
        <audio
          key={audioUrl}
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
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

      {/* Progress Bar - Show when file is loaded */}
      {audioSource === 'upload' && audioUrl && duration > 0 && (
        <div className="flex items-center gap-2 w-full mt-1">
          {/* Current time */}
          <span className="text-[9px] text-neon-cyan/80 font-mono w-10 text-right">
            {formatTime(currentTime)}
          </span>

          {/* Progress bar */}
          <div
            ref={progressRef}
            className="flex-1 h-2 bg-white/10 rounded-full cursor-pointer relative overflow-hidden group"
            onMouseDown={handleSeekStart}
            onMouseMove={handleSeekMove}
            onMouseUp={handleSeekEnd}
            onMouseLeave={handleSeekEnd}
          >
            {/* Filled progress */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            {/* Hover/drag indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 6px)` }}
            />
          </div>

          {/* Duration */}
          <span className="text-[9px] text-neon-cyan/80 font-mono w-10">
            {formatTime(duration)}
          </span>
        </div>
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
