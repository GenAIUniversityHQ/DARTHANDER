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
}

interface PreviewMonitorProps {
  state: VisualState | null;
  canvasId?: string;
}

// Color palettes
const palettes: Record<string, { bg: string; colors: string[] }> = {
  cosmos: { bg: '#050510', colors: ['#8B5CF6', '#EC4899', '#06B6D4', '#3B82F6'] },
  void: { bg: '#000000', colors: ['#1a1a2e', '#16213e', '#0f3460', '#1a1a2e'] },
  fire: { bg: '#0a0000', colors: ['#ff4500', '#ff6b35', '#f7931e', '#ffcc00'] },
  ice: { bg: '#000a14', colors: ['#00d4ff', '#7fdbff', '#39cccc', '#01ff70'] },
  earth: { bg: '#0a0f0a', colors: ['#2ecc71', '#27ae60', '#f39c12', '#e67e22'] },
  neon: { bg: '#05000a', colors: ['#ff00ff', '#00ffff', '#ff0080', '#80ff00'] },
  sacred: { bg: '#0f0a14', colors: ['#ffd700', '#8B5CF6', '#ff69b4', '#00ced1'] },
  ocean: { bg: '#000814', colors: ['#00b4d8', '#0077b6', '#90e0ef', '#48cae4', '#023e8a'] },
  sunset: { bg: '#0a0505', colors: ['#ff6b6b', '#feca57', '#ff9f43', '#ee5a24', '#f368e0'] },
};

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

      const palette = palettes[state?.colorPalette || 'cosmos'] || palettes.cosmos;
      const intensity = state?.overallIntensity ?? 0.5;
      const complexity = state?.geometryComplexity ?? 0.3;
      const motionSpeed = state?.motionSpeed ?? 0.2;
      const geometryMode = state?.geometryMode ?? 'stars';
      const chaos = state?.chaosFactor ?? 0;
      const audioReact = state?.audioReactGeometry ?? 0.5;

      timeRef.current += 16 * motionSpeed;

      // Clear
      ctx.fillStyle = `rgba(5, 5, 16, ${0.15 + bass * 0.1})`;
      ctx.fillRect(0, 0, width, height);

      // Background glow
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, height * 0.8);
      bgGlow.addColorStop(0, `rgba(139, 92, 246, ${0.1 + bass * 0.4 * intensity})`);
      bgGlow.addColorStop(0.5, `rgba(236, 72, 153, ${0.05 + mid * 0.2 * intensity})`);
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

      // Audio bars
      const barWidth = 3;
      const barGap = 1;
      const barCount = 32;
      const startX = centerX - (barCount * (barWidth + barGap)) / 2;
      for (let i = 0; i < barCount; i++) {
        const freq = i < 8 ? bass : i < 16 ? audioState?.lowMid || 0 : i < 24 ? mid : high;
        const barHeight = freq * 30 * intensity + 2;
        const hue = (i / barCount) * 60 + 260;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.3 + freq * 0.5})`;
        ctx.fillRect(startX + i * (barWidth + barGap), height - barHeight - 8, barWidth, barHeight);
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
}
