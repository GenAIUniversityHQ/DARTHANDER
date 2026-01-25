// DARTHANDER Visual Consciousness Engine
// Database Seed - Core Presets and Voice Commands

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌌 Seeding DARTHANDER database...');

  // ============================================
  // CORE PRESETS
  // ============================================

  const presets = [
    {
      name: 'COSMOS',
      description: 'The opening state. Pure night sky. Grounding, familiar, orienting.',
      category: 'cosmos',
      sortOrder: 1,
      isCore: true,
      geometryMode: 'stars',
      geometryComplexity: 0.2,
      geometryScale: 1.0,
      geometryRotation: 0.05,
      geometrySymmetry: 6,
      colorPalette: 'cosmos',
      colorSaturation: 0.6,
      colorBrightness: 0.7,
      colorShiftSpeed: 0.02,
      motionDirection: 'clockwise',
      motionSpeed: 0.05,
      motionTurbulence: 0.0,
      depthMode: 'deep',
      depthFocalPoint: 0.5,
      depthParallax: 0.3,
      starDensity: 0.8,
      starBrightness: 0.7,
      eclipsePhase: 0.0,
      coronaIntensity: 0.0,
      nebulaPresence: 0.3,
      overallIntensity: 0.4,
      chaosFactor: 0.0,
      audioReactGeometry: 0.2,
      audioReactColor: 0.1,
      audioReactMotion: 0.2,
      audioReactScale: 0.1,
      suggestedPhase: 'arrival',
      transitionDuration: 5000,
    },
    {
      name: 'EMERGENCE',
      description: 'Geometry begins to appear. Building awareness.',
      category: 'geometry',
      sortOrder: 2,
      isCore: true,
      geometryMode: 'mandala',
      geometryComplexity: 0.4,
      geometryScale: 1.2,
      geometryRotation: 0.1,
      geometrySymmetry: 8,
      colorPalette: 'cosmos',
      colorSaturation: 0.65,
      colorBrightness: 0.6,
      colorShiftSpeed: 0.05,
      motionDirection: 'breathing',
      motionSpeed: 0.2,
      motionTurbulence: 0.05,
      depthMode: 'shallow',
      depthFocalPoint: 0.4,
      depthParallax: 0.4,
      starDensity: 0.5,
      starBrightness: 0.5,
      eclipsePhase: 0.0,
      coronaIntensity: 0.0,
      nebulaPresence: 0.2,
      overallIntensity: 0.5,
      chaosFactor: 0.05,
      audioReactGeometry: 0.5,
      audioReactColor: 0.3,
      audioReactMotion: 0.4,
      audioReactScale: 0.4,
      suggestedPhase: 'emergence',
      transitionDuration: 8000,
    },
    {
      name: 'DESCENT',
      description: 'Eclipse approaching. Tension builds. Things get closer.',
      category: 'geometry',
      sortOrder: 3,
      isCore: true,
      geometryMode: 'hexagon',
      geometryComplexity: 0.6,
      geometryScale: 1.0,
      geometryRotation: 0.15,
      geometrySymmetry: 6,
      colorPalette: 'void',
      colorSaturation: 0.5,
      colorBrightness: 0.4,
      colorShiftSpeed: 0.03,
      motionDirection: 'inward',
      motionSpeed: 0.3,
      motionTurbulence: 0.1,
      depthMode: 'deep',
      depthFocalPoint: 0.6,
      depthParallax: 0.5,
      starDensity: 0.3,
      starBrightness: 0.3,
      eclipsePhase: 0.5,
      coronaIntensity: 0.2,
      nebulaPresence: 0.1,
      overallIntensity: 0.6,
      chaosFactor: 0.1,
      audioReactGeometry: 0.6,
      audioReactColor: 0.4,
      audioReactMotion: 0.5,
      audioReactScale: 0.5,
      suggestedPhase: 'descent',
      transitionDuration: 10000,
    },
    {
      name: 'TOTALITY',
      description: 'Full eclipse. Near-total darkness. Deep presence.',
      category: 'cosmos',
      sortOrder: 4,
      isCore: true,
      geometryMode: 'void',
      geometryComplexity: 0.3,
      geometryScale: 0.8,
      geometryRotation: 0.0,
      geometrySymmetry: 1,
      colorPalette: 'void',
      colorSaturation: 0.3,
      colorBrightness: 0.1,
      colorShiftSpeed: 0.01,
      motionDirection: 'still',
      motionSpeed: 0.0,
      motionTurbulence: 0.0,
      depthMode: 'infinite',
      depthFocalPoint: 0.8,
      depthParallax: 0.2,
      starDensity: 0.0,
      starBrightness: 0.0,
      eclipsePhase: 1.0,
      coronaIntensity: 0.3,
      nebulaPresence: 0.0,
      overallIntensity: 0.3,
      chaosFactor: 0.0,
      audioReactGeometry: 0.8,
      audioReactColor: 0.6,
      audioReactMotion: 0.2,
      audioReactScale: 0.3,
      suggestedPhase: 'totality',
      transitionDuration: 15000,
    },
    {
      name: 'PORTAL',
      description: 'Interdimensional passage. Tunnel through space.',
      category: 'portal',
      sortOrder: 5,
      isCore: true,
      geometryMode: 'tunnel',
      geometryComplexity: 0.8,
      geometryScale: 1.5,
      geometryRotation: 0.2,
      geometrySymmetry: 12,
      colorPalette: 'sacred',
      colorSaturation: 0.7,
      colorBrightness: 0.5,
      colorShiftSpeed: 0.08,
      motionDirection: 'inward',
      motionSpeed: 0.6,
      motionTurbulence: 0.15,
      depthMode: 'infinite',
      depthFocalPoint: 1.0,
      depthParallax: 0.8,
      starDensity: 0.1,
      starBrightness: 0.2,
      eclipsePhase: 0.8,
      coronaIntensity: 0.1,
      nebulaPresence: 0.3,
      overallIntensity: 0.8,
      chaosFactor: 0.2,
      audioReactGeometry: 0.7,
      audioReactColor: 0.5,
      audioReactMotion: 0.8,
      audioReactScale: 0.6,
      suggestedPhase: 'descent',
      transitionDuration: 8000,
    },
    {
      name: 'FRACTAL_BLOOM',
      description: 'Organic complexity explosion. Maximum visual density.',
      category: 'energy',
      sortOrder: 6,
      isCore: true,
      geometryMode: 'fractal',
      geometryComplexity: 1.0,
      geometryScale: 2.0,
      geometryRotation: 0.25,
      geometrySymmetry: 8,
      colorPalette: 'neon',
      colorSaturation: 0.9,
      colorBrightness: 0.7,
      colorShiftSpeed: 0.15,
      motionDirection: 'outward',
      motionSpeed: 0.5,
      motionTurbulence: 0.4,
      depthMode: 'deep',
      depthFocalPoint: 0.5,
      depthParallax: 0.6,
      starDensity: 0.2,
      starBrightness: 0.3,
      eclipsePhase: 0.3,
      coronaIntensity: 0.0,
      nebulaPresence: 0.5,
      overallIntensity: 0.9,
      chaosFactor: 0.5,
      audioReactGeometry: 0.9,
      audioReactColor: 0.7,
      audioReactMotion: 0.8,
      audioReactScale: 0.8,
      suggestedPhase: 'emergence',
      transitionDuration: 3000,
    },
    {
      name: 'VOID',
      description: 'Near-empty darkness with hints. Minimalist.',
      category: 'cosmos',
      sortOrder: 7,
      isCore: true,
      geometryMode: 'void',
      geometryComplexity: 0.1,
      geometryScale: 0.5,
      geometryRotation: 0.0,
      geometrySymmetry: 1,
      colorPalette: 'void',
      colorSaturation: 0.2,
      colorBrightness: 0.05,
      colorShiftSpeed: 0.0,
      motionDirection: 'still',
      motionSpeed: 0.0,
      motionTurbulence: 0.0,
      depthMode: 'infinite',
      depthFocalPoint: 0.9,
      depthParallax: 0.1,
      starDensity: 0.05,
      starBrightness: 0.1,
      eclipsePhase: 0.9,
      coronaIntensity: 0.1,
      nebulaPresence: 0.0,
      overallIntensity: 0.1,
      chaosFactor: 0.0,
      audioReactGeometry: 0.9,
      audioReactColor: 0.8,
      audioReactMotion: 0.1,
      audioReactScale: 0.5,
      suggestedPhase: 'totality',
      transitionDuration: 10000,
    },
    {
      name: 'RETURN',
      description: 'Coming back. Light re-emerges. Softening.',
      category: 'cosmos',
      sortOrder: 8,
      isCore: true,
      geometryMode: 'stars',
      geometryComplexity: 0.3,
      geometryScale: 1.0,
      geometryRotation: 0.05,
      geometrySymmetry: 6,
      colorPalette: 'cosmos',
      colorSaturation: 0.6,
      colorBrightness: 0.6,
      colorShiftSpeed: 0.03,
      motionDirection: 'outward',
      motionSpeed: 0.1,
      motionTurbulence: 0.0,
      depthMode: 'shallow',
      depthFocalPoint: 0.4,
      depthParallax: 0.3,
      starDensity: 0.7,
      starBrightness: 0.6,
      eclipsePhase: 0.2,
      coronaIntensity: 0.3,
      nebulaPresence: 0.2,
      overallIntensity: 0.4,
      chaosFactor: 0.0,
      audioReactGeometry: 0.3,
      audioReactColor: 0.2,
      audioReactMotion: 0.2,
      audioReactScale: 0.2,
      suggestedPhase: 'return',
      transitionDuration: 20000,
    },
    {
      name: 'CLOSE',
      description: 'Final state. Gentle fade. Integration.',
      category: 'cosmos',
      sortOrder: 9,
      isCore: true,
      geometryMode: 'stars',
      geometryComplexity: 0.1,
      geometryScale: 0.8,
      geometryRotation: 0.02,
      geometrySymmetry: 6,
      colorPalette: 'cosmos',
      colorSaturation: 0.4,
      colorBrightness: 0.4,
      colorShiftSpeed: 0.01,
      motionDirection: 'clockwise',
      motionSpeed: 0.02,
      motionTurbulence: 0.0,
      depthMode: 'flat',
      depthFocalPoint: 0.3,
      depthParallax: 0.1,
      starDensity: 0.5,
      starBrightness: 0.4,
      eclipsePhase: 0.0,
      coronaIntensity: 0.0,
      nebulaPresence: 0.1,
      overallIntensity: 0.2,
      chaosFactor: 0.0,
      audioReactGeometry: 0.1,
      audioReactColor: 0.1,
      audioReactMotion: 0.1,
      audioReactScale: 0.1,
      suggestedPhase: 'close',
      transitionDuration: 30000,
    },
    {
      name: 'SPIRAL',
      description: 'Golden ratio hypnotic spiral. Drawing inward.',
      category: 'geometry',
      sortOrder: 10,
      isCore: false,
      geometryMode: 'spiral',
      geometryComplexity: 0.7,
      geometryScale: 1.3,
      geometryRotation: 0.3,
      geometrySymmetry: 1,
      colorPalette: 'sacred',
      colorSaturation: 0.65,
      colorBrightness: 0.55,
      colorShiftSpeed: 0.06,
      motionDirection: 'inward',
      motionSpeed: 0.4,
      motionTurbulence: 0.1,
      depthMode: 'deep',
      depthFocalPoint: 0.7,
      depthParallax: 0.5,
      starDensity: 0.2,
      starBrightness: 0.3,
      eclipsePhase: 0.4,
      coronaIntensity: 0.1,
      nebulaPresence: 0.3,
      overallIntensity: 0.65,
      chaosFactor: 0.15,
      audioReactGeometry: 0.6,
      audioReactColor: 0.4,
      audioReactMotion: 0.7,
      audioReactScale: 0.5,
      suggestedPhase: 'descent',
      transitionDuration: 6000,
    },
  ];

  for (const preset of presets) {
    await prisma.preset.upsert({
      where: { name: preset.name },
      update: preset,
      create: preset,
    });
    console.log(`  ✓ Preset: ${preset.name}`);
  }

  // ============================================
  // PROMPT MAPPINGS
  // ============================================

  const promptMappings = [
    // Portal operations
    {
      triggerPhrase: 'open the portal',
      intent: 'portal_open',
      parameterChanges: {
        geometryMode: 'tunnel',
        depthMode: 'infinite',
        motionDirection: 'inward',
        geometryComplexity: 0.8,
        motionSpeed: 0.5,
      },
      transitionStyle: 'gradual',
      transitionDuration: 12000,
      notes: 'Transition to interdimensional tunnel',
    },
    {
      triggerPhrase: 'open the portal slowly',
      intent: 'portal_open_slow',
      parameterChanges: {
        geometryMode: 'tunnel',
        depthMode: 'infinite',
        motionDirection: 'inward',
        geometryComplexity: 0.7,
        motionSpeed: 0.3,
      },
      transitionStyle: 'slow',
      transitionDuration: 20000,
      notes: 'Gentle transition to portal',
    },
    {
      triggerPhrase: 'close the portal',
      intent: 'portal_close',
      parameterChanges: {
        geometryMode: 'stars',
        depthMode: 'shallow',
        motionDirection: 'outward',
        geometryComplexity: 0.3,
        motionSpeed: 0.1,
      },
      transitionStyle: 'gradual',
      transitionDuration: 15000,
      notes: 'Return from portal to normal space',
    },

    // Intensity controls
    {
      triggerPhrase: 'go deeper',
      intent: 'intensify',
      parameterChanges: {
        overallIntensity: '+0.2',
        geometryComplexity: '+0.15',
        depthFocalPoint: '+0.1',
        audioReactGeometry: '+0.1',
      },
      transitionStyle: 'slow',
      transitionDuration: 8000,
      notes: 'Increase intensity and depth',
    },
    {
      triggerPhrase: 'take them deeper',
      intent: 'intensify_strong',
      parameterChanges: {
        overallIntensity: '+0.3',
        geometryComplexity: '+0.25',
        depthFocalPoint: '+0.2',
        depthMode: 'deep',
      },
      transitionStyle: 'gradual',
      transitionDuration: 10000,
      notes: 'Significant increase in immersion',
    },
    {
      triggerPhrase: 'ease back',
      intent: 'reduce',
      parameterChanges: {
        overallIntensity: '-0.15',
        geometryComplexity: '-0.1',
        chaosFactor: '-0.1',
        motionSpeed: '-0.1',
      },
      transitionStyle: 'slow',
      transitionDuration: 10000,
      notes: 'Gently reduce intensity',
    },
    {
      triggerPhrase: 'pull back',
      intent: 'reduce_strong',
      parameterChanges: {
        overallIntensity: '-0.25',
        geometryComplexity: '-0.2',
        chaosFactor: '-0.15',
        depthFocalPoint: '-0.15',
      },
      transitionStyle: 'gradual',
      transitionDuration: 8000,
      notes: 'Significant reduction in intensity',
    },

    // Motion controls
    {
      triggerPhrase: 'breathe',
      intent: 'breathing_motion',
      parameterChanges: {
        motionDirection: 'breathing',
        motionSpeed: 0.25,
        audioReactScale: 0.8,
      },
      transitionStyle: 'instant',
      transitionDuration: 2000,
      notes: 'Rhythmic expand/contract motion',
    },
    {
      triggerPhrase: 'make it breathe',
      intent: 'breathing_motion',
      parameterChanges: {
        motionDirection: 'breathing',
        motionSpeed: 0.25,
        audioReactScale: 0.8,
      },
      transitionStyle: 'gradual',
      transitionDuration: 5000,
      notes: 'Transition to breathing motion',
    },
    {
      triggerPhrase: 'still',
      intent: 'stop_motion',
      parameterChanges: {
        motionSpeed: 0.0,
        motionTurbulence: 0.0,
        motionDirection: 'still',
      },
      transitionStyle: 'slow',
      transitionDuration: 5000,
      notes: 'Bring all motion to a stop',
    },
    {
      triggerPhrase: 'hold',
      intent: 'freeze',
      parameterChanges: {
        motionSpeed: 0,
      },
      transitionStyle: 'instant',
      transitionDuration: 500,
      notes: 'Instant freeze of current state',
    },

    // Dramatic actions
    {
      triggerPhrase: 'crack it open',
      intent: 'dramatic_shift',
      parameterChanges: {
        chaosFactor: 0.7,
        geometryComplexity: 1.0,
        motionTurbulence: 0.6,
        overallIntensity: 0.9,
        geometryMode: 'fractal',
      },
      transitionStyle: 'dramatic',
      transitionDuration: 2000,
      notes: 'Explosive visual moment',
    },
    {
      triggerPhrase: 'explode',
      intent: 'explosion',
      parameterChanges: {
        chaosFactor: 0.8,
        geometryComplexity: 1.0,
        motionDirection: 'outward',
        motionSpeed: 0.9,
        overallIntensity: 1.0,
      },
      transitionStyle: 'instant',
      transitionDuration: 1000,
      notes: 'Maximum outward explosion',
    },
    {
      triggerPhrase: 'drop',
      intent: 'energy_drop',
      parameterChanges: {
        overallIntensity: 0.9,
        geometryComplexity: 0.9,
        audioReactGeometry: 0.9,
        audioReactMotion: 0.9,
        chaosFactor: 0.4,
      },
      transitionStyle: 'instant',
      transitionDuration: 500,
      notes: 'Hit the drop - max audio reactivity',
    },

    // Return/calm
    {
      triggerPhrase: 'bring them back',
      intent: 'return',
      parameterChanges: {
        geometryMode: 'stars',
        depthMode: 'shallow',
        motionDirection: 'still',
        eclipsePhase: '-0.2',
        overallIntensity: 0.4,
        chaosFactor: 0.0,
      },
      transitionStyle: 'gradual',
      transitionDuration: 25000,
      notes: 'Return journey to familiar space',
    },
    {
      triggerPhrase: 'bring them home',
      intent: 'return_full',
      parameterChanges: {
        geometryMode: 'stars',
        depthMode: 'shallow',
        motionDirection: 'clockwise',
        motionSpeed: 0.05,
        eclipsePhase: 0.0,
        overallIntensity: 0.3,
        chaosFactor: 0.0,
        starDensity: 0.8,
        starBrightness: 0.7,
      },
      transitionStyle: 'gradual',
      transitionDuration: 30000,
      notes: 'Full return to opening state',
    },
    {
      triggerPhrase: 'ground them',
      intent: 'grounding',
      parameterChanges: {
        depthMode: 'shallow',
        motionSpeed: 0.05,
        motionTurbulence: 0.0,
        chaosFactor: 0.0,
        overallIntensity: '-0.2',
      },
      transitionStyle: 'slow',
      transitionDuration: 15000,
      notes: 'Create sense of stability',
    },
    {
      triggerPhrase: 'calm',
      intent: 'calm',
      parameterChanges: {
        motionSpeed: 0.1,
        motionTurbulence: 0.0,
        chaosFactor: 0.0,
        overallIntensity: 0.3,
        colorBrightness: 0.5,
      },
      transitionStyle: 'slow',
      transitionDuration: 12000,
      notes: 'Reduce energy, create peace',
    },

    // Eclipse controls
    {
      triggerPhrase: 'begin eclipse',
      intent: 'eclipse_start',
      parameterChanges: {
        eclipsePhase: 0.3,
        starBrightness: '-0.2',
        overallIntensity: '+0.1',
      },
      transitionStyle: 'slow',
      transitionDuration: 30000,
      notes: 'Start the eclipse sequence',
    },
    {
      triggerPhrase: 'totality',
      intent: 'eclipse_full',
      parameterChanges: {
        eclipsePhase: 1.0,
        starDensity: 0.0,
        starBrightness: 0.0,
        coronaIntensity: 0.3,
        colorBrightness: 0.1,
      },
      transitionStyle: 'gradual',
      transitionDuration: 20000,
      notes: 'Full eclipse darkness',
    },
    {
      triggerPhrase: 'end eclipse',
      intent: 'eclipse_end',
      parameterChanges: {
        eclipsePhase: 0.0,
        starDensity: 0.7,
        starBrightness: 0.6,
        coronaIntensity: 0.0,
        colorBrightness: 0.6,
      },
      transitionStyle: 'gradual',
      transitionDuration: 45000,
      notes: 'Return light after eclipse',
    },

    // Geometry modes
    {
      triggerPhrase: 'mandala',
      intent: 'geometry_mandala',
      parameterChanges: {
        geometryMode: 'mandala',
        geometrySymmetry: 8,
      },
      transitionStyle: 'gradual',
      transitionDuration: 5000,
      notes: 'Switch to mandala geometry',
    },
    {
      triggerPhrase: 'hexagons',
      intent: 'geometry_hexagon',
      parameterChanges: {
        geometryMode: 'hexagon',
        geometrySymmetry: 6,
      },
      transitionStyle: 'gradual',
      transitionDuration: 5000,
      notes: 'Switch to hexagonal tessellation',
    },
    {
      triggerPhrase: 'fractals',
      intent: 'geometry_fractal',
      parameterChanges: {
        geometryMode: 'fractal',
        geometryComplexity: '+0.3',
      },
      transitionStyle: 'gradual',
      transitionDuration: 5000,
      notes: 'Switch to fractal patterns',
    },
    {
      triggerPhrase: 'spirals',
      intent: 'geometry_spiral',
      parameterChanges: {
        geometryMode: 'spiral',
        motionDirection: 'inward',
      },
      transitionStyle: 'gradual',
      transitionDuration: 5000,
      notes: 'Switch to spiral patterns',
    },

    // Color palettes
    {
      triggerPhrase: 'warmer',
      intent: 'color_warm',
      parameterChanges: {
        colorPalette: 'fire',
        colorSaturation: '+0.1',
      },
      transitionStyle: 'slow',
      transitionDuration: 8000,
      notes: 'Shift to warmer colors',
    },
    {
      triggerPhrase: 'colder',
      intent: 'color_cold',
      parameterChanges: {
        colorPalette: 'ice',
        colorSaturation: '+0.1',
      },
      transitionStyle: 'slow',
      transitionDuration: 8000,
      notes: 'Shift to cooler colors',
    },
    {
      triggerPhrase: 'sacred',
      intent: 'color_sacred',
      parameterChanges: {
        colorPalette: 'sacred',
        colorSaturation: 0.6,
      },
      transitionStyle: 'gradual',
      transitionDuration: 6000,
      notes: 'Gold and purple sacred colors',
    },
    {
      triggerPhrase: 'neon',
      intent: 'color_neon',
      parameterChanges: {
        colorPalette: 'neon',
        colorSaturation: 0.9,
        colorBrightness: 0.7,
      },
      transitionStyle: 'gradual',
      transitionDuration: 4000,
      notes: 'Electric neon colors',
    },

    // Audio reactivity
    {
      triggerPhrase: 'feel the music',
      intent: 'high_audio_react',
      parameterChanges: {
        audioReactGeometry: 0.8,
        audioReactColor: 0.6,
        audioReactMotion: 0.8,
        audioReactScale: 0.7,
      },
      transitionStyle: 'instant',
      transitionDuration: 2000,
      notes: 'High audio reactivity',
    },
    {
      triggerPhrase: 'disconnect from music',
      intent: 'low_audio_react',
      parameterChanges: {
        audioReactGeometry: 0.1,
        audioReactColor: 0.1,
        audioReactMotion: 0.1,
        audioReactScale: 0.1,
      },
      transitionStyle: 'gradual',
      transitionDuration: 5000,
      notes: 'Minimal audio reactivity',
    },

    // Experiential / emotional
    {
      triggerPhrase: 'they\'re ready',
      intent: 'increase_engagement',
      parameterChanges: {
        overallIntensity: '+0.2',
        geometryComplexity: '+0.2',
        audioReactGeometry: '+0.2',
      },
      transitionStyle: 'gradual',
      transitionDuration: 10000,
      notes: 'Room is ready for more',
    },
    {
      triggerPhrase: 'ease into it',
      intent: 'gentle_increase',
      parameterChanges: {
        geometryComplexity: '+0.1',
        starBrightness: '+0.1',
        overallIntensity: '+0.1',
      },
      transitionStyle: 'slow',
      transitionDuration: 12000,
      notes: 'Gentle increase in presence',
    },
    {
      triggerPhrase: 'let it settle',
      intent: 'settling',
      parameterChanges: {
        motionSpeed: '-0.1',
        motionTurbulence: '-0.1',
        chaosFactor: '-0.1',
      },
      transitionStyle: 'slow',
      transitionDuration: 15000,
      notes: 'Allow the room to settle',
    },
  ];

  for (const mapping of promptMappings) {
    // Check if exists by trigger phrase
    const existing = await prisma.promptMapping.findFirst({
      where: { triggerPhrase: mapping.triggerPhrase },
    });

    if (existing) {
      await prisma.promptMapping.update({
        where: { id: existing.id },
        data: mapping,
      });
    } else {
      await prisma.promptMapping.create({
        data: mapping,
      });
    }
    console.log(`  ✓ Prompt: "${mapping.triggerPhrase}"`);
  }

  // ============================================
  // VOICE COMMANDS (Quick Triggers)
  // ============================================

  const voiceCommands = [
    // Preset triggers
    { phrase: 'cosmos', action: 'load_preset', targetPreset: 'COSMOS' },
    { phrase: 'emergence', action: 'load_preset', targetPreset: 'EMERGENCE' },
    { phrase: 'descent', action: 'load_preset', targetPreset: 'DESCENT' },
    { phrase: 'totality', action: 'load_preset', targetPreset: 'TOTALITY' },
    { phrase: 'portal', action: 'load_preset', targetPreset: 'PORTAL' },
    { phrase: 'fractal', action: 'load_preset', targetPreset: 'FRACTAL_BLOOM' },
    { phrase: 'void', action: 'load_preset', targetPreset: 'VOID' },
    { phrase: 'return', action: 'load_preset', targetPreset: 'RETURN' },
    { phrase: 'close', action: 'load_preset', targetPreset: 'CLOSE' },
    { phrase: 'spiral', action: 'load_preset', targetPreset: 'SPIRAL' },

    // System actions
    { phrase: 'hold', action: 'system_action', parameters: { action: 'hold' } },
    { phrase: 'freeze', action: 'system_action', parameters: { action: 'hold' } },
    { phrase: 'kill', action: 'system_action', parameters: { action: 'kill' } },
    { phrase: 'blackout', action: 'system_action', parameters: { action: 'kill' } },
    { phrase: 'reset', action: 'system_action', parameters: { action: 'reset' } },
    { phrase: 'max', action: 'parameter_change', parameters: { overallIntensity: 0.95 } },
    { phrase: 'maximum', action: 'parameter_change', parameters: { overallIntensity: 0.95 } },

    // Motion triggers
    { phrase: 'breathe', action: 'parameter_change', parameters: { motionDirection: 'breathing', motionSpeed: 0.25 } },
    { phrase: 'still', action: 'parameter_change', parameters: { motionDirection: 'still', motionSpeed: 0 } },
    { phrase: 'spin', action: 'parameter_change', parameters: { motionDirection: 'clockwise', motionSpeed: 0.5 } },
  ];

  for (const command of voiceCommands) {
    await prisma.voiceCommand.upsert({
      where: { phrase: command.phrase },
      update: command,
      create: command,
    });
    console.log(`  ✓ Voice: "${command.phrase}"`);
  }

  // ============================================
  // INITIAL VISUAL STATE
  // ============================================

  const existingState = await prisma.visualState.findFirst({
    where: { isActive: true },
  });

  if (!existingState) {
    await prisma.visualState.create({
      data: {
        isActive: true,
        currentPhase: 'arrival',
      },
    });
    console.log('  ✓ Initial visual state created');
  }

  // ============================================
  // INITIAL AUDIO STATE
  // ============================================

  const existingAudioState = await prisma.audioState.findFirst({
    where: { isActive: true },
  });

  if (!existingAudioState) {
    await prisma.audioState.create({
      data: {
        isActive: true,
      },
    });
    console.log('  ✓ Initial audio state created');
  }

  console.log('\n🌌 DARTHANDER database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
