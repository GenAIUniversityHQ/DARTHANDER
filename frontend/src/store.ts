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
  colorHueShift: number;
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

// Preset now includes full visual parameters
interface Preset {
  id: string;
  name: string;
  description?: string;
  category: string;
  isCore: boolean;
  sortOrder: number;
  // Full visual state parameters
  visualState: Partial<VisualState>;
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

// Vibe layers for extended visual effects
interface VibeLayers {
  [category: string]: string | null;
}

interface Store {
  // Visual State
  visualState: VisualState;
  setVisualState: (state: VisualState) => void;
  updateVisualParameter: (key: string, value: any) => void;

  // Vibe Layers
  vibeLayers: VibeLayers;
  setVibeLayer: (category: string, value: string | null) => void;

  // Audio State
  audioState: AudioState | null;
  setAudioState: (state: AudioState) => void;

  // Presets
  presets: Preset[];
  setPresets: (presets: Preset[]) => void;
  currentPreset: string | null;
  loadPreset: (name: string) => void;

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

  // Gemini API Key (for frontend AI interpretation)
  geminiApiKey: string | null;
  setGeminiApiKey: (key: string | null) => void;
}

// Default visual state for standalone operation
const defaultVisualState: VisualState = {
  id: 'default',
  geometryMode: 'stars',
  geometryComplexity: 0.3,
  geometryScale: 1.0,
  geometryRotation: 0,
  geometrySymmetry: 6,
  colorPalette: 'cosmos',
  colorHueShift: 0,
  colorSaturation: 0.8,
  colorBrightness: 0.7,
  colorShiftSpeed: 0.1,
  motionDirection: 'clockwise',
  motionSpeed: 0.1,
  motionTurbulence: 0.1,
  depthMode: 'deep',
  depthFocalPoint: 0.5,
  depthParallax: 0.3,
  starDensity: 0.8,
  starBrightness: 0.7,
  eclipsePhase: 0,
  coronaIntensity: 0,
  nebulaPresence: 0.3,
  overallIntensity: 0.5,
  chaosFactor: 0.1,
  audioReactGeometry: 0.5,
  audioReactColor: 0.3,
  audioReactMotion: 0.4,
  audioReactScale: 0.2,
  currentPhase: 'arrival',
  transitionDuration: 2000,
};

// Full preset configurations with all visual parameters
const defaultPresets: Preset[] = [
  {
    id: '1',
    name: 'COSMOS',
    description: 'Cosmic starfield - calm arrival state',
    category: 'core',
    isCore: true,
    sortOrder: 1,
    visualState: {
      geometryMode: 'stars',
      geometryComplexity: 0.3,
      geometryScale: 1.0,
      geometrySymmetry: 6,
      colorPalette: 'cosmos',
      colorSaturation: 0.8,
      colorBrightness: 0.7,
      colorShiftSpeed: 0.05,
      motionDirection: 'clockwise',
      motionSpeed: 0.1,
      motionTurbulence: 0.1,
      depthMode: 'deep',
      starDensity: 0.9,
      starBrightness: 0.8,
      eclipsePhase: 0,
      coronaIntensity: 0,
      nebulaPresence: 0.4,
      overallIntensity: 0.5,
      chaosFactor: 0.1,
      currentPhase: 'arrival',
    },
  },
  {
    id: '2',
    name: 'EMERGENCE',
    description: 'Elements appearing, building energy',
    category: 'core',
    isCore: true,
    sortOrder: 2,
    visualState: {
      geometryMode: 'mandala',
      geometryComplexity: 0.5,
      geometryScale: 1.2,
      geometrySymmetry: 8,
      colorPalette: 'cosmos',
      colorSaturation: 0.85,
      colorBrightness: 0.75,
      colorShiftSpeed: 0.15,
      motionDirection: 'outward',
      motionSpeed: 0.25,
      motionTurbulence: 0.2,
      depthMode: 'deep',
      starDensity: 0.7,
      starBrightness: 0.6,
      eclipsePhase: 0.1,
      coronaIntensity: 0,
      nebulaPresence: 0.5,
      overallIntensity: 0.65,
      chaosFactor: 0.2,
      currentPhase: 'emergence',
    },
  },
  {
    id: '3',
    name: 'DESCENT',
    description: 'Eclipse approaching, intensifying',
    category: 'core',
    isCore: true,
    sortOrder: 3,
    visualState: {
      geometryMode: 'spiral',
      geometryComplexity: 0.7,
      geometryScale: 1.5,
      geometrySymmetry: 12,
      colorPalette: 'sacred',
      colorSaturation: 0.9,
      colorBrightness: 0.6,
      colorShiftSpeed: 0.2,
      motionDirection: 'inward',
      motionSpeed: 0.4,
      motionTurbulence: 0.3,
      depthMode: 'tunnel',
      starDensity: 0.5,
      starBrightness: 0.4,
      eclipsePhase: 0.5,
      coronaIntensity: 0.3,
      nebulaPresence: 0.6,
      overallIntensity: 0.75,
      chaosFactor: 0.35,
      currentPhase: 'descent',
    },
  },
  {
    id: '4',
    name: 'TOTALITY',
    description: 'Peak darkness, maximum immersion',
    category: 'core',
    isCore: true,
    sortOrder: 4,
    visualState: {
      geometryMode: 'hexagon',
      geometryComplexity: 0.9,
      geometryScale: 2.0,
      geometrySymmetry: 6,
      colorPalette: 'void',
      colorSaturation: 0.5,
      colorBrightness: 0.3,
      colorShiftSpeed: 0.05,
      motionDirection: 'breathing',
      motionSpeed: 0.15,
      motionTurbulence: 0.1,
      depthMode: 'infinite',
      starDensity: 0.2,
      starBrightness: 0.3,
      eclipsePhase: 1.0,
      coronaIntensity: 0.8,
      nebulaPresence: 0.2,
      overallIntensity: 0.9,
      chaosFactor: 0.1,
      currentPhase: 'totality',
    },
  },
  {
    id: '5',
    name: 'PORTAL',
    description: 'Gateway opening, transcendent',
    category: 'core',
    isCore: true,
    sortOrder: 5,
    visualState: {
      geometryMode: 'tunnel',
      geometryComplexity: 0.8,
      geometryScale: 1.8,
      geometrySymmetry: 8,
      colorPalette: 'neon',
      colorSaturation: 1.0,
      colorBrightness: 0.85,
      colorShiftSpeed: 0.3,
      motionDirection: 'inward',
      motionSpeed: 0.5,
      motionTurbulence: 0.25,
      depthMode: 'tunnel',
      starDensity: 0.4,
      starBrightness: 0.5,
      eclipsePhase: 0.7,
      coronaIntensity: 0.5,
      nebulaPresence: 0.7,
      overallIntensity: 0.85,
      chaosFactor: 0.4,
      currentPhase: 'descent',
    },
  },
  {
    id: '6',
    name: 'FRACTAL_BLOOM',
    description: 'Organic complexity explosion',
    category: 'core',
    isCore: true,
    sortOrder: 6,
    visualState: {
      geometryMode: 'fractal',
      geometryComplexity: 1.0,
      geometryScale: 1.5,
      geometrySymmetry: 16,
      colorPalette: 'fire',
      colorSaturation: 0.95,
      colorBrightness: 0.9,
      colorShiftSpeed: 0.25,
      motionDirection: 'outward',
      motionSpeed: 0.35,
      motionTurbulence: 0.5,
      depthMode: 'deep',
      starDensity: 0.3,
      starBrightness: 0.4,
      eclipsePhase: 0.3,
      coronaIntensity: 0.2,
      nebulaPresence: 0.8,
      overallIntensity: 0.95,
      chaosFactor: 0.7,
      currentPhase: 'emergence',
    },
  },
  {
    id: '7',
    name: 'VOID',
    description: 'Near-empty darkness with hints',
    category: 'core',
    isCore: true,
    sortOrder: 7,
    visualState: {
      geometryMode: 'void',
      geometryComplexity: 0.1,
      geometryScale: 1.0,
      geometrySymmetry: 4,
      colorPalette: 'void',
      colorSaturation: 0.2,
      colorBrightness: 0.15,
      colorShiftSpeed: 0.02,
      motionDirection: 'still',
      motionSpeed: 0.02,
      motionTurbulence: 0.05,
      depthMode: 'infinite',
      starDensity: 0.1,
      starBrightness: 0.2,
      eclipsePhase: 0.9,
      coronaIntensity: 0.1,
      nebulaPresence: 0.1,
      overallIntensity: 0.2,
      chaosFactor: 0.05,
      currentPhase: 'totality',
    },
  },
  {
    id: '8',
    name: 'RETURN',
    description: 'Light returning, gentle closing',
    category: 'core',
    isCore: true,
    sortOrder: 8,
    visualState: {
      geometryMode: 'stars',
      geometryComplexity: 0.4,
      geometryScale: 1.0,
      geometrySymmetry: 6,
      colorPalette: 'ice',
      colorSaturation: 0.7,
      colorBrightness: 0.8,
      colorShiftSpeed: 0.08,
      motionDirection: 'clockwise',
      motionSpeed: 0.08,
      motionTurbulence: 0.1,
      depthMode: 'shallow',
      starDensity: 0.85,
      starBrightness: 0.85,
      eclipsePhase: 0,
      coronaIntensity: 0,
      nebulaPresence: 0.3,
      overallIntensity: 0.45,
      chaosFactor: 0.05,
      currentPhase: 'return',
    },
  },
];

// Broadcast state changes to other windows (for display sync)
const broadcastState = (state: VisualState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('darthander_state', JSON.stringify(state));
    localStorage.setItem('darthander_state_timestamp', Date.now().toString());
  }
};

