// DARTHANDER Visual Consciousness Engine
// Preview Monitor Component - Audio-reactive visual canvas with layered geometry

import { useEffect, useRef } from 'react';
import { useStore } from '../store';

interface VisualState {
  geometryMode: string;
  geometryComplexity: number;
  geometryLayer2?: string;
  geometryLayer3?: string;
  geometryLayer4?: string;
  colorPalette: string;
  colorBrightness: number;
  colorSaturation: number;
  motionSpeed: number;
  motionDirection: string;
  starDensity: number;
  starBrightness: number;
  eclipsePhase: number;
  coronaIntensity: number;
  overallIntensity: number;
  depthMode: string;
  chaosFactor: number;
  bassImpact?: number;
  audioReactGeometry: number;
  audioReactColor: number;
  audioReactMotion: number;
  backgroundHue?: number;  // 0-360, shifts background color hue
}

interface PreviewMonitorProps {
  state: VisualState | null;
  canvasId?: string;
}

// Color palettes - expanded with full spectrum
const palettes: Record<string, { bg: string; colors: string[] }> = {
  // Original
  cosmos: { bg: '#050510', colors: ['#8B5CF6', '#EC4899', '#06B6D4', '#3B82F6'] },
  void: { bg: '#000000', colors: ['#1a1a2e', '#16213e', '#0f3460', '#1a1a2e'] },
  fire: { bg: '#0a0000', colors: ['#ff4500', '#ff6b35', '#f7931e', '#ffcc00'] },
  ice: { bg: '#000a14', colors: ['#00d4ff', '#7fdbff', '#39cccc', '#01ff70'] },
  earth: { bg: '#0a0f0a', colors: ['#2ecc71', '#27ae60', '#f39c12', '#e67e22'] },
  neon: { bg: '#05000a', colors: ['#ff00ff', '#00ffff', '#ff0080', '#80ff00'] },
  sacred: { bg: '#0f0a14', colors: ['#ffd700', '#8B5CF6', '#ff69b4', '#00ced1'] },
  ocean: { bg: '#000814', colors: ['#00b4d8', '#0077b6', '#90e0ef', '#48cae4', '#023e8a'] },
  sunset: { bg: '#0a0505', colors: ['#ff6b6b', '#feca57', '#ff9f43', '#ee5a24', '#f368e0'] },
  // NEW: Full spectrum rainbow
  spectrum: { bg: '#050505', colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'] },
  rainbow: { bg: '#000000', colors: ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#00b0ff', '#d500f9', '#f50057'] },
  // NEW: Light / Bright palettes
  light: { bg: '#0a0a14', colors: ['#ffffff', '#f0f0ff', '#e0e0ff', '#d0d0ff', '#c0c0ff'] },
  ethereal: { bg: '#050510', colors: ['#e8d5ff', '#d5e8ff', '#ffe8d5', '#d5ffe8', '#ffd5e8'] },
  pastel: { bg: '#08080f', colors: ['#ffb3ba', '#bae1ff', '#baffc9', '#ffffba', '#ffdfba'] },
  // NEW: Ice / Cold variations
  glacier: { bg: '#000510', colors: ['#b3e5fc', '#4fc3f7', '#03a9f4', '#0288d1', '#01579b'] },
  arctic: { bg: '#000814', colors: ['#e1f5fe', '#b3e5fc', '#81d4fa', '#4fc3f7', '#29b6f6'] },
  frost: { bg: '#000a0f', colors: ['#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da'] },
  // NEW: Dark red / purple prism
  bloodmoon: { bg: '#0a0000', colors: ['#4a0000', '#6b0000', '#8b0000', '#b20000', '#d40000'] },
  darkprism: { bg: '#0a000a', colors: ['#4a004a', '#6b006b', '#8b008b', '#9400d3', '#ba55d3'] },
  crimson: { bg: '#050005', colors: ['#8b0000', '#9b111e', '#722f37', '#dc143c', '#ff1493'] },
  amethyst: { bg: '#050010', colors: ['#4b0082', '#6a0dad', '#8b008b', '#9932cc', '#ba55d3'] },
  obsidian: { bg: '#000000', colors: ['#1a0a1a', '#2a0a2a', '#3a0a3a', '#4a0a4a', '#5a0a5a'] },
  // NEW: Black and white / Monochrome
  monochrome: { bg: '#000000', colors: ['#ffffff', '#cccccc', '#999999', '#666666', '#333333'] },
  noir: { bg: '#000000', colors: ['#f5f5f5', '#e0e0e0', '#9e9e9e', '#616161', '#212121'] },
  silver: { bg: '#050505', colors: ['#c0c0c0', '#a9a9a9', '#808080', '#696969', '#d3d3d3'] },
  // NEW: Mystical / Ancient
  ancient: { bg: '#0a0805', colors: ['#d4af37', '#c5a028', '#b8860b', '#daa520', '#ffd700'] },
  mystic: { bg: '#0a050f', colors: ['#9370db', '#8a2be2', '#9400d3', '#8b008b', '#4b0082'] },
  alchemical: { bg: '#050500', colors: ['#ffd700', '#c0c0c0', '#cd7f32', '#b87333', '#8b4513'] },
};

// Helper function to convert HSL to RGB string
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = h / 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// Get background colors based on hue (0-360)
function getBackgroundColors(hue: number) {
  // Dark base color
  const baseDark = hslToRgb(hue, 0.5, 0.04);
  // Primary glow color (more saturated)
  const glowPrimary = hslToRgb(hue, 0.7, 0.66);
  // Secondary glow (shifted hue for depth)
  const glowSecondary = hslToRgb((hue + 60) % 360, 0.75, 0.6);
  return { baseDark, glowPrimary, glowSecondary };
}

// Flow state for dancer-like movement
interface FlowState {
  energy: number;          // Accumulated energy from beats
  momentum: { x: number; y: number };  // Current movement momentum
  rotation: number;        // Current rotation velocity
  scale: number;           // Current scale momentum
  sway: number;            // Side-to-side sway phase
  bounce: number;          // Up-down bounce phase
  lean: number;            // Leaning direction (-1 to 1)
  lastBass: number;        // Previous frame bass for detecting hits
  beatHistory: number[];   // Recent beat intensities for pattern detection
  anticipation: number;    // Pre-movement before beats
}

export function PreviewMonitor({ state, canvasId }: PreviewMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{x: number; y: number; vx: number; vy: number; size: number; hue: number}>>([]);

  // Flow state for dancer-like adaptive movement
  const flowRef = useRef<FlowState>({
    energy: 0,
    momentum: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
    sway: 0,
    bounce: 0,
    lean: 0,
    lastBass: 0,
    beatHistory: [],
    anticipation: 0,
  });

  const audioState = useStore((s) => s.audioState);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push({
          x: Math.random() * 800,
          y: Math.random() * 600,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1,
          hue: Math.random() * 360,
        });
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // Audio values with bass impact multiplier
      const bassImpact = state?.bassImpact ?? 0.5;
      const rawBass = audioState?.bass || 0;
      const bass = rawBass * (1 + bassImpact * 2); // Bass impact amplifies bass
      const mid = audioState?.mid || 0;
      const high = audioState?.presence || 0;
      const overall = audioState?.overallAmplitude || 0;
      const beat = (audioState?.beatIntensity || 0) * (1 + bassImpact);

      // Get base palette and apply color modifications
      const basePalette = palettes[state?.colorPalette || 'cosmos'] || palettes.cosmos;
      const hueShift = (state as any)?.colorHueShift ?? 0;
      const satMod = (state as any)?.colorSaturation ?? 0.5;
      const brightMod = (state as any)?.colorBrightness ?? 0.5;

      // Apply hue shift and saturation/brightness to palette colors
      const palette = {
        bg: basePalette.bg,
        colors: basePalette.colors.map(color => {
          // Convert hex to HSL, shift, convert back
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) / 255;
          const g = parseInt(hex.substr(2, 2), 16) / 255;
          const b = parseInt(hex.substr(4, 2), 16) / 255;

          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          let h = 0, s = 0, l = (max + min) / 2;

          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b - r) / d + 2) / 6;
            else h = ((r - g) / d + 4) / 6;
          }

          // Apply modifications
          h = (h + hueShift) % 1;
          s = Math.min(1, s * (satMod * 2)); // satMod 0.5 = normal
          l = Math.min(1, Math.max(0, l * (brightMod * 2))); // brightMod 0.5 = normal

          // HSL to RGB
          const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };

          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          const newR = Math.round(hue2rgb(p, q, h + 1/3) * 255);
          const newG = Math.round(hue2rgb(p, q, h) * 255);
          const newB = Math.round(hue2rgb(p, q, h - 1/3) * 255);

          return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        })
      };

      const intensity = state?.overallIntensity ?? 0.5;
      const complexity = state?.geometryComplexity ?? 0.3;
      const motionSpeed = state?.motionSpeed ?? 0.2;
      const geometryMode = state?.geometryMode ?? 'stars';
      const chaos = state?.chaosFactor ?? 0;
      const audioReact = state?.audioReactGeometry ?? 0.5;
      const bgHue = state?.backgroundHue ?? 270; // Default purple

      timeRef.current += 16 * motionSpeed;

      // Get hue-shifted background colors
      const bgColors = getBackgroundColors(bgHue);

      // Clear with hue-shifted dark color
      ctx.fillStyle = `rgba(${bgColors.baseDark.r}, ${bgColors.baseDark.g}, ${bgColors.baseDark.b}, ${0.15 + bass * 0.1})`;
      ctx.fillRect(0, 0, width, height);

      // Background glow with hue-shifted colors
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, height * 0.8);
      bgGlow.addColorStop(0, `rgba(${bgColors.glowPrimary.r}, ${bgColors.glowPrimary.g}, ${bgColors.glowPrimary.b}, ${0.1 + bass * 0.4 * intensity})`);
      bgGlow.addColorStop(0.5, `rgba(${bgColors.glowSecondary.r}, ${bgColors.glowSecondary.g}, ${bgColors.glowSecondary.b}, ${0.05 + mid * 0.2 * intensity})`);
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(centerX, centerY);

      const motionDir = state?.motionDirection ?? 'clockwise';
      let rotation = timeRef.current * 0.0005;
      let breathScale = 1 + bass * 0.2 * audioReact;
      let offsetX = 0;
      let offsetY = 0;

      // === FLOW MODE - Dancer-like adaptive movement ===
      if (motionDir === 'flow') {
        const flow = flowRef.current;
        const dt = 0.016; // ~60fps frame time

        // Detect beat hits (bass spike)
        const bassHit = bass > flow.lastBass + 0.15 && bass > 0.3;
        flow.lastBass = bass;

        // Track beat history for pattern detection
        flow.beatHistory.push(beat);
        if (flow.beatHistory.length > 30) flow.beatHistory.shift();

        // Calculate average beat intensity for anticipation
        const avgBeat = flow.beatHistory.reduce((a, b) => a + b, 0) / Math.max(flow.beatHistory.length, 1);

        // === ENERGY SYSTEM - Like a dancer building up and releasing ===
        // Energy builds on beats, decays smoothly
        if (bassHit) {
          flow.energy = Math.min(flow.energy + bass * 0.8, 2);
          // Random lean direction on hit (like a dancer shifting weight)
          flow.lean += (Math.random() - 0.5) * bass * 2;
        }
        flow.energy *= 0.98; // Smooth decay
        flow.lean *= 0.95; // Lean returns to center
        flow.lean = Math.max(-1, Math.min(1, flow.lean));

        // === MOMENTUM - Smooth follow-through like a dancer ===
        // Add impulse on beats
        if (bassHit) {
          flow.momentum.x += (Math.random() - 0.5) * bass * 40;
          flow.momentum.y += (Math.random() - 0.5) * bass * 40;
          flow.rotation += (Math.random() - 0.5) * bass * 0.1;
        }
        // Apply friction (dancers have smooth deceleration)
        flow.momentum.x *= 0.92;
        flow.momentum.y *= 0.92;
        flow.rotation *= 0.95;

        // === SWAY - Side-to-side body movement ===
        // Sway speed increases with energy, like dancing harder
        flow.sway += dt * (2 + flow.energy * 3 + mid * 2);
        const swayAmount = Math.sin(flow.sway) * (20 + flow.energy * 30) * audioReact;

        // === BOUNCE - Up-down movement synced to beat ===
        flow.bounce += dt * (3 + bass * 5);
        const bounceAmount = Math.abs(Math.sin(flow.bounce)) * (10 + flow.energy * 25) * audioReact;

        // === ANTICIPATION - Slight pre-movement before expected beats ===
        // Creates that "feeling the beat" effect dancers have
        flow.anticipation = avgBeat * 0.3 * Math.sin(timeRef.current * 0.008);

        // === SCALE BREATHING - Organic expansion/contraction ===
        const targetScale = 1 + flow.energy * 0.15 + bass * 0.2 * audioReact;
        flow.scale += (targetScale - flow.scale) * 0.1; // Smooth interpolation

        // Apply all flow transformations
        offsetX = flow.momentum.x + swayAmount + flow.lean * 30;
        offsetY = flow.momentum.y - bounceAmount + flow.anticipation * 20;
        rotation = flow.rotation + Math.sin(flow.sway * 0.5) * 0.05 * (1 + flow.energy);
        breathScale = flow.scale;

        // Slight skew for organic feel (like a dancer's body isn't perfectly rigid)
        const skewX = flow.lean * 0.03;
        const skewY = Math.sin(flow.sway) * 0.02 * flow.energy;
        ctx.transform(1, skewY, skewX, 1, 0, 0);

      } else {
        // Standard motion modes
        if (motionDir === 'counter') rotation = -rotation;
        if (motionDir === 'breathing' || motionDir === 'still') rotation = 0;

        if (motionDir === 'breathing') {
          breathScale = 1 + Math.sin(timeRef.current * 0.002) * 0.1 + bass * 0.25 * audioReact;
        }
      }

      ctx.translate(offsetX, offsetY);
      ctx.rotate(rotation);
      ctx.scale(breathScale, breathScale);

      // === BASE GEOMETRY ===
      drawGeometry(ctx, geometryMode, width, height, bass, mid, high, beat, overall, intensity, complexity, chaos, audioReact, palette, timeRef.current, particlesRef.current);

      // === SACRED LAYER ===
      const layer2 = state?.geometryLayer2;
      if (layer2 && layer2 !== 'none') {
        ctx.globalAlpha = 0.6;
        drawSacredGeometry(ctx, layer2, width, height, bass, mid, beat, intensity, palette, timeRef.current);
        ctx.globalAlpha = 1;
      }

      // === QUANTUM LAYER ===
      const layer3 = state?.geometryLayer3;
      if (layer3 && layer3 !== 'none') {
        ctx.globalAlpha = 0.5;
        drawQuantumLayer(ctx, layer3, width, height, bass, mid, high, beat, intensity, palette, timeRef.current);
        ctx.globalAlpha = 1;
      }

      // === COSMIC LAYER ===
      const layer4 = (state as any)?.geometryLayer4;
      if (layer4 && layer4 !== 'none') {
        ctx.globalAlpha = 0.4;
        drawCosmicLayer(ctx, layer4, width, height, bass, mid, beat, intensity, palette, timeRef.current);
        ctx.globalAlpha = 1;
      }

      // === LIFEFORCE LAYER ===
      const layer5 = (state as any)?.geometryLayer5;
      if (layer5 && layer5 !== 'none') {
        ctx.globalAlpha = 0.5;
        drawLifeforceLayer(ctx, layer5, width, height, bass, mid, beat, timeRef.current, palette);
        ctx.globalAlpha = 1;
      }

      // === ANCIENT WISDOM LAYER ===
      const layer6 = (state as any)?.geometryLayer6;
      if (layer6 && layer6 !== 'none') {
        ctx.globalAlpha = 0.6;
        drawAncientLayer(ctx, layer6, width, height, bass, beat, timeRef.current, palette);
        ctx.globalAlpha = 1;
      }

      // === DIMENSIONAL LAYER (4D+) ===
      const layer7 = (state as any)?.geometryLayer7;
      if (layer7 && layer7 !== 'none') {
        ctx.globalAlpha = 0.6;
        drawDimensionalLayer(ctx, layer7, width, height, bass, beat, timeRef.current, palette);
        ctx.globalAlpha = 1;
      }

      // === CONSCIOUSNESS LAYER ===
      const layer8 = (state as any)?.geometryLayer8;
      if (layer8 && layer8 !== 'none') {
        ctx.globalAlpha = 0.6;
        drawConsciousnessLayer(ctx, layer8, width, height, bass, beat, timeRef.current, palette);
        ctx.globalAlpha = 1;
      }

      // === 5D LAYER ===
      const layer9 = (state as any)?.geometryLayer9;
      if (layer9 && layer9 !== 'none') {
        ctx.globalAlpha = 0.5;
        draw5DLayer(ctx, layer9, width, height, bass, beat, timeRef.current, palette);
        ctx.globalAlpha = 1;
      }

      // === 6D+ LAYER ===
      const layer10 = (state as any)?.geometryLayer10;
      if (layer10 && layer10 !== 'none') {
        ctx.globalAlpha = 0.5;
        draw6DLayer(ctx, layer10, width, height, bass, beat, timeRef.current, palette);
        ctx.globalAlpha = 1;
      }

      // === FRACTAL LAYER ===
      const layer11 = (state as any)?.geometryLayer11;
      if (layer11 && layer11 !== 'none') {
        ctx.globalAlpha = 0.6;
        drawFractalLayer(ctx, layer11, width, height, bass, beat, timeRef.current, palette);
        ctx.globalAlpha = 1;
      }

      // === CHAOS/ATTRACTOR LAYER ===
      const layer12 = (state as any)?.geometryLayer12;
      if (layer12 && layer12 !== 'none') {
        ctx.globalAlpha = 0.5;
        drawChaosLayer(ctx, layer12, width, height, bass, beat, timeRef.current, palette);
        ctx.globalAlpha = 1;
      }

      // === REALITY LAYER ===
      const layer13 = (state as any)?.geometryLayer13;
      if (layer13 && layer13 !== 'none') {
        ctx.globalAlpha = 0.6;
        drawRealityLayer(ctx, layer13, width, height, bass, beat, timeRef.current, palette);
        ctx.globalAlpha = 1;
      }

      // === PARADOX/IMPOSSIBLE LAYER ===
      const layer14 = (state as any)?.geometryLayer14;
      if (layer14 && layer14 !== 'none') {
        ctx.globalAlpha = 0.6;
        drawParadoxLayer(ctx, layer14, width, height, bass, beat, timeRef.current, palette);
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      // === ECLIPSE - Audio-reactive with awe-inspiring corona ===
      const baseEclipse = state?.eclipsePhase ?? 0;
      const coronaBase = state?.coronaIntensity ?? 0;

      if (baseEclipse > 0) {
        // Eclipse darkness deepens with overall audio intensity
        const eclipseDepth = baseEclipse * (0.6 + overall * 0.4);
        ctx.fillStyle = `rgba(0, 0, 0, ${eclipseDepth * 0.85})`;
        ctx.fillRect(0, 0, width, height);

        // Corona effect - builds with music intensity
        if (coronaBase > 0) {
          const coronaPulse = coronaBase * (0.5 + bass * 0.5 + beat * 0.3);
          const coronaSize = 80 + coronaBase * 120 + bass * 80 + beat * 60;

          // Outer ethereal glow - subtle and expansive
          const outerGlow = ctx.createRadialGradient(centerX, centerY, coronaSize * 0.3, centerX, centerY, coronaSize * 2);
          outerGlow.addColorStop(0, `rgba(139, 92, 246, ${coronaPulse * 0.15})`);
          outerGlow.addColorStop(0.3, `rgba(236, 72, 153, ${coronaPulse * 0.1})`);
          outerGlow.addColorStop(0.6, `rgba(6, 182, 212, ${coronaPulse * 0.05})`);
          outerGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = outerGlow;
          ctx.fillRect(0, 0, width, height);

          // Corona rays - emanate on beats
          if (beat > 0.2) {
            const rayCount = 12;
            for (let i = 0; i < rayCount; i++) {
              const angle = (i / rayCount) * Math.PI * 2 + timeRef.current * 0.0002;
              const rayLength = coronaSize * (0.8 + beat * 1.5);
              const rayWidth = 2 + beat * 4;

              ctx.save();
              ctx.translate(centerX, centerY);
              ctx.rotate(angle);

              const rayGrad = ctx.createLinearGradient(30, 0, rayLength, 0);
              rayGrad.addColorStop(0, `rgba(255, 200, 100, ${beat * coronaBase * 0.4})`);
              rayGrad.addColorStop(0.5, `rgba(255, 150, 50, ${beat * coronaBase * 0.2})`);
              rayGrad.addColorStop(1, 'transparent');

              ctx.beginPath();
              ctx.moveTo(30, -rayWidth/2);
              ctx.lineTo(rayLength, 0);
              ctx.lineTo(30, rayWidth/2);
              ctx.closePath();
              ctx.fillStyle = rayGrad;
              ctx.fill();
              ctx.restore();
            }
          }

          // Inner corona - warm golden glow
          const innerCorona = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, coronaSize);
          innerCorona.addColorStop(0, `rgba(255, 220, 150, ${coronaPulse * 0.6})`);
          innerCorona.addColorStop(0.2, `rgba(255, 180, 100, ${coronaPulse * 0.4})`);
          innerCorona.addColorStop(0.5, `rgba(255, 120, 50, ${coronaPulse * 0.2})`);
          innerCorona.addColorStop(1, 'transparent');
          ctx.fillStyle = innerCorona;
          ctx.fillRect(0, 0, width, height);

          // Central dark disc (the moon)
          const discSize = 25 + baseEclipse * 15;
          ctx.beginPath();
          ctx.arc(centerX, centerY, discSize, 0, Math.PI * 2);
          ctx.fillStyle = '#000000';
          ctx.fill();

          // Subtle rim light on the disc edge
          ctx.beginPath();
          ctx.arc(centerX, centerY, discSize, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 200, 150, ${coronaPulse * 0.3})`;
          ctx.lineWidth = 1 + beat;
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [state, audioState]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10">
      <canvas ref={canvasRef} id={canvasId} className="w-full h-full" style={{ background: '#050510' }} />
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-[9px] font-mono text-white/50">
        {state?.geometryMode || 'stars'}
        {state?.geometryLayer2 && state.geometryLayer2 !== 'none' && ` + ${state.geometryLayer2}`}
        {state?.geometryLayer3 && state.geometryLayer3 !== 'none' && ` + ${state.geometryLayer3}`}
        {(state as any)?.geometryLayer4 && (state as any).geometryLayer4 !== 'none' && ` + ${(state as any).geometryLayer4}`}
      </div>
    </div>
  );
}

// Draw base geometry
function drawGeometry(ctx: CanvasRenderingContext2D, mode: string, w: number, h: number, bass: number, mid: number, _high: number, beat: number, overall: number, intensity: number, complexity: number, chaos: number, audioReact: number, palette: {colors: string[]}, time: number, particles: any[]) {
  if (mode === 'stars' || mode === 'cosmos') {
    particles.forEach((p, i) => {
      p.x += p.vx * (1 + bass * audioReact * 3);
      p.y += p.vy * (1 + bass * audioReact * 3);
      if (p.x < -w/2) p.x = w/2;
      if (p.x > w/2) p.x = -w/2;
      if (p.y < -h/2) p.y = h/2;
      if (p.y > h/2) p.y = -h/2;
      const size = p.size * (1 + beat * 2 * audioReact);
      const alpha = Math.floor((0.3 + overall * 0.7) * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length] + alpha;
      ctx.fill();
    });
  }

  if (mode === 'mandala' || mode === 'hexagon') {
    const sides = mode === 'hexagon' ? 6 : Math.floor(complexity * 12 + 6);
    const layers = Math.floor(complexity * 8 + 4);
    for (let layer = 0; layer < layers; layer++) {
      const radius = (layer + 1) * (Math.min(w, h) * 0.35 / layers) * (1 + bass * 0.3 * audioReact);
      const alpha = Math.floor(intensity * (1 - layer / layers * 0.5) * 200).toString(16).padStart(2, '0');
      ctx.strokeStyle = palette.colors[layer % palette.colors.length] + alpha;
      ctx.lineWidth = 1 + beat * 2;
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + time * 0.001 * (layer % 2 ? 1 : -1);
        const wobble = Math.sin(time * 0.005 + layer) * chaos * 20;
        const x = Math.cos(angle) * (radius + wobble);
        const y = Math.sin(angle) * (radius + wobble);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  if (mode === 'tunnel' || mode === 'portal') {
    const rings = Math.floor(complexity * 15 + 8);
    for (let i = 0; i < rings; i++) {
      const t = ((i / rings) + time * 0.001) % 1;
      const radius = t * Math.min(w, h) * 0.5 * (1 + bass * 0.2 * audioReact);
      const alpha = Math.floor((1 - t) * intensity * 200).toString(16).padStart(2, '0');
      ctx.strokeStyle = palette.colors[i % palette.colors.length] + alpha;
      ctx.lineWidth = 2 + mid * 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (mode === 'spiral') {
    const maxRadius = Math.min(w, h) * 0.4;
    for (let arm = 0; arm < 3; arm++) {
      ctx.beginPath();
      ctx.strokeStyle = palette.colors[arm % palette.colors.length] + 'cc';
      ctx.lineWidth = 2 + bass * 3;
      for (let i = 0; i < 360 * 4; i += 3) {
        const angle = (i / 180) * Math.PI + (arm * Math.PI * 2 / 3);
        const r = (i / (360 * 4)) * maxRadius * (1 + mid * 0.3 * audioReact);
        const x = Math.cos(angle + time * 0.002) * r;
        const y = Math.sin(angle + time * 0.002) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  if (mode === 'fractal') {
    const drawBranch = (x: number, y: number, len: number, angle: number, depth: number) => {
      if (depth === 0 || len < 3) return;
      const endX = x + Math.cos(angle) * len * (1 + bass * 0.3);
      const endY = y + Math.sin(angle) * len * (1 + bass * 0.3);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = palette.colors[depth % palette.colors.length] + '99';
      ctx.lineWidth = depth * 0.5 + beat;
      ctx.stroke();
      const branchAngle = 0.5 + complexity * 0.3;
      drawBranch(endX, endY, len * 0.7, angle + branchAngle, depth - 1);
      drawBranch(endX, endY, len * 0.7, angle - branchAngle, depth - 1);
    };
    drawBranch(0, h * 0.3, 50 + bass * 30, -Math.PI / 2, Math.floor(complexity * 5 + 4));
  }

  if (mode === 'void') {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + bass * 0.3})`;
    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 + beat * 0.4})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 50 + bass * 100, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Draw sacred geometry overlay
