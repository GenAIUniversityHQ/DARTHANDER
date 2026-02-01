// DARTHANDER Visual Consciousness Engine
// Display Window Component - Standalone visualization for external display

import { useEffect, useRef, useState } from 'react';
import { defaultVisualState } from '../store';

// Socket connection disabled - display syncs only from localStorage

interface VisualState {
  geometryMode: string;
  geometryComplexity: number;
  geometryScale: number;
  colorPalette: string;
  colorBrightness: number;
  colorHueShift: number;
  colorSaturation: number;
  motionSpeed: number;
  motionDirection: string;
  motionTurbulence: number;
  starDensity: number;
  starBrightness: number;
  eclipsePhase: number;
  coronaIntensity: number;
  nebulaPresence: number;
  overallIntensity: number;
  depthMode: string;
  chaosFactor: number;
}

interface VibeLayers {
  [category: string]: string | null;
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
  peakAmplitude: number;
  beatIntensity: number;
  bassImpact: number;
  bassPulse: number;
}

// Audio sensitivity settings (read from visualState)
interface AudioSensitivity {
  bassImpactSensitivity: number;
  bassPulseSensitivity: number;
  audioReactMotion: number;
  audioReactColor: number;
  audioReactGeometry: number;
}

// Color palette definitions
const palettes: Record<string, { bg: string; primary: string; secondary: string }> = {
  cosmos: { bg: '#0a0a1a', primary: '#4a4aff', secondary: '#8a4aff' },
  void: { bg: '#000000', primary: '#1a1a1a', secondary: '#2a2a2a' },
  fire: { bg: '#1a0a00', primary: '#ff4a00', secondary: '#ffaa00' },
  ice: { bg: '#001a2a', primary: '#00aaff', secondary: '#aaffff' },
  earth: { bg: '#0a1a0a', primary: '#4a8a4a', secondary: '#8a6a4a' },
  neon: { bg: '#0a001a', primary: '#ff00ff', secondary: '#00ffff' },
  sacred: { bg: '#1a0a1a', primary: '#ffd700', secondary: '#8a4aff' },
};

// Read initial state from localStorage BEFORE component mounts
// This ensures the display shows current state immediately, not defaults
function getInitialState(): VisualState & AudioSensitivity {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('darthander_state');
      console.log('[DISPLAY] Reading localStorage:', stored ? 'HAS DATA' : 'EMPTY');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[DISPLAY] Parsed state:', {
          intensity: parsed.overallIntensity,
          speed: parsed.motionSpeed,
          mode: parsed.geometryMode
        });
        return parsed;
      }
    } catch (e) {
      console.error('[DISPLAY] Failed to parse state:', e);
    }
  }
  console.log('[DISPLAY] Using DEFAULT state - localStorage was empty!');
  return defaultVisualState as VisualState & AudioSensitivity;
}

function getInitialVibes(): VibeLayers {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('darthander_vibes');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) { }
  }
  return {};
}

