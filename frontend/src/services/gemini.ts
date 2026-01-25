// DARTHANDER Visual Consciousness Engine
// Client-side Gemini Interpreter (Netlify-only MVP)

import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================
// INTELLIGENT VISUAL CONDUCTOR SYSTEM PROMPT
// ============================================

const SYSTEM_PROMPT = `You are DARTHANDER, an AI visual consciousness conductor for live musical performances.
Your role is to translate natural language into stunning, contextually-appropriate visual states.

Think through each prompt carefully:
1. What emotion/vibe is the user trying to achieve?
2. What's the current visual state and how should we evolve it?
3. Which COMBINATION of layers will create the most powerful effect?
4. How should the visuals react to the music (bass, frequencies)?

RESPOND ONLY WITH JSON:
{
  "thinking": "Brief reasoning about the intent and approach",
  "interpretation": "Poetic 2-3 word summary shown to user",
  "parameter_changes": { "param": value },
  "transition": { "style": "gradual|slow|instant|dramatic", "duration_ms": 3000 }
}

═══════════════════════════════════════════════
COMPLETE PARAMETER REFERENCE
═══════════════════════════════════════════════

BASE GEOMETRY (geometryMode):
  stars, mandala, hexagon, fractal, spiral, void, tunnel, fibonacci, chaos-field

SACRED GEOMETRY (geometryLayer2):
  none, flower-of-life, metatron, sri-yantra, torus, vesica, seed-of-life, merkaba, golden-ratio, platonic, 64-tetrahedron, tree-of-life, fibonacci-spiral, yin-yang

QUANTUM LAYER (geometryLayer3):
  none, quantum-field, wave-function, particle-grid, neural-net, dna-helix, singularity, entanglement, superposition

COSMIC LAYER (geometryLayer4):
  none, cosmic-surf, star-streaks, fluid-flow, nebula, galaxy, aurora, wormhole, pulsar, cosmic-web

LIFEFORCE LAYER (geometryLayer5):
  none, heartbeat, breath, neurons, cells, mycelium, biolum, roots, jellyfish, kundalini, aura, cymatics

ANCIENT WISDOM (geometryLayer6):
  none, ankh, eye-of-horus, ouroboros, enso, om, yin-yang, dharma-wheel, triskele, hunab-ku, chakras

4D GEOMETRY (geometryLayer7):
  none, tesseract, hypersphere, 24-cell, 120-cell, 600-cell, duocylinder, clifford-torus, klein-bottle

CONSCIOUSNESS (geometryLayer8):
  none, third-eye, akashic, morphic, dreamtime, void-source, infinity, unity, transcendence

5D GEOMETRY (geometryLayer9):
  none, penteract, 5-simplex, 5-orthoplex, 5-demicube, pentasphere

6D+ GEOMETRY (geometryLayer10):
  none, hexeract, e8-lattice, 6-simplex, gosset, leech-lattice

FRACTAL LAYER (geometryLayer11):
  none, mandelbrot, julia, sierpinski, koch, dragon, tree-fractal, menger, apollonian

CHAOS ATTRACTORS (geometryLayer12):
  none, lorenz, rossler, chua, halvorsen, thomas, aizawa

REALITY LAYER (geometryLayer13):
  none, matrix, glitch, simulation, observer, collapse, indras-net, holofractal, time-crystal

PARADOX/IMPOSSIBLE (geometryLayer14):
  none, penrose, impossible, mobius, hyperbolic, non-euclidean, recursive

COLOR PALETTES (colorPalette):
  cosmos, void, fire, ice, earth, neon, sacred, ocean, sunset,
  spectrum, rainbow, light, ethereal, pastel, glacier, arctic, frost,
  bloodmoon, darkprism, crimson, amethyst, obsidian, monochrome, noir, silver,
  ancient, mystic, alchemical

COLOR MODIFICATION:
  colorHueShift: 0-1 (rotates all colors through hue spectrum)
  colorSaturation: 0-1 (0=grayscale, 1=vivid)
  colorBrightness: 0-1 (0=dark, 1=bright)

MOTION (motionDirection):
  outward, inward, clockwise, counter, breathing, still, flow

SLIDERS (all 0.0-1.0):
  geometryComplexity, geometryScale, geometryRotation
  motionSpeed, motionTurbulence
  starDensity, starBrightness
  eclipsePhase, coronaIntensity
  overallIntensity, chaosFactor
  bassImpact (how much bass affects visuals)
  audioReactGeometry, audioReactColor, audioReactMotion, audioReactScale

═══════════════════════════════════════════════
CREATIVE GUIDANCE
═══════════════════════════════════════════════

LAYER COMBINATIONS (use multiple layers together!):
- Deep meditation: geometryLayer2=flower-of-life + geometryLayer6=enso + geometryLayer8=void-source
- Cosmic journey: geometryMode=tunnel + geometryLayer4=wormhole + geometryLayer7=tesseract
- Ancient power: geometryMode=mandala + geometryLayer6=ankh + geometryLayer2=metatron
- Reality breaking: geometryLayer13=glitch + geometryLayer14=non-euclidean + geometryLayer11=julia
- Chaos energy: geometryMode=chaos-field + geometryLayer12=lorenz + chaosFactor=0.8
- Transcendence: geometryLayer8=transcendence + geometryLayer7=hypersphere + geometryLayer2=merkaba

MUSIC-REACTIVE SETTINGS:
- Heavy bass drops: bassImpact=0.9, audioReactScale=0.8, audioReactGeometry=0.7
- Ambient/chill: bassImpact=0.3, audioReactColor=0.6, motionSpeed=0.1
- Intense buildups: overallIntensity=0.9, audioReactMotion=0.8, motionSpeed=0.6
- Atmospheric: audioReactColor=0.7, colorShiftSpeed=0.3, geometryLayer4=nebula

EMOTIONAL MAPPING:
- Wonder/awe: slow motion, deep colors, sacred geometry, high starBrightness
- Energy/excitement: fast motion, neon colors, high chaosFactor, strong bassImpact
- Peace/meditation: breathing motion, soft colors, flower-of-life, low intensity
- Mystery/depth: void/tunnel, dark palettes, 4D geometry, inward motion
- Transcendence: light palette, consciousness layer, high complexity, outward motion

Use "+0.2" or "-0.1" for RELATIVE changes from current state.
ALWAYS set multiple complementary parameters for cohesive results.
Respond with ONLY valid JSON.`;