function drawSacredGeometry(ctx: CanvasRenderingContext2D, type: string, w: number, h: number, bass: number, _mid: number, beat: number, _intensity: number, palette: {colors: string[]}, time: number) {
  const r = Math.min(w, h) * 0.3 * (1 + bass * 0.2);

  if (type === 'flower-of-life') {
    const petals = 6;
    for (let ring = 0; ring < 3; ring++) {
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 + time * 0.0005;
        const cx = Math.cos(angle) * r * (ring * 0.3 + 0.3);
        const cy = Math.sin(angle) * r * (ring * 0.3 + 0.3);
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = palette.colors[ring % palette.colors.length] + '60';
        ctx.lineWidth = 1 + beat;
        ctx.stroke();
      }
    }
  }

  if (type === 'metatron') {
    // Metatron's cube - 13 circles
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
    ctx.strokeStyle = palette.colors[0] + '80';
    ctx.lineWidth = 1 + beat;
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * 0.0003;
      const cx = Math.cos(angle) * r * 0.4;
      const cy = Math.sin(angle) * r * 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
      ctx.stroke();
      // Connecting lines
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = palette.colors[1] + '40';
      ctx.stroke();
    }
  }

  if (type === 'sri-yantra') {
    // Triangles
    for (let i = 0; i < 9; i++) {
      const scale = 1 - i * 0.1;
      const rot = i % 2 === 0 ? 0 : Math.PI;
      ctx.save();
      ctx.rotate(rot + time * 0.0002 * (i % 2 ? 1 : -1));
      ctx.beginPath();
      ctx.moveTo(0, -r * scale);
      ctx.lineTo(r * scale * 0.866, r * scale * 0.5);
      ctx.lineTo(-r * scale * 0.866, r * scale * 0.5);
      ctx.closePath();
      ctx.strokeStyle = palette.colors[i % palette.colors.length] + '50';
      ctx.lineWidth = 1 + beat * 0.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  if (type === 'torus') {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.001;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.3, angle, 0, Math.PI * 2);
      ctx.strokeStyle = palette.colors[i % palette.colors.length] + '40';
      ctx.lineWidth = 1 + bass;
      ctx.stroke();
    }
  }

  if (type === 'vesica') {
    const offset = r * 0.3;
    ctx.beginPath();
    ctx.arc(-offset, 0, r * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = palette.colors[0] + '60';
    ctx.lineWidth = 2 + beat;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(offset, 0, r * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (type === 'seed-of-life') {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
    ctx.strokeStyle = palette.colors[0] + '70';
    ctx.lineWidth = 1 + beat;
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const cx = Math.cos(angle) * r * 0.2;
      const cy = Math.sin(angle) * r * 0.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// Draw quantum layer
function drawQuantumLayer(ctx: CanvasRenderingContext2D, type: string, w: number, h: number, bass: number, _mid: number, _high: number, beat: number, _intensity: number, palette: {colors: string[]}, time: number) {
  if (type === 'quantum-field') {
    // Random quantum fluctuations
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(time * 0.001 + i * 0.5) * 0.5 + 0.5) * w - w/2;
      const y = (Math.cos(time * 0.001 + i * 0.7) * 0.5 + 0.5) * h - h/2;
      const size = 2 + bass * 5 + Math.sin(time * 0.01 + i) * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length] + '60';
      ctx.fill();
    }
  }

  if (type === 'wave-function') {
    ctx.beginPath();
    for (let x = -w/2; x < w/2; x += 3) {
      const y = Math.sin(x * 0.02 + time * 0.003) * h * 0.2 * (1 + bass * 0.5);
      if (x === -w/2) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = palette.colors[0] + '80';
    ctx.lineWidth = 2 + beat * 2;
    ctx.stroke();
  }

  if (type === 'particle-grid') {
    const spacing = 40;
    for (let x = -w/2; x < w/2; x += spacing) {
      for (let y = -h/2; y < h/2; y += spacing) {
        const dist = Math.sqrt(x*x + y*y);
        const wave = Math.sin(dist * 0.02 - time * 0.003) * bass * 10;
        ctx.beginPath();
        ctx.arc(x, y + wave, 2 + beat * 2, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[0] + '50';
        ctx.fill();
      }
    }
  }

  if (type === 'neural-net') {
    const nodes: {x: number, y: number}[] = [];
    for (let i = 0; i < 20; i++) {
      nodes.push({
        x: Math.sin(i * 0.5 + time * 0.001) * w * 0.4,
        y: Math.cos(i * 0.7 + time * 0.001) * h * 0.4
      });
    }
    // Draw connections
    nodes.forEach((n1, i) => {
      nodes.forEach((n2, j) => {
        if (i < j && Math.random() > 0.7) {
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = palette.colors[0] + '30';
          ctx.lineWidth = 1 + beat;
          ctx.stroke();
        }
      });
      ctx.beginPath();
      ctx.arc(n1.x, n1.y, 3 + bass * 3, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length] + '70';
      ctx.fill();
    });
  }

  if (type === 'dna-helix') {
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      for (let t = -h/2; t < h/2; t += 5) {
        const x = Math.sin(t * 0.03 + time * 0.002 + i * Math.PI) * 50 * (1 + bass * 0.3);
        if (t === -h/2) ctx.moveTo(x, t);
        else ctx.lineTo(x, t);
      }
      ctx.strokeStyle = palette.colors[i] + '70';
      ctx.lineWidth = 3 + beat;
      ctx.stroke();
    }
  }

  if (type === 'singularity') {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 100 + bass * 50);
    gradient.addColorStop(0, palette.colors[0] + 'ff');
    gradient.addColorStop(0.5, palette.colors[1] + '80');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 100 + bass * 50, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw cosmic layer
function drawCosmicLayer(ctx: CanvasRenderingContext2D, type: string, w: number, h: number, bass: number, _mid: number, beat: number, _intensity: number, palette: {colors: string[]}, time: number) {
  if (type === 'nebula') {
    for (let i = 0; i < 5; i++) {
      const x = Math.sin(time * 0.0005 + i) * w * 0.3;
      const y = Math.cos(time * 0.0007 + i) * h * 0.3;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 150 + bass * 50);
      gradient.addColorStop(0, palette.colors[i % palette.colors.length] + '40');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(-w/2, -h/2, w, h);
    }
  }

  if (type === 'galaxy') {
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      for (let i = 0; i < 200; i++) {
        const angle = (i / 30) + arm * Math.PI + time * 0.0003;
        const r = i * 1.5 * (1 + bass * 0.2);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r * 0.6; // Flatten for perspective
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = palette.colors[arm] + '50';
      ctx.lineWidth = 3 + beat;
      ctx.stroke();
    }
  }

  if (type === 'supernova') {
    const rays = 12;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2 + time * 0.001;
      const length = 100 + bass * 100 + Math.sin(time * 0.01 + i) * 30;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      ctx.strokeStyle = palette.colors[i % palette.colors.length] + '60';
      ctx.lineWidth = 3 + beat * 3;
      ctx.stroke();
    }
  }

  if (type === 'black-hole') {
    // Event horizon
    const gradient = ctx.createRadialGradient(0, 0, 20, 0, 0, 100 + bass * 30);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.7, '#000000');
    gradient.addColorStop(1, palette.colors[0] + '40');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 100 + bass * 30, 0, Math.PI * 2);
    ctx.fill();
  }

  if (type === 'aurora') {
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      for (let x = -w/2; x < w/2; x += 10) {
        const y = -h/3 + i * 30 + Math.sin(x * 0.01 + time * 0.002 + i) * 30 * (1 + bass * 0.5);
        if (x === -w/2) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = palette.colors[i % palette.colors.length] + '40';
      ctx.lineWidth = 20 + beat * 10;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  if (type === 'cosmic-dust') {
    for (let i = 0; i < 100; i++) {
      const x = ((i * 37 + time * 0.1) % w) - w/2;
      const y = ((i * 53 + time * 0.05) % h) - h/2;
      const size = 1 + Math.sin(i) * 0.5 + bass;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length] + '40';
      ctx.fill();
    }
  }

  if (type === 'wormhole') {
    for (let i = 0; i < 8; i++) {
      const t = ((i / 8) + time * 0.001) % 1;
      const radius = t * Math.min(w, h) * 0.4;
      const squeeze = 0.3 + t * 0.7;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * squeeze, time * 0.001, 0, Math.PI * 2);
      ctx.strokeStyle = palette.colors[i % palette.colors.length] + Math.floor((1 - t) * 100).toString(16).padStart(2, '0');
      ctx.lineWidth = 2 + beat * 2;
      ctx.stroke();
    }
  }

  // Cosmic surfing waves - flowing organic motion like surfing through space
  if (type === 'cosmic-surf') {
    // Multiple layers of flowing waves
    for (let layer = 0; layer < 6; layer++) {
      const layerOffset = layer * 0.4;
      const waveAmplitude = h * 0.15 * (1 + bass * 0.8);
      const frequency = 0.008 + layer * 0.002;
      const speed = 0.003 + layer * 0.0005;

      ctx.beginPath();
      for (let x = -w/2; x <= w/2; x += 4) {
        // Organic flowing wave with multiple frequencies
        const y = Math.sin(x * frequency + time * speed + layerOffset) * waveAmplitude
                + Math.sin(x * frequency * 2.3 + time * speed * 1.7 + layerOffset) * waveAmplitude * 0.3
                + Math.cos(x * frequency * 0.5 + time * speed * 0.8) * waveAmplitude * 0.5
                + (layer - 3) * h * 0.08; // Vertical offset per layer

        if (x === -w/2) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // Create gradient for each wave
      const gradient = ctx.createLinearGradient(-w/2, 0, w/2, 0);
      const alpha = Math.floor(60 - layer * 8).toString(16).padStart(2, '0');
      gradient.addColorStop(0, palette.colors[layer % palette.colors.length] + alpha);
      gradient.addColorStop(0.5, palette.colors[(layer + 1) % palette.colors.length] + alpha);
      gradient.addColorStop(1, palette.colors[(layer + 2) % palette.colors.length] + alpha);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4 + beat * 4 - layer * 0.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  // Star streaks - like flying through hyperspace
  if (type === 'star-streaks') {
    const streakCount = 80;
    for (let i = 0; i < streakCount; i++) {
      // Each star has a position that moves outward from center
      const angle = (i / streakCount) * Math.PI * 2 + i * 0.1;
      const baseSpeed = 0.5 + (i % 5) * 0.3;
      const t = ((time * 0.002 * baseSpeed + i * 0.1) % 1);

      // Start from center, move outward
      const startR = t * Math.min(w, h) * 0.6;
      const endR = startR + 20 + bass * 60;

      const x1 = Math.cos(angle) * startR;
      const y1 = Math.sin(angle) * startR;
      const x2 = Math.cos(angle) * endR;
      const y2 = Math.sin(angle) * endR;

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.3, palette.colors[i % palette.colors.length] + '80');
      gradient.addColorStop(1, palette.colors[i % palette.colors.length] + 'ff');

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1 + beat * 2;
      ctx.stroke();
    }
  }

  // Fluid flow - organic plasma-like motion
  if (type === 'fluid-flow') {
    const resolution = 25;
    for (let ix = 0; ix < resolution; ix++) {
      for (let iy = 0; iy < resolution; iy++) {
        const x = (ix / resolution - 0.5) * w;
        const y = (iy / resolution - 0.5) * h;

        // Perlin-like noise simulation with multiple octaves
        const n1 = Math.sin(x * 0.01 + time * 0.001) * Math.cos(y * 0.01 + time * 0.0008);
        const n2 = Math.sin(x * 0.02 + y * 0.02 + time * 0.002) * 0.5;
        const n3 = Math.cos(x * 0.005 - time * 0.0005) * Math.sin(y * 0.005 + time * 0.0007) * 0.7;

        const flowX = (n1 + n2) * 30 * (1 + bass * 0.5);
        const flowY = (n2 + n3) * 30 * (1 + bass * 0.5);

        const size = 3 + Math.abs(n1 + n2 + n3) * 8 + beat * 4;
        const hue = ((n1 + 1) * 180 + time * 0.05) % 360;

        ctx.beginPath();
        ctx.arc(x + flowX, y + flowY, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.15 + bass * 0.15})`;
        ctx.fill();
      }
    }
  }

  // Pulsar - rotating beam of light
  if (type === 'pulsar') {
    const beamAngle = time * 0.003;
    for (let i = 0; i < 2; i++) {
      const angle = beamAngle + i * Math.PI;
      const length = Math.min(w, h) * 0.6;

      ctx.save();
      ctx.rotate(angle);
      const gradient = ctx.createLinearGradient(0, 0, length, 0);
      gradient.addColorStop(0, `rgba(255, 255, 200, ${0.8 + bass * 0.2})`);
      gradient.addColorStop(0.3, `rgba(255, 200, 100, ${0.4 + beat * 0.3})`);
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(0, -10 - beat * 5);
      ctx.lineTo(length, 0);
      ctx.lineTo(0, 10 + beat * 5);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    }

    // Core glow
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 30 + bass * 20);
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 + beat * 0.1})`);
    coreGrad.addColorStop(0.5, `rgba(200, 200, 255, 0.5)`);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 30 + bass * 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cosmic web - large scale structure of universe
  if (type === 'cosmic-web') {
    const nodes: {x: number, y: number}[] = [];
    for (let i = 0; i < 30; i++) {
      nodes.push({
        x: Math.sin(i * 1.3 + time * 0.0003) * w * 0.4,
        y: Math.cos(i * 1.7 + time * 0.0004) * h * 0.4
      });
    }

    // Draw filaments between nearby nodes
    nodes.forEach((n1, i) => {
      nodes.forEach((n2, j) => {
        if (i < j) {
          const dist = Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2);
          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.3;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = palette.colors[i % palette.colors.length] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 1 + beat;
            ctx.stroke();
          }
        }
      });

      // Node glow
      ctx.beginPath();
      ctx.arc(n1.x, n1.y, 3 + bass * 5, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length] + '60';
      ctx.fill();
    });
  }
}

