// DARTHANDER Visual Consciousness Engine
// Zustand Store for State Management

import { create } from 'zustand';

interface VisualState {
  id: string;
  geometryMode: string;
  geometryComplexity: number;
  geometryScale: number;
  geometryRotation: number;
  geometrySymmetry: number;
  colorPalette: string;
  colorSaturation: number;
  colorBrightness: number;
  colorShiftSpeed: number;
  motionDirection: string;
  motionSpeed: number;
  motionTurbulence: number;
  depthMode: string;
  depthFocalPoint: number;
  depthParallax: number;
  starDensity: number;
  starBrightness: number;
  eclipsePhase: number;
  coronaIntensity: number;
  nebulaPresence: number;
  overallIntensity: number;
  chaosFactor: number;
  audioReactGeometry: number;
  audioReactColor: number;
  audioReactMotion: number;
  audioReactScale: number;
  currentPhase: string;
  transitionDuration: number;
}

interface AudioState {
  subBass: number;
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  presence: number;
  brilliance: number;
  overallAmplitude: number;
  peakAmplitude: number;
  detectedBpm: number;
  beatIntensity: number;
  spectralCentroid: number;
  spectralFlux: number;
}

interface Preset {
  id: string;
  name: string;
  description?: string;
  category: string;
  isCore: boolean;
  sortOrder: number;
}

interface Track {
  id: string;
  filename: string;
  title?: string;
  artist?: string;
  duration?: number;
  bpm?: number;
  key?: string;
  mood?: string;
  sections?: any[];
}

interface Store {
  // Visual State
  visualState: VisualState | null;
  setVisualState: (state: VisualState) => void;
  updateVisualParameter: (key: string, value: any) => void;

  // Audio State
  audioState: AudioState | null;
  setAudioState: (state: AudioState) => void;

  // Presets
  presets: Preset[];
  setPresets: (presets: Preset[]) => void;

  // Tracks
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackPosition: number;
  setPlaybackPosition: (position: number) => void;

  // Audio Source
  audioSource: 'upload' | 'live' | 'stream';
  setAudioSource: (source: 'upload' | 'live' | 'stream') => void;

  // Session
  sessionId: string | null;
  setSessionId: (id: string | null) => void;

  // Autopilot
  autoPilot: boolean;
  setAutoPilot: (enabled: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  // Visual State
  visualState: null,
  setVisualState: (state) => set({ visualState: state }),
  updateVisualParameter: (key, value) => 
    set((state) => ({
      visualState: state.visualState 
        ? { ...state.visualState, [key]: value }
        : null,
    })),

  // Audio State
  audioState: null,
  setAudioState: (state) => set({ audioState: state }),

  // Presets
  presets: [],
  setPresets: (presets) => set({ presets }),

  // Tracks
  tracks: [],
  setTracks: (tracks) => set({ tracks }),
  currentTrack: null,
  setCurrentTrack: (track) => set({ currentTrack: track }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  playbackPosition: 0,
  setPlaybackPosition: (position) => set({ playbackPosition: position }),

  // Audio Source
  audioSource: 'live',
  setAudioSource: (source) => set({ audioSource: source }),

  // Session
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),

  // Autopilot
  autoPilot: false,
  setAutoPilot: (enabled) => set({ autoPilot: enabled }),
}));

// Selector hooks for specific state slices
export const useVisualState = () => useStore((state) => state.visualState);
export const useAudioState = () => useStore((state) => state.audioState);
export const usePresets = () => useStore((state) => state.presets);
export const useCurrentTrack = () => useStore((state) => state.currentTrack);
export const useAudioSource = () => useStore((state) => state.audioSource);