// ============================================
// TYPES
// ============================================

export interface VisualState {
  geometryMode: string;
  geometryComplexity: number;
  geometryScale: number;
  geometryRotation: number;
  geometrySymmetry: number;
  geometryLayer2: string;   // Sacred
  geometryLayer3: string;   // Quantum
  geometryLayer4: string;   // Cosmic
  geometryLayer5: string;   // Lifeforce
  geometryLayer6: string;   // Ancient
  geometryLayer7: string;   // 4D
  geometryLayer8: string;   // Consciousness
  geometryLayer9: string;   // 5D
  geometryLayer10: string;  // 6D+
  geometryLayer11: string;  // Fractal
  geometryLayer12: string;  // Chaos
  geometryLayer13: string;  // Reality
  geometryLayer14: string;  // Paradox
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
  cosmicDepth: number;
  overallIntensity: number;
  chaosFactor: number;
  bassImpact: number;
  audioReactGeometry: number;
  audioReactColor: number;
  audioReactMotion: number;
  audioReactScale: number;
  currentPhase: string;
  transitionDuration: number;
  [key: string]: string | number;
}

interface GeminiResponse {
  thinking?: string;  // AI's reasoning (not shown to user)
  interpretation: string;
  parameter_changes: Record<string, string | number>;
  transition: {
    style: 'gradual' | 'slow' | 'instant' | 'dramatic';
    duration_ms: number;
  };
}

export interface PromptResult {
  success: boolean;
  interpretation?: string;
  parameterChanges?: Record<string, number | string>;
  transition?: {
    style: string;
    duration_ms: number;
  };
  error?: string;
}

// ============================================
// DEFAULT STATE
// ============================================