// Draw lifeforce / biological layer
function drawLifeforceLayer(ctx: CanvasRenderingContext2D, type: string, w: number, h: number, bass: number, _mid: number, beat: number, time: number, palette: {colors: string[]}) {

  // Heartbeat - pulsing concentric rings
  if (type === 'heartbeat') {
    const heartRate = 1.2; // ~72 bpm feel
    const pulse = Math.sin(time * 0.006 * heartRate);
    const isPeak = pulse > 0.8;

    for (let i = 0; i < 5; i++) {
      const baseRadius = 30 + i * 40;
      const pulseRadius = baseRadius * (1 + (isPeak ? 0.3 : 0.1) * (1 - i * 0.15)) + bass * 30;

      ctx.beginPath();
      ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, ${50 + i * 30}, ${50 + i * 20}, ${0.6 - i * 0.1 + (isPeak ? 0.2 : 0)})`;
      ctx.lineWidth = 3 + (isPeak ? beat * 3 : 0);
      ctx.stroke();
    }

    // Heart center glow
    const heartGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 50 + bass * 30);
    heartGlow.addColorStop(0, `rgba(255, 80, 80, ${0.8 + (isPeak ? 0.2 : 0)})`);
    heartGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = heartGlow;
    ctx.fillRect(-100, -100, 200, 200);
  }

  // Breath - expanding/contracting organic waves
  if (type === 'breath') {
    const breathCycle = Math.sin(time * 0.002) * 0.5 + 0.5; // 0-1 breath cycle

    for (let ring = 0; ring < 8; ring++) {
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.1) {
        const baseR = 50 + ring * 30;
        const breathR = baseR * (0.8 + breathCycle * 0.4);
        const wobble = Math.sin(a * 3 + time * 0.003 + ring) * 10 * breathCycle;
        const r = breathR + wobble + bass * 20;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.4 - ring * 0.04})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Neurons - synaptic firing network
  if (type === 'neurons') {
    const neurons: {x: number, y: number, firing: boolean}[] = [];
    for (let i = 0; i < 25; i++) {
      neurons.push({
        x: Math.sin(i * 2.1 + time * 0.0002) * w * 0.35,
        y: Math.cos(i * 2.7 + time * 0.0003) * h * 0.35,
        firing: Math.sin(time * 0.01 + i * 0.5) > 0.7
      });
    }

    // Axons (connections)
    neurons.forEach((n1, i) => {
      neurons.slice(i + 1, i + 4).forEach((n2) => {
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        // Curved axon
        const cx = (n1.x + n2.x) / 2 + Math.sin(time * 0.002 + i) * 20;
        const cy = (n1.y + n2.y) / 2 + Math.cos(time * 0.002 + i) * 20;
        ctx.quadraticCurveTo(cx, cy, n2.x, n2.y);
        ctx.strokeStyle = n1.firing ? 'rgba(255, 200, 100, 0.6)' : 'rgba(150, 100, 200, 0.2)';
        ctx.lineWidth = n1.firing ? 2 + beat : 1;
        ctx.stroke();
      });

      // Neuron body
      ctx.beginPath();
      ctx.arc(n1.x, n1.y, n1.firing ? 8 + bass * 5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = n1.firing ? 'rgba(255, 220, 100, 0.9)' : 'rgba(180, 140, 220, 0.5)';
      ctx.fill();
    });
  }

  // Cells - dividing and flowing
  if (type === 'cells') {
    for (let i = 0; i < 40; i++) {
      const x = Math.sin(i * 1.7 + time * 0.0005) * w * 0.4;
      const y = Math.cos(i * 2.3 + time * 0.0004) * h * 0.4;
      const size = 10 + Math.sin(i + time * 0.003) * 5 + bass * 8;

      // Cell membrane
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.8, time * 0.001 + i, 0, Math.PI * 2);
      ctx.strokeStyle = palette.colors[i % palette.colors.length] + '60';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Nucleus
      ctx.beginPath();
      ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[(i + 1) % palette.colors.length] + '80';
      ctx.fill();
    }
  }

  // Mycelium - underground fungal network
  if (type === 'mycelium') {
    const drawBranch = (x: number, y: number, angle: number, len: number, depth: number) => {
      if (depth === 0 || len < 5) return;

      const endX = x + Math.cos(angle) * len;
      const endY = y + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = `rgba(255, 200, 150, ${0.3 + depth * 0.05})`;
      ctx.lineWidth = depth * 0.5;
      ctx.stroke();

      // Branches
      const branches = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < branches; i++) {
        const newAngle = angle + (Math.random() - 0.5) * 1.2;
        drawBranch(endX, endY, newAngle, len * 0.7, depth - 1);
      }
    };

    // Multiple root points
    for (let i = 0; i < 5; i++) {
      const startX = Math.sin(i * 1.5) * 50;
      const startY = Math.cos(i * 1.5) * 50;
      const angle = Math.atan2(-startY, -startX) + Math.sin(time * 0.001 + i) * 0.3;
      drawBranch(startX, startY, angle, 60 + bass * 30, 5);
    }
  }

  // Bioluminescence - glowing particles
  if (type === 'biolum') {
    for (let i = 0; i < 60; i++) {
      const t = (time * 0.0005 + i * 0.1) % 1;
      const x = Math.sin(i * 2.3 + t * Math.PI * 2) * w * 0.4 * t;
      const y = Math.cos(i * 3.1 + t * Math.PI * 2) * h * 0.4 * t;
      const glow = Math.sin(time * 0.005 + i) * 0.5 + 0.5;
      const size = (3 + glow * 8) * (1 + bass * 0.5);

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      gradient.addColorStop(0, `rgba(100, 255, 200, ${0.8 * glow})`);
      gradient.addColorStop(0.5, `rgba(50, 200, 255, ${0.4 * glow})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);
    }
  }

  // Roots - growing tree roots
  if (type === 'roots') {
    const drawRoot = (x: number, y: number, angle: number, thickness: number, depth: number) => {
      if (depth === 0 || thickness < 1) return;

      const len = 30 + thickness * 3 + bass * 10;
      const endX = x + Math.cos(angle) * len;
      const endY = y + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + Math.cos(angle) * len * 0.5 + Math.sin(time * 0.002 + depth) * 10,
        y + Math.sin(angle) * len * 0.5,
        endX, endY
      );
      ctx.strokeStyle = `rgba(139, 90, 43, ${0.6 + depth * 0.05})`;
      ctx.lineWidth = thickness;
      ctx.stroke();

      // Branch into 2-3 roots
      const numBranches = depth > 3 ? 3 : 2;
      for (let i = 0; i < numBranches; i++) {
        const spreadAngle = 0.4;
        const newAngle = angle + (i - (numBranches - 1) / 2) * spreadAngle + Math.sin(time * 0.001 + i) * 0.1;
        drawRoot(endX, endY, newAngle, thickness * 0.7, depth - 1);
      }
    };

    drawRoot(0, -h * 0.3, Math.PI / 2, 8, 6);
  }

  // Jellyfish - pulsing bell with tentacles
  if (type === 'jellyfish') {
    const pulse = Math.sin(time * 0.004) * 0.3 + 0.7;

    // Bell
    ctx.beginPath();
    for (let a = 0; a <= Math.PI; a += 0.1) {
      const r = 80 * pulse + bass * 20;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.6 - 30;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const bellGrad = ctx.createRadialGradient(0, -30, 0, 0, -30, 100);
    bellGrad.addColorStop(0, `rgba(200, 100, 255, ${0.6 + beat * 0.2})`);
    bellGrad.addColorStop(1, `rgba(100, 50, 200, 0.2)`);
    ctx.fillStyle = bellGrad;
    ctx.fill();

    // Tentacles
    for (let i = 0; i < 8; i++) {
      const startX = (i - 3.5) * 20;
      ctx.beginPath();
      ctx.moveTo(startX, 20);

      for (let y = 0; y < 150; y += 10) {
        const wave = Math.sin(y * 0.05 + time * 0.005 + i) * (20 + y * 0.1);
        ctx.lineTo(startX + wave, 20 + y);
      }

      ctx.strokeStyle = `rgba(180, 100, 255, ${0.4 - i * 0.03})`;
      ctx.lineWidth = 3 - i * 0.2;
      ctx.stroke();
    }
  }

  // DNA Helix - double helix structure
  if (type === 'dna-helix') {
    const helixLength = 200;
    for (let i = 0; i < helixLength; i += 5) {
      const y = i - helixLength / 2;
      const twist = (i + time * 0.05) * 0.1;
      const x1 = Math.sin(twist) * 40;
      const x2 = Math.sin(twist + Math.PI) * 40;
      const z1 = Math.cos(twist);
      const z2 = Math.cos(twist + Math.PI);

      // Backbone strands
      ctx.beginPath();
      ctx.arc(x1, y, 4 + z1 * 2 + bass * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 200, 255, ${0.5 + z1 * 0.3})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x2, y, 4 + z2 * 2 + bass * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 100, 150, ${0.5 + z2 * 0.3})`;
      ctx.fill();

      // Base pairs (rungs)
      if (i % 15 === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `rgba(200, 255, 100, ${0.4 + beat * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  // Kundalini - rising serpent energy through chakras
  if (type === 'kundalini') {
    const chakraColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#00bfff', '#4b0082', '#8b00ff'];
    const rise = (time * 0.001) % 1;

    // Serpent spine
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const y = h * 0.4 - t * h * 0.8;
      const wave = Math.sin(t * Math.PI * 3 + time * 0.005) * 30 * (1 - t * 0.5);
      if (i === 0) ctx.moveTo(wave, y);
      else ctx.lineTo(wave, y);
    }
    ctx.strokeStyle = `rgba(255, 100, 50, ${0.6 + bass * 0.3})`;
    ctx.lineWidth = 4 + beat * 3;
    ctx.stroke();

    // Chakra points
    chakraColors.forEach((color, i) => {
      const y = h * 0.35 - (i / 6) * h * 0.7;
      const active = rise > i / 7;
      const size = active ? 15 + bass * 10 : 8;

      const glow = ctx.createRadialGradient(0, y, 0, 0, y, size * 2);
      glow.addColorStop(0, color + (active ? 'ff' : '60'));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(-size * 2, y - size * 2, size * 4, size * 4);
    });
  }

  // Aura - layered energy field
  if (type === 'aura') {
    const auraColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
    for (let layer = auraColors.length - 1; layer >= 0; layer--) {
      const baseR = 60 + layer * 35;
      const breathe = Math.sin(time * 0.002 + layer * 0.5) * 10;
      const r = baseR + breathe + bass * 20;

      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.05) {
        const wobble = Math.sin(a * 5 + time * 0.003 + layer) * 5;
        const px = Math.cos(a) * (r + wobble);
        const py = Math.sin(a) * (r + wobble) * 1.3; // Oval shape
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = auraColors[layer] + '20';
      ctx.fill();
      ctx.strokeStyle = auraColors[layer] + '40';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Cymatics - sound made visible (standing wave patterns)
  if (type === 'cymatics') {
    const freq = 3 + Math.floor(bass * 5); // Frequency based on bass
    for (let r = 20; r < Math.min(w, h) * 0.4; r += 15) {
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.02) {
        const wave = Math.sin(a * freq + time * 0.003) * (10 + bass * 15);
        const px = Math.cos(a) * (r + wave);
        const py = Math.sin(a) * (r + wave);
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = palette.colors[Math.floor(r / 20) % palette.colors.length] + '60';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Nodal points
    for (let i = 0; i < freq * 2; i++) {
      const angle = (i / (freq * 2)) * Math.PI * 2;
      const dist = 80 + bass * 40;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(x, y, 5 + beat * 5, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[0] + 'aa';
      ctx.fill();
    }
  }
}

// ============================================
// ANCIENT WISDOM LAYER - Cultural sacred symbols
// ============================================
function drawAncientLayer(ctx: CanvasRenderingContext2D, type: string, _w: number, _h: number, bass: number, beat: number, time: number, palette: {colors: string[]}) {

  // Ankh - Egyptian key of life
  if (type === 'ankh') {
    const scale = 1 + bass * 0.3;
    ctx.save();
    ctx.scale(scale, scale);

    // Loop (top circle)
    ctx.beginPath();
    ctx.ellipse(0, -60, 25, 35, 0, 0, Math.PI * 2);
    ctx.strokeStyle = palette.colors[0] + 'cc';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Vertical staff
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(0, 80);
    ctx.stroke();

    // Horizontal arms
    ctx.beginPath();
    ctx.moveTo(-35, 0);
    ctx.lineTo(35, 0);
    ctx.stroke();

    // Inner glow
    const glow = ctx.createRadialGradient(0, -60, 0, 0, -60, 50);
    glow.addColorStop(0, palette.colors[0] + '40');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(-60, -110, 120, 100);

    ctx.restore();
  }

  // Eye of Horus - Egyptian protection symbol
  if (type === 'eye-of-horus') {
    const scale = 1 + bass * 0.2;
    ctx.save();
    ctx.scale(scale, scale);

    // Eye outline
    ctx.beginPath();
    ctx.moveTo(-60, 0);
    ctx.quadraticCurveTo(0, -30, 60, 0);
    ctx.quadraticCurveTo(0, 30, -60, 0);
    ctx.strokeStyle = palette.colors[0] + 'cc';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Iris
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = palette.colors[1] + 'aa';
    ctx.fill();

    // Pupil
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Falcon markings below
    ctx.beginPath();
    ctx.moveTo(-10, 30);
    ctx.quadraticCurveTo(-20, 60, -10, 90);
    ctx.strokeStyle = palette.colors[0] + 'aa';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.lineTo(30, 50);
    ctx.lineTo(50, 50);
    ctx.stroke();

    // Glow on pulse
    if (beat > 0.5) {
      const eyeGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
      eyeGlow.addColorStop(0, palette.colors[0] + '60');
      eyeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = eyeGlow;
      ctx.fillRect(-50, -50, 100, 100);
    }

    ctx.restore();
  }

  // Ouroboros - serpent eating its tail
  if (type === 'ouroboros') {
    const rotation = time * 0.001;
    const radius = 80 + bass * 20;

    ctx.save();
    ctx.rotate(rotation);

    // Serpent body
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0.3, Math.PI * 2 - 0.3);
    ctx.strokeStyle = palette.colors[0] + 'cc';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Scales pattern
    for (let a = 0.5; a < Math.PI * 2 - 0.5; a += 0.3) {
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[1] + '60';
      ctx.fill();
    }

    // Head eating tail
    const headAngle = 0.15;
    const hx = Math.cos(headAngle) * radius;
    const hy = Math.sin(headAngle) * radius;
    ctx.beginPath();
    ctx.arc(hx, hy, 15, 0, Math.PI * 2);
    ctx.fillStyle = palette.colors[0] + 'ee';
    ctx.fill();

    // Eye
    ctx.beginPath();
    ctx.arc(hx + 5, hy - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = palette.colors[1];
    ctx.fill();

    ctx.restore();
  }

  // Enso - Zen circle
  if (type === 'enso') {
    const radius = 100 + bass * 30;
    const strokeWidth = 8 + beat * 4;

    ctx.beginPath();
    // Imperfect circle - the beauty of enso
    for (let a = 0.2; a < Math.PI * 2 - 0.1; a += 0.05) {
      const wobble = Math.sin(a * 3 + time * 0.001) * 3;
      const r = radius + wobble;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (a < 0.25) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    // Brushstroke effect - fading at ends
    const gradient = ctx.createLinearGradient(-radius, 0, radius, 0);
    gradient.addColorStop(0, palette.colors[0] + '20');
    gradient.addColorStop(0.1, palette.colors[0] + 'cc');
    gradient.addColorStop(0.9, palette.colors[0] + 'cc');
    gradient.addColorStop(1, palette.colors[0] + '40');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Om - Sacred Hindu symbol
  if (type === 'om') {
    const scale = 1 + bass * 0.2;
    ctx.save();
    ctx.scale(scale, scale);

    // Simplified Om shape using curves
    ctx.beginPath();
    // Main body curves (simplified representation)
    ctx.arc(-30, 20, 30, 0.5, Math.PI * 1.5);
    ctx.quadraticCurveTo(0, -20, 30, 0);
    ctx.arc(50, 20, 25, -Math.PI * 0.5, Math.PI * 0.8);
    ctx.strokeStyle = palette.colors[0] + 'cc';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Top crescent and dot
    ctx.beginPath();
    ctx.arc(40, -50, 15, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(40, -75, 6, 0, Math.PI * 2);
    ctx.fillStyle = palette.colors[0] + 'ee';
    ctx.fill();

    // Vibration rings
    for (let i = 1; i <= 3; i++) {
      const r = 80 + i * 30 + Math.sin(time * 0.003 + i) * 10;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = palette.colors[0] + (20 - i * 5).toString(16);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  // Yin Yang - balance of opposites
  if (type === 'yin-yang') {
    const radius = 80 + bass * 20;
    const rotation = time * 0.0005;

    ctx.save();
    ctx.rotate(rotation);

    // White half
    ctx.beginPath();
    ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2);
    ctx.arc(0, radius / 2, radius / 2, Math.PI / 2, -Math.PI / 2, true);
    ctx.arc(0, -radius / 2, radius / 2, Math.PI / 2, -Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Black half
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI / 2, -Math.PI / 2);
    ctx.arc(0, -radius / 2, radius / 2, -Math.PI / 2, Math.PI / 2, true);
    ctx.arc(0, radius / 2, radius / 2, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Small circles (dots)
    ctx.beginPath();
    ctx.arc(0, radius / 2, radius / 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -radius / 2, radius / 8, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = palette.colors[0] + '60';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  // Dharma Wheel - Buddhist eight-spoked wheel
  if (type === 'dharma-wheel') {
    const radius = 80 + bass * 20;
    const rotation = time * 0.0008;

    ctx.save();
    ctx.rotate(rotation);

    // Outer rim
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = palette.colors[0] + 'cc';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Hub
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fillStyle = palette.colors[0] + 'aa';
    ctx.fill();

    // Eight spokes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 15, Math.sin(angle) * 15);
      ctx.lineTo(Math.cos(angle) * (radius - 3), Math.sin(angle) * (radius - 3));
      ctx.strokeStyle = palette.colors[0] + 'cc';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spoke decoration
      const midR = radius * 0.6;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * midR, Math.sin(angle) * midR, 5, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[1] + '80';
      ctx.fill();
    }

    ctx.restore();
  }

  // Triskele - Celtic triple spiral
  if (type === 'triskele') {
    const rotation = time * 0.001;

    ctx.save();
    ctx.rotate(rotation);

    for (let arm = 0; arm < 3; arm++) {
      ctx.save();
      ctx.rotate((arm / 3) * Math.PI * 2);

      ctx.beginPath();
      for (let t = 0; t < Math.PI * 2; t += 0.1) {
        const r = 10 + t * 15 + bass * 10;
        const x = Math.cos(t) * r;
        const y = Math.sin(t) * r;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = palette.colors[arm % palette.colors.length] + 'cc';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  // Hunab Ku - Mayan galactic symbol
  if (type === 'hunab-ku') {
    const scale = 1 + bass * 0.2;
    const rotation = time * 0.0005;

    ctx.save();
    ctx.scale(scale, scale);
    ctx.rotate(rotation);

    // Yin-yang style swirl
    const radius = 70;

    // First half
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI);
    ctx.arc(radius / 2, 0, radius / 2, Math.PI, 0, true);
    ctx.arc(-radius / 2, 0, radius / 2, 0, Math.PI, true);
    ctx.fillStyle = palette.colors[0] + 'cc';
    ctx.fill();

    // Second half
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI, Math.PI * 2);
    ctx.arc(-radius / 2, 0, radius / 2, 0, Math.PI);
    ctx.arc(radius / 2, 0, radius / 2, Math.PI, 0);
    ctx.fillStyle = '#000000cc';
    ctx.fill();

    // Decorative border
    ctx.beginPath();
    ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
    ctx.strokeStyle = palette.colors[0] + '80';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Corner glyphs
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const d = radius + 30;
      ctx.beginPath();
      ctx.rect(
        Math.cos(angle) * d - 8,
        Math.sin(angle) * d - 8,
        16, 16
      );
      ctx.fillStyle = palette.colors[1] + '80';
      ctx.fill();
    }

    ctx.restore();
  }

  // Chakras - seven energy centers aligned vertically
  if (type === 'chakras') {
    const chakras = [
      { y: 120, color: '#ff0000', name: 'Root' },
      { y: 80, color: '#ff7f00', name: 'Sacral' },
      { y: 40, color: '#ffff00', name: 'Solar' },
      { y: 0, color: '#00ff00', name: 'Heart' },
      { y: -40, color: '#00bfff', name: 'Throat' },
      { y: -80, color: '#4b0082', name: 'Third Eye' },
      { y: -120, color: '#8b00ff', name: 'Crown' },
    ];

    // Central channel (Sushumna)
    ctx.beginPath();
    ctx.moveTo(0, 140);
    ctx.lineTo(0, -140);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw each chakra
    chakras.forEach((chakra, i) => {
      const active = Math.sin(time * 0.003 + i * 0.5) > 0.3;
      const baseSize = 20 + bass * 10;
      const size = active ? baseSize * 1.3 : baseSize;

      // Glow
      const glow = ctx.createRadialGradient(0, chakra.y, 0, 0, chakra.y, size * 2);
      glow.addColorStop(0, chakra.color + (active ? 'cc' : '60'));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(-size * 2, chakra.y - size * 2, size * 4, size * 4);

      // Lotus petals
      const petals = 4 + i * 2; // More petals for higher chakras
      for (let p = 0; p < petals; p++) {
        const angle = (p / petals) * Math.PI * 2 + time * 0.001;
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(angle) * (size * 0.6),
          chakra.y + Math.sin(angle) * (size * 0.3),
          size * 0.4, size * 0.2,
          angle, 0, Math.PI * 2
        );
        ctx.fillStyle = chakra.color + '40';
        ctx.fill();
      }

      // Center
      ctx.beginPath();
      ctx.arc(0, chakra.y, size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = chakra.color + 'ee';
      ctx.fill();
    });
  }
}

// ============================================
// DIMENSIONAL LAYER - Higher dimensions & impossible geometry
// ============================================
function drawDimensionalLayer(ctx: CanvasRenderingContext2D, type: string, _w: number, _h: number, bass: number, beat: number, time: number, palette: {colors: string[]}) {

  // Tesseract - 4D hypercube projection
  if (type === 'tesseract') {
    const size = 60 + bass * 20;
    const rotation = time * 0.001;
    const innerSize = size * 0.5;

    ctx.save();

    // Outer cube vertices
    const outer = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ].map(([x, y, z]) => {
      const rx = x * Math.cos(rotation) - z * Math.sin(rotation);
      const rz = x * Math.sin(rotation) + z * Math.cos(rotation);
      const ry = y * Math.cos(rotation * 0.7) - rz * Math.sin(rotation * 0.7);
      return [rx * size, ry * size];
    });

    // Inner cube (4D inner)
    const inner = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ].map(([x, y, z]) => {
      const rx = x * Math.cos(rotation + 0.5) - z * Math.sin(rotation + 0.5);
      const rz = x * Math.sin(rotation + 0.5) + z * Math.cos(rotation + 0.5);
      const ry = y * Math.cos(rotation * 0.7 + 0.3) - rz * Math.sin(rotation * 0.7 + 0.3);
      return [rx * innerSize, ry * innerSize];
    });

    // Draw connecting lines (4D edges)
    ctx.strokeStyle = palette.colors[0] + '60';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(outer[i][0], outer[i][1]);
      ctx.lineTo(inner[i][0], inner[i][1]);
      ctx.stroke();
    }

    // Draw outer cube
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    ctx.strokeStyle = palette.colors[0] + 'cc';
    ctx.lineWidth = 2;
    edges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(outer[a][0], outer[a][1]);
      ctx.lineTo(outer[b][0], outer[b][1]);
      ctx.stroke();
    });

    // Draw inner cube
    ctx.strokeStyle = palette.colors[1] + 'aa';
    edges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(inner[a][0], inner[a][1]);
      ctx.lineTo(inner[b][0], inner[b][1]);
      ctx.stroke();
    });

    ctx.restore();
  }

  // Hypersphere - 4D sphere projection (glome)
  if (type === 'hypersphere') {
    const baseRadius = 80 + bass * 30;
    const layers = 5;

    for (let l = 0; l < layers; l++) {
      const phase = time * 0.001 + l * 0.5;
      const w4 = Math.sin(phase); // 4th dimension coordinate
      const radius = baseRadius * Math.sqrt(1 - w4 * w4); // 3D projection radius

      if (radius > 5) {
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = palette.colors[l % palette.colors.length] + (80 + l * 20).toString(16);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cross-section indicators
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const x = Math.cos(a + phase) * radius;
          const y = Math.sin(a + phase) * radius;
          ctx.beginPath();
          ctx.arc(x, y, 3 + beat * 3, 0, Math.PI * 2);
          ctx.fillStyle = palette.colors[l % palette.colors.length] + 'aa';
          ctx.fill();
        }
      }
    }
  }

  // Klein Bottle - non-orientable surface
  if (type === 'klein-bottle') {
    const scale = 40 + bass * 15;

    ctx.beginPath();
    for (let u = 0; u < Math.PI * 2; u += 0.1) {
      for (let v = 0; v < Math.PI * 2; v += 0.3) {
        const rotation = time * 0.0005;
        // Klein bottle parametric equations (simplified projection)
        const x = (2 + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.cos(u);
        const y = (2 + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.sin(u);

        const rx = x * Math.cos(rotation) - y * Math.sin(rotation);
        const ry = x * Math.sin(rotation) + y * Math.cos(rotation);

        ctx.beginPath();
        ctx.arc(rx * scale, ry * scale, 2, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[Math.floor(u) % palette.colors.length] + '80';
        ctx.fill();
      }
    }
  }

  // Möbius Strip
  if (type === 'mobius') {
    const R = 80 + bass * 20; // Major radius
    const w = 30; // Width
    const rotation = time * 0.001;

    ctx.save();
    ctx.rotate(rotation * 0.3);

    for (let u = 0; u < Math.PI * 2; u += 0.05) {
      for (let v = -1; v <= 1; v += 0.5) {
        // Möbius strip parametric equations
        const x = (R + v * w * Math.cos(u / 2)) * Math.cos(u);
        const y = (R + v * w * Math.cos(u / 2)) * Math.sin(u);
        const z = v * w * Math.sin(u / 2);

        // Simple 3D to 2D projection
        const scale = 200 / (200 + z);
        const px = x * scale;
        const py = y * scale * 0.4; // Flatten for better view

        const colorIndex = Math.floor((u / (Math.PI * 2)) * palette.colors.length);
        ctx.beginPath();
        ctx.arc(px, py, 2 + beat, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[colorIndex % palette.colors.length] + 'aa';
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Penrose Triangle / Impossible geometry
  if (type === 'penrose') {
    const size = 80 + bass * 20;
    const rotation = time * 0.0005;

    ctx.save();
    ctx.rotate(rotation);

    // Penrose triangle coordinates
    const thickness = 20;
    const h = size * Math.sqrt(3) / 2;

    // Draw the three beams
    for (let beam = 0; beam < 3; beam++) {
      ctx.save();
      ctx.rotate((beam * 2 * Math.PI) / 3);

      // Outer edge
      ctx.beginPath();
      ctx.moveTo(-size / 2, h / 2);
      ctx.lineTo(0, -h / 2);
      ctx.lineTo(size / 2, h / 2);
      ctx.strokeStyle = palette.colors[beam % palette.colors.length] + 'cc';
      ctx.lineWidth = thickness;
      ctx.stroke();

      ctx.restore();
    }

    // Impossible overlap illusion (simplified)
    ctx.fillStyle = palette.colors[0] + '40';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.3, -h * 0.3);
    ctx.lineTo(0, -h * 0.5);
    ctx.lineTo(-size * 0.3, -h * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Calabi-Yau manifold (string theory extra dimensions)
  if (type === 'calabi-yau') {
    const scale = 60 + bass * 20;
    const rotation = time * 0.0008;

    // Simplified artistic representation of 6D manifold projection
    for (let layer = 0; layer < 3; layer++) {
      ctx.save();
      ctx.rotate(rotation + layer * Math.PI / 3);

      for (let u = 0; u < Math.PI * 2; u += 0.15) {
        for (let v = 0; v < Math.PI; v += 0.2) {
          // Artistic interpretation of Calabi-Yau surface
          const r = scale * (0.5 + 0.5 * Math.sin(3 * u) * Math.sin(2 * v));
          const x = r * Math.sin(v) * Math.cos(u);
          const y = r * Math.sin(v) * Math.sin(u) + r * Math.cos(v) * 0.3;

          const brightness = 0.3 + Math.sin(u * 3) * 0.3;
          ctx.beginPath();
          ctx.arc(x, y, 1.5 + beat, 0, Math.PI * 2);
          ctx.fillStyle = palette.colors[layer % palette.colors.length] + Math.floor(brightness * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  // Hyperbolic geometry (Poincaré disk)
  if (type === 'hyperbolic') {
    const radius = 100 + bass * 20;

    // Boundary circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = palette.colors[0] + '60';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hyperbolic tiling pattern
    const drawHyperbolicLine = (x1: number, y1: number, x2: number, y2: number) => {
      // In hyperbolic geometry, "straight lines" are arcs
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const dist = Math.sqrt(midX * midX + midY * midY);

      if (dist < radius * 0.95) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX * 1.2, midY * 1.2, x2, y2);
        ctx.strokeStyle = palette.colors[1] + '80';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // Create hyperbolic tiling
    const n = 7; // Heptagonal tiling
    for (let ring = 1; ring <= 4; ring++) {
      const ringRadius = radius * (1 - Math.pow(0.6, ring));
      for (let i = 0; i < n * ring; i++) {
        const angle = (i / (n * ring)) * Math.PI * 2 + time * 0.0003 * ring;
        const x = Math.cos(angle) * ringRadius;
        const y = Math.sin(angle) * ringRadius;

        // Connect to neighbors
        const nextAngle = ((i + 1) / (n * ring)) * Math.PI * 2 + time * 0.0003 * ring;
        const nx = Math.cos(nextAngle) * ringRadius;
        const ny = Math.sin(nextAngle) * ringRadius;
        drawHyperbolicLine(x, y, nx, ny);

        // Vertex marker
        ctx.beginPath();
        ctx.arc(x, y, 2 + beat, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[ring % palette.colors.length] + 'cc';
        ctx.fill();
      }
    }
  }

  // Impossible Object
  if (type === 'impossible') {
    const size = 70 + bass * 20;
    const rotation = time * 0.0008;

    ctx.save();
    ctx.rotate(rotation);

    // Impossible cube / Necker cube illusion
    const d = size * 0.4; // Depth offset

    // Back face
    ctx.strokeStyle = palette.colors[1] + '80';
    ctx.lineWidth = 3;
    ctx.strokeRect(-size / 2 + d, -size / 2 + d, size, size);

    // Front face
    ctx.strokeStyle = palette.colors[0] + 'cc';
    ctx.strokeRect(-size / 2, -size / 2, size, size);

    // Connecting lines (the "impossible" part)
    ctx.beginPath();
    ctx.moveTo(-size / 2, -size / 2);
    ctx.lineTo(-size / 2 + d, -size / 2 + d);
    ctx.moveTo(size / 2, -size / 2);
    ctx.lineTo(size / 2 + d, -size / 2 + d);
    ctx.moveTo(-size / 2, size / 2);
    ctx.lineTo(-size / 2 + d, size / 2 + d);
    ctx.moveTo(size / 2, size / 2);
    ctx.lineTo(size / 2 + d, size / 2 + d);
    ctx.strokeStyle = palette.colors[2 % palette.colors.length] + 'aa';
    ctx.stroke();

    ctx.restore();
  }
}

// ============================================
// CONSCIOUSNESS LAYER - Beyond physical reality
// ============================================
function drawConsciousnessLayer(ctx: CanvasRenderingContext2D, type: string, w: number, h: number, bass: number, beat: number, time: number, palette: {colors: string[]}) {

  // Third Eye - Ajna chakra visualization
  if (type === 'third-eye') {
    const scale = 1 + bass * 0.3;
    const pulse = Math.sin(time * 0.003) * 0.2 + 0.8;

    ctx.save();
    ctx.scale(scale, scale);

    // Eye shape
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.quadraticCurveTo(0, -50 * pulse, 80, 0);
    ctx.quadraticCurveTo(0, 50 * pulse, -80, 0);
    ctx.strokeStyle = '#4b0082cc';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Iris - indigo spiral
    for (let r = 5; r < 35; r += 5) {
      ctx.beginPath();
      ctx.arc(0, 0, r, time * 0.002, time * 0.002 + Math.PI * 1.8);
      ctx.strokeStyle = `rgba(75, 0, 130, ${0.8 - r * 0.02})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Central point of awareness
    const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    innerGlow.addColorStop(0, '#ffffff');
    innerGlow.addColorStop(0.5, '#8b00ff');
    innerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGlow;
    ctx.fillRect(-25, -25, 50, 50);

    // Emanating rays of perception
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.001;
      const len = 100 + Math.sin(time * 0.005 + i) * 20 + beat * 30;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 40, Math.sin(angle) * 25);
      ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len * 0.6);
      ctx.strokeStyle = `rgba(138, 43, 226, ${0.3 + beat * 0.3})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  // Akashic Records - infinite library of all knowledge
  if (type === 'akashic') {
    // Floating symbols/glyphs representing universal knowledge
    const symbols = '∞◯△□◇☆✦✧⚡☯♾';

    for (let i = 0; i < 30; i++) {
      const t = (time * 0.0003 + i * 0.1) % 1;
      const spiral = t * Math.PI * 4;
      const dist = 50 + t * 150;
      const x = Math.cos(spiral + i) * dist * (1 - t * 0.3);
      const y = Math.sin(spiral + i) * dist * 0.5 - t * 100 + 50;

      ctx.font = `${14 + bass * 8}px serif`;
      ctx.fillStyle = palette.colors[i % palette.colors.length] + Math.floor((1 - t) * 200).toString(16).padStart(2, '0');
      ctx.fillText(symbols[i % symbols.length], x, y);
    }

    // Central book/portal
    const bookGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 60 + bass * 20);
    bookGlow.addColorStop(0, 'rgba(200, 150, 255, 0.8)');
    bookGlow.addColorStop(0.5, 'rgba(100, 50, 200, 0.3)');
    bookGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bookGlow;
    ctx.fillRect(-80, -80, 160, 160);
  }

  // Morphic Field - Sheldrake's morphic resonance
  if (type === 'morphic') {
    // Interconnected field of resonating forms
    const nodes: {x: number, y: number, phase: number}[] = [];

    for (let i = 0; i < 40; i++) {
      nodes.push({
        x: Math.sin(i * 1.7 + time * 0.0002) * w * 0.35,
        y: Math.cos(i * 2.3 + time * 0.0003) * h * 0.35,
        phase: (time * 0.003 + i * 0.2) % (Math.PI * 2)
      });
    }

    // Field connections
    nodes.forEach((n1, i) => {
      nodes.slice(i + 1).forEach((n2) => {
        const dist = Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2);
        if (dist < 150) {
          const resonance = Math.sin(n1.phase - n2.phase);
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = `rgba(100, 200, 150, ${0.1 + Math.abs(resonance) * 0.3})`;
          ctx.lineWidth = 1 + Math.abs(resonance) * 2;
          ctx.stroke();
        }
      });

      // Node visualization
      const size = 5 + Math.sin(n1.phase) * 3 + bass * 5;
      ctx.beginPath();
      ctx.arc(n1.x, n1.y, size, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length] + '80';
      ctx.fill();
    });
  }

  // Dreamtime - Aboriginal concept of eternal dream
  if (type === 'dreamtime') {
    // Concentric waves emanating from multiple dream points
    const dreamCenters = [
      { x: -60, y: -40 },
      { x: 80, y: 20 },
      { x: 0, y: 60 },
      { x: -40, y: 80 },
    ];

    dreamCenters.forEach((center, ci) => {
      for (let r = 10; r < 120; r += 20) {
        const wave = Math.sin(time * 0.002 - r * 0.05 + ci) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(center.x, center.y, r + wave * 10 + bass * 10, 0, Math.PI * 2);
        ctx.strokeStyle = palette.colors[ci % palette.colors.length] + Math.floor(wave * 100 + 50).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Dot painting style elements
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const dist = 100 + Math.sin(i * 0.5 + time * 0.001) * 30;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;

      ctx.beginPath();
      ctx.arc(x, y, 3 + beat * 2, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length] + 'cc';
      ctx.fill();
    }
  }

  // Void Source - the primordial emptiness
  if (type === 'void-source') {
    // Deep black center with subtle presence
    const voidGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 150 + bass * 50);
    voidGrad.addColorStop(0, '#000000');
    voidGrad.addColorStop(0.3, '#050505');
    voidGrad.addColorStop(0.6, '#0a0a15');
    voidGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = voidGrad;
    ctx.fillRect(-200, -200, 400, 400);

    // Subtle particles emerging/returning to void
    for (let i = 0; i < 30; i++) {
      const t = (time * 0.0005 + i * 0.1) % 1;
      const angle = i * 2.4 + time * 0.0003;
      const dist = t * 150;

      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const alpha = Math.sin(t * Math.PI); // Fade in and out

      ctx.beginPath();
      ctx.arc(x, y, 1 + beat, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 100, 150, ${alpha * 0.5})`;
      ctx.fill();
    }
  }

  // Infinity - endless recursion
  if (type === 'infinity') {
    const scale = 60 + bass * 20;

    // Lemniscate (infinity symbol)
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 2; t += 0.05) {
      const x = scale * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
      const y = scale * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Rainbow gradient stroke
    const grad = ctx.createLinearGradient(-scale, 0, scale, 0);
    palette.colors.forEach((color, i) => {
      grad.addColorStop(i / (palette.colors.length - 1), color);
    });
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6 + beat * 4;
    ctx.stroke();

    // Nested infinities
    for (let layer = 1; layer <= 3; layer++) {
      const layerScale = scale * (1 - layer * 0.25);
      const offset = Math.sin(time * 0.002 + layer) * 5;

      ctx.beginPath();
      for (let t = 0; t < Math.PI * 2; t += 0.1) {
        const x = layerScale * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t)) + offset;
        const y = layerScale * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = palette.colors[layer % palette.colors.length] + '60';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Unity - all is one
  if (type === 'unity') {
    const radius = 80 + bass * 30;

    // All colors merging into white center
    for (let r = radius; r > 0; r -= 5) {
      const t = r / radius;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);

      if (t > 0.7) {
        ctx.strokeStyle = palette.colors[Math.floor((1 - t) * palette.colors.length * 3) % palette.colors.length] + 'aa';
      } else if (t > 0.3) {
        ctx.strokeStyle = `rgba(200, 200, 255, ${0.5 + (1 - t) * 0.3})`;
      } else {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 + beat * 0.2})`;
      }
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Central unity point
    const unityGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
    unityGlow.addColorStop(0, '#ffffff');
    unityGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = unityGlow;
    ctx.fillRect(-40, -40, 80, 80);
  }

  // Transcendence - beyond form
  if (type === 'transcendence') {
    // Ascending light particles
    for (let i = 0; i < 60; i++) {
      const t = (time * 0.001 + i * 0.05) % 1;
      const x = (Math.sin(i * 2.1) * 100) * (1 - t * 0.5);
      const y = 150 - t * 300; // Rising upward

      const size = (1 - t) * 5 + bass * 3;
      const alpha = Math.sin(t * Math.PI);

      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      glow.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);
    }

    // Light rays from above
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI - Math.PI / 2 + Math.sin(time * 0.001) * 0.1;
      const spread = 0.3;

      ctx.beginPath();
      ctx.moveTo(0, -h * 0.4);
      ctx.lineTo(Math.cos(angle - spread) * w * 0.5, h * 0.4);
      ctx.lineTo(Math.cos(angle + spread) * w * 0.5, h * 0.4);
      ctx.closePath();

      const rayGrad = ctx.createLinearGradient(0, -h * 0.4, 0, h * 0.4);
      rayGrad.addColorStop(0, `rgba(255, 255, 200, ${0.1 + beat * 0.1})`);
      rayGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rayGrad;
      ctx.fill();
    }
  }
}

// ============================================
// 5D LAYER - Fifth dimensional objects
// ============================================
function draw5DLayer(ctx: CanvasRenderingContext2D, type: string, _w: number, _h: number, bass: number, beat: number, time: number, palette: {colors: string[]}) {

  // Penteract - 5D hypercube
  if (type === 'penteract') {
    const size = 50 + bass * 20;
    const rotation1 = time * 0.0008;
    const rotation2 = time * 0.0006;

    // 5D has 32 vertices, project down to 2D through multiple rotations
    for (let layer = 0; layer < 3; layer++) {
      const layerOffset = layer * 0.3;
      const layerSize = size * (1 - layer * 0.25);

      ctx.save();
      ctx.rotate(rotation1 + layerOffset);

      // Draw nested hypercube projections
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + rotation2;
        const r = layerSize * (0.8 + Math.sin(time * 0.002 + i) * 0.2);

        ctx.beginPath();
        ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 3 + beat * 2, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[layer % palette.colors.length] + 'cc';
        ctx.fill();

        // Connect to adjacent vertices
        const nextAngle = ((i + 1) / 8) * Math.PI * 2 + rotation2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        ctx.lineTo(Math.cos(nextAngle) * r, Math.sin(nextAngle) * r);
        ctx.strokeStyle = palette.colors[layer % palette.colors.length] + '60';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    }

    // Cross-dimensional connections
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const innerR = size * 0.5;
      const outerR = size;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle + rotation1) * innerR, Math.sin(angle + rotation1) * innerR);
      ctx.lineTo(Math.cos(angle + rotation2) * outerR, Math.sin(angle + rotation2) * outerR);
      ctx.strokeStyle = palette.colors[0] + '30';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // 5-simplex - 5D tetrahedron
  if (type === '5-simplex') {
    const size = 70 + bass * 25;
    const rotation = time * 0.001;

    // 6 vertices in 5D, project to 2D
    const vertices: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + rotation;
      const r = size * (0.7 + Math.sin(time * 0.002 + i * 1.5) * 0.3);
      vertices.push([Math.cos(angle) * r, Math.sin(angle) * r]);
    }

    // Connect all vertices (complete graph K6)
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 6; j++) {
        ctx.beginPath();
        ctx.moveTo(vertices[i][0], vertices[i][1]);
        ctx.lineTo(vertices[j][0], vertices[j][1]);
        ctx.strokeStyle = palette.colors[(i + j) % palette.colors.length] + '50';
        ctx.lineWidth = 1 + beat;
        ctx.stroke();
      }

      // Vertex glow
      ctx.beginPath();
      ctx.arc(vertices[i][0], vertices[i][1], 5 + bass * 3, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length] + 'cc';
      ctx.fill();
    }
  }

  // 5-orthoplex - 5D cross-polytope
  if (type === '5-orthoplex') {
    const size = 60 + bass * 20;
    const rotation = time * 0.0008;

    // 10 vertices (±1, 0, 0, 0, 0) etc
    for (let dim = 0; dim < 5; dim++) {
      const angle1 = rotation + dim * 0.4;
      const angle2 = rotation + dim * 0.4 + Math.PI;

      const r = size * (0.8 + Math.sin(time * 0.003 + dim) * 0.2);
      const x1 = Math.cos(angle1) * r;
      const y1 = Math.sin(angle1) * r;
      const x2 = Math.cos(angle2) * r;
      const y2 = Math.sin(angle2) * r;

      // Axis line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = palette.colors[dim % palette.colors.length] + '80';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vertices
      ctx.beginPath();
      ctx.arc(x1, y1, 4 + beat * 2, 0, Math.PI * 2);
      ctx.arc(x2, y2, 4 + beat * 2, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[dim % palette.colors.length] + 'ee';
      ctx.fill();
    }
  }

  // 5-demicube
  if (type === '5-demicube') {
    const size = 55 + bass * 20;
    const rotation = time * 0.0007;

    // 16 vertices, half of 5-cube
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + rotation;
      const r = size * (0.6 + (i % 2) * 0.4);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      ctx.beginPath();
      ctx.arc(x, y, 3 + beat, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length] + 'cc';
      ctx.fill();

      // Connect to next vertex
      const nextAngle = ((i + 1) / 16) * Math.PI * 2 + rotation;
      const nextR = size * (0.6 + ((i + 1) % 2) * 0.4);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(Math.cos(nextAngle) * nextR, Math.sin(nextAngle) * nextR);
      ctx.strokeStyle = palette.colors[0] + '40';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Pentasphere - 5D sphere
  if (type === 'pentasphere') {
    const baseRadius = 70 + bass * 25;

    for (let layer = 0; layer < 5; layer++) {
      const phase = time * 0.001 + layer * 0.4;
      const w = Math.sin(phase);
      const v = Math.cos(phase * 1.3);
      const radius = baseRadius * Math.sqrt(Math.max(0.1, 1 - w * w - v * v * 0.5));

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = palette.colors[layer % palette.colors.length] + '80';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Points on the sphere slice
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + phase;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(x, y, 2 + beat, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[layer % palette.colors.length] + 'cc';
        ctx.fill();
      }
    }
  }
}

// ============================================
// 6D+ LAYER - Sixth dimension and beyond
// ============================================
function draw6DLayer(ctx: CanvasRenderingContext2D, type: string, _w: number, _h: number, bass: number, beat: number, time: number, palette: {colors: string[]}) {

  // Hexeract - 6D hypercube
  if (type === 'hexeract') {
    const size = 45 + bass * 15;

    for (let layer = 0; layer < 4; layer++) {
      const rotation = time * 0.0005 * (layer + 1);
      const layerSize = size * (1 - layer * 0.2);

      ctx.save();
      ctx.rotate(rotation);

      // Each layer represents a 2D slice of the 6D cube
      const vertices = 12;
      for (let i = 0; i < vertices; i++) {
        const angle = (i / vertices) * Math.PI * 2;
        const r = layerSize * (0.8 + Math.sin(time * 0.002 + i + layer) * 0.2);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        ctx.beginPath();
        ctx.arc(x, y, 2 + beat, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[layer % palette.colors.length] + 'cc';
        ctx.fill();

        // Edges
        const nextAngle = ((i + 1) % vertices / vertices) * Math.PI * 2;
        const nextR = layerSize * (0.8 + Math.sin(time * 0.002 + i + 1 + layer) * 0.2);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(Math.cos(nextAngle) * nextR, Math.sin(nextAngle) * nextR);
        ctx.strokeStyle = palette.colors[layer % palette.colors.length] + '40';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // E8 Lattice - 8-dimensional exceptional Lie group
  if (type === 'e8-lattice') {
    const size = 80 + bass * 30;
    const rotation = time * 0.0003;

    // E8 has 240 root vectors - we show a projection
    for (let ring = 0; ring < 8; ring++) {
      const ringR = size * (0.3 + ring * 0.1);
      const points = 30;

      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2 + rotation * (ring + 1);
        const wobble = Math.sin(time * 0.002 + i * 0.5 + ring) * 5;
        const x = Math.cos(angle) * (ringR + wobble);
        const y = Math.sin(angle) * (ringR + wobble);

        ctx.beginPath();
        ctx.arc(x, y, 1.5 + beat, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[ring % palette.colors.length] + 'aa';
        ctx.fill();
      }
    }

    // Central structure
    const centralGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.3);
    centralGlow.addColorStop(0, palette.colors[0] + '40');
    centralGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = centralGlow;
    ctx.fillRect(-size, -size, size * 2, size * 2);
  }

  // 6-simplex
  if (type === '6-simplex') {
    const size = 65 + bass * 20;
    const rotation = time * 0.0008;

    // 7 vertices, all connected
    const vertices: [number, number][] = [];
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + rotation;
      const r = size * (0.6 + Math.sin(time * 0.002 + i * 1.2) * 0.4);
      vertices.push([Math.cos(angle) * r, Math.sin(angle) * r]);
    }

    // All edges
    for (let i = 0; i < 7; i++) {
      for (let j = i + 1; j < 7; j++) {
        ctx.beginPath();
        ctx.moveTo(vertices[i][0], vertices[i][1]);
        ctx.lineTo(vertices[j][0], vertices[j][1]);
        ctx.strokeStyle = palette.colors[(i + j) % palette.colors.length] + '30';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(vertices[i][0], vertices[i][1], 4 + beat * 2, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length] + 'dd';
      ctx.fill();
    }
  }

  // Gosset polytope (4_21)
  if (type === 'gosset') {
    const size = 70 + bass * 25;
    const rotation = time * 0.0006;

    // 240 vertices - show representative sample
    for (let layer = 0; layer < 6; layer++) {
      ctx.save();
      ctx.rotate(rotation + layer * Math.PI / 6);

      const layerR = size * (0.4 + layer * 0.1);
      const points = 24;

      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const x = Math.cos(angle) * layerR;
        const y = Math.sin(angle) * layerR;

        ctx.beginPath();
        ctx.arc(x, y, 2 + beat, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[layer % palette.colors.length] + 'bb';
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Leech Lattice - 24 dimensions
  if (type === 'leech-lattice') {
    const size = 90 + bass * 30;
    const rotation = time * 0.0004;

    // 196560 minimal vectors - show artistic representation
    for (let shell = 0; shell < 5; shell++) {
      const shellR = size * (0.3 + shell * 0.15);
      const density = 48 - shell * 6;

      for (let i = 0; i < density; i++) {
        const angle = (i / density) * Math.PI * 2 + rotation * (shell + 1);
        const jitter = Math.sin(time * 0.003 + i + shell * 10) * 3;
        const x = Math.cos(angle) * (shellR + jitter);
        const y = Math.sin(angle) * (shellR + jitter);

        ctx.beginPath();
        ctx.arc(x, y, 1 + bass, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[shell % palette.colors.length] + 'aa';
        ctx.fill();
      }
    }

    // Ethereal connections
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + rotation;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
      ctx.strokeStyle = palette.colors[i % palette.colors.length] + '15';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// ============================================
// FRACTAL LAYER - Infinite self-similar patterns
// ============================================
function drawFractalLayer(ctx: CanvasRenderingContext2D, type: string, w: number, h: number, bass: number, beat: number, time: number, palette: {colors: string[]}) {

  // Mandelbrot Set
  if (type === 'mandelbrot') {
    const zoom = 2 + Math.sin(time * 0.0005) * 0.5;
    const offsetX = -0.5 + Math.sin(time * 0.0003) * 0.2;
    const offsetY = Math.cos(time * 0.0004) * 0.2;
    const maxIter = 20 + Math.floor(bass * 10);
    const step = 8;

    for (let px = -w * 0.4; px < w * 0.4; px += step) {
      for (let py = -h * 0.4; py < h * 0.4; py += step) {
        const x0 = (px / (w * 0.4)) * zoom + offsetX;
        const y0 = (py / (h * 0.4)) * zoom + offsetY;

        let x = 0, y = 0;
        let iter = 0;

        while (x * x + y * y <= 4 && iter < maxIter) {
          const xtemp = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xtemp;
          iter++;
        }

        if (iter < maxIter) {
          const colorIdx = Math.floor((iter / maxIter) * palette.colors.length);
          ctx.fillStyle = palette.colors[colorIdx % palette.colors.length] + Math.floor((iter / maxIter) * 200 + 55).toString(16);
          ctx.fillRect(px, py, step, step);
        }
      }
    }
  }

  // Julia Set
  if (type === 'julia') {
    const cRe = -0.7 + Math.sin(time * 0.0003) * 0.2;
    const cIm = 0.27 + Math.cos(time * 0.0004) * 0.1;
    const maxIter = 25 + Math.floor(bass * 10);
    const step = 8;

    for (let px = -w * 0.4; px < w * 0.4; px += step) {
      for (let py = -h * 0.4; py < h * 0.4; py += step) {
        let x = (px / (w * 0.4)) * 2;
        let y = (py / (h * 0.4)) * 2;
        let iter = 0;

        while (x * x + y * y <= 4 && iter < maxIter) {
          const xtemp = x * x - y * y + cRe;
          y = 2 * x * y + cIm;
          x = xtemp;
          iter++;
        }

        if (iter < maxIter) {
          const colorIdx = Math.floor((iter / maxIter) * palette.colors.length);
          ctx.fillStyle = palette.colors[colorIdx % palette.colors.length] + 'aa';
          ctx.fillRect(px, py, step, step);
        }
      }
    }
  }

  // Sierpinski Triangle
  if (type === 'sierpinski') {
    const size = 150 + bass * 50;
    const rotation = time * 0.0003;

    const drawSierpinski = (x: number, y: number, s: number, depth: number) => {
      if (depth === 0 || s < 5) {
        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.866);
        ctx.lineTo(x - s / 2, y + s * 0.433);
        ctx.lineTo(x + s / 2, y + s * 0.433);
        ctx.closePath();
        ctx.fillStyle = palette.colors[depth % palette.colors.length] + 'aa';
        ctx.fill();
        return;
      }

      const newS = s / 2;
      drawSierpinski(x, y - newS * 0.433, newS, depth - 1);
      drawSierpinski(x - newS / 2, y + newS * 0.433, newS, depth - 1);
      drawSierpinski(x + newS / 2, y + newS * 0.433, newS, depth - 1);
    };

    ctx.save();
    ctx.rotate(rotation);
    drawSierpinski(0, 0, size, 5 + Math.floor(beat * 2));
    ctx.restore();
  }

  // Koch Snowflake
  if (type === 'koch') {
    const size = 100 + bass * 40;
    const rotation = time * 0.0004;

    ctx.save();
    ctx.rotate(rotation);

    const depth = 4;
    const drawKochLine = (x1: number, y1: number, x2: number, y2: number, d: number) => {
      if (d === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = palette.colors[0] + 'cc';
        ctx.lineWidth = 1;
        ctx.stroke();
        return;
      }

      const dx = x2 - x1;
      const dy = y2 - y1;

      const x3 = x1 + dx / 3;
      const y3 = y1 + dy / 3;
      const x5 = x1 + dx * 2 / 3;
      const y5 = y1 + dy * 2 / 3;

      const x4 = (x1 + x2) / 2 + (y1 - y2) * Math.sqrt(3) / 6;
      const y4 = (y1 + y2) / 2 + (x2 - x1) * Math.sqrt(3) / 6;

      drawKochLine(x1, y1, x3, y3, d - 1);
      drawKochLine(x3, y3, x4, y4, d - 1);
      drawKochLine(x4, y4, x5, y5, d - 1);
      drawKochLine(x5, y5, x2, y2, d - 1);
    };

    // Three sides
    const h = size * Math.sqrt(3) / 2;
    drawKochLine(-size / 2, h / 3, size / 2, h / 3, depth);
    drawKochLine(size / 2, h / 3, 0, -h * 2 / 3, depth);
    drawKochLine(0, -h * 2 / 3, -size / 2, h / 3, depth);

    ctx.restore();
  }

  // Dragon Curve
  if (type === 'dragon') {
    const size = 3 + bass;
    const iterations = 12;
    let sequence = 'R';

    for (let i = 0; i < iterations; i++) {
      sequence = sequence + 'R' + sequence.split('').reverse().map(c => c === 'R' ? 'L' : 'R').join('');
    }

    let x = 0, y = 0;
    let angle = time * 0.0005;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 0; i < Math.min(sequence.length, 2000); i++) {
      x += Math.cos(angle) * size;
      y += Math.sin(angle) * size;
      ctx.lineTo(x, y);
      angle += (sequence[i] === 'R' ? 1 : -1) * Math.PI / 2;
    }

    ctx.strokeStyle = palette.colors[0] + 'cc';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Tree Fractal
  if (type === 'tree-fractal') {
    const drawBranch = (x: number, y: number, len: number, angle: number, depth: number) => {
      if (depth === 0 || len < 3) return;

      const endX = x + Math.cos(angle) * len;
      const endY = y + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = palette.colors[depth % palette.colors.length] + 'cc';
      ctx.lineWidth = depth * 0.5;
      ctx.stroke();

      const spread = 0.4 + bass * 0.2;
      const shrink = 0.7;

      drawBranch(endX, endY, len * shrink, angle - spread, depth - 1);
      drawBranch(endX, endY, len * shrink, angle + spread, depth - 1);
    };

    drawBranch(0, 100, 60 + bass * 20, -Math.PI / 2 + Math.sin(time * 0.001) * 0.1, 8);
  }

  // Menger Sponge (2D projection)
  if (type === 'menger') {
    const size = 150 + bass * 30;
    const rotation = time * 0.0004;

    ctx.save();
    ctx.rotate(rotation);

    const drawMenger = (x: number, y: number, s: number, depth: number) => {
      if (depth === 0 || s < 3) {
        ctx.fillStyle = palette.colors[0] + 'aa';
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
        return;
      }

      const newS = s / 3;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue; // Center hole
          drawMenger(x + i * newS, y + j * newS, newS, depth - 1);
        }
      }
    };

    drawMenger(0, 0, size, 3 + Math.floor(beat));
    ctx.restore();
  }

  // Apollonian Gasket
  if (type === 'apollonian') {
    const drawCircle = (x: number, y: number, r: number, depth: number) => {
      if (depth === 0 || r < 3) return;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = palette.colors[depth % palette.colors.length] + 'aa';
      ctx.lineWidth = 1;
      ctx.stroke();

      const newR = r * 0.5;
      drawCircle(x, y - r + newR, newR, depth - 1);
      drawCircle(x - (r - newR) * 0.866, y + (r - newR) * 0.5, newR, depth - 1);
      drawCircle(x + (r - newR) * 0.866, y + (r - newR) * 0.5, newR, depth - 1);
    };

    drawCircle(0, 0, 100 + bass * 30, 6);
  }
}

// ============================================
// CHAOS LAYER - Strange Attractors
// ============================================
function drawChaosLayer(ctx: CanvasRenderingContext2D, type: string, _w: number, _h: number, bass: number, beat: number, time: number, palette: {colors: string[]}) {

  // Lorenz Attractor
  if (type === 'lorenz') {
    const sigma = 10, rho = 28, beta = 8 / 3;
    const dt = 0.01;
    const scale = 4 + bass;
    const points: [number, number, number][] = [];

    let x = 0.1, y = 0, z = 0;

    for (let i = 0; i < 3000; i++) {
      const dx = sigma * (y - x) * dt;
      const dy = (x * (rho - z) - y) * dt;
      const dz = (x * y - beta * z) * dt;
      x += dx; y += dy; z += dz;
      points.push([x, y, z]);
    }

    const rotation = time * 0.0003;

    ctx.beginPath();
    points.forEach((p, i) => {
      const rx = p[0] * Math.cos(rotation) - p[2] * Math.sin(rotation);
      const ry = p[1];
      const px = rx * scale;
      const py = (ry - 25) * scale;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = palette.colors[0] + 'cc';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Highlight points
    for (let i = 0; i < points.length; i += 100) {
      const p = points[i];
      const rx = p[0] * Math.cos(rotation) - p[2] * Math.sin(rotation);
      const ry = p[1];
      ctx.beginPath();
      ctx.arc(rx * scale, (ry - 25) * scale, 2 + beat, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[(i / 100) % palette.colors.length] + 'ee';
      ctx.fill();
    }
  }

  // Rössler Attractor
  if (type === 'rossler') {
    const a = 0.2, b = 0.2, c = 5.7;
    const dt = 0.02;
    const scale = 8 + bass * 2;
    const points: [number, number, number][] = [];

    let x = 0.1, y = 0.1, z = 0.1;

    for (let i = 0; i < 2000; i++) {
      const dx = (-y - z) * dt;
      const dy = (x + a * y) * dt;
      const dz = (b + z * (x - c)) * dt;
      x += dx; y += dy; z += dz;
      points.push([x, y, z]);
    }

    const rotation = time * 0.0004;

    ctx.beginPath();
    points.forEach((p, i) => {
      const rx = p[0] * Math.cos(rotation) - p[1] * Math.sin(rotation);
      const ry = p[0] * Math.sin(rotation) + p[1] * Math.cos(rotation);
      if (i === 0) ctx.moveTo(rx * scale, ry * scale);
      else ctx.lineTo(rx * scale, ry * scale);
    });
    ctx.strokeStyle = palette.colors[1 % palette.colors.length] + 'cc';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Chua's Circuit
  if (type === 'chua') {
    const alpha = 15.6, beta = 28, m0 = -1.143, m1 = -0.714;
    const dt = 0.01;
    const scale = 15 + bass * 3;

    let x = 0.7, y = 0, z = 0;

    ctx.beginPath();
    for (let i = 0; i < 2000; i++) {
      const h = m1 * x + 0.5 * (m0 - m1) * (Math.abs(x + 1) - Math.abs(x - 1));
      const dx = alpha * (y - x - h) * dt;
      const dy = (x - y + z) * dt;
      const dz = -beta * y * dt;
      x += dx; y += dy; z += dz;

      const px = x * scale;
      const py = y * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = palette.colors[2 % palette.colors.length] + 'cc';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Halvorsen Attractor
  if (type === 'halvorsen') {
    const a = 1.89;
    const dt = 0.005;
    const scale = 12 + bass * 2;
    const rotation = time * 0.0003;

    let x = -5, y = 0, z = 0;

    ctx.beginPath();
    for (let i = 0; i < 3000; i++) {
      const dx = (-a * x - 4 * y - 4 * z - y * y) * dt;
      const dy = (-a * y - 4 * z - 4 * x - z * z) * dt;
      const dz = (-a * z - 4 * x - 4 * y - x * x) * dt;
      x += dx; y += dy; z += dz;

      const rx = x * Math.cos(rotation) - z * Math.sin(rotation);
      const ry = y;
      if (i === 0) ctx.moveTo(rx * scale, ry * scale);
      else ctx.lineTo(rx * scale, ry * scale);
    }
    ctx.strokeStyle = palette.colors[0] + 'bb';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Thomas Attractor
  if (type === 'thomas') {
    const b = 0.208186;
    const dt = 0.04;
    const scale = 40 + bass * 10;
    const rotation = time * 0.0004;

    let x = 1.1, y = 1.1, z = -0.01;

    ctx.beginPath();
    for (let i = 0; i < 2500; i++) {
      const dx = (Math.sin(y) - b * x) * dt;
      const dy = (Math.sin(z) - b * y) * dt;
      const dz = (Math.sin(x) - b * z) * dt;
      x += dx; y += dy; z += dz;

      const rx = x * Math.cos(rotation) - y * Math.sin(rotation);
      const ry = x * Math.sin(rotation) + y * Math.cos(rotation);
      if (i === 0) ctx.moveTo(rx * scale, ry * scale);
      else ctx.lineTo(rx * scale, ry * scale);
    }
    ctx.strokeStyle = palette.colors[3 % palette.colors.length] + 'cc';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Aizawa Attractor
  if (type === 'aizawa') {
    const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1;
    const dt = 0.01;
    const scale = 60 + bass * 15;
    const rotation = time * 0.0003;

    let x = 0.1, y = 0, z = 0;

    ctx.beginPath();
    for (let i = 0; i < 3000; i++) {
      const dx = ((z - b) * x - d * y) * dt;
      const dy = (d * x + (z - b) * y) * dt;
      const dz = (c + a * z - z * z * z / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x) * dt;
      x += dx; y += dy; z += dz;

      const rx = x * Math.cos(rotation) - y * Math.sin(rotation);
      const ry = z;
      if (i === 0) ctx.moveTo(rx * scale, ry * scale);
      else ctx.lineTo(rx * scale, ry * scale);
    }
    ctx.strokeStyle = palette.colors[4 % palette.colors.length] + 'cc';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// ============================================
// REALITY LAYER - Simulation / Meta-reality
// ============================================
function drawRealityLayer(ctx: CanvasRenderingContext2D, type: string, w: number, h: number, bass: number, beat: number, time: number, palette: {colors: string[]}) {

  // Matrix Rain
  if (type === 'matrix') {
    const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789';
    const columns = 30;
    const columnWidth = w / columns;

    for (let col = 0; col < columns; col++) {
      const x = -w / 2 + col * columnWidth + columnWidth / 2;
      const speed = 0.5 + (col % 5) * 0.2;
      const offset = (time * speed * 0.1 + col * 50) % (h * 1.5);

      for (let row = 0; row < 15; row++) {
        const y = -h / 2 + offset + row * 20 - h * 0.25;
        if (y < -h / 2 || y > h / 2) continue;

        const charIdx = Math.floor((time * 0.01 + col + row) % chars.length);
        const alpha = 1 - row / 15;

        ctx.font = '14px monospace';
        ctx.fillStyle = row === 0
          ? `rgba(200, 255, 200, ${alpha})`
          : `rgba(0, ${150 + bass * 100}, 0, ${alpha * 0.7})`;
        ctx.fillText(chars[charIdx], x, y);
      }
    }
  }

  // Glitch Effect
  if (type === 'glitch') {
    const glitchIntensity = bass * 0.5 + beat * 0.3;

    for (let i = 0; i < 10 + glitchIntensity * 20; i++) {
      const x = (Math.random() - 0.5) * w;
      const y = (Math.random() - 0.5) * h;
      const gw = 20 + Math.random() * 100;
      const gh = 2 + Math.random() * 10;

      ctx.fillStyle = palette.colors[Math.floor(Math.random() * palette.colors.length)] + Math.floor(Math.random() * 100 + 50).toString(16);
      ctx.fillRect(x, y, gw, gh);
    }

    // Scan lines
    for (let y = -h / 2; y < h / 2; y += 4) {
      if (Math.random() < 0.3) {
        ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.2})`;
        ctx.fillRect(-w / 2, y, w, 2);
      }
    }

    // RGB shift
    if (beat > 0.5) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.05)';
      ctx.fillRect(-w / 2 + 3, -h / 2, w, h);
      ctx.fillStyle = 'rgba(0, 0, 255, 0.05)';
      ctx.fillRect(-w / 2 - 3, -h / 2, w, h);
    }
  }

  // Simulation Grid
  if (type === 'simulation') {
    const gridSize = 30;
    const pulse = Math.sin(time * 0.002) * 0.3 + 0.7;

    // Perspective grid
    for (let z = 1; z <= 10; z++) {
      const scale = 1 / z;
      const y = h * 0.4 * (1 - scale);

      ctx.beginPath();
      ctx.moveTo(-w * 0.5, y);
      ctx.lineTo(w * 0.5, y);
      ctx.strokeStyle = `rgba(0, ${200 + bass * 55}, ${200 + bass * 55}, ${scale * pulse})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Vertical lines converging
    for (let x = -10; x <= 10; x++) {
      const startX = x * gridSize;
      ctx.beginPath();
      ctx.moveTo(startX, h * 0.4);
      ctx.lineTo(0, -h * 0.3);
      ctx.strokeStyle = `rgba(0, ${200 + bass * 55}, ${200 + bass * 55}, ${0.3 + beat * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Data points
    for (let i = 0; i < 20; i++) {
      const t = (time * 0.001 + i * 0.1) % 1;
      const x = (Math.sin(i * 2.3) * 100) * (1 - t);
      const y = h * 0.4 - t * h * 0.7;

      ctx.beginPath();
      ctx.arc(x, y, 2 + beat * 2, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length] + 'cc';
      ctx.fill();
    }
  }

  // Observer Effect
  if (type === 'observer') {
    // Central observer eye
    const eyeSize = 40 + bass * 20;

    ctx.beginPath();
    ctx.ellipse(0, 0, eyeSize, eyeSize * 0.6, 0, 0, Math.PI * 2);
    ctx.strokeStyle = palette.colors[0] + 'cc';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pupil that follows
    const pupilX = Math.sin(time * 0.002) * 10;
    const pupilY = Math.cos(time * 0.003) * 5;
    ctx.beginPath();
    ctx.arc(pupilX, pupilY, eyeSize * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Observation waves collapsing probability
    for (let ring = 0; ring < 8; ring++) {
      const r = eyeSize + 30 + ring * 25 + Math.sin(time * 0.003 + ring) * 10;
      const collapse = Math.sin(time * 0.002 - ring * 0.3);

      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.1) {
        const wobble = Math.sin(a * 8 + time * 0.005) * 5 * (1 - Math.abs(collapse));
        const px = Math.cos(a) * (r + wobble);
        const py = Math.sin(a) * (r + wobble) * 0.6;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = palette.colors[ring % palette.colors.length] + Math.floor((1 - ring / 8) * 150 + 50).toString(16);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Wavefunction Collapse
  if (type === 'collapse') {
    const collapsed = Math.sin(time * 0.002) > 0;

    if (collapsed) {
      // Definite state - single point
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 50 + bass * 30);
      glow.addColorStop(0, palette.colors[0] + 'ff');
      glow.addColorStop(0.5, palette.colors[0] + '40');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(-100, -100, 200, 200);
    } else {
      // Superposition - probability cloud
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 100 + bass * 50;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;

        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[i % palette.colors.length] + '60';
        ctx.fill();
      }
    }
  }

  // Indra's Net - infinite reflections
  if (type === 'indras-net') {
    const gridSize = 50;
    const cols = Math.ceil(w / gridSize);
    const rows = Math.ceil(h / gridSize);

    for (let i = -cols / 2; i < cols / 2; i++) {
      for (let j = -rows / 2; j < rows / 2; j++) {
        const x = i * gridSize;
        const y = j * gridSize;
        const phase = time * 0.002 + i * 0.3 + j * 0.3;
        const brightness = Math.sin(phase) * 0.5 + 0.5;

        // Jewel
        ctx.beginPath();
        ctx.arc(x, y, 3 + brightness * 5 + bass * 3, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[(i + j + 10) % palette.colors.length] + Math.floor(brightness * 200 + 55).toString(16);
        ctx.fill();

        // Reflection threads
        if (i < cols / 2 - 1) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + gridSize, y);
          ctx.strokeStyle = palette.colors[0] + '20';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        if (j < rows / 2 - 1) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + gridSize);
          ctx.strokeStyle = palette.colors[0] + '20';
          ctx.stroke();
        }
      }
    }
  }

  // Holofractal
  if (type === 'holofractal') {
    const layers = 5;
    for (let layer = 0; layer < layers; layer++) {
      const scale = 1 - layer * 0.15;
      const rotation = time * 0.0005 * (layer + 1);
      const size = 80 * scale + bass * 20;

      ctx.save();
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Torus-like structure at each layer
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2;
        const r = size;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r * 0.5;

        ctx.beginPath();
        ctx.arc(x, y, 3 + beat, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[layer % palette.colors.length] + 'aa';
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Time Crystal
  if (type === 'time-crystal') {
    const phases = 6;
    const currentPhase = Math.floor((time * 0.001) % phases);

    for (let p = 0; p < phases; p++) {
      const active = p === currentPhase;
      const size = 60 + bass * 20;
      const angle = (p / phases) * Math.PI * 2;

      ctx.save();
      ctx.rotate(angle);
      ctx.translate(0, -size);

      // Crystal structure
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(15, 0);
      ctx.lineTo(0, 20);
      ctx.lineTo(-15, 0);
      ctx.closePath();

      ctx.fillStyle = active
        ? palette.colors[p % palette.colors.length] + 'ee'
        : palette.colors[p % palette.colors.length] + '40';
      ctx.fill();
      ctx.strokeStyle = palette.colors[p % palette.colors.length] + 'cc';
      ctx.lineWidth = active ? 2 : 1;
      ctx.stroke();

      ctx.restore();
    }

    // Time flow indicator
    ctx.beginPath();
    ctx.arc(0, 0, 30 + beat * 10, 0, (time * 0.002) % (Math.PI * 2));
    ctx.strokeStyle = palette.colors[currentPhase % palette.colors.length] + 'cc';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// ============================================
// PARADOX LAYER - Impossible / Mind-bending geometry
// ============================================
function drawParadoxLayer(ctx: CanvasRenderingContext2D, type: string, _w: number, _h: number, bass: number, beat: number, time: number, palette: {colors: string[]}) {

  // Penrose Triangle
  if (type === 'penrose') {
    const size = 70 + bass * 20;
    const rotation = time * 0.0005;

    ctx.save();
    ctx.rotate(rotation);

    const thickness = 15;

    // Draw three impossible beams
    for (let beam = 0; beam < 3; beam++) {
      ctx.save();
      ctx.rotate((beam * 2 * Math.PI) / 3);

      ctx.beginPath();
      ctx.moveTo(-size / 2, size * 0.3);
      ctx.lineTo(0, -size * 0.5);
      ctx.lineTo(size / 2, size * 0.3);
      ctx.lineTo(size / 2 - thickness, size * 0.3);
      ctx.lineTo(0, -size * 0.5 + thickness * 1.5);
      ctx.lineTo(-size / 2 + thickness, size * 0.3);
      ctx.closePath();

      ctx.fillStyle = palette.colors[beam % palette.colors.length] + 'cc';
      ctx.fill();
      ctx.strokeStyle = palette.colors[beam % palette.colors.length];
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  // Escher-style impossible cube
  if (type === 'impossible') {
    const size = 60 + bass * 15;
    const rotation = time * 0.0006;

    ctx.save();
    ctx.rotate(rotation);

    // Front face
    ctx.beginPath();
    ctx.rect(-size / 2, -size / 2, size, size);
    ctx.fillStyle = palette.colors[0] + '80';
    ctx.fill();
    ctx.strokeStyle = palette.colors[0] + 'cc';
    ctx.lineWidth = 2;
    ctx.stroke();

    // "Back" face offset (the impossible part)
    const offset = size * 0.4;
    ctx.beginPath();
    ctx.rect(-size / 2 + offset, -size / 2 - offset, size, size);
    ctx.fillStyle = palette.colors[1 % palette.colors.length] + '60';
    ctx.fill();
    ctx.strokeStyle = palette.colors[1 % palette.colors.length] + 'cc';
    ctx.stroke();

    // Impossible connecting edges
    ctx.beginPath();
    ctx.moveTo(-size / 2, -size / 2);
    ctx.lineTo(-size / 2 + offset, -size / 2 - offset);
    ctx.moveTo(size / 2, -size / 2);
    ctx.lineTo(size / 2 + offset, -size / 2 - offset);
    ctx.moveTo(-size / 2, size / 2);
    ctx.lineTo(-size / 2 + offset, size / 2 - offset);
    ctx.moveTo(size / 2, size / 2);
    ctx.lineTo(size / 2 + offset, size / 2 - offset);
    ctx.strokeStyle = palette.colors[2 % palette.colors.length] + 'aa';
    ctx.stroke();

    ctx.restore();
  }

  // Möbius Strip
  if (type === 'mobius') {
    const R = 70 + bass * 20;
    const w = 25;
    const rotation = time * 0.0008;

    ctx.save();
    ctx.rotate(rotation * 0.3);

    for (let u = 0; u < Math.PI * 2; u += 0.03) {
      for (let v = -1; v <= 1; v += 0.3) {
        const x = (R + v * w * Math.cos(u / 2)) * Math.cos(u);
        const y = (R + v * w * Math.cos(u / 2)) * Math.sin(u);
        const z = v * w * Math.sin(u / 2);

        const scale = 200 / (200 + z);
        const px = x * scale;
        const py = y * scale * 0.4;

        const colorIdx = Math.floor((u / (Math.PI * 2)) * palette.colors.length);
        ctx.beginPath();
        ctx.arc(px, py, 2 + beat, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[colorIdx % palette.colors.length] + 'bb';
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Hyperbolic Tiling
  if (type === 'hyperbolic') {
    const radius = 100 + bass * 20;

    // Poincaré disk boundary
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = palette.colors[0] + '60';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hyperbolic tiling (order-7 triangular)
    for (let ring = 1; ring <= 5; ring++) {
      const n = 7 * ring;
      const r = radius * (1 - Math.pow(0.55, ring));

      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2 + time * 0.0002 * ring;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        ctx.beginPath();
        ctx.arc(x, y, 3 - ring * 0.4 + beat, 0, Math.PI * 2);
        ctx.fillStyle = palette.colors[ring % palette.colors.length] + 'cc';
        ctx.fill();

        // Geodesic to next point
        const nextAngle = ((i + 1) / n) * Math.PI * 2 + time * 0.0002 * ring;
        const nextX = Math.cos(nextAngle) * r;
        const nextY = Math.sin(nextAngle) * r;

        ctx.beginPath();
        ctx.moveTo(x, y);
        const midX = (x + nextX) / 2;
        const midY = (y + nextY) / 2;
        ctx.quadraticCurveTo(midX * 1.1, midY * 1.1, nextX, nextY);
        ctx.strokeStyle = palette.colors[ring % palette.colors.length] + '40';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // Non-Euclidean space
  if (type === 'non-euclidean') {
    // Parallel lines that curve
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      for (let t = -1; t <= 1; t += 0.02) {
        const x = t * 150;
        const curve = Math.sin(t * Math.PI + time * 0.002) * 20 * (1 + Math.abs(i) * 0.2);
        const y = i * 20 + curve + bass * 10 * Math.sin(t * 2);

        if (t === -1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = palette.colors[Math.abs(i) % palette.colors.length] + 'aa';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Curved triangles
    for (let t = 0; t < 3; t++) {
      const angle = (t / 3) * Math.PI * 2 + time * 0.0005;
      const r = 60 + bass * 20;

      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 / 3; a += 0.1) {
        const curveAngle = angle + a;
        const curveR = r + Math.sin(a * 3) * 10;
        const x = Math.cos(curveAngle) * curveR;
        const y = Math.sin(curveAngle) * curveR;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = palette.colors[t % palette.colors.length] + 'cc';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Recursive Reality
  if (type === 'recursive') {
    const drawRecursive = (x: number, y: number, size: number, depth: number) => {
      if (depth === 0 || size < 5) return;

      ctx.beginPath();
      ctx.rect(x - size / 2, y - size / 2, size, size);
      ctx.strokeStyle = palette.colors[depth % palette.colors.length] + 'cc';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner recursive squares
      const newSize = size * 0.6;
      const offset = size * 0.15;
      drawRecursive(x + offset, y + offset, newSize, depth - 1);
    };

    const rotation = time * 0.0003;
    ctx.save();
    ctx.rotate(rotation);
    drawRecursive(0, 0, 150 + bass * 30, 6);
    ctx.restore();
  }
}
