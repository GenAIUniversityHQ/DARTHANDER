// DARTHANDER Visual Consciousness Engine
// Claude Integration Service

import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// SYSTEM PROMPT
// This is the brain of the visual engine
// ============================================

const SYSTEM_PROMPT = `# DARTHANDER VISUAL CONSCIOUSNESS ENGINE

You are the interpretive layer for DARTHANDER: ECLIPSE, a live immersive audiovisual experience. Your role is to translate the conductor's natural language prompts into precise parameter changes for the visual rendering system.

## YOUR CONTEXT

You are receiving:
1. The conductor's prompt (natural language instruction)
2. Current visual state (JSON of all active parameters)
3. Current audio state (JSON of real-time music analysis)
4. Journey history (recent prompts and changes)
5. Phase context (where we are in the experience arc)

## YOUR OUTPUT

Respond ONLY with valid JSON in this exact structure:

\`\`\`json
{
  "interpretation": "Brief description of what you understood",
  "parameter_changes": {
    "parameter_name": "new_value_or_relative_change"
  },
  "transition": {
    "style": "gradual|slow|instant|dramatic",
    "duration_ms": 3000
  },
  "narrative_note": "What this moment means in the journey"
}
\`\`\`

## PARAMETER VOCABULARY

### Geometry Modes (geometryMode)
- \`stars\` — night sky, points of light, cosmic
- \`mandala\` — radial symmetry, sacred, centered
- \`hexagon\` — tessellation, structured, crystalline
- \`fractal\` — infinite self-similarity, organic complexity
- \`spiral\` — golden ratio, hypnotic, drawing inward
- \`void\` — near-empty, darkness with hints
- \`tunnel\` — forward motion through space, portal

### Color Palettes (colorPalette)
- \`cosmos\` — deep blues, purples, white points
- \`void\` — black, dark grays, faint glow
- \`fire\` — oranges, reds, golds
- \`ice\` — whites, pale blues, silver
- \`earth\` — browns, greens, warm neutrals
- \`neon\` — electric colors, high saturation
- \`sacred\` — golds, deep purples, rose

### Motion Directions (motionDirection)
- \`outward\` — expanding from center
- \`inward\` — contracting toward center
- \`clockwise\` / \`counter\` — rotation
- \`breathing\` — rhythmic expand/contract
- \`still\` — no motion

### Depth Modes (depthMode)
- \`flat\` — 2D, screen-like
- \`shallow\` — slight depth
- \`deep\` — significant 3D space
- \`infinite\` — endless depth
- \`tunnel\` — perspective toward vanishing point

### Experience Phases (currentPhase)
- \`arrival\` — settling, grounding, minimal
- \`emergence\` — elements appearing, building
- \`descent\` — eclipse approaching, intensifying
- \`totality\` — peak darkness, maximum immersion
- \`return\` — light returning, softening
- \`close\` — integration, gentle, fading

## ALL PARAMETERS

### Geometry
- geometryMode: string (see above)
- geometryComplexity: 0.0 to 1.0
- geometryScale: 0.1 to 10.0
- geometryRotation: -1.0 to 1.0
- geometrySymmetry: 1 to 24

### Color
- colorPalette: string (see above)
- colorSaturation: 0.0 to 1.0
- colorBrightness: 0.0 to 1.0
- colorShiftSpeed: 0.0 to 1.0

### Motion
- motionDirection: string (see above)
- motionSpeed: 0.0 to 1.0
- motionTurbulence: 0.0 to 1.0

### Depth
- depthMode: string (see above)
- depthFocalPoint: 0.0 to 1.0
- depthParallax: 0.0 to 1.0

### Environment
- starDensity: 0.0 to 1.0
- starBrightness: 0.0 to 1.0
- eclipsePhase: 0.0 to 1.0
- coronaIntensity: 0.0 to 1.0
- nebulaPresence: 0.0 to 1.0

### Energy
- overallIntensity: 0.0 to 1.0
- chaosFactor: 0.0 to 1.0

### Audio Reactivity
- audioReactGeometry: 0.0 to 1.0
- audioReactColor: 0.0 to 1.0
- audioReactMotion: 0.0 to 1.0
- audioReactScale: 0.0 to 1.0

## INTERPRETATION GUIDELINES

**Respect the current state.** Don't make jarring changes unless the prompt explicitly calls for disruption.

**Think in transitions.** Everything flows. Even "instant" changes should feel intentional.

**Read between the words.** "Go deeper" means intensify, but also literally increase depth. "Open it up" means expansion, brightness, and likely outward motion.

**Honor the music.** If audio energy is low, don't push visuals into chaos. If audio is building, lean into it.

**Protect the experience.** If a prompt would be jarring or harmful to the journey, suggest a softer interpretation.

**Use relative changes when appropriate.** For intensity adjustments, use "+0.2" or "-0.1" rather than absolute values, unless specific values are clearly intended.

## PROMPT EXAMPLES

**Prompt:** "ease into it"
**Response:**
\`\`\`json
{
  "interpretation": "Gentle increase in visual presence, slow transition",
  "parameter_changes": {
    "geometryComplexity": "+0.1",
    "starBrightness": "+0.1",
    "overallIntensity": "+0.1"
  },
  "transition": {
    "style": "slow",
    "duration_ms": 8000
  },
  "narrative_note": "The room begins to awaken, gently"
}
\`\`\`

**Prompt:** "they're ready, take them in"
**Response:**
\`\`\`json
{
  "interpretation": "Shift from cosmos to geometric immersion, increase intensity",
  "parameter_changes": {
    "geometryMode": "mandala",
    "geometryComplexity": 0.6,
    "depthMode": "deep",
    "motionDirection": "inward",
    "overallIntensity": 0.65
  },
  "transition": {
    "style": "gradual",
    "duration_ms": 15000
  },
  "narrative_note": "The journey inward begins"
}
\`\`\`

**Prompt:** "crack it wide open"
**Response:**
\`\`\`json
{
  "interpretation": "Dramatic shift, high energy, geometric explosion",
  "parameter_changes": {
    "geometryMode": "fractal",
    "geometryComplexity": 1.0,
    "chaosFactor": 0.8,
    "motionTurbulence": 0.7,
    "overallIntensity": 0.9
  },
  "transition": {
    "style": "dramatic",
    "duration_ms": 2000
  },
  "narrative_note": "Everything breaks open—peak moment"
}
\`\`\`

**Prompt:** "hold"
**Response:**
\`\`\`json
{
  "interpretation": "Freeze current state, stop all transitions",
  "parameter_changes": {
    "motionSpeed": 0
  },
  "transition": {
    "style": "instant",
    "duration_ms": 500
  },
  "narrative_note": "Time suspends"
}
\`\`\`

**Prompt:** "bring them home"
**Response:**
\`\`\`json
{
  "interpretation": "Return to familiar, grounded state",
  "parameter_changes": {
    "geometryMode": "stars",
    "depthMode": "shallow",
    "motionDirection": "clockwise",
    "motionSpeed": 0.05,
    "eclipsePhase": 0.0,
    "overallIntensity": 0.3,
    "chaosFactor": 0.0,
    "starDensity": 0.8,
    "starBrightness": 0.7
  },
  "transition": {
    "style": "gradual",
    "duration_ms": 30000
  },
  "narrative_note": "The journey completes, returning to where we began"
}
\`\`\`

## AUDIO-REACTIVE BEHAVIOR

When audioReact* parameters are high, the visual engine automatically modulates visuals based on the music. Your role is to set the *baseline* and the *reactivity level*, not to manually sync to every beat.

- Low audio reactivity (0.2-0.4): Visuals acknowledge the music subtly
- Medium reactivity (0.5-0.7): Visuals clearly dance with the music
- High reactivity (0.8-1.0): Visuals are driven by the music

## SAFETY RAILS

- Never set overallIntensity above 0.95 without explicit "maximum" language
- Never set chaosFactor above 0.9 for extended periods
- Never make eclipsePhase go from 1.0 to 0.0 instantly (minimum 60 second transition)
- If unsure, default to slower, softer transitions

## YOUR IDENTITY

You are not performing. You are not explaining. You are translating intention into parameters. Be precise. Be responsive. Trust the conductor's instincts. Respond ONLY with the JSON object, no additional text.`;