export const DEFAULT_VISUAL_STATE: VisualState = {
  geometryMode: 'stars',
  geometryComplexity: 0.2,
  geometryScale: 1.0,
  geometryRotation: 0.0,
  geometrySymmetry: 6,
  geometryLayer2: 'none',   // Sacred
  geometryLayer3: 'none',   // Quantum
  geometryLayer4: 'none',   // Cosmic
  geometryLayer5: 'none',   // Lifeforce
  geometryLayer6: 'none',   // Ancient
  geometryLayer7: 'none',   // 4D
  geometryLayer8: 'none',   // Consciousness
  geometryLayer9: 'none',   // 5D
  geometryLayer10: 'none',  // 6D+
  geometryLayer11: 'none',  // Fractal
  geometryLayer12: 'none',  // Chaos
  geometryLayer13: 'none',  // Reality
  geometryLayer14: 'none',  // Paradox
  colorPalette: 'cosmos',
  colorHueShift: 0,
  colorSaturation: 0.7,
  colorBrightness: 0.6,
  colorShiftSpeed: 0.1,
  motionDirection: 'clockwise',
  motionSpeed: 0.1,
  motionTurbulence: 0.0,
  depthMode: 'deep',
  depthFocalPoint: 0.5,
  depthParallax: 0.3,
  starDensity: 0.8,
  starBrightness: 0.7,
  eclipsePhase: 0.0,
  coronaIntensity: 0.0,
  nebulaPresence: 0.2,
  cosmicDepth: 0.5,
  overallIntensity: 0.4,
  chaosFactor: 0.0,
  bassImpact: 0.5,
  audioReactGeometry: 0.3,
  audioReactColor: 0.2,
  audioReactMotion: 0.3,
  audioReactScale: 0.2,
  currentPhase: 'arrival',
  transitionDuration: 3000,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function applyParameterChanges(
  currentState: VisualState,
  changes: Record<string, string | number>
): Record<string, number | string> {
  const applied: Record<string, number | string> = {};

  for (const [key, value] of Object.entries(changes)) {
    if (typeof value === 'string') {
      if (value.startsWith('+') || value.startsWith('-')) {
        const delta = parseFloat(value);
        const currentValue = currentState[key] as number || 0;
        applied[key] = Math.max(0, Math.min(1, currentValue + delta));
      } else {
        applied[key] = value;
      }
    } else {
      applied[key] = value;
    }
  }

  return applied;
}

// ============================================
// FALLBACK PROMPT HANDLING (No API needed)
// ============================================

function handleFallbackPrompt(prompt: string): PromptResult | null {
  const lower = prompt.toLowerCase();

  // === CONTROL COMMANDS ===
  if (lower.includes('hold') || lower.includes('freeze') || lower.includes('stop')) {
    return {
      success: true,
      interpretation: 'Holding',
      parameterChanges: { motionSpeed: 0 },
      transition: { style: 'instant', duration_ms: 500 },
    };
  }

  if (lower.includes('home') || lower.includes('reset')) {
    return {
      success: true,
      interpretation: 'Returning home',
      parameterChanges: {
        geometryMode: 'stars',
        overallIntensity: 0.4,
        motionSpeed: 0.1,
        geometryLayer2: 'none',
        geometryLayer3: 'none',
        geometryLayer4: 'none',
        geometryLayer5: 'none',
        geometryLayer6: 'none',
        geometryLayer7: 'none',
        geometryLayer8: 'none',
      },
      transition: { style: 'gradual', duration_ms: 10000 },
    };
  }

  // === INTENSITY/DEPTH ===
  if (lower.includes('deeper') || lower.includes('more intense') || lower.includes('crank it')) {
    return {
      success: true,
      interpretation: 'Going deeper',
      parameterChanges: {
        overallIntensity: 0.85,
        geometryComplexity: 0.7,
        bassImpact: 0.8,
        audioReactGeometry: 0.6,
      },
      transition: { style: 'gradual', duration_ms: 5000 },
    };
  }

  // === PORTALS & TUNNELS ===
  if (lower.includes('portal') || lower.includes('tunnel') || lower.includes('wormhole')) {
    return {
      success: true,
      interpretation: 'Opening portal',
      parameterChanges: {
        geometryMode: 'tunnel',
        depthMode: 'infinite',
        motionDirection: 'inward',
        geometryLayer4: 'wormhole',
        geometryLayer7: 'tesseract',
        colorPalette: 'cosmos',
        overallIntensity: 0.7,
      },
      transition: { style: 'gradual', duration_ms: 5000 },
    };
  }

  // === TRANSCENDENCE / ENLIGHTENMENT ===
  if (lower.includes('transcend') || lower.includes('enlighten') || lower.includes('ascend') || lower.includes('awaken')) {
    return {
      success: true,
      interpretation: 'Transcending',
      parameterChanges: {
        geometryLayer2: 'flower-of-life',
        geometryLayer8: 'transcendence',
        geometryLayer7: 'hypersphere',
        colorPalette: 'light',
        colorBrightness: 0.9,
        motionDirection: 'outward',
        overallIntensity: 0.8,
      },
      transition: { style: 'slow', duration_ms: 8000 },
    };
  }

  // === ANCIENT / MYSTICAL ===
  if (lower.includes('ancient') || lower.includes('egypt') || lower.includes('mystical')) {
    return {
      success: true,
      interpretation: 'Ancient wisdom',
      parameterChanges: {
        geometryMode: 'mandala',
        geometryLayer2: 'metatron',
        geometryLayer6: 'eye-of-horus',
        colorPalette: 'ancient',
        overallIntensity: 0.6,
      },
      transition: { style: 'slow', duration_ms: 6000 },
    };
  }

  // === VOID / DARKNESS ===
  if (lower.includes('void') || lower.includes('darkness') || lower.includes('abyss')) {
    return {
      success: true,
      interpretation: 'Entering void',
      parameterChanges: {
        geometryMode: 'void',
        colorPalette: 'void',
        overallIntensity: 0.2,
        geometryLayer8: 'void-source',
        motionDirection: 'inward',
      },
      transition: { style: 'slow', duration_ms: 8000 },
    };
  }

  // === SACRED GEOMETRY ===
  if (lower.includes('sacred') || lower.includes('mandala') || lower.includes('geometry')) {
    return {
      success: true,
      interpretation: 'Sacred geometry',
      parameterChanges: {
        geometryMode: 'mandala',
        geometryLayer2: 'flower-of-life',
        colorPalette: 'sacred',
        geometrySymmetry: 12,
      },
      transition: { style: 'gradual', duration_ms: 6000 },
    };
  }

  // === CHAOS / GLITCH ===
  if (lower.includes('chaos') || lower.includes('glitch') || lower.includes('break reality') || lower.includes('wild')) {
    return {
      success: true,
      interpretation: 'Breaking reality',
      parameterChanges: {
        chaosFactor: 0.9,
        motionTurbulence: 0.8,
        overallIntensity: 0.95,
        geometryLayer13: 'glitch',
        geometryLayer14: 'non-euclidean',
        geometryLayer12: 'lorenz',
      },
      transition: { style: 'dramatic', duration_ms: 2000 },
    };
  }

  // === MATRIX / SIMULATION ===
  if (lower.includes('matrix') || lower.includes('simulation') || lower.includes('code')) {
    return {
      success: true,
      interpretation: 'Entering matrix',
      parameterChanges: {
        geometryLayer13: 'matrix',
        colorPalette: 'neon',
        colorHueShift: 0.33, // Green tint
        overallIntensity: 0.7,
      },
      transition: { style: 'instant', duration_ms: 1000 },
    };
  }

  // === FRACTALS ===
  if (lower.includes('fractal') || lower.includes('mandelbrot') || lower.includes('julia')) {
    return {
      success: true,
      interpretation: 'Fractal infinity',
      parameterChanges: {
        geometryMode: 'fractal',
        geometryLayer11: 'mandelbrot',
        geometryComplexity: 0.8,
        colorPalette: 'spectrum',
      },
      transition: { style: 'gradual', duration_ms: 5000 },
    };
  }

  // === COSMIC / SPACE ===
  if (lower.includes('cosmic') || lower.includes('cosmos') || lower.includes('space') || lower.includes('galaxy') || lower.includes('nebula')) {
    return {
      success: true,
      interpretation: 'Cosmic journey',
      parameterChanges: {
        geometryMode: 'stars',
        geometryLayer4: 'nebula',
        colorPalette: 'cosmos',
        starDensity: 0.9,
        starBrightness: 0.8,
        cosmicDepth: 0.8,
      },
      transition: { style: 'gradual', duration_ms: 6000 },
    };
  }

  // === FIRE / ENERGY ===
  if (lower.includes('fire') || lower.includes('burn') || lower.includes('inferno') || lower.includes('energy')) {
    return {
      success: true,
      interpretation: 'Igniting',
      parameterChanges: {
        colorPalette: 'fire',
        overallIntensity: 0.85,
        chaosFactor: 0.5,
        bassImpact: 0.8,
        audioReactColor: 0.7,
      },
      transition: { style: 'dramatic', duration_ms: 3000 },
    };
  }

  // === ICE / CRYSTAL ===
  if (lower.includes('ice') || lower.includes('cold') || lower.includes('frozen') || lower.includes('crystal')) {
    return {
      success: true,
      interpretation: 'Crystallizing',
      parameterChanges: {
        colorPalette: 'glacier',
        motionSpeed: 0.05,
        geometryMode: 'hexagon',
        geometryLayer2: 'seed-of-life',
      },
      transition: { style: 'slow', duration_ms: 7000 },
    };
  }

  // === HYPERDIMENSIONAL ===
  if (lower.includes('4d') || lower.includes('tesseract') || lower.includes('hypercube') || lower.includes('dimension')) {
    return {
      success: true,
      interpretation: 'Higher dimensions',
      parameterChanges: {
        geometryLayer7: 'tesseract',
        geometryLayer9: 'penteract',
        geometryComplexity: 0.7,
        colorPalette: 'spectrum',
        motionDirection: 'flow',
      },
      transition: { style: 'gradual', duration_ms: 5000 },
    };
  }

  // === MEDITATION / PEACE ===
  if (lower.includes('calm') || lower.includes('peace') || lower.includes('meditat') || lower.includes('zen') || lower.includes('relax')) {
    return {
      success: true,
      interpretation: 'Finding peace',
      parameterChanges: {
        chaosFactor: 0.0,
        motionSpeed: 0.05,
        overallIntensity: 0.3,
        motionDirection: 'breathing',
        geometryLayer2: 'flower-of-life',
        geometryLayer6: 'enso',
        colorPalette: 'ethereal',
      },
      transition: { style: 'slow', duration_ms: 10000 },
    };
  }

  // === ECLIPSE ===
  if (lower.includes('eclipse') || lower.includes('totality') || lower.includes('corona')) {
    return {
      success: true,
      interpretation: 'Eclipse totality',
      parameterChanges: {
        eclipsePhase: 1.0,
        coronaIntensity: 0.9,
        starBrightness: 0.2,
        colorPalette: 'bloodmoon',
      },
      transition: { style: 'slow', duration_ms: 10000 },
    };
  }

  // === TRIPPY / PSYCHEDELIC ===
  if (lower.includes('trippy') || lower.includes('psychedelic') || lower.includes('weird')) {
    return {
      success: true,
      interpretation: 'Getting trippy',
      parameterChanges: {
        geometryLayer11: 'julia',
        geometryLayer14: 'non-euclidean',
        colorPalette: 'spectrum',
        colorShiftSpeed: 0.4,
        chaosFactor: 0.5,
        motionTurbulence: 0.4,
      },
      transition: { style: 'gradual', duration_ms: 4000 },
    };
  }

  // === DROP / BASS ===
  if (lower.includes('drop') || lower.includes('bass') || lower.includes('hit') || lower.includes('bang')) {
    return {
      success: true,
      interpretation: 'Bass drop',
      parameterChanges: {
        bassImpact: 1.0,
        audioReactGeometry: 0.9,
        audioReactScale: 0.9,
        overallIntensity: 1.0,
        chaosFactor: 0.7,
      },
      transition: { style: 'dramatic', duration_ms: 500 },
    };
  }

  // === NEON / ELECTRIC ===
  if (lower.includes('neon') || lower.includes('electric') || lower.includes('cyber')) {
    return {
      success: true,
      interpretation: 'Neon pulse',
      parameterChanges: {
        colorPalette: 'neon',
        colorBrightness: 0.95,
        colorSaturation: 1.0,
        geometryLayer3: 'neural-net',
      },
      transition: { style: 'instant', duration_ms: 1000 },
    };
  }

  // === BREATHING / PULSE ===
  if (lower.includes('breathe') || lower.includes('pulse') || lower.includes('heartbeat')) {
    return {
      success: true,
      interpretation: 'Breathing',
      parameterChanges: {
        motionDirection: 'breathing',
        motionSpeed: 0.2,
        geometryLayer5: 'heartbeat',
      },
      transition: { style: 'gradual', duration_ms: 4000 },
    };
  }

  // === SPIRAL ===
  if (lower.includes('spiral') || lower.includes('spin') || lower.includes('vortex')) {
    return {
      success: true,
      interpretation: 'Spiraling',
      parameterChanges: {
        geometryMode: 'spiral',
        motionDirection: 'clockwise',
        motionSpeed: 0.5,
        geometryLayer2: 'fibonacci-spiral',
      },
      transition: { style: 'gradual', duration_ms: 4000 },
    };
  }

  return null;
}

// ============================================
// MAIN INTERPRETATION FUNCTION
// ============================================

export async function interpretPrompt(
  prompt: string,
  currentState: VisualState,
  apiKey?: string
): Promise<PromptResult> {
  // First try fallback (works without API)
  const fallbackResult = handleFallbackPrompt(prompt);

  // If no API key, use fallback only
  if (!apiKey) {
    if (fallbackResult) {
      return fallbackResult;
    }
    return {
      success: false,
      error: 'No API key configured. Try keywords: portal, void, deeper, home, mandala, fire, ice, spiral, chaos, calm',
    };
  }

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build comprehensive context - show AI the full current state
    const activeLayers: string[] = [];
    if (currentState.geometryLayer2 !== 'none') activeLayers.push(`Sacred: ${currentState.geometryLayer2}`);
    if (currentState.geometryLayer3 !== 'none') activeLayers.push(`Quantum: ${currentState.geometryLayer3}`);
    if (currentState.geometryLayer4 !== 'none') activeLayers.push(`Cosmic: ${currentState.geometryLayer4}`);
    if (currentState.geometryLayer5 !== 'none') activeLayers.push(`Lifeforce: ${currentState.geometryLayer5}`);
    if (currentState.geometryLayer6 !== 'none') activeLayers.push(`Ancient: ${currentState.geometryLayer6}`);
    if (currentState.geometryLayer7 !== 'none') activeLayers.push(`4D: ${currentState.geometryLayer7}`);
    if (currentState.geometryLayer8 !== 'none') activeLayers.push(`Consciousness: ${currentState.geometryLayer8}`);
    if (currentState.geometryLayer9 !== 'none') activeLayers.push(`5D: ${currentState.geometryLayer9}`);
    if (currentState.geometryLayer10 !== 'none') activeLayers.push(`6D+: ${currentState.geometryLayer10}`);
    if (currentState.geometryLayer11 !== 'none') activeLayers.push(`Fractal: ${currentState.geometryLayer11}`);
    if (currentState.geometryLayer12 !== 'none') activeLayers.push(`Chaos: ${currentState.geometryLayer12}`);
    if (currentState.geometryLayer13 !== 'none') activeLayers.push(`Reality: ${currentState.geometryLayer13}`);
    if (currentState.geometryLayer14 !== 'none') activeLayers.push(`Paradox: ${currentState.geometryLayer14}`);

    const context = {
      base: currentState.geometryMode,
      active_layers: activeLayers.length > 0 ? activeLayers : ['none'],
      color: {
        palette: currentState.colorPalette,
        hueShift: currentState.colorHueShift || 0,
        saturation: currentState.colorSaturation,
        brightness: currentState.colorBrightness,
      },
      motion: {
        direction: currentState.motionDirection,
        speed: currentState.motionSpeed,
        turbulence: currentState.motionTurbulence,
      },
      intensity: {
        overall: currentState.overallIntensity,
        chaos: currentState.chaosFactor,
        complexity: currentState.geometryComplexity,
      },
      audio: {
        bassImpact: currentState.bassImpact,
        reactGeometry: currentState.audioReactGeometry,
        reactColor: currentState.audioReactColor,
        reactMotion: currentState.audioReactMotion,
      },
    };

    // Call Gemini with rich context
    const geminiPrompt = `${SYSTEM_PROMPT}

═══════════════════════════════════════════════
USER PROMPT: "${prompt}"
═══════════════════════════════════════════════

CURRENT VISUAL STATE:
${JSON.stringify(context, null, 2)}

Think about what the user wants to achieve, consider the current state, and respond with a COMBINATION of complementary parameters. Use multiple layers together for rich, layered visuals.

Respond with ONLY valid JSON.`;

    const result = await model.generateContent(geminiPrompt);
    const responseText = result.response.text();

    // Extract JSON from response
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // Clean up the response
    jsonStr = jsonStr.trim();
    if (!jsonStr.startsWith('{')) {
      const startIdx = jsonStr.indexOf('{');
      if (startIdx !== -1) {
        jsonStr = jsonStr.slice(startIdx);
      }
    }

    const response: GeminiResponse = JSON.parse(jsonStr);

    // Apply changes
    const appliedChanges = applyParameterChanges(currentState, response.parameter_changes);

    return {
      success: true,
      interpretation: response.interpretation,
      parameterChanges: appliedChanges,
      transition: response.transition,
    };
  } catch (error) {
    console.error('Gemini interpretation error:', error);

    // Fall back to keyword matching
    if (fallbackResult) {
      return fallbackResult;
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
