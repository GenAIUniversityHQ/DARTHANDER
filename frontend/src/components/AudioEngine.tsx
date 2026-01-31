// DARTHANDER Visual Consciousness Engine
// Real-time Audio Analysis Engine with Device Selection

import { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Volume2, Settings, ChevronDown } from 'lucide-react';
import { useStore } from '../store';

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
}

interface AudioAnalysisData {
  subBass: number;
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  presence: number;
  brilliance: number;
  overallAmplitude: number;
  peakAmplitude: number;
  beatIntensity: number;
  bassImpact: number;
  bassPulse: number;
}

export function AudioEngine() {
  const [isActive, setIsActive] = useState(false);
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('default');
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [bassLevel, setBassLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const previousBassRef = useRef(0);
  const beatThresholdRef = useRef(0);

  const { setAudioState, updateVisualParameter } = useStore();

  // Enumerate available audio devices
  const enumerateDevices = useCallback(async () => {
    try {
      // Request permission first to get labeled devices
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: device.kind,
        }));

      setDevices(audioInputs);

      // Load saved preference
      const savedDevice = localStorage.getItem('darthander_audio_device');
      if (savedDevice && audioInputs.find(d => d.deviceId === savedDevice)) {
        setSelectedDevice(savedDevice);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
      setError('Could not access audio devices');
    }
  }, []);

  useEffect(() => {
    enumerateDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
    };
  }, [enumerateDevices]);

  // Start audio capture and analysis
  const startAudio = useCallback(async () => {
    try {
      setError(null);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Get audio stream from selected device
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedDevice !== 'default' ? { exact: selectedDevice } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Create audio context and analyzer
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setIsActive(true);

      // Start analysis loop
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const sampleRate = audioContext.sampleRate;

      const analyze = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate frequency bands
        const getFrequencyRange = (lowFreq: number, highFreq: number) => {
          const lowIndex = Math.floor(lowFreq * bufferLength / (sampleRate / 2));
          const highIndex = Math.floor(highFreq * bufferLength / (sampleRate / 2));
          let sum = 0;
          let count = 0;
          for (let i = lowIndex; i <= highIndex && i < bufferLength; i++) {
            sum += dataArray[i];
            count++;
          }
          return count > 0 ? sum / count / 255 : 0;
        };

        // Extract frequency bands
        const subBass = getFrequencyRange(20, 60);
        const bass = getFrequencyRange(60, 250);
        const lowMid = getFrequencyRange(250, 500);
        const mid = getFrequencyRange(500, 2000);
        const highMid = getFrequencyRange(2000, 4000);
        const presence = getFrequencyRange(4000, 6000);
        const brilliance = getFrequencyRange(6000, 20000);

        // Calculate overall amplitude
        let sum = 0;
        let peak = 0;
        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i] / 255;
          sum += value;
          if (value > peak) peak = value;
        }
        const overallAmplitude = sum / bufferLength;
        const peakAmplitude = peak;

        // Beat detection (based on bass transients)
        const currentBass = (subBass + bass) / 2;
        const bassDelta = currentBass - previousBassRef.current;

        // Adaptive threshold for beat detection
        beatThresholdRef.current = beatThresholdRef.current * 0.95 + currentBass * 0.05;
        const beatIntensity = bassDelta > 0.1 && currentBass > beatThresholdRef.current ?
          Math.min(1, bassDelta * 3) : 0;

        // Bass impact (sudden bass hits)
        const bassImpact = bassDelta > 0.15 ? Math.min(1, bassDelta * 2) : 0;

        // Bass pulse (rhythmic bass presence)
        const bassPulse = currentBass > 0.3 ? currentBass : 0;

        previousBassRef.current = currentBass;

        // Update UI levels
        setAudioLevel(overallAmplitude);
        setBassLevel(currentBass);

        // Update store with audio data
        const audioData: AudioAnalysisData = {
          subBass,
          bass,
          lowMid,
          mid,
          highMid,
          presence,
          brilliance,
          overallAmplitude,
          peakAmplitude,
          beatIntensity,
          bassImpact,
          bassPulse,
        };

        setAudioState({
          ...audioData,
          detectedBpm: 0, // Would need beat tracking algorithm
          spectralCentroid: (mid + highMid) / 2,
          spectralFlux: bassDelta,
        });

        // Apply audio reactivity to visuals - REAL-TIME SYNC
        const store = useStore.getState();
        const audioReact = store.visualState?.audioReactGeometry ?? 0.5;
        const audioReactColor = store.visualState?.audioReactColor ?? 0.3;
        const audioReactMotion = store.visualState?.audioReactMotion ?? 0.4;
        const bassImpactSens = store.visualState?.bassImpactSensitivity ?? 0.7;
        const bassPulseSens = store.visualState?.bassPulseSensitivity ?? 0.6;

        if (audioReact > 0 || audioReactColor > 0 || audioReactMotion > 0 || bassImpactSens > 0 || bassPulseSens > 0) {
          // BASS IMPACT - Corona explodes on bass hits
          const coronaBase = store.visualState?.coronaIntensity ?? 0.5;
          const impactBoost = bassImpact * bassImpactSens * 2;
          const pulseBoost = bassPulse * bassPulseSens;
          const coronaBoost = (currentBass * 0.4 + impactBoost * 0.4 + pulseBoost * 0.2) * audioReact;
          updateVisualParameter('coronaIntensity', Math.min(1, Math.max(0.3, coronaBase * 0.5 + coronaBoost)));

          // BASS PULSE - Overall intensity breathes with bass
          const intensityBase = 0.5;
          const intensityPulse = (overallAmplitude * 0.3 + bassPulse * bassPulseSens * 0.4) * audioReact;
          updateVisualParameter('overallIntensity', Math.min(1, intensityBase + intensityPulse));

          // Eclipse phase pulses slightly with heavy bass
          const eclipseBase = store.visualState?.eclipsePhase ?? 0.8;
          const eclipsePulse = bassImpact * bassImpactSens * 0.1;
          updateVisualParameter('eclipsePhase', Math.min(1, Math.max(0.6, eclipseBase + eclipsePulse - 0.05)));

          // Chaos factor responds to high frequencies and beats
          const chaosBoost = (beatIntensity * 0.5 + highMid * 0.3 + bassImpact * bassImpactSens * 0.2) * audioReact;
          updateVisualParameter('chaosFactor', Math.min(1, 0.1 + chaosBoost * 0.6));

          // Motion speed responds to tempo/energy
          const motionBoost = (overallAmplitude * 0.4 + beatIntensity * 0.3 + bassPulse * 0.3) * audioReactMotion;
          updateVisualParameter('motionSpeed', Math.min(1, 0.1 + motionBoost * 0.5));

          // Color brightness pulses with mid frequencies
          const brightnessBoost = (mid * 0.5 + presence * 0.3 + bassPulse * 0.2) * audioReactColor;
          updateVisualParameter('colorBrightness', Math.min(1, 0.5 + brightnessBoost * 0.4));

          // Star brightness twinkles with high frequencies
          const starBoost = (brilliance * 0.4 + presence * 0.3 + beatIntensity * 0.3) * audioReact;
          updateVisualParameter('starBrightness', Math.min(1, 0.4 + starBoost * 0.5));

          // Geometry complexity responds to spectral complexity
          const spectralComplexity = (lowMid + mid + highMid) / 3;
          const complexityBoost = (spectralComplexity * 0.6 + bassImpact * 0.4) * audioReact * 0.4;
          updateVisualParameter('geometryComplexity', Math.min(1, 0.3 + complexityBoost));

          // Geometry scale pulses with bass
          const scaleBase = store.visualState?.geometryScale ?? 1.2;
          const scalePulse = bassImpact * bassImpactSens * 0.15;
          updateVisualParameter('geometryScale', Math.min(2, Math.max(1, scaleBase + scalePulse - 0.05)));
        }

        animationRef.current = requestAnimationFrame(analyze);
      };

      analyze();

    } catch (err) {
      console.error('Error starting audio:', err);
      setError('Could not start audio capture. Check permissions.');
      setIsActive(false);
    }
  }, [selectedDevice, setAudioState, updateVisualParameter]);

  // Stop audio capture
  const stopAudio = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsActive(false);
    setAudioLevel(0);
    setBassLevel(0);
  }, []);

  // Handle device selection
  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId);
    localStorage.setItem('darthander_audio_device', deviceId);
    setShowDeviceMenu(false);

    // Restart audio if active
    if (isActive) {
      stopAudio();
      setTimeout(() => startAudio(), 100);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const selectedDeviceLabel = devices.find(d => d.deviceId === selectedDevice)?.label || 'Default';

  return (
    <div className="flex items-center gap-2">
      {/* Audio Toggle Button */}
      <button
        onClick={isActive ? stopAudio : startAudio}
        className={`
          p-2 rounded transition-all flex items-center gap-2
          ${isActive
            ? 'bg-green-900/50 text-green-300 border border-green-500/50'
            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'}
        `}
        title={isActive ? 'Stop audio input' : 'Start audio input'}
      >
        {isActive ? (
          <>
            <Mic className="w-4 h-4" />
            <span className="text-xs">LIVE</span>
          </>
        ) : (
          <>
            <MicOff className="w-4 h-4" />
            <span className="text-xs">OFF</span>
          </>
        )}
      </button>

      {/* Audio Level Meters */}
      {isActive && (
        <div className="flex items-center gap-1">
          <div className="w-16 h-2 bg-zinc-800 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-75"
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
          <div className="w-8 h-2 bg-zinc-800 rounded overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-75"
              style={{ width: `${bassLevel * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Device Selector */}
      <div className="relative">
        <button
          onClick={() => setShowDeviceMenu(!showDeviceMenu)}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700 flex items-center gap-1"
          title="Select audio input device"
        >
          <Settings className="w-4 h-4 text-zinc-400" />
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {showDeviceMenu && (
          <div className="absolute right-0 top-full mt-1 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-zinc-800">
              <span className="text-xs text-zinc-500">AUDIO INPUT DEVICE</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {devices.length === 0 ? (
                <div className="p-3 text-sm text-zinc-500">
                  No audio devices found
                </div>
              ) : (
                devices.map((device) => (
                  <button
                    key={device.deviceId}
                    onClick={() => handleDeviceSelect(device.deviceId)}
                    className={`
                      w-full px-3 py-2 text-left text-sm transition-colors
                      ${selectedDevice === device.deviceId
                        ? 'bg-purple-900/50 text-purple-300'
                        : 'text-zinc-300 hover:bg-zinc-800'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{device.label}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="p-2 border-t border-zinc-800 text-xs text-zinc-500">
              Current: {selectedDeviceLabel.substring(0, 30)}...
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}
