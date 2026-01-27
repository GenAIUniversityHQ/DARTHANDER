// DARTHANDER Visual Consciousness Engine
// Zustand Store for State Management (Client-side Only)

import { create } from 'zustand';
import { VisualState, DEFAULT_VISUAL_STATE } from './services/gemini';
import { Preset, loadVisualState, saveVisualState, loadPresets, loadApiKey, saveApiKey } from './services/storage';

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

const DEFAULT_AUDIO_STATE: AudioState = {
  subBass: 0,
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  presence: 0,
  brilliance: 0,
  overallAmplitude: 0,
  peakAmplitude: 0,
  detectedBpm: 0,
  beatIntensity: 0,
  spectralCentroid: 0.5,
  spectralFlux: 0,
};

// Background Image State
interface BackgroundImageState {
  url: string | null;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  scale: number;
  positionX: number;
  positionY: number;
  enabled: boolean;
}

const DEFAULT_BACKGROUND_IMAGE_STATE: BackgroundImageState = {
  url: null,
  opacity: 0.5,
  blendMode: 'multiply',
  scale: 1,
  positionX: 0.5,
  positionY: 0.5,
  enabled: true,
};

interface Store {
  // Visual State
  visualState: VisualState;
  setVisualState: (state: VisualState) => void;
  updateVisualParameter: (key: string, value: number | string) => void;
  applyParameterChanges: (changes: Record<string, number | string>) => void;

  // Audio State
  audioState: AudioState;
  setAudioState: (state: AudioState) => void;

  // Background Image
  backgroundImage: BackgroundImageState;
  setBackgroundImage: (state: Partial<BackgroundImageState>) => void;
  clearBackgroundImage: () => void;

  // Presets
  presets: Preset[];
  setPresets: (presets: Preset[]) => void;
  loadPreset: (preset: Preset) => void;

  // Audio Source
  audioSource: 'upload' | 'live' | 'stream';
  setAudioSource: (source: 'upload' | 'live' | 'stream') => void;

  // Audio Stream for recording
  audioStream: MediaStream | null;
  setAudioStream: (stream: MediaStream | null) => void;

  // API Key
  apiKey: string | null;
  setApiKey: (key: string | null) => void;

  // Session (for UI, client-side only)
  sessionId: string | null;
  setSessionId: (id: string | null) => void;

  // Autopilot
  autoPilot: boolean;
  setAutoPilot: (enabled: boolean) => void;

  // Transition
  isTransitioning: boolean;
  setIsTransitioning: (transitioning: boolean) => void;
}

export const useStore = create<Store>((set, get) => ({
  // Visual State - load from localStorage on init
  visualState: loadVisualState(),
  setVisualState: (state) => {
    saveVisualState(state);
    set({ visualState: state });
  },
  updateVisualParameter: (key, value) => {
    const current = get().visualState;
    const updated = { ...current, [key]: value };
    saveVisualState(updated);
    set({ visualState: updated });
  },
  applyParameterChanges: (changes) => {
    const current = get().visualState;
    const updated = { ...current };

    for (const [key, value] of Object.entries(changes)) {
      if (typeof value === 'string' && (value.startsWith('+') || value.startsWith('-'))) {
        const delta = parseFloat(value);
        const currentValue = (current as Record<string, number | string>)[key];
        if (typeof currentValue === 'number') {
          (updated as Record<string, number | string>)[key] = Math.max(0, Math.min(1, currentValue + delta));
        }
      } else {
        (updated as Record<string, number | string>)[key] = value;
      }
    }

    saveVisualState(updated);
    set({ visualState: updated });
  },

  // Audio State
  audioState: DEFAULT_AUDIO_STATE,
  setAudioState: (state) => set({ audioState: state }),

  // Background Image
  backgroundImage: DEFAULT_BACKGROUND_IMAGE_STATE,
  setBackgroundImage: (partial) => {
    const current = get().backgroundImage;
    set({ backgroundImage: { ...current, ...partial } });
  },
  clearBackgroundImage: () => {
    const current = get().backgroundImage;
    if (current.url) {
      URL.revokeObjectURL(current.url);
    }
    set({ backgroundImage: DEFAULT_BACKGROUND_IMAGE_STATE });
  },

  // Presets - load from localStorage
  presets: loadPresets(),
  setPresets: (presets) => set({ presets }),
  loadPreset: (preset) => {
    const current = get().visualState;
    // Apply preset values to current state
    const updated = { ...current };
    for (const [key, value] of Object.entries(preset.state)) {
      if (value !== undefined) {
        (updated as Record<string, string | number>)[key] = value;
      }
    }
    saveVisualState(updated);
    set({ visualState: updated, isTransitioning: true });
    const duration = (preset.state.transitionDuration as number | undefined) || 3000;
    setTimeout(() => set({ isTransitioning: false }), duration);
  },

  // Audio Source
  audioSource: 'live',
  setAudioSource: (source) => set({ audioSource: source }),

  // Audio Stream for recording
  audioStream: null,
  setAudioStream: (stream) => set({ audioStream: stream }),

  // API Key - load from localStorage/env
  apiKey: loadApiKey(),
  setApiKey: (key) => {
    if (key) saveApiKey(key);
    set({ apiKey: key });
  },

  // Session
  sessionId: `session_${Date.now()}`,
  setSessionId: (id) => set({ sessionId: id }),

  // Autopilot
  autoPilot: false,
  setAutoPilot: (enabled) => set({ autoPilot: enabled }),

  // Transition
  isTransitioning: false,
  setIsTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
}));

// Selector hooks for specific state slices
export const useVisualState = () => useStore((state) => state.visualState);
export const useAudioState = () => useStore((state) => state.audioState);
export const usePresets = () => useStore((state) => state.presets);
export const useAudioSource = () => useStore((state) => state.audioSource);
export const useApiKey = () => useStore((state) => state.apiKey);
export const useBackgroundImage = () => useStore((state) => state.backgroundImage);

export type { AudioState, Preset, BackgroundImageState };
export { DEFAULT_VISUAL_STATE, DEFAULT_AUDIO_STATE, DEFAULT_BACKGROUND_IMAGE_STATE };
