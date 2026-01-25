// DARTHANDER Visual Consciousness Engine
// Gemini Integration Service (Lightweight MVP)

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ============================================
// SYSTEM PROMPT (Simplified for MVP)
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

interface VisualState {
  geometryMode: string;
  geometryComplexity: number;
  colorPalette: string;
  motionDirection: string;
  motionSpeed: number;
  depthMode: string;
  overallIntensity: number;
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

interface PromptResult {
  success: boolean;
  interpretation?: string;
  parameterChanges?: Record<string, number | string>;
  transition?: {
    style: string;
    duration_ms: number;
  };
  narrativeNote?: string;
  error?: string;
}

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
        const currentValue = (currentState as any)[key] || 0;
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
// MAIN INTERPRETATION FUNCTION
// ============================================

export async function interpretPrompt(
  prompt: string,
  sessionId?: string
): Promise<PromptResult> {
  try {
    // Get current visual state
    const visualState = await prisma.visualState.findFirst({
      where: { isActive: true },
    });

    if (!visualState) {
      throw new Error('No active visual state found');
    }

    // Build context
    const context = {
      current_state: {
        geometryMode: visualState.geometryMode,
        geometryComplexity: visualState.geometryComplexity,
        colorPalette: visualState.colorPalette,
        motionDirection: visualState.motionDirection,
        motionSpeed: visualState.motionSpeed,
        overallIntensity: visualState.overallIntensity,
        eclipsePhase: visualState.eclipsePhase,
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
    const appliedChanges = applyParameterChanges(
      visualState as unknown as VisualState,
      response.parameter_changes
    );

    // Log the interaction
    if (sessionId) {
      await prisma.sessionLog.create({
        data: {
          sessionId,
          promptReceived: prompt,
          claudeInterpretation: response.interpretation,
          parametersChanged: appliedChanges,
        },
      });
    }

    return {
      success: true,
      interpretation: response.interpretation,
      parameterChanges: appliedChanges,
      transition: response.transition,
    };
  } catch (error) {
    console.error('Gemini interpretation error:', error);

    // Fallback: simple keyword matching for basic prompts
    const fallbackResult = handleFallbackPrompt(prompt);
    if (fallbackResult) {
      return fallbackResult;
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// FALLBACK PROMPT HANDLING (No API needed)
// ============================================

function handleFallbackPrompt(prompt: string): PromptResult | null {
  const lower = prompt.toLowerCase();

  // Basic keyword matching for common prompts
  if (lower.includes('portal') || lower.includes('tunnel')) {
    return {
      success: true,
      interpretation: 'Opening portal',
      parameterChanges: { geometryMode: 'tunnel', depthMode: 'infinite', motionDirection: 'inward' },
      transition: { style: 'gradual', duration_ms: 5000 },
    };
  }

  if (lower.includes('hold') || lower.includes('freeze')) {
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

  if (lower.includes('deeper') || lower.includes('more')) {
    return {
      success: true,
      interpretation: 'Going deeper',
      parameterChanges: { overallIntensity: 0.7, geometryComplexity: 0.6 },
      transition: { style: 'gradual', duration_ms: 5000 },
    };
  }

  if (lower.includes('void') || lower.includes('dark')) {
    return {
      success: true,
      interpretation: 'Entering void',
      parameterChanges: { geometryMode: 'void', colorPalette: 'void', overallIntensity: 0.2 },
      transition: { style: 'slow', duration_ms: 8000 },
    };
  }

  return null;
}

// ============================================
// QUICK COMMAND CHECK
// ============================================

export async function checkQuickCommand(phrase: string) {
  const command = await prisma.voiceCommand.findFirst({
    where: {
      phrase: phrase.toLowerCase().trim(),
      isEnabled: true,
    },
  });

  return command;
}

// ============================================
// PROMPT MAPPING CHECK
// ============================================

export async function checkPromptMapping(phrase: string) {
  const mappings = await prisma.promptMapping.findMany();
  const lowerPhrase = phrase.toLowerCase().trim();

  let mapping = mappings.find(m =>
    m.triggerPhrase.toLowerCase() === lowerPhrase
  );

  if (!mapping) {
    mapping = mappings.find(m =>
      lowerPhrase.includes(m.triggerPhrase.toLowerCase())
    );
  }

  return mapping;
}

export { SYSTEM_PROMPT };