export const useStore = create<Store>((set, get) => ({
  // Visual State - start with defaults so UI works without backend
  visualState: defaultVisualState,
  setVisualState: (state) => {
    set({ visualState: state });
    broadcastState(state);
  },
  updateVisualParameter: (key, value) =>
    set((state) => {
      const newState = state.visualState
        ? { ...state.visualState, [key]: value }
        : { ...defaultVisualState, [key]: value };
      broadcastState(newState);
      return { visualState: newState };
    }),

  // Audio State
  audioState: null,
  setAudioState: (state) => set({ audioState: state }),

  // Vibe Layers - for extended visual effects
  vibeLayers: {},
  setVibeLayer: (category: string, value: string | null) =>
    set((state) => ({
      vibeLayers: {
        ...state.vibeLayers,
        [category]: value,
      },
    })),

  // Presets - start with defaults so UI works without backend
  presets: defaultPresets,
  setPresets: (presets) => set({ presets: presets.length > 0 ? presets : defaultPresets }),
  currentPreset: 'COSMOS',
  loadPreset: (name: string) => {
    const { presets, visualState } = get();
    const preset = presets.find((p) => p.name === name);
    if (preset && preset.visualState) {
      const newState = {
        ...visualState,
        ...preset.visualState,
        id: `preset-${name}`,
      };
      set({ visualState: newState, currentPreset: name });
      broadcastState(newState);
    }
  },

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

  // Gemini API Key (persisted to localStorage)
  geminiApiKey: typeof window !== 'undefined' ? localStorage.getItem('darthander_gemini_key') : null,
  setGeminiApiKey: (key) => {
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem('darthander_gemini_key', key);
      } else {
        localStorage.removeItem('darthander_gemini_key');
      }
    }
    set({ geminiApiKey: key });
  },
}));

// Selector hooks for specific state slices
export const useVisualState = () => useStore((state) => state.visualState);
export const useAudioState = () => useStore((state) => state.audioState);
export const usePresets = () => useStore((state) => state.presets);
export const useCurrentTrack = () => useStore((state) => state.currentTrack);
export const useAudioSource = () => useStore((state) => state.audioSource);

// Export preset configurations for external use
export { defaultPresets, defaultVisualState };
