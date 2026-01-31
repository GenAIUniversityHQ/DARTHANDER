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

  // Background Image
  backgroundImage: string | null;
  setBackgroundImage: (image: string | null) => void;
}

// Default visual state for standalone operation
const defaultVisualState: VisualState = {
  id: 'default',
  geometryMode: 'mandala',
  geometryComplexity: 0.5,
  geometryScale: 1.0,
  geometryRotation: 0,
  geometrySymmetry: 6,
  colorPalette: 'cosmos',
  colorSaturation: 0.8,
  colorBrightness: 0.7,
  colorShiftSpeed: 0.1,
  motionDirection: 'clockwise',
  motionSpeed: 0.3,
  motionTurbulence: 0.2,
  depthMode: 'deep',
  depthFocalPoint: 0.5,
  depthParallax: 0.3,
  starDensity: 0.8,
  starBrightness: 0.7,
  eclipsePhase: 0,
  coronaIntensity: 0,
  nebulaPresence: 0.3,
  overallIntensity: 0.6,
  chaosFactor: 0.2,
  audioReactGeometry: 0.5,
  audioReactColor: 0.3,
  audioReactMotion: 0.4,
  audioReactScale: 0.2,
  currentPhase: 'arrival',
  transitionDuration: 2000,
};

// Default presets for standalone operation
const defaultPresets: Preset[] = [
  { id: '1', name: 'COSMOS', category: 'core', isCore: true, sortOrder: 1 },
  { id: '2', name: 'EMERGENCE', category: 'core', isCore: true, sortOrder: 2 },
  { id: '3', name: 'DESCENT', category: 'core', isCore: true, sortOrder: 3 },
  { id: '4', name: 'TOTALITY', category: 'core', isCore: true, sortOrder: 4 },
  { id: '5', name: 'PORTAL', category: 'core', isCore: true, sortOrder: 5 },
  { id: '6', name: 'FRACTAL_BLOOM', category: 'core', isCore: true, sortOrder: 6 },
  { id: '7', name: 'VOID', category: 'core', isCore: true, sortOrder: 7 },
  { id: '8', name: 'RETURN', category: 'core', isCore: true, sortOrder: 8 },
];

export const useStore = create<Store>((set) => ({
  // Visual State - start with defaults so UI works without backend
  visualState: defaultVisualState,
  setVisualState: (state) => set({ visualState: state }),
  updateVisualParameter: (key, value) =>
    set((state) => ({
      visualState: state.visualState
        ? { ...state.visualState, [key]: value }
        : defaultVisualState,
    })),

  // Audio State
  audioState: null,
  setAudioState: (state) => set({ audioState: state }),

  // Presets - start with defaults so UI works without backend
  presets: defaultPresets,
  setPresets: (presets) => set({ presets: presets.length > 0 ? presets : defaultPresets }),

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

  // Background Image (persisted to localStorage)
  backgroundImage: typeof window !== 'undefined' ? localStorage.getItem('darthander_bg') : null,
  setBackgroundImage: (image) => {
    if (typeof window !== 'undefined') {
      if (image) {
        localStorage.setItem('darthander_bg', image);
      } else {
        localStorage.removeItem('darthander_bg');
      }
    }
    set({ backgroundImage: image });
  },
}));

// Selector hooks for specific state slices
export const useVisualState = () => useStore((state) => state.visualState);
export const useAudioState = () => useStore((state) => state.audioState);
export const usePresets = () => useStore((state) => state.presets);
export const useCurrentTrack = () => useStore((state) => state.currentTrack);
export const useAudioSource = () => useStore((state) => state.audioSource);
