// DARTHANDER Visual Consciousness Engine
// Preview Monitor Component - Audio-reactive visual canvas

import { useEffect, useRef } from 'react';
import { useStore } from '../store';

interface VisualState {
  geometryMode: string;
  geometryComplexity: number;
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
  audioReactGeometry: number;
  audioReactColor: number;
  audioReactMotion: number;
}

interface PreviewMonitorProps {
  state: VisualState | null;
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
};

export function PreviewMonitor({ state }: PreviewMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{x: number; y: number; vx: number; vy: number; size: number; hue: number}>>([]);

  // Get audio state from store
  const audioState = useStore((s) => s.audioState);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize particles
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

      // Get audio values
      const bass = audioState?.bass || 0;
      const mid = audioState?.mid || 0;
      const high = audioState?.presence || 0;
      const overall = audioState?.overallAmplitude || 0;
      const beat = audioState?.beatIntensity || 0;

      // Get visual state
      const palette = palettes[state?.colorPalette || 'cosmos'] || palettes.cosmos;
      const intensity = state?.overallIntensity ?? 0.5;
      const complexity = state?.geometryComplexity ?? 0.3;
      const motionSpeed = state?.motionSpeed ?? 0.2;
      const geometryMode = state?.geometryMode ?? 'stars';
      const chaos = state?.chaosFactor ?? 0;
      const audioReact = state?.audioReactGeometry ?? 0.5;

      // Update time
      timeRef.current += 16 * motionSpeed;

      // Clear with fade effect
      ctx.fillStyle = `rgba(5, 5, 16, ${0.1 + bass * 0.1})`;
      ctx.fillRect(0, 0, width, height);

      // Audio-reactive background glow
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, height * 0.8);
      bgGlow.addColorStop(0, `rgba(139, 92, 246, ${0.1 + bass * 0.3 * intensity})`);
      bgGlow.addColorStop(0.5, `rgba(236, 72, 153, ${0.05 + mid * 0.2 * intensity})`);
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Save context for rotation
      ctx.save();
      ctx.translate(centerX, centerY);

      // Rotation based on motion direction
      const motionDir = state?.motionDirection ?? 'clockwise';
      let rotation = timeRef.current * 0.0005;
      if (motionDir === 'counter') rotation = -rotation;
      if (motionDir === 'breathing') rotation = 0;
      ctx.rotate(rotation);

      // Breathing scale
      let breathScale = 1;
      if (motionDir === 'breathing') {
        breathScale = 1 + Math.sin(timeRef.current * 0.002) * 0.1 + bass * 0.2 * audioReact;
      } else {
        breathScale = 1 + bass * 0.15 * audioReact;
      }
      ctx.scale(breathScale, breathScale);

      // Draw geometry based on mode
      if (geometryMode === 'stars' || geometryMode === 'cosmos') {
        // Particle system - stars
        particlesRef.current.forEach((p, i) => {
          // Update position
          p.x += p.vx * (1 + bass * audioReact * 3);
          p.y += p.vy * (1 + bass * audioReact * 3);

          // Wrap around
          if (p.x < -width/2) p.x = width/2;
          if (p.x > width/2) p.x = -width/2;
          if (p.y < -height/2) p.y = height/2;
          if (p.y > height/2) p.y = -height/2;

          // Draw with audio reaction
          const size = p.size * (1 + beat * 2 * audioReact);
          const alpha = 0.3 + overall * 0.7;
          const colorIndex = i % palette.colors.length;

          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = palette.colors[colorIndex] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();

          // Glow effect on beat
          if (beat > 0.5) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
            glow.addColorStop(0, palette.colors[colorIndex] + '40');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fill();
          }
        });
      }

      if (geometryMode === 'mandala' || geometryMode === 'hexagon') {
        const sides = geometryMode === 'hexagon' ? 6 : Math.floor(complexity * 12 + 6);
        const layers = Math.floor(complexity * 8 + 4);

        for (let layer = 0; layer < layers; layer++) {
          const baseRadius = (layer + 1) * (Math.min(width, height) * 0.35 / layers);
          const radius = baseRadius * (1 + bass * 0.3 * audioReact);
          const alpha = intensity * (1 - layer / layers * 0.5);
          const colorIndex = layer % palette.colors.length;

          ctx.strokeStyle = palette.colors[colorIndex] + Math.floor(alpha * 200).toString(16).padStart(2, '0');
          ctx.lineWidth = 1 + beat * 2;

          ctx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + timeRef.current * 0.001 * (layer % 2 ? 1 : -1);
            const wobble = Math.sin(timeRef.current * 0.005 + layer) * chaos * 20;
            const x = Math.cos(angle) * (radius + wobble);
            const y = Math.sin(angle) * (radius + wobble);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();

          // Inner glow on beat
          if (beat > 0.6 && layer < 3) {
            ctx.fillStyle = palette.colors[colorIndex] + '20';
            ctx.fill();
          }
        }
      }

      if (geometryMode === 'tunnel' || geometryMode === 'portal') {
        const rings = Math.floor(complexity * 15 + 8);

        for (let i = 0; i < rings; i++) {
          const t = ((i / rings) + timeRef.current * 0.001) % 1;
          const radius = t * Math.min(width, height) * 0.5 * (1 + bass * 0.2 * audioReact);
          const alpha = (1 - t) * intensity;
          const colorIndex = i % palette.colors.length;

          ctx.strokeStyle = palette.colors[colorIndex] + Math.floor(alpha * 200).toString(16).padStart(2, '0');
          ctx.lineWidth = 2 + mid * 3;

          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center glow
        const centerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
        centerGlow.addColorStop(0, palette.colors[0] + Math.floor((0.3 + bass * 0.5) * 255).toString(16).padStart(2, '0'));
        centerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = centerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 100 + beat * 50, 0, Math.PI * 2);
        ctx.fill();
      }

      if (geometryMode === 'spiral') {
        const turns = complexity * 6 + 3;
        const maxRadius = Math.min(width, height) * 0.4;

        for (let arm = 0; arm < 3; arm++) {
          ctx.beginPath();
          const colorIndex = arm % palette.colors.length;
          ctx.strokeStyle = palette.colors[colorIndex] + 'cc';
          ctx.lineWidth = 2 + bass * 3;

          for (let i = 0; i < 360 * turns; i += 2) {
            const angle = (i / 180) * Math.PI + (arm * Math.PI * 2 / 3);
            const r = (i / (360 * turns)) * maxRadius * (1 + mid * 0.3 * audioReact);
            const wobble = Math.sin(i * 0.1 + timeRef.current * 0.01) * chaos * 10;
            const x = Math.cos(angle + timeRef.current * 0.002) * (r + wobble);
            const y = Math.sin(angle + timeRef.current * 0.002) * (r + wobble);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      if (geometryMode === 'fractal') {
        const drawBranch = (x: number, y: number, len: number, angle: number, depth: number, colorIdx: number) => {
          if (depth === 0 || len < 3) return;

          const audioLen = len * (1 + bass * 0.3 * audioReact);
          const endX = x + Math.cos(angle) * audioLen;
          const endY = y + Math.sin(angle) * audioLen;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = palette.colors[colorIdx % palette.colors.length] + Math.floor((0.3 + depth * 0.1) * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = depth * 0.5 + beat;
          ctx.stroke();

          const branchAngle = 0.4 + complexity * 0.4 + high * 0.2 * audioReact;
          drawBranch(endX, endY, len * 0.7, angle + branchAngle, depth - 1, colorIdx + 1);
          drawBranch(endX, endY, len * 0.7, angle - branchAngle, depth - 1, colorIdx + 1);
        };

        const depth = Math.floor(complexity * 5 + 4);
        drawBranch(0, height * 0.3, 60 + bass * 30, -Math.PI / 2, depth, 0);
      }

      if (geometryMode === 'void') {
        // Dark mode - subtle particles
        ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + bass * 0.3})`;
        ctx.fillRect(-width/2, -height/2, width, height);

        // Subtle ring
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 + beat * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 50 + bass * 100, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // Eclipse effect
      const eclipse = state?.eclipsePhase ?? 0;
      if (eclipse > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${eclipse * 0.8})`;
        ctx.fillRect(0, 0, width, height);

        // Corona
        if (eclipse > 0.5 && (state?.coronaIntensity ?? 0) > 0) {
          const corona = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 150);
          corona.addColorStop(0, `rgba(255, 200, 100, ${(eclipse - 0.5) * state!.coronaIntensity * 0.5})`);
          corona.addColorStop(1, 'transparent');
          ctx.fillStyle = corona;
          ctx.fillRect(0, 0, width, height);
        }
      }

      // Audio level indicator bars at bottom
      const barWidth = 4;
      const barGap = 2;
      const barCount = 32;
      const startX = centerX - (barCount * (barWidth + barGap)) / 2;

      for (let i = 0; i < barCount; i++) {
        const freq = i < 8 ? bass : i < 16 ? audioState?.lowMid || 0 : i < 24 ? mid : high;
        const barHeight = freq * 40 * intensity + 2;
        const hue = (i / barCount) * 60 + 260; // Purple to pink

        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.3 + freq * 0.5})`;
        ctx.fillRect(
          startX + i * (barWidth + barGap),
          height - barHeight - 10,
          barWidth,
          barHeight
        );
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
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-neon-purple/20 shadow-glass">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: '#050510' }}
      />

      {/* Info overlay */}
      <div className="absolute bottom-3 left-3 glass px-3 py-2 rounded-lg text-[10px] font-mono space-y-1">
        <div className="text-neon-purple/70">MODE: <span className="text-neon-cyan">{state?.geometryMode || 'stars'}</span></div>
        <div className="text-neon-purple/70">DEPTH: <span className="text-neon-cyan">{state?.depthMode || 'deep'}</span></div>
      </div>

      <div className="absolute bottom-3 right-3 glass px-3 py-1.5 rounded-lg text-[10px] text-neon-magenta/70 font-mono tracking-widest">
        PREVIEW
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-neon-purple/30 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-neon-purple/30 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-neon-purple/30 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-neon-purple/30 rounded-br-xl" />
    </div>
  );
}
