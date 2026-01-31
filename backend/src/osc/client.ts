// DARTHANDER Visual Consciousness Engine
// OSC Client for TouchDesigner Communication

import { Client } from 'node-osc';

let oscClient: Client | null = null;

// ============================================
// INITIALIZE OSC CONNECTION
// ============================================

export function initializeOSC() {
  const host = process.env.OSC_HOST || '127.0.0.1';
  const port = parseInt(process.env.OSC_PORT || '9000', 10);

  try {
    oscClient = new Client(host, port);
    console.log(`  OSC client connected to ${host}:${port}`);
  } catch (error) {
    console.error('Failed to initialize OSC client:', error);
  }
}

// ============================================
// SEND OSC MESSAGE
// ============================================

export function sendOSC(address: string, ...args: any[]) {
  if (!oscClient) {
    console.warn('OSC client not initialized');
    return;
  }

  try {
    oscClient.send(address, ...args);
  } catch (error) {
    console.error('OSC send error:', error);
  }
}

// ============================================
// SEND FULL STATE UPDATE
// ============================================

export function sendOSCUpdate(state: any) {
  if (!oscClient) return;

  // Send each parameter as individual OSC message
  // TouchDesigner receives these on corresponding channels
  
  // Geometry
  sendOSC('/darthander/geometry/mode', state.geometryMode);
  sendOSC('/darthander/geometry/complexity', state.geometryComplexity);
  sendOSC('/darthander/geometry/scale', state.geometryScale);
  sendOSC('/darthander/geometry/rotation', state.geometryRotation);
  sendOSC('/darthander/geometry/symmetry', state.geometrySymmetry);

  // Color
  sendOSC('/darthander/color/palette', state.colorPalette);
  sendOSC('/darthander/color/saturation', state.colorSaturation);
  sendOSC('/darthander/color/brightness', state.colorBrightness);
  sendOSC('/darthander/color/shiftSpeed', state.colorShiftSpeed);

  // Motion
  sendOSC('/darthander/motion/direction', state.motionDirection);
  sendOSC('/darthander/motion/speed', state.motionSpeed);
  sendOSC('/darthander/motion/turbulence', state.motionTurbulence);

  // Depth
  sendOSC('/darthander/depth/mode', state.depthMode);
  sendOSC('/darthander/depth/focalPoint', state.depthFocalPoint);
  sendOSC('/darthander/depth/parallax', state.depthParallax);

  // Environment
  sendOSC('/darthander/env/starDensity', state.starDensity);
  sendOSC('/darthander/env/starBrightness', state.starBrightness);
  sendOSC('/darthander/env/eclipsePhase', state.eclipsePhase);
  sendOSC('/darthander/env/coronaIntensity', state.coronaIntensity);
  sendOSC('/darthander/env/nebulaPresence', state.nebulaPresence);

  // Energy
  sendOSC('/darthander/energy/intensity', state.overallIntensity);
  sendOSC('/darthander/energy/chaos', state.chaosFactor);

  // Audio Reactivity
  sendOSC('/darthander/audio/reactGeometry', state.audioReactGeometry);
  sendOSC('/darthander/audio/reactColor', state.audioReactColor);
  sendOSC('/darthander/audio/reactMotion', state.audioReactMotion);
  sendOSC('/darthander/audio/reactScale', state.audioReactScale);

  // Meta
  sendOSC('/darthander/phase', state.currentPhase);
  sendOSC('/darthander/transition', state.transitionDuration);
}

// ============================================
// SEND PRESET TRIGGER
// ============================================

export function sendOSCPreset(presetName: string) {
  sendOSC('/darthander/preset', presetName);
}

// ============================================
// SEND SYSTEM COMMANDS
// ============================================

export function sendOSCCommand(command: string) {
  sendOSC('/darthander/command', command);
}

// ============================================
// SEND AUDIO DATA
// ============================================

export function sendOSCAudio(audioData: {
  subBass?: number;
  bass?: number;
  lowMid?: number;
  mid?: number;
  highMid?: number;
  presence?: number;
  brilliance?: number;
  amplitude?: number;
  bpm?: number;
  beatIntensity?: number;
}) {
  if (audioData.subBass !== undefined) sendOSC('/darthander/audio/subBass', audioData.subBass);
  if (audioData.bass !== undefined) sendOSC('/darthander/audio/bass', audioData.bass);
  if (audioData.lowMid !== undefined) sendOSC('/darthander/audio/lowMid', audioData.lowMid);
  if (audioData.mid !== undefined) sendOSC('/darthander/audio/mid', audioData.mid);
  if (audioData.highMid !== undefined) sendOSC('/darthander/audio/highMid', audioData.highMid);
  if (audioData.presence !== undefined) sendOSC('/darthander/audio/presence', audioData.presence);
  if (audioData.brilliance !== undefined) sendOSC('/darthander/audio/brilliance', audioData.brilliance);
  if (audioData.amplitude !== undefined) sendOSC('/darthander/audio/amplitude', audioData.amplitude);
  if (audioData.bpm !== undefined) sendOSC('/darthander/audio/bpm', audioData.bpm);
  if (audioData.beatIntensity !== undefined) sendOSC('/darthander/audio/beatIntensity', audioData.beatIntensity);
}

// ============================================
// CLOSE CONNECTION
// ============================================

export function closeOSC() {
  if (oscClient) {
    oscClient.close();
    oscClient = null;
  }
}