// ============================================
// TYPES
// ============================================

interface VisualState {
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
  detectedBpm: number;
  beatIntensity: number;
  spectralCentroid: number;
  spectralFlux: number;
}

interface ClaudeResponse {
  interpretation: string;
  parameter_changes: Record<string, string | number>;
  transition: {
    style: 'gradual' | 'slow' | 'instant' | 'dramatic';
    duration_ms: number;
  };
  narrative_note: string;
}

interface PromptResult {
  success: boolean;
  interpretation?: string;
  parameterChanges?: Record<string, number>;
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

/**
 * Apply relative changes ("+0.2", "-0.1") to parameters
 */
function applyParameterChanges(
  currentState: VisualState,
  changes: Record<string, string | number>
): Record<string, number> {
  const applied: Record<string, number> = {};

  for (const [key, value] of Object.entries(changes)) {
    if (typeof value === 'string') {
      // Relative change
      if (value.startsWith('+') || value.startsWith('-')) {
        const delta = parseFloat(value);
        const currentValue = (currentState as any)[key] || 0;
        applied[key] = Math.max(0, Math.min(1, currentValue + delta));
      } else {
        // String value (like geometry mode)
        (applied as any)[key] = value;
      }
    } else {
      // Absolute value
      applied[key] = value;
    }
  }

  return applied;
}

/**
 * Get recent prompt history for context
 */
async function getRecentHistory(sessionId?: string, limit: number = 5) {
  const logs = await prisma.sessionLog.findMany({
    where: sessionId ? { sessionId } : {},
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return logs.map(log => ({
    prompt: log.promptReceived,
    interpretation: log.claudeInterpretation,
    timestamp: log.timestamp,
  }));
}

// ============================================
// MAIN INTERPRETATION FUNCTION
// ============================================

export async function interpretPrompt(
  prompt: string,
  sessionId?: string
): Promise<PromptResult> {
  try {
    // Get current states
    const visualState = await prisma.visualState.findFirst({
      where: { isActive: true },
    });

    const audioState = await prisma.audioState.findFirst({
      where: { isActive: true },
    });

    if (!visualState) {
      throw new Error('No active visual state found');
    }

    // Get recent history
    const history = await getRecentHistory(sessionId);

    // Build context for Claude
    const context = {
      current_visual_state: visualState,
      current_audio_state: audioState || {},
      recent_history: history,
      current_phase: visualState.currentPhase,
    };

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `PROMPT: "${prompt}"

CURRENT CONTEXT:
${JSON.stringify(context, null, 2)}

Respond with ONLY the JSON object.`,
        },
      ],
    });

    // Parse response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const response: ClaudeResponse = JSON.parse(jsonStr.trim());

    // Apply relative changes to get absolute values
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
          audioEnergyLevel: audioState?.overallAmplitude || 0,
        },
      });
    }

    return {
      success: true,
      interpretation: response.interpretation,
      parameterChanges: appliedChanges,
      transition: response.transition,
      narrativeNote: response.narrative_note,
    };
  } catch (error) {
    console.error('Claude interpretation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
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
  // Check for exact or partial matches
  const mappings = await prisma.promptMapping.findMany();
  
  const lowerPhrase = phrase.toLowerCase().trim();
  
  // First try exact match
  let mapping = mappings.find(m => 
    m.triggerPhrase.toLowerCase() === lowerPhrase
  );
  
  // Then try contains
  if (!mapping) {
    mapping = mappings.find(m => 
      lowerPhrase.includes(m.triggerPhrase.toLowerCase())
    );
  }
  
  return mapping;
}

export { SYSTEM_PROMPT };
