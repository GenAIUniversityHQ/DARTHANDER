// DARTHANDER Visual Consciousness Engine
// State Management Service

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES
// ============================================

interface VisualStateUpdate {
  geometryMode?: string;
  geometryComplexity?: number;
  geometryScale?: number;
  geometryRotation?: number;
  geometrySymmetry?: number;
  colorPalette?: string;
  colorSaturation?: number;
  colorBrightness?: number;
  colorShiftSpeed?: number;
  motionDirection?: string;
  motionSpeed?: number;
  motionTurbulence?: number;
  depthMode?: string;
  depthFocalPoint?: number;
  depthParallax?: number;
  starDensity?: number;
  starBrightness?: number;
  eclipsePhase?: number;
  coronaIntensity?: number;
  nebulaPresence?: number;
  overallIntensity?: number;
  chaosFactor?: number;
  audioReactGeometry?: number;
  audioReactColor?: number;
  audioReactMotion?: number;
  audioReactScale?: number;
  currentPhase?: string;
  transitionDuration?: number;
}

// ============================================
// GET CURRENT STATE
// ============================================

export async function getCurrentState() {
  const state = await prisma.visualState.findFirst({
    where: { isActive: true },
  });

  if (!state) {
    // Create default state if none exists
    return prisma.visualState.create({
      data: { isActive: true },
    });
  }

  return state;
}

// ============================================
// UPDATE VISUAL STATE
// ============================================

export async function updateVisualState(
  updates: VisualStateUpdate,
  transitionDuration?: number
) {
  const currentState = await getCurrentState();

  // Filter out undefined values and non-state fields
  const validUpdates: Record<string, any> = {};
  const stateFields = [
    'geometryMode', 'geometryComplexity', 'geometryScale', 'geometryRotation', 'geometrySymmetry',
    'colorPalette', 'colorSaturation', 'colorBrightness', 'colorShiftSpeed',
    'motionDirection', 'motionSpeed', 'motionTurbulence',
    'depthMode', 'depthFocalPoint', 'depthParallax',
    'starDensity', 'starBrightness', 'eclipsePhase', 'coronaIntensity', 'nebulaPresence',
    'overallIntensity', 'chaosFactor',
    'audioReactGeometry', 'audioReactColor', 'audioReactMotion', 'audioReactScale',
    'currentPhase',
  ];

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && stateFields.includes(key)) {
      validUpdates[key] = value;
    }
  }

  if (transitionDuration !== undefined) {
    validUpdates.transitionDuration = transitionDuration;
  }

  const updatedState = await prisma.visualState.update({
    where: { id: currentState.id },
    data: validUpdates,
  });

  return {
    state: updatedState,
    changes: validUpdates,
    transitionDuration: transitionDuration || currentState.transitionDuration,
  };
}

// ============================================
// LOAD PRESET
// ============================================

export async function loadPreset(presetName: string, transitionDuration?: number) {
  const preset = await prisma.preset.findUnique({
    where: { name: presetName },
  });

  if (!preset) {
    throw new Error(`Preset "${presetName}" not found`);
  }

  // Extract state fields from preset
  const stateUpdate: VisualStateUpdate = {
    geometryMode: preset.geometryMode,
    geometryComplexity: preset.geometryComplexity,
    geometryScale: preset.geometryScale,
    geometryRotation: preset.geometryRotation,
    geometrySymmetry: preset.geometrySymmetry,
    colorPalette: preset.colorPalette,
    colorSaturation: preset.colorSaturation,
    colorBrightness: preset.colorBrightness,
    colorShiftSpeed: preset.colorShiftSpeed,
    motionDirection: preset.motionDirection,
    motionSpeed: preset.motionSpeed,
    motionTurbulence: preset.motionTurbulence,
    depthMode: preset.depthMode,
    depthFocalPoint: preset.depthFocalPoint,
    depthParallax: preset.depthParallax,
    starDensity: preset.starDensity,
    starBrightness: preset.starBrightness,
    eclipsePhase: preset.eclipsePhase,
    coronaIntensity: preset.coronaIntensity,
    nebulaPresence: preset.nebulaPresence,
    overallIntensity: preset.overallIntensity,
    chaosFactor: preset.chaosFactor,
    audioReactGeometry: preset.audioReactGeometry,
    audioReactColor: preset.audioReactColor,
    audioReactMotion: preset.audioReactMotion,
    audioReactScale: preset.audioReactScale,
    currentPhase: preset.suggestedPhase || undefined,
  };

  return updateVisualState(
    stateUpdate,
    transitionDuration || preset.transitionDuration
  );
}

// ============================================
// GET AUDIO STATE
// ============================================

export async function getAudioState() {
  const state = await prisma.audioState.findFirst({
    where: { isActive: true },
  });

  if (!state) {
    return prisma.audioState.create({
      data: { isActive: true },
    });
  }

  return state;
}

// ============================================
// UPDATE AUDIO STATE
// ============================================

export async function updateAudioState(updates: {
  subBass?: number;
  bass?: number;
  lowMid?: number;
  mid?: number;
  highMid?: number;
  presence?: number;
  brilliance?: number;
  overallAmplitude?: number;
  peakAmplitude?: number;
  dynamicRange?: number;
  detectedBpm?: number;
  beatIntensity?: number;
  onsetDensity?: number;
  spectralCentroid?: number;
  spectralFlux?: number;
  harmonicRatio?: number;
}) {
  const currentState = await getAudioState();

  return prisma.audioState.update({
    where: { id: currentState.id },
    data: updates,
  });
}

// ============================================
// HOLD / FREEZE STATE
// ============================================

export async function holdState() {
  return updateVisualState({ motionSpeed: 0 }, 500);
}

// ============================================
// KILL / BLACKOUT
// ============================================

export async function killVisuals() {
  return updateVisualState({
    overallIntensity: 0,
    starBrightness: 0,
    colorBrightness: 0,
  }, 1000);
}

// ============================================
// RESET TO COSMOS
// ============================================

export async function resetToCosmos() {
  return loadPreset('COSMOS', 3000);
}
