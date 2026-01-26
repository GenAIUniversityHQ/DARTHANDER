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
  // ============================================
  // EXPERIENTIAL LAYER COMBOS
  // ============================================
  {
    id: 'dmt-temple',
    name: 'DMT Temple',
    description: 'Ancient geometry meets hyperspace',
    category: 'transcendent',
    isCore: true,
    state: {
      geometryMode: 'mandala',
      colorPalette: 'sacred',
      geometryLayer2: 'flower-of-life',
      geometryLayer3: 'quantum-field',
      geometryLayer6: 'eye-of-horus',
      geometryLayer8: 'third-eye',
      elementalLayer: 'fire',
      energyLayer: 'prana',
      geometryComplexity: 0.8,
      geometrySymmetry: 8,
      motionDirection: 'breathing',
      motionSpeed: 0.15,
      overallIntensity: 0.7,
      colorHueShift: 0.1,
      audioReactGeometry: 0.8,
      audioReactColor: 0.6,
      bassImpact: 0.9,
    },
  },
  {
    id: 'ocean-drift',
    name: 'Ocean Drift',
    description: 'Deep sea consciousness',
    category: 'nature',
    isCore: true,
    state: {
      geometryMode: 'spiral',
      colorPalette: 'ocean',
      geometryLayer4: 'fluid-flow',
      geometryLayer5: 'jellyfish',
      elementalLayer: 'water',
      textureLayer: 'liquid',
      natureLayer: 'ocean',
      motionDirection: 'flow',
      motionSpeed: 0.08,
      overallIntensity: 0.5,
      geometryComplexity: 0.4,
      audioReactMotion: 0.7,
      bassImpact: 0.5,
    },
  },
  {
    id: 'kundalini-rise',
    name: 'Kundalini Rise',
    description: 'Energy ascending through chakras',
    category: 'energy',
    isCore: true,
    state: {
      geometryMode: 'spiral',
      colorPalette: 'spectrum',
      geometryLayer2: 'merkaba',
      geometryLayer5: 'kundalini',
      geometryLayer6: 'chakras',
      energyLayer: 'chi',
      alteredLayer: 'flow-state',
      motionDirection: 'outward',
      motionSpeed: 0.2,
      overallIntensity: 0.6,
      colorShiftSpeed: 0.3,
      audioReactGeometry: 0.7,
      bassImpact: 0.8,
    },
  },
  {
    id: 'tesseract-mind',
    name: 'Tesseract Mind',
    description: '4D geometry exploration',
    category: 'geometry',
    isCore: true,
    state: {
      geometryMode: 'hexagon',
      colorPalette: 'neon',
      geometryLayer2: 'metatron',
      geometryLayer7: 'tesseract',
      geometryLayer11: 'mandelbrot',
      textureLayer: 'glass',
      motionDirection: 'clockwise',
      motionSpeed: 0.12,
      geometryComplexity: 0.9,
      overallIntensity: 0.6,
      depthParallax: 0.8,
      audioReactGeometry: 0.9,
    },
  },
  {
    id: 'nebula-birth',
    name: 'Nebula Birth',
    description: 'Cosmic creation unfolding',
    category: 'cosmos',
    isCore: true,
    state: {
      geometryMode: 'stars',
      colorPalette: 'cosmos',
      geometryLayer4: 'nebula',
      geometryLayer13: 'holofractal',
      celestialLayer: 'saturn',
      starDensity: 1.0,
      starBrightness: 0.7,
      nebulaPresence: 0.9,
      cosmicDepth: 0.8,
      motionDirection: 'flow',
      motionSpeed: 0.05,
      overallIntensity: 0.5,
      coronaIntensity: 0.3,
    },
  },
  {
    id: 'phoenix-rebirth',
    name: 'Phoenix Rebirth',
    description: 'Fire transformation',
    category: 'mythic',
    isCore: true,
    state: {
      geometryMode: 'spiral',
      colorPalette: 'fire',
      geometryLayer2: 'seed-of-life',
      elementalLayer: 'fire',
      mythicLayer: 'phoenix',
      alchemicalLayer: 'rubedo',
      emotionLayer: 'ecstasy',
      motionDirection: 'outward',
      motionSpeed: 0.25,
      overallIntensity: 0.8,
      chaosFactor: 0.3,
      motionTurbulence: 0.4,
      audioReactColor: 0.8,
      bassImpact: 1.0,
    },
  },
  {
    id: 'astral-projection',
    name: 'Astral Projection',
    description: 'Out of body experience',
    category: 'transcendent',
    isCore: true,
    state: {
      geometryMode: 'tunnel',
      colorPalette: 'ethereal',
      depthMode: 'infinite',
      geometryLayer3: 'wave-function',
      geometryLayer8: 'void-source',
      alteredLayer: 'astral',
      waveformLayer: 'sine',
      motionDirection: 'inward',
      motionSpeed: 0.3,
      overallIntensity: 0.4,
      depthParallax: 1.0,
      audioReactMotion: 0.9,
    },
  },
  {
    id: 'mycelium-network',
    name: 'Mycelium Network',
    description: 'Underground consciousness web',
    category: 'nature',
    isCore: true,
    state: {
      geometryMode: 'fractal',
      colorPalette: 'earth',
      geometryLayer3: 'neural-net',
      geometryLayer5: 'mycelium',
      geometryLayer11: 'tree-fractal',
      natureLayer: 'forest',
      textureLayer: 'particle',
      motionDirection: 'flow',
      motionSpeed: 0.1,
      geometryComplexity: 0.7,
      overallIntensity: 0.5,
      audioReactGeometry: 0.6,
    },
  },
  {
    id: 'akashic-records',
    name: 'Akashic Records',
    description: 'All knowledge repository',
    category: 'transcendent',
    isCore: true,
    state: {
      geometryMode: 'void',
      colorPalette: 'ancient',
      geometryLayer2: 'tree-of-life',
      geometryLayer8: 'akashic',
      geometryLayer13: 'indras-net',
      temporalLayer: 'eternal',
      textureLayer: 'metallic',
      motionDirection: 'breathing',
      motionSpeed: 0.05,
      overallIntensity: 0.4,
      starDensity: 0.6,
      audioReactColor: 0.5,
    },
  },
  {
    id: 'rave-dimension',
    name: 'Rave Dimension',
    description: 'Peak energy party mode',
    category: 'energy',
    isCore: true,
    state: {
      geometryMode: 'tunnel',
      colorPalette: 'neon',
      geometryLayer2: 'platonic',
      geometryLayer11: 'sierpinski',
      geometryLayer12: 'lorenz',
      textureLayer: 'grain',
      waveformLayer: 'sawtooth',
      motionDirection: 'inward',
      motionSpeed: 0.5,
      overallIntensity: 0.9,
      colorShiftSpeed: 0.5,
      chaosFactor: 0.5,
      audioReactGeometry: 1.0,
      audioReactColor: 1.0,
      audioReactMotion: 1.0,
      bassImpact: 1.0,
    },
  },
  {
    id: 'meditation-deep',
    name: 'Deep Meditation',
    description: 'Inner peace visualization',
    category: 'calm',
    isCore: true,
    state: {
      geometryMode: 'mandala',
      colorPalette: 'ethereal',
      geometryLayer2: 'sri-yantra',
      geometryLayer6: 'om',
      geometryLayer8: 'unity',
      emotionLayer: 'peace',
      alteredLayer: 'trance',
      geometrySymmetry: 6,
      motionDirection: 'breathing',
      motionSpeed: 0.03,
      overallIntensity: 0.3,
      chaosFactor: 0.0,
      audioReactGeometry: 0.3,
      bassImpact: 0.3,
    },
  },
  {
    id: 'electric-dreams',
    name: 'Electric Dreams',
    description: 'Neon cyberpunk visions',
    category: 'altered',
    isCore: true,
    state: {
      geometryMode: 'hexagon',
      colorPalette: 'neon',
      geometryLayer3: 'neural-net',
      geometryLayer13: 'matrix',
      geometryLayer14: 'recursive',
      energyLayer: 'tesla',
      textureLayer: 'metallic',
      motionDirection: 'outward',
      motionSpeed: 0.2,
      overallIntensity: 0.7,
      colorShiftSpeed: 0.4,
      audioReactGeometry: 0.8,
      bassImpact: 0.9,
    },
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    description: 'Northern lights dance',
    category: 'nature',
    isCore: true,
    state: {
      geometryMode: 'stars',
      colorPalette: 'glacier',
      geometryLayer4: 'aurora',
      geometryLayer5: 'biolum',
      celestialLayer: 'moon',
      natureLayer: 'mountain',
      starDensity: 0.7,
      motionDirection: 'flow',
      motionSpeed: 0.08,
      overallIntensity: 0.5,
      colorShiftSpeed: 0.2,
      audioReactColor: 0.7,
    },
  },
  {
    id: 'black-hole',
    name: 'Black Hole',
    description: 'Event horizon singularity',
    category: 'cosmos',
    isCore: true,
    state: {
      geometryMode: 'tunnel',
      colorPalette: 'void',
      depthMode: 'infinite',
      geometryLayer3: 'singularity',
      geometryLayer4: 'wormhole',
      geometryLayer7: 'hypersphere',
      eclipsePhase: 0.9,
      coronaIntensity: 0.6,
      motionDirection: 'inward',
      motionSpeed: 0.4,
      overallIntensity: 0.6,
      depthParallax: 1.0,
      bassImpact: 0.8,
    },
  },
  {
    id: 'divine-feminine',
    name: 'Divine Feminine',
    description: 'Goddess energy flow',
    category: 'energy',
    isCore: true,
    state: {
      geometryMode: 'spiral',
      colorPalette: 'pastel',
      geometryLayer2: 'vesica',
      geometryLayer6: 'yin-yang',
      geometryLayer5: 'aura',
      emotionLayer: 'love',
      textureLayer: 'silk',
      motionDirection: 'breathing',
      motionSpeed: 0.08,
      overallIntensity: 0.5,
      geometryComplexity: 0.5,
      audioReactColor: 0.6,
    },
  },
  // ============================================
  // MORE EXPERIENTIAL COMBOS
  // ============================================
  {
    id: 'liquid-light',
    name: 'Liquid Light',
    description: 'Flowing luminescent energy',
    category: 'energy',
    isCore: true,
    state: {
      geometryMode: 'spiral',
      colorPalette: 'spectrum',
      geometryLayer4: 'fluid-flow',
      textureLayer: 'liquid',
      waveformLayer: 'sine',
      motionDirection: 'flow',
      motionSpeed: 0.15,
      overallIntensity: 0.6,
      colorShiftSpeed: 0.3,
      audioReactColor: 0.8,
      audioReactMotion: 0.7,
    },
  },
  {
    id: 'quantum-dream',
    name: 'Quantum Dream',
    description: 'Superposition of realities',
    category: 'altered',
    isCore: true,
    state: {
      geometryMode: 'fractal',
      colorPalette: 'ethereal',
      geometryLayer3: 'wave-function',
      geometryLayer13: 'simulation',
      geometryLayer7: 'hypersphere',
      alteredLayer: 'lucid',
      temporalLayer: 'loop',
      motionDirection: 'breathing',
      motionSpeed: 0.1,
      geometryComplexity: 0.7,
      depthParallax: 0.9,
      audioReactGeometry: 0.6,
    },
  },
  {
    id: 'tribal-fire',
    name: 'Tribal Fire',
    description: 'Primal ceremony flames',
    category: 'energy',
    isCore: true,
    state: {
      geometryMode: 'mandala',
      colorPalette: 'fire',
      geometryLayer2: 'seed-of-life',
      geometryLayer6: 'triskele',
      elementalLayer: 'fire',
      textureLayer: 'grain',
      geometrySymmetry: 6,
      motionDirection: 'clockwise',
      motionSpeed: 0.12,
      overallIntensity: 0.7,
      chaosFactor: 0.2,
      bassImpact: 0.9,
    },
  },
  {
    id: 'cosmic-surf',
    name: 'Cosmic Surf',
    description: 'Riding waves through space',
    category: 'cosmos',
    isCore: true,
    state: {
      geometryMode: 'stars',
      colorPalette: 'cosmos',
      geometryLayer4: 'cosmic-surf',
      geometryLayer11: 'dragon',
      waveformLayer: 'harmonic',
      starDensity: 0.8,
      motionDirection: 'flow',
      motionSpeed: 0.2,
      overallIntensity: 0.6,
      cosmicDepth: 0.9,
      audioReactMotion: 0.8,
    },
  },
  {
    id: 'crystal-cave',
    name: 'Crystal Cave',
    description: 'Underground gem formations',
    category: 'nature',
    isCore: true,
    state: {
      geometryMode: 'hexagon',
      colorPalette: 'amethyst',
      geometryLayer2: '64-tetrahedron',
      geometryLayer9: 'penteract',
      textureLayer: 'glass',
      natureLayer: 'cave',
      geometryComplexity: 0.6,
      motionDirection: 'breathing',
      motionSpeed: 0.05,
      overallIntensity: 0.5,
      depthParallax: 0.7,
    },
  },
  {
    id: 'shamanic-journey',
    name: 'Shamanic Journey',
    description: 'Spirit world gateway',
    category: 'transcendent',
    isCore: true,
    state: {
      geometryMode: 'spiral',
      colorPalette: 'earth',
      geometryLayer2: 'tree-of-life',
      geometryLayer5: 'mycelium',
      geometryLayer6: 'hunab-ku',
      geometryLayer8: 'dreamtime',
      alteredLayer: 'peak',
      motionDirection: 'inward',
      motionSpeed: 0.15,
      overallIntensity: 0.6,
      audioReactGeometry: 0.7,
      bassImpact: 0.8,
    },
  },
  {
    id: 'neon-tokyo',
    name: 'Neon Tokyo',
    description: 'Cyberpunk city lights',
    category: 'altered',
    isCore: true,
    state: {
      geometryMode: 'hexagon',
      colorPalette: 'neon',
      geometryLayer3: 'neural-net',
      geometryLayer13: 'glitch',
      textureLayer: 'metallic',
      energyLayer: 'tesla',
      motionDirection: 'outward',
      motionSpeed: 0.25,
      overallIntensity: 0.8,
      colorShiftSpeed: 0.4,
      chaosFactor: 0.3,
      audioReactGeometry: 0.9,
      bassImpact: 1.0,
    },
  },
  {
    id: 'breathwork',
    name: 'Breathwork',
    description: 'Rhythmic breathing visualization',
    category: 'calm',
    isCore: true,
    state: {
      geometryMode: 'mandala',
      colorPalette: 'glacier',
      geometryLayer2: 'torus',
      geometryLayer5: 'breath',
      geometryLayer6: 'enso',
      emotionLayer: 'serenity',
      geometrySymmetry: 4,
      motionDirection: 'breathing',
      motionSpeed: 0.04,
      overallIntensity: 0.35,
      chaosFactor: 0.0,
      audioReactGeometry: 0.4,
    },
  },
  {
    id: 'supernova',
    name: 'Supernova',
    description: 'Stellar explosion energy',
    category: 'cosmos',
    isCore: true,
    state: {
      geometryMode: 'stars',
      colorPalette: 'fire',
      geometryLayer3: 'singularity',
      geometryLayer4: 'pulsar',
      celestialLayer: 'sun',
      eclipsePhase: 0.0,
      coronaIntensity: 1.0,
      starDensity: 1.0,
      starBrightness: 1.0,
      motionDirection: 'outward',
      motionSpeed: 0.4,
      overallIntensity: 0.9,
      chaosFactor: 0.4,
      bassImpact: 1.0,
    },
  },
  {
    id: 'lotus-bloom',
    name: 'Lotus Bloom',
    description: 'Spiritual awakening unfold',
    category: 'transcendent',
    isCore: true,
    state: {
      geometryMode: 'mandala',
      colorPalette: 'pastel',
      geometryLayer2: 'flower-of-life',
      geometryLayer5: 'aura',
      geometryLayer6: 'dharma-wheel',
      geometryLayer8: 'transcendence',
      emotionLayer: 'wonder',
      geometrySymmetry: 8,
      motionDirection: 'outward',
      motionSpeed: 0.06,
      overallIntensity: 0.5,
      geometryComplexity: 0.6,
      audioReactColor: 0.5,
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
