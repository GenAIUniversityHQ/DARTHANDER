// DARTHANDER Visual Consciousness Engine
// LocalStorage Service (Netlify-only MVP)

import { VisualState, DEFAULT_VISUAL_STATE } from './gemini';

const STORAGE_KEYS = {
  VISUAL_STATE: 'darthander_visual_state',
  PRESETS: 'darthander_presets',
  API_KEY: 'darthander_gemini_key',
  PROMPT_HISTORY: 'darthander_prompt_history',
};

// ============================================
// PRESET TYPES
// ============================================

export interface Preset {
  id: string;
  name: string;
  description?: string;
  category: string;
  state: Partial<VisualState>;
  isCore?: boolean;
}

// ============================================
// DEFAULT PRESETS
// ============================================

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'awe',
    name: 'AWE',
    description: 'Stargazing wonder with eclipse crescendo',
    category: 'cosmos',
    isCore: true,
    state: {
      geometryMode: 'stars',
      colorPalette: 'cosmos',
      motionDirection: 'flow',
      motionSpeed: 0.08,
      overallIntensity: 0.35,
      starDensity: 0.9,
      starBrightness: 0.6,
      geometryComplexity: 0.2,
      chaosFactor: 0.0,
      eclipsePhase: 0.3,
      coronaIntensity: 0.4,
      geometryLayer2: 'seed-of-life',
      geometryLayer4: 'nebula',
      audioReactGeometry: 0.6,
      audioReactColor: 0.4,
      audioReactMotion: 0.5,
      bassImpact: 0.7,
    },
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    description: 'Peaceful starfield',
    category: 'cosmos',
    isCore: true,
    state: {
      geometryMode: 'stars',
      colorPalette: 'cosmos',
      motionDirection: 'clockwise',
      motionSpeed: 0.1,
      overallIntensity: 0.4,
      starDensity: 0.8,
    },
  },
  {
    id: 'portal',
    name: 'Portal',
    description: 'Infinite tunnel',
    category: 'portal',
    isCore: true,
    state: {
      geometryMode: 'tunnel',
      depthMode: 'infinite',
      motionDirection: 'inward',
      motionSpeed: 0.3,
      overallIntensity: 0.6,
      colorPalette: 'neon',
    },
  },
  {
    id: 'void',
    name: 'Void',
    description: 'Deep darkness',
    category: 'cosmos',
    isCore: true,
    state: {
      geometryMode: 'void',
      colorPalette: 'void',
      overallIntensity: 0.2,
      starBrightness: 0.3,
      motionSpeed: 0.05,
    },
  },
  {
    id: 'mandala',
    name: 'Sacred Mandala',
    description: 'Sacred geometry',
    category: 'geometry',
    isCore: true,
    state: {
      geometryMode: 'mandala',
      colorPalette: 'sacred',
      geometrySymmetry: 12,
      geometryComplexity: 0.6,
      motionDirection: 'clockwise',
      motionSpeed: 0.08,
    },
  },
  {
    id: 'eclipse',
    name: 'Eclipse',
    description: 'Total eclipse',
    category: 'cosmos',
    isCore: true,
    state: {
      eclipsePhase: 1.0,
      coronaIntensity: 0.8,
      starBrightness: 0.3,
      colorPalette: 'cosmos',
      overallIntensity: 0.5,
    },
  },
  {
    id: 'fire',
    name: 'Fire',
    description: 'Burning intensity',
    category: 'energy',
    isCore: true,
    state: {
      colorPalette: 'fire',
      overallIntensity: 0.8,
      chaosFactor: 0.4,
      motionTurbulence: 0.3,
    },
  },
  {
    id: 'ice',
    name: 'Ice',
    description: 'Frozen crystal',
    category: 'energy',
    isCore: true,
    state: {
      geometryMode: 'hexagon',
      colorPalette: 'ice',
      motionSpeed: 0.05,
      overallIntensity: 0.5,
    },
  },
  {
    id: 'fractal',
    name: 'Fractal',
    description: 'Infinite complexity',
    category: 'geometry',
    isCore: true,
    state: {
      geometryMode: 'fractal',
      geometryComplexity: 0.8,
      colorPalette: 'neon',
      depthMode: 'deep',
    },
  },
  {
    id: 'chaos',
    name: 'Chaos',
    description: 'Wild energy',
    category: 'energy',
    isCore: true,
    state: {
      chaosFactor: 0.8,
      motionTurbulence: 0.7,
      overallIntensity: 0.9,
      motionSpeed: 0.5,
    },
  },
  {
    id: 'zen',
    name: 'Zen',
    description: 'Perfect calm',
    category: 'cosmos',
    isCore: true,
    state: {
      geometryMode: 'mandala',
      colorPalette: 'earth',
      motionSpeed: 0.03,
      overallIntensity: 0.3,
      chaosFactor: 0.0,
      motionDirection: 'breathing',
    },
  },
];

// ============================================
// VISUAL STATE STORAGE
// ============================================

export function saveVisualState(state: VisualState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VISUAL_STATE, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save visual state:', e);
  }
}

export function loadVisualState(): VisualState {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VISUAL_STATE);
    if (stored) {
      return { ...DEFAULT_VISUAL_STATE, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load visual state:', e);
  }
  return { ...DEFAULT_VISUAL_STATE };
}

// ============================================
// PRESET STORAGE
// ============================================

export function savePresets(presets: Preset[]): void {
  try {
    // Only save custom presets (not core)
    const customPresets = presets.filter(p => !p.isCore);
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(customPresets));
  } catch (e) {
    console.error('Failed to save presets:', e);
  }
}

export function loadPresets(): Preset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRESETS);
    const customPresets = stored ? JSON.parse(stored) : [];
    return [...DEFAULT_PRESETS, ...customPresets];
  } catch (e) {
    console.error('Failed to load presets:', e);
  }
  return [...DEFAULT_PRESETS];
}

export function addPreset(preset: Omit<Preset, 'id'>): Preset {
  const newPreset: Preset = {
    ...preset,
    id: `custom_${Date.now()}`,
    isCore: false,
  };
  const presets = loadPresets();
  presets.push(newPreset);
  savePresets(presets);
  return newPreset;
}

export function deletePreset(id: string): void {
  const presets = loadPresets().filter(p => p.id !== id);
  savePresets(presets);
}

// ============================================
// API KEY STORAGE
// ============================================

export function saveApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  } catch (e) {
    console.error('Failed to save API key:', e);
  }
}

export function loadApiKey(): string | null {
  try {
    // First check environment variable
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey) return envKey;

    // Then check localStorage
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  } catch (e) {
    console.error('Failed to load API key:', e);
  }
  return null;
}

export function clearApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  } catch (e) {
    console.error('Failed to clear API key:', e);
  }
}

// ============================================
// PROMPT HISTORY
// ============================================

export function savePromptHistory(history: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROMPT_HISTORY, JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save prompt history:', e);
  }
}

export function loadPromptHistory(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load prompt history:', e);
  }
  return [];
}