export default function DisplayWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const motionOffsetRef = useRef({ x: 0, y: 0 }); // For outward/inward motion
  // Initialize from localStorage IMMEDIATELY (not in useEffect)
  const stateRef = useRef<VisualState & AudioSensitivity>(getInitialState());
  const vibeLayersRef = useRef<VibeLayers>(getInitialVibes());
  const audioStateRef = useRef<AudioState | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'fill' | '16:9'>('fill');
  const [showControls, setShowControls] = useState(true);
  // Initialize debug state from the initial read
  const initialState = stateRef.current;
  const [debugState, setDebugState] = useState({
    intensity: initialState?.overallIntensity ?? 0,
    speed: initialState?.motionSpeed ?? 0,
    mode: initialState?.geometryMode ?? '',
    hasData: !!localStorage.getItem('darthander_state')
  });

  // Load background image from localStorage (shared with main window)
  useEffect(() => {
    const loadBgImage = () => {
      const bgData = localStorage.getItem('darthander_bg');
      if (bgData) {
        const img = new Image();
        img.onload = () => {
          bgImageRef.current = img;
        };
        img.src = bgData;
      } else {
        bgImageRef.current = null;
      }
    };

    loadBgImage();

    // Listen for storage changes from main window
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darthander_bg') {
        loadBgImage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync visual state, vibe layers, and audio state from localStorage
  useEffect(() => {
    let syncCount = 0;
    const syncFromLocalStorage = () => {
      // Sync visual state
      const stateData = localStorage.getItem('darthander_state');
      if (stateData) {
        try {
          const parsed = JSON.parse(stateData);
          stateRef.current = parsed;
          // Log every 60 syncs (~1 second at 60fps)
          syncCount++;
          if (syncCount % 60 === 0) {
            console.log('[DISPLAY SYNC] Current state:', {
              intensity: parsed.overallIntensity,
              speed: parsed.motionSpeed
            });
            // Update debug display
            setDebugState({
              intensity: parsed.overallIntensity,
              speed: parsed.motionSpeed,
              mode: parsed.geometryMode,
              hasData: true
            });
          }
        } catch (e) {
          console.error('Failed to parse state from localStorage');
        }
      } else {
        console.warn('[DISPLAY SYNC] localStorage is EMPTY!');
        setDebugState(prev => ({ ...prev, hasData: false }));
      }
      // Sync vibe layers
      const vibeData = localStorage.getItem('darthander_vibes');
      if (vibeData) {
        try {
          vibeLayersRef.current = JSON.parse(vibeData);
        } catch (e) {
          console.error('Failed to parse vibes from localStorage');
        }
      }
      // Sync audio state (for audio-reactive visuals)
      const audioData = localStorage.getItem('darthander_audio');
      if (audioData) {
        try {
          audioStateRef.current = JSON.parse(audioData);
        } catch (e) {
          // Audio data might not exist, that's OK
        }
      }
    };

    // Initial sync
    syncFromLocalStorage();

    // Poll for changes at 60fps for smooth audio-reactive visuals
    const pollInterval = setInterval(syncFromLocalStorage, 16);

    // Also listen for storage events from same origin but different tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('darthander_')) {
        syncFromLocalStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // DISABLED: Socket connection removed to prevent state conflicts
  // Display window now syncs ONLY from localStorage (written by control panel)
  // This ensures the control panel is the single source of truth
  useEffect(() => {
    console.log('Display window: Using localStorage sync only (socket disabled)');
    // Socket is intentionally not connected
    // All state comes from localStorage polling at 60fps above
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      // CRITICAL: Reset transform before scaling (scale is cumulative!)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      try {
        const state = stateRef.current || defaultVisualState;
        const audio = audioStateRef.current;
        const width = window.innerWidth;
        const height = window.innerHeight;

      // Calculate viewport for 16:9 aspect ratio mode (YouTube format)
      let viewX = 0, viewY = 0, viewW = width, viewH = height;
      if (aspectRatio === '16:9') {
        const targetRatio = 16 / 9;
        const currentRatio = width / height;
        if (currentRatio > targetRatio) {
          viewW = height * targetRatio;
          viewX = (width - viewW) / 2;
        } else {
          viewH = width / targetRatio;
          viewY = (height - viewH) / 2;
        }
      }

      const centerX = viewX + viewW / 2;
      const centerY = viewY + viewH / 2;

      // ============================================
      // AUDIO-REACTIVE VISUAL BOOSTS
      // These add to user's base values for DISPLAY ONLY
      // They do NOT modify the stored slider values
      // ============================================
      const bassImpactSens = (state as any)?.bassImpactSensitivity ?? 0;
      const bassPulseSens = (state as any)?.bassPulseSensitivity ?? 0;
      const audioReactMotion = (state as any)?.audioReactMotion ?? 0;
      const audioReactColor = (state as any)?.audioReactColor ?? 0;
      const audioReactGeo = (state as any)?.audioReactGeometry ?? 0;

      // Calculate audio boosts (only if audio is active)
      let coronaBoost = 0;
      let motionBoost = 0;
      let brightnessBoost = 0;
      let chaosBoost = 0;
      let scaleBoost = 0;

      if (audio) {
        const bassImpact = audio.bassImpact ?? 0;
        const bassPulse = audio.bassPulse ?? 0;
        const beatIntensity = audio.beatIntensity ?? 0;
        const overallAmp = audio.overallAmplitude ?? 0;
        const mid = audio.mid ?? 0;
        const highMid = audio.highMid ?? 0;

        // Corona pulses with bass
        coronaBoost = (bassImpact * bassImpactSens * 0.5 + bassPulse * bassPulseSens * 0.3) * 0.6;

        // Motion responds to energy
        motionBoost = (overallAmp * 0.4 + beatIntensity * 0.4) * audioReactMotion * 0.5;

        // Brightness pulses with mids
        brightnessBoost = (mid * 0.3 + overallAmp * 0.2) * audioReactColor * 0.4;

        // Chaos responds to beats and highs
        chaosBoost = (beatIntensity * 0.3 + highMid * 0.3 + bassImpact * 0.2) * audioReactGeo * 0.5;

        // Scale pulse on heavy bass
        if (bassImpactSens > 0.5 && bassImpact > 0.4) {
          scaleBoost = bassImpact * bassImpactSens * 0.08;
        }
      }

      // Clear entire screen with black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Get current palette
      const palette = state?.colorPalette
        ? palettes[state.colorPalette] || palettes.cosmos
        : palettes.cosmos;

      // Apply audio boost to brightness (VISUAL ONLY)
      const baseBrightness = state?.colorBrightness ?? 0.6;
      const brightness = Math.min(1, baseBrightness + brightnessBoost);
      const intensity = state?.overallIntensity ?? 0.4;
      ctx.fillStyle = palette.bg;
      ctx.fillRect(viewX, viewY, viewW, viewH);

      // Draw background image if set
      if (bgImageRef.current) {
        const img = bgImageRef.current;
        // Cover the viewport while maintaining aspect ratio
        const imgRatio = img.width / img.height;
        const canvasRatio = viewW / viewH;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgRatio > canvasRatio) {
          drawHeight = viewH;
          drawWidth = viewH * imgRatio;
          drawX = viewX + (viewW - drawWidth) / 2;
          drawY = viewY;
        } else {
          drawWidth = viewW;
          drawHeight = viewW / imgRatio;
          drawX = viewX;
          drawY = viewY + (viewH - drawHeight) / 2;
        }

        ctx.globalAlpha = 0.7; // Slight transparency so effects show through
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.globalAlpha = 1.0;
      }

      // ============================================
      // DRAMATIC ECLIPSE RENDERING
      // ============================================
      const eclipsePhase = state?.eclipsePhase ?? 0;
      const baseCoronaIntensity = state?.coronaIntensity ?? 0;
      // Apply audio boost to corona for pulsing effect
      const coronaIntensity = Math.min(1, baseCoronaIntensity + coronaBoost);

      if (eclipsePhase > 0) {
        // Subtle ambient darkening (reduced from 0.9 to let eclipse shine)
        ctx.fillStyle = `rgba(0, 0, 0, ${eclipsePhase * 0.6})`;
        ctx.fillRect(viewX, viewY, viewW, viewH);

        // Eclipse disc size scales with phase - larger for fullscreen
        const maxDiscRadius = Math.min(viewW, viewH) * 0.18;
        const discRadius = maxDiscRadius * Math.min(1, eclipsePhase * 1.2);

        // Only draw eclipse visuals when phase is significant
        if (eclipsePhase > 0.2) {
          ctx.save();
          ctx.translate(centerX, centerY);

          // OUTER CORONA - ethereal glow extending far out
          if (coronaIntensity > 0) {
            const outerCoronaRadius = discRadius * (3.5 + coronaIntensity * 2.5);
            const outerGlow = ctx.createRadialGradient(0, 0, discRadius, 0, 0, outerCoronaRadius);
            outerGlow.addColorStop(0, `rgba(255, 250, 240, ${coronaIntensity * 0.5 * eclipsePhase})`);
            outerGlow.addColorStop(0.15, `rgba(255, 230, 200, ${coronaIntensity * 0.35 * eclipsePhase})`);
            outerGlow.addColorStop(0.4, `rgba(255, 200, 150, ${coronaIntensity * 0.15 * eclipsePhase})`);
            outerGlow.addColorStop(0.7, `rgba(255, 180, 120, ${coronaIntensity * 0.05 * eclipsePhase})`);
            outerGlow.addColorStop(1, 'rgba(255, 150, 80, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, outerCoronaRadius, 0, Math.PI * 2);
            ctx.fill();

            // PLASMA STREAMERS - dynamic tendrils (more for fullscreen)
            const numStreamers = 24;
            for (let i = 0; i < numStreamers; i++) {
              const baseAngle = (i / numStreamers) * Math.PI * 2;
              const wobble = Math.sin(timeRef.current * 0.001 + i * 0.7) * 0.12;
              const angle = baseAngle + wobble;
              const lengthVariation = 0.5 + Math.sin(timeRef.current * 0.0015 + i * 1.3) * 0.5;
              const streamerLength = discRadius * (1.8 + lengthVariation * 1.5) * coronaIntensity;

              const gradient = ctx.createLinearGradient(
                Math.cos(angle) * discRadius * 0.9,
                Math.sin(angle) * discRadius * 0.9,
                Math.cos(angle) * (discRadius + streamerLength),
                Math.sin(angle) * (discRadius + streamerLength)
              );
              gradient.addColorStop(0, `rgba(255, 245, 220, ${coronaIntensity * 0.8 * eclipsePhase})`);
              gradient.addColorStop(0.3, `rgba(255, 210, 140, ${coronaIntensity * 0.5 * eclipsePhase})`);
              gradient.addColorStop(0.6, `rgba(255, 180, 100, ${coronaIntensity * 0.25 * eclipsePhase})`);
              gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');

              ctx.beginPath();
              ctx.moveTo(Math.cos(angle - 0.04) * discRadius * 0.95, Math.sin(angle - 0.04) * discRadius * 0.95);
              ctx.quadraticCurveTo(
                Math.cos(angle + wobble * 0.3) * (discRadius + streamerLength * 0.6),
                Math.sin(angle + wobble * 0.3) * (discRadius + streamerLength * 0.6),
                Math.cos(angle + wobble * 0.5) * (discRadius + streamerLength),
                Math.sin(angle + wobble * 0.5) * (discRadius + streamerLength)
              );
              ctx.quadraticCurveTo(
                Math.cos(angle - wobble * 0.3) * (discRadius + streamerLength * 0.6),
                Math.sin(angle - wobble * 0.3) * (discRadius + streamerLength * 0.6),
                Math.cos(angle + 0.04) * discRadius * 0.95,
                Math.sin(angle + 0.04) * discRadius * 0.95
              );
              ctx.fillStyle = gradient;
              ctx.fill();
            }
          }

          // INNER CORONA RING - bright edge glow (chromosphere)
          const innerCoronaWidth = discRadius * 0.35;
          const innerCorona = ctx.createRadialGradient(0, 0, discRadius - 3, 0, 0, discRadius + innerCoronaWidth);
          innerCorona.addColorStop(0, `rgba(255, 80, 30, ${eclipsePhase * 0.9})`); // Deep chromosphere red
          innerCorona.addColorStop(0.08, `rgba(255, 150, 80, ${eclipsePhase * 0.95})`);
          innerCorona.addColorStop(0.2, `rgba(255, 220, 180, ${eclipsePhase * 0.85})`);
          innerCorona.addColorStop(0.4, `rgba(255, 255, 250, ${eclipsePhase * 0.7})`); // Brilliant white edge
          innerCorona.addColorStop(0.6, `rgba(255, 240, 200, ${eclipsePhase * 0.45})`);
          innerCorona.addColorStop(1, 'rgba(255, 220, 180, 0)');
          ctx.fillStyle = innerCorona;
          ctx.beginPath();
          ctx.arc(0, 0, discRadius + innerCoronaWidth, 0, Math.PI * 2);
          ctx.fill();

          // DIAMOND RING EFFECT - brilliant point during partial phases
          if (eclipsePhase > 0.3 && eclipsePhase < 0.85) {
            const diamondAngle = timeRef.current * 0.0002;
            const diamondX = Math.cos(diamondAngle) * discRadius * 0.92;
            const diamondY = Math.sin(diamondAngle) * discRadius * 0.92;
            const diamondIntensity = Math.sin((eclipsePhase - 0.3) * Math.PI / 0.55) * 0.9;

            // Bright diamond point
            const diamondGlow = ctx.createRadialGradient(diamondX, diamondY, 0, diamondX, diamondY, discRadius * 0.6);
            diamondGlow.addColorStop(0, `rgba(255, 255, 255, ${diamondIntensity})`);
            diamondGlow.addColorStop(0.1, `rgba(255, 255, 240, ${diamondIntensity * 0.8})`);
            diamondGlow.addColorStop(0.3, `rgba(255, 240, 200, ${diamondIntensity * 0.5})`);
            diamondGlow.addColorStop(0.6, `rgba(255, 220, 150, ${diamondIntensity * 0.2})`);
            diamondGlow.addColorStop(1, 'rgba(255, 200, 100, 0)');
            ctx.fillStyle = diamondGlow;
            ctx.beginPath();
            ctx.arc(diamondX, diamondY, discRadius * 0.6, 0, Math.PI * 2);
            ctx.fill();

            // Star burst from diamond
            const burstRays = 6;
            for (let r = 0; r < burstRays; r++) {
              const rayAngle = diamondAngle + (r / burstRays) * Math.PI * 2;
              const rayLength = discRadius * 0.4 * diamondIntensity;
              ctx.beginPath();
              ctx.moveTo(diamondX, diamondY);
              ctx.lineTo(
                diamondX + Math.cos(rayAngle) * rayLength,
                diamondY + Math.sin(rayAngle) * rayLength
              );
              ctx.strokeStyle = `rgba(255, 255, 255, ${diamondIntensity * 0.6})`;
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }

          // THE DARK DISC (Moon) - solid black center
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(0, 0, discRadius, 0, Math.PI * 2);
          ctx.fill();

          // Subtle limb darkening effect on disc edge
          const limbGradient = ctx.createRadialGradient(0, 0, discRadius * 0.7, 0, 0, discRadius);
          limbGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          limbGradient.addColorStop(1, `rgba(20, 10, 5, ${eclipsePhase * 0.3})`);
          ctx.fillStyle = limbGradient;
          ctx.beginPath();
          ctx.arc(0, 0, discRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // Update time and motion (with audio boost for VISUAL ONLY)
      const baseMotionSpeed = state?.motionSpeed ?? 0.1;
      const motionSpeed = Math.min(1, baseMotionSpeed + motionBoost);
      const motionTurbulence = state?.motionTurbulence ?? 0.1;
      const motionDir = state?.motionDirection ?? 'clockwise';

      // Only update time if not "still" - this controls all animation
      if (motionDir !== 'still') {
        timeRef.current += 0.016 * motionSpeed * 60;
      }

      // Update motion offset for outward/inward effects
      if (motionDir === 'outward') {
        motionOffsetRef.current.x += motionSpeed * 0.5;
        if (motionOffsetRef.current.x > 1) motionOffsetRef.current.x = 0;
      } else if (motionDir === 'inward') {
        motionOffsetRef.current.x -= motionSpeed * 0.5;
        if (motionOffsetRef.current.x < 0) motionOffsetRef.current.x = 1;
      }

      // Draw nebula clouds (BEFORE stars so stars appear in front)
      const nebulaPresence = state?.nebulaPresence ?? 0;
      if (nebulaPresence > 0) {
        const numClouds = Math.floor(nebulaPresence * 8 + 2);
        for (let i = 0; i < numClouds; i++) {
          const seed = i * 7654.321;
          const cloudX = viewX + ((Math.sin(seed) + 1) / 2) * viewW;
          const cloudY = viewY + ((Math.cos(seed * 1.5) + 1) / 2) * viewH;
          const cloudSize = 100 + ((Math.sin(seed * 2) + 1) / 2) * 200;
          const pulse = Math.sin(timeRef.current * 0.001 + seed) * 0.2 + 0.8;

          const nebulaGradient = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudSize);
          const hueShift = state?.colorHueShift ?? 0;
          const baseHue = (i * 60 + hueShift * 360) % 360;
          nebulaGradient.addColorStop(0, `hsla(${baseHue}, 80%, 50%, ${nebulaPresence * 0.3 * pulse * (1 - eclipsePhase)})`);
          nebulaGradient.addColorStop(0.5, `hsla(${baseHue + 30}, 70%, 40%, ${nebulaPresence * 0.15 * pulse * (1 - eclipsePhase)})`);
          nebulaGradient.addColorStop(1, 'transparent');

          ctx.fillStyle = nebulaGradient;
          ctx.beginPath();
          ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw stars with motion effects
      const starDensity = state?.starDensity ?? 0.8;
      const starBrightness = state?.starBrightness ?? 0.7;
      const numStars = Math.floor(starDensity * 400); // More stars for fullscreen

      for (let i = 0; i < numStars; i++) {
        const seed = i * 12345.6789;
        let x = viewX + ((Math.sin(seed) + 1) / 2) * viewW;
        let y = viewY + ((Math.cos(seed * 2) + 1) / 2) * viewH;

        // Apply motion based on direction
        if (motionDir === 'outward') {
          // Stars drift outward from center
          const dx = x - centerX;
          const dy = y - centerY;
          const expandFactor = (motionOffsetRef.current.x + (seed % 1)) % 1;
          x = centerX + dx * (0.5 + expandFactor * 0.8);
          y = centerY + dy * (0.5 + expandFactor * 0.8);
        } else if (motionDir === 'inward') {
          // Stars drift inward toward center
          const dx = x - centerX;
          const dy = y - centerY;
          const contractFactor = (1 - motionOffsetRef.current.x + (seed % 1)) % 1;
          x = centerX + dx * (0.2 + contractFactor * 0.8);
          y = centerY + dy * (0.2 + contractFactor * 0.8);
        }

        // Add turbulence
        if (motionTurbulence > 0) {
          x += Math.sin(timeRef.current * 0.002 + seed) * motionTurbulence * 20;
          y += Math.cos(timeRef.current * 0.002 + seed * 1.5) * motionTurbulence * 20;
        }

        const size = ((Math.sin(seed * 3) + 1) / 2) * 2 + 0.5;
        const twinkle = Math.sin(timeRef.current * 0.01 + seed) * 0.3 + 0.7;

        ctx.fillStyle = `rgba(255, 255, 255, ${starBrightness * twinkle * intensity * (1 - eclipsePhase)})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw geometry based on mode (with audio boosts for VISUAL ONLY)
      const geometryMode = state?.geometryMode ?? 'stars';
      const complexity = state?.geometryComplexity ?? 0.2;
      const baseGeometryScale = state?.geometryScale ?? 1.0;
      const baseChaos = state?.chaosFactor ?? 0;

      // Apply audio boosts (VISUAL ONLY - does not affect stored values)
      const geometryScale = Math.min(2, baseGeometryScale + scaleBoost);
      const chaosFactor = Math.min(1, baseChaos + chaosBoost);

      // Rotation based on direction
      let rotation = 0;
      if (motionDir === 'clockwise') rotation = timeRef.current * 0.001;
      else if (motionDir === 'counter') rotation = -timeRef.current * 0.001;

      // Base scale from geometryScale setting
      let scale = geometryScale;

      // Breathing motion adds to scale
      if (motionDir === 'breathing') {
        scale *= 1 + Math.sin(timeRef.current * 0.002) * 0.15;
      }

      // Chaos adds random wobble
      if (chaosFactor > 0) {
        rotation += Math.sin(timeRef.current * 0.005) * chaosFactor * 0.3;
        scale *= 1 + Math.sin(timeRef.current * 0.003) * chaosFactor * 0.1;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Draw based on geometry mode
      if (geometryMode === 'mandala' || geometryMode === 'hexagon') {
        const sides = geometryMode === 'hexagon' ? 6 : Math.floor(complexity * 16 + 4);
        const layers = Math.floor(complexity * 8 + 3); // More layers for fullscreen

        for (let layer = 0; layer < layers; layer++) {
          const radius = (layer + 1) * (Math.min(viewW, viewH) / 2.5 / layers);
          const alpha = intensity * brightness * (1 - layer / layers) * 0.5 * (1 - eclipsePhase);

          ctx.strokeStyle = layer % 2 === 0
            ? `${palette.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
            : `${palette.secondary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 2;

          ctx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (geometryMode === 'spiral') {
        const turns = complexity * 8 + 3;
        const maxRadius = Math.min(viewW, viewH) / 2.2;
        const alpha = intensity * brightness * 0.6 * (1 - eclipsePhase);

        ctx.strokeStyle = `${palette.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let i = 0; i < 360 * turns; i++) {
          const angle = (i / 180) * Math.PI;
          const r = (i / (360 * turns)) * maxRadius;
          const x = Math.cos(angle + timeRef.current * 0.001) * r;
          const y = Math.sin(angle + timeRef.current * 0.001) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (geometryMode === 'tunnel') {
        const rings = Math.floor(complexity * 15 + 8);

        for (let i = 0; i < rings; i++) {
          const t = (i + timeRef.current * 0.002) % 1;
          const radius = t * Math.min(viewW, viewH) / 2;
          const alpha = (1 - t) * intensity * brightness * 0.5 * (1 - eclipsePhase);

          ctx.strokeStyle = `${palette.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (geometryMode === 'fractal') {
        const alpha = intensity * brightness * 0.4 * (1 - eclipsePhase);
        ctx.strokeStyle = `${palette.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;

        const drawBranch = (x: number, y: number, len: number, angle: number, depth: number) => {
          if (depth === 0 || len < 5) return;

          const endX = x + Math.cos(angle) * len;
          const endY = y + Math.sin(angle) * len;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          const branchAngle = 0.4 + complexity * 0.3;
          drawBranch(endX, endY, len * 0.7, angle + branchAngle, depth - 1);
          drawBranch(endX, endY, len * 0.7, angle - branchAngle, depth - 1);
        };

        const depth = Math.floor(complexity * 8 + 4);
        drawBranch(0, 100, 120, -Math.PI / 2, depth);
      }

      ctx.restore();

      // Draw vibe layer effects
      const vibes = vibeLayersRef.current;
      if (vibes && Object.keys(vibes).length > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);

        // SACRED geometry overlays
        if (vibes.SACRED && vibes.SACRED !== 'OFF') {
          const sacredAlpha = intensity * 0.4 * (1 - eclipsePhase);
          ctx.strokeStyle = `rgba(255, 215, 0, ${sacredAlpha})`;
          ctx.lineWidth = 1.5;

          if (vibes.SACRED === 'FLOWER' || vibes.SACRED === 'SEED') {
            // Flower/Seed of Life pattern
            const radius = Math.min(viewW, viewH) * 0.15;
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, radius, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
          } else if (vibes.SACRED === 'METATRON') {
            // Metatron's cube - interconnected circles
            const r = Math.min(viewW, viewH) * 0.12;
            for (let i = 0; i < 13; i++) {
              const angle = i < 6 ? (i / 6) * Math.PI * 2 : ((i - 6) / 6) * Math.PI * 2;
              const dist = i < 6 ? r * 2 : i === 12 ? 0 : r;
              ctx.beginPath();
              ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, r * 0.5, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }

        // COSMIC effects
        if (vibes.COSMIC && vibes.COSMIC !== 'OFF') {
          const cosmicAlpha = intensity * 0.3;
          if (vibes.COSMIC === 'AURORA') {
            for (let i = 0; i < 5; i++) {
              const waveY = Math.sin(timeRef.current * 0.001 + i) * 50;
              const gradient = ctx.createLinearGradient(-viewW / 2, waveY - 30, -viewW / 2, waveY + 30);
              gradient.addColorStop(0, 'transparent');
              gradient.addColorStop(0.5, `rgba(0, 255, 128, ${cosmicAlpha * 0.5})`);
              gradient.addColorStop(1, 'transparent');
              ctx.fillStyle = gradient;
              ctx.fillRect(-viewW / 2, waveY - 30 - viewH * 0.3, viewW, 60);
            }
          } else if (vibes.COSMIC === 'GALAXY') {
            ctx.strokeStyle = `rgba(180, 160, 255, ${cosmicAlpha})`;
            ctx.lineWidth = 2;
            const arms = 4;
            for (let arm = 0; arm < arms; arm++) {
              ctx.beginPath();
              for (let i = 0; i < 200; i++) {
                const angle = (arm / arms) * Math.PI * 2 + (i / 30) + timeRef.current * 0.0003;
                const r = i * 1.5;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r * 0.6;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          }
        }

        // ELEMENT effects
        if (vibes.ELEMENT && vibes.ELEMENT !== 'OFF') {
          const elemAlpha = intensity * 0.25;
          if (vibes.ELEMENT === 'FIRE') {
            for (let i = 0; i < 20; i++) {
              const flameX = (Math.random() - 0.5) * viewW * 0.3;
              const flameY = viewH * 0.3 - Math.random() * 100;
              const flameSize = 20 + Math.random() * 40;
              const gradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize);
              gradient.addColorStop(0, `rgba(255, 200, 50, ${elemAlpha})`);
              gradient.addColorStop(0.5, `rgba(255, 100, 0, ${elemAlpha * 0.5})`);
              gradient.addColorStop(1, 'transparent');
              ctx.fillStyle = gradient;
              ctx.fillRect(flameX - flameSize, flameY - flameSize, flameSize * 2, flameSize * 2);
            }
          } else if (vibes.ELEMENT === 'WATER') {
            ctx.strokeStyle = `rgba(0, 150, 255, ${elemAlpha})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
              ctx.beginPath();
              for (let x = -viewW / 2; x < viewW / 2; x += 10) {
                const waveY = Math.sin(x * 0.02 + timeRef.current * 0.002 + i) * 20 + i * 30;
                if (x === -viewW / 2) ctx.moveTo(x, waveY);
                else ctx.lineTo(x, waveY);
              }
              ctx.stroke();
            }
          }
        }

        ctx.restore();
      }

      // Draw letterbox bars for 16:9 mode
      if (aspectRatio === '16:9') {
        ctx.fillStyle = '#000000';
        if (viewX > 0) {
          ctx.fillRect(0, 0, viewX, height);
          ctx.fillRect(viewX + viewW, 0, viewX, height);
        }
        if (viewY > 0) {
          ctx.fillRect(0, 0, width, viewY);
          ctx.fillRect(0, viewY + viewH, width, viewY);
        }
      }

      } catch (error) {
        console.error('Display draw error (continuing):', error);
      }

      // ALWAYS request next frame, even if draw had an error
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [aspectRatio]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }
      if (e.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
      }
      if (e.key === 'a' || e.key === 'A') {
        setAspectRatio(prev => prev === 'fill' ? '16:9' : 'fill');
      }
      if (e.key === 'h' || e.key === 'H') {
        setShowControls(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    timeout = setTimeout(() => setShowControls(false), 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#000',
      cursor: showControls ? 'default' : 'none'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      {/* Controls overlay */}
      <div
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '11px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
          textAlign: 'right',
        }}
      >
        <div style={{ marginBottom: '4px', color: aspectRatio === '16:9' ? '#a855f7' : 'inherit' }}>
          [A] Aspect: {aspectRatio}
        </div>
        <div>[F] Fullscreen</div>
        <div>[H] Hide controls</div>
      </div>

      {/* Status indicator with DEBUG info */}
      <div
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '10px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
          background: 'rgba(0,0,0,0.7)',
          padding: '8px',
          borderRadius: '4px',
        }}
      >
        <div style={{ marginBottom: '4px', color: debugState.hasData ? '#4ade80' : '#f87171' }}>
          DARTHANDER DISPLAY {debugState.hasData ? '(SYNCED)' : '(NO DATA!)'}
        </div>
        <div>Intensity: {(debugState.intensity * 100).toFixed(0)}%</div>
        <div>Speed: {(debugState.speed * 100).toFixed(0)}%</div>
        <div>Mode: {debugState.mode || 'unknown'}</div>
        <div style={{ marginTop: '4px', fontSize: '9px', color: '#888' }}>
          [D] Toggle debug
        </div>
      </div>
    </div>
  );
}
