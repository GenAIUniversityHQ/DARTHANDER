// DARTHANDER Visual Consciousness Engine
// Client-side Gemini Interpreter (Netlify-only MVP)

import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================
// SYSTEM PROMPT
// ============================================

const SYSTEM_PROMPT = `You are DARTHANDER, an AI visual conductor. Translate natural language prompts into visual parameter changes.

RESPOND ONLY WITH JSON in this format:
{
  "interpretation": "Brief description",
  "parameter_changes": { "param": value },
  "transition": { "style": "gradual|slow|instant|dramatic", "duration_ms": 3000 }
}

PARAMETERS (all 0.0-1.0 unless noted):
- geometryMode: stars|mandala|hexagon|fractal|spiral|void|tunnel
- geometryComplexity, geometryScale (0.1-10), geometryRotation (-1 to 1)
- colorPalette: cosmos|void|fire|ice|earth|neon|sacred
- colorSaturation, colorBrightness, colorShiftSpeed
- motionDirection: outward|inward|clockwise|counter|breathing|still
- motionSpeed, motionTurbulence
- depthMode: flat|shallow|deep|infinite|tunnel
- starDensity, starBrightness, eclipsePhase, coronaIntensity
- overallIntensity, chaosFactor
- audioReactGeometry, audioReactColor, audioReactMotion

EXAMPLES:
"go deeper" → increase intensity +0.2, complexity +0.15, shift toward purple
"open the portal" → geometryMode: tunnel, depthMode: infinite, motionDirection: inward
"hold" → motionSpeed: 0
"bring them home" → return to stars, low intensity, gentle

Use "+0.2" or "-0.1" for relative changes. Respond ONLY with JSON.`;

// ============================================
// TYPES
// ============================================

export interface VisualState {
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
  [key: string]: string | number;
}

interface GeminiResponse {
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
  colorPalette: 'cosmos',
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
  overallIntensity: 0.4,
  chaosFactor: 0.0,
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

  if (lower.includes('portal') || lower.includes('tunnel')) {
    return {
      success: true,
      interpretation: 'Opening portal',
      parameterChanges: { geometryMode: 'tunnel', depthMode: 'infinite', motionDirection: 'inward' },
      transition: { style: 'gradual', duration_ms: 5000 },
    };
  }

  if (lower.includes('hold') || lower.includes('freeze') || lower.includes('stop')) {
    return {
      success: true,
      interpretation: 'Holding position',
      parameterChanges: { motionSpeed: 0 },
      transition: { style: 'instant', duration_ms: 500 },
    };
  }

  if (lower.includes('home') || lower.includes('cosmos') || lower.includes('reset')) {
    return {
      success: true,
      interpretation: 'Returning to cosmos',
      parameterChanges: { geometryMode: 'stars', overallIntensity: 0.4, motionSpeed: 0.1 },
      transition: { style: 'gradual', duration_ms: 10000 },
    };
  }

  if (lower.includes('deeper') || lower.includes('more') || lower.includes('intense')) {
    return {
      success: true,
      interpretation: 'Going deeper',
      parameterChanges: { overallIntensity: 0.7, geometryComplexity: 0.6 },
      transition: { style: 'gradual', duration_ms: 5000 },
    };
  }

  if (lower.includes('void') || lower.includes('dark') || lower.includes('shadow')) {
    return {
      success: true,
      interpretation: 'Entering void',
      parameterChanges: { geometryMode: 'void', colorPalette: 'void', overallIntensity: 0.2 },
      transition: { style: 'slow', duration_ms: 8000 },
    };
  }

  if (lower.includes('mandala') || lower.includes('sacred')) {
    return {
      success: true,
      interpretation: 'Sacred mandala',
      parameterChanges: { geometryMode: 'mandala', colorPalette: 'sacred', geometrySymmetry: 12 },
      transition: { style: 'gradual', duration_ms: 6000 },
    };
  }

  if (lower.includes('fire') || lower.includes('burn') || lower.includes('heat')) {
    return {
      success: true,
      interpretation: 'Igniting fire',
      parameterChanges: { colorPalette: 'fire', overallIntensity: 0.8, chaosFactor: 0.4 },
      transition: { style: 'dramatic', duration_ms: 3000 },
    };
  }

  if (lower.includes('ice') || lower.includes('cold') || lower.includes('frozen')) {
    return {
      success: true,
      interpretation: 'Crystallizing ice',
      parameterChanges: { colorPalette: 'ice', motionSpeed: 0.05, geometryMode: 'hexagon' },
      transition: { style: 'slow', duration_ms: 7000 },
    };
  }

  if (lower.includes('spiral') || lower.includes('spin')) {
    return {
      success: true,
      interpretation: 'Spiraling',
      parameterChanges: { geometryMode: 'spiral', motionDirection: 'clockwise', motionSpeed: 0.4 },
      transition: { style: 'gradual', duration_ms: 4000 },
    };
  }

  if (lower.includes('fractal') || lower.includes('complex')) {
    return {
      success: true,
      interpretation: 'Fractal complexity',
      parameterChanges: { geometryMode: 'fractal', geometryComplexity: 0.8 },
      transition: { style: 'gradual', duration_ms: 5000 },
    };
  }

  if (lower.includes('neon') || lower.includes('glow') || lower.includes('electric')) {
    return {
      success: true,
      interpretation: 'Neon glow',
      parameterChanges: { colorPalette: 'neon', colorBrightness: 0.9, colorSaturation: 1.0 },
      transition: { style: 'instant', duration_ms: 1000 },
    };
  }

  if (lower.includes('eclipse') || lower.includes('totality')) {
    return {
      success: true,
      interpretation: 'Eclipse totality',
      parameterChanges: { eclipsePhase: 1.0, coronaIntensity: 0.8, starBrightness: 0.3 },
      transition: { style: 'slow', duration_ms: 10000 },
    };
  }

  if (lower.includes('breathe') || lower.includes('breathing') || lower.includes('pulse')) {
    return {
      success: true,
      interpretation: 'Breathing pulse',
      parameterChanges: { motionDirection: 'breathing', motionSpeed: 0.2 },
      transition: { style: 'gradual', duration_ms: 4000 },
    };
  }

  if (lower.includes('chaos') || lower.includes('wild') || lower.includes('crazy')) {
    return {
      success: true,
      interpretation: 'Chaos unleashed',
      parameterChanges: { chaosFactor: 0.8, motionTurbulence: 0.7, overallIntensity: 0.9 },
      transition: { style: 'dramatic', duration_ms: 2000 },
    };
  }

  if (lower.includes('calm') || lower.includes('gentle') || lower.includes('peace')) {
    return {
      success: true,
      interpretation: 'Finding peace',
      parameterChanges: { chaosFactor: 0.0, motionSpeed: 0.05, overallIntensity: 0.3 },
      transition: { style: 'slow', duration_ms: 8000 },
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build context
    const context = {
      current_state: {
        geometryMode: currentState.geometryMode,
        geometryComplexity: currentState.geometryComplexity,
        colorPalette: currentState.colorPalette,
        motionDirection: currentState.motionDirection,
        motionSpeed: currentState.motionSpeed,
        overallIntensity: currentState.overallIntensity,
        eclipsePhase: currentState.eclipsePhase,
      },
    };

    // Call Gemini
    const geminiPrompt = `${SYSTEM_PROMPT}

PROMPT: "${prompt}"
CURRENT STATE: ${JSON.stringify(context.current_state)}

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
