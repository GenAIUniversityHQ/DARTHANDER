// DARTHANDER Visual Consciousness Engine
// Preview Monitor Component - IDENTICAL to DisplayWindow rendering

import { useEffect, useRef, useState } from 'react';
import { Monitor, ExternalLink } from 'lucide-react';
import { useStore } from '../store';

interface VisualState {
  geometryMode: string;
  geometryComplexity: number;
  geometryScale: number;
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
  nebulaPresence: number;
}

interface PreviewMonitorProps {
  state: VisualState | null;
}

// Theme color configurations - SAME as DisplayWindow
const themes: Record<string, { bg: string[]; accent: string; glow: string; particles: string }> = {
  cosmos: {
    bg: ['#000011', '#0a0a2e', '#1a1a4e'],
    accent: '#6366f1',
    glow: '#818cf8',
    particles: '#c4b5fd',
  },
  sacred: {
    bg: ['#0a0008', '#1a0020', '#2a0040'],
    accent: '#fbbf24',
    glow: '#f59e0b',
    particles: '#fcd34d',
  },
  void: {
    bg: ['#000000', '#050505', '#0a0a0a'],
    accent: '#374151',
    glow: '#1f2937',
    particles: '#4b5563',
  },
  fire: {
    bg: ['#0a0000', '#1a0500', '#2a0a00'],
    accent: '#ef4444',
    glow: '#f97316',
    particles: '#fbbf24',
  },
  ice: {
    bg: ['#000a10', '#001020', '#002040'],
    accent: '#06b6d4',
    glow: '#22d3ee',
    particles: '#a5f3fc',
  },
  neon: {
    bg: ['#05000a', '#0a0015', '#150025'],
    accent: '#f0abfc',
    glow: '#e879f9',
    particles: '#c084fc',
  },
  earth: {
    bg: ['#0a0800', '#151005', '#201810'],
    accent: '#84cc16',
    glow: '#a3e635',
    particles: '#bef264',
  },
  desert: {
    bg: ['#1a1408', '#2a2010', '#3a2c18'],
    accent: '#f59e0b',
    glow: '#fbbf24',
    particles: '#fcd34d',
  },
  ocean: {
    bg: ['#001015', '#002030', '#003050'],
    accent: '#0891b2',
    glow: '#06b6d4',
    particles: '#22d3ee',
  },
  matrix: {
    bg: ['#000500', '#000a00', '#001500'],
    accent: '#22c55e',
    glow: '#4ade80',
    particles: '#86efac',
  },
};

export function PreviewMonitor({ state }: PreviewMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const [displayWindow, setDisplayWindow] = useState<Window | null>(null);
  const { backgroundImage, vibeLayers } = useStore();

  // Load background image when it changes
  useEffect(() => {
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        bgImageRef.current = img;
      };
      img.src = backgroundImage;
    } else {
      bgImageRef.current = null;
    }
  }, [backgroundImage]);

  // Open display window for external monitor
  const openDisplayWindow = () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('display', 'true');
    const displayUrl = url.toString();

    const newWindow = window.open(
      displayUrl,
      'DARTHANDER_DISPLAY',
      'popup=yes,width=1920,height=1080'
    );

    if (newWindow) {
      setDisplayWindow(newWindow);
      const checkWindow = setInterval(() => {
        if (newWindow.closed) {
          setDisplayWindow(null);
          clearInterval(checkWindow);
        }
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (displayWindow && !displayWindow.closed) {
        displayWindow.close();
      }
    };
  }, [displayWindow]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const minDim = Math.min(width, height);

      // Clear screen
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Get theme - SAME as DisplayWindow
      const themeName = state?.colorPalette || 'cosmos';
      const theme = themes[themeName] || themes.cosmos;
      const intensity = state?.overallIntensity ?? 0.7;
      const brightness = state?.colorBrightness ?? 0.6;

      // Draw gradient background - SAME as DisplayWindow
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, minDim);
      bgGradient.addColorStop(0, theme.bg[2]);
      bgGradient.addColorStop(0.5, theme.bg[1]);
      bgGradient.addColorStop(1, theme.bg[0]);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw background image if set
      if (bgImageRef.current) {
        const img = bgImageRef.current;
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        let drawWidth, drawHeight, drawX, drawY;
        if (imgRatio > canvasRatio) {
          drawHeight = height;
          drawWidth = height * imgRatio;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = width;
          drawHeight = width / imgRatio;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        }
        ctx.globalAlpha = 0.5;
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.globalAlpha = 1.0;
      }

      // Update time
      const motionSpeed = state?.motionSpeed ?? 0.15;
      timeRef.current += 0.016 * motionSpeed * 60;
      const time = timeRef.current;

      // Eclipse parameters
      const eclipsePhase = state?.eclipsePhase ?? 0.8;
      const coronaIntensity = state?.coronaIntensity ?? 0.7;
      const eclipseRadius = minDim * 0.1;

      // ===== COSMIC BACKDROP - SAME as DisplayWindow =====
      const starDensity = state?.starDensity ?? 0.7;
      const starBrightness = state?.starBrightness ?? 0.6;
      const nebulaPresence = state?.nebulaPresence ?? 0.5;

      // Soft nebula clouds
      if (nebulaPresence > 0) {
        for (let i = 0; i < 5; i++) {
          const seed = i * 7919;
          const angle = (seed % 1000) / 1000 * Math.PI * 2;
          const dist = minDim * 0.2 + (seed % 500) / 500 * minDim * 0.25;
          const nx = centerX + Math.cos(angle + time * 0.0001) * dist;
          const ny = centerY + Math.sin(angle + time * 0.0001) * dist;
          const size = minDim * 0.15 + (seed % 300) / 300 * minDim * 0.15;

          const nebulaGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, size);
          nebulaGrad.addColorStop(0, `${theme.accent}${Math.floor(nebulaPresence * 15).toString(16).padStart(2, '0')}`);
          nebulaGrad.addColorStop(0.4, `${theme.glow}${Math.floor(nebulaPresence * 8).toString(16).padStart(2, '0')}`);
          nebulaGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = nebulaGrad;
          ctx.fillRect(0, 0, width, height);
        }
      }

      // Stars field - SAME clean distribution as DisplayWindow
      const numStars = Math.floor(starDensity * 400);
      for (let i = 0; i < numStars; i++) {
        const seed1 = Math.sin(i * 12345.6789) * 43758.5453;
        const seed2 = Math.sin(i * 78901.2345) * 23421.6312;
        const seed3 = Math.sin(i * 45678.9012) * 84756.2341;

        const x = (seed1 - Math.floor(seed1)) * width;
        const y = (seed2 - Math.floor(seed2)) * height;

        // Skip stars too close to eclipse center
        const distToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distToCenter < eclipseRadius * 2.5) continue;

        const sizeSeed = seed3 - Math.floor(seed3);
        const size = sizeSeed < 0.7 ? 0.5 + sizeSeed : 1 + sizeSeed * 1.5;
        const twinkle = Math.sin(time * 0.008 + i * 0.5) * 0.2 + 0.8;

        const colorSeed = (i * 17) % 10;
        let starColor = '255, 255, 255';
        if (colorSeed < 2) starColor = '255, 250, 240';
        else if (colorSeed < 4) starColor = '240, 248, 255';
        else if (colorSeed === 4) starColor = '255, 220, 180';
        else if (colorSeed === 5) starColor = '200, 220, 255';

        ctx.fillStyle = `rgba(${starColor}, ${starBrightness * twinkle * intensity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ===== ECLIPSE - SAME as DisplayWindow =====
      if (eclipsePhase > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);

        // Soft outer glow - effervescent aura
        if (coronaIntensity > 0) {
          // Very soft outer ambient glow
          const ambientGlow = ctx.createRadialGradient(0, 0, eclipseRadius * 0.8, 0, 0, eclipseRadius * 6);
          ambientGlow.addColorStop(0, `rgba(255, 180, 100, ${coronaIntensity * 0.15 * intensity})`);
          ambientGlow.addColorStop(0.2, `rgba(255, 150, 80, ${coronaIntensity * 0.08 * intensity})`);
          ambientGlow.addColorStop(0.5, `rgba(255, 120, 60, ${coronaIntensity * 0.03 * intensity})`);
          ambientGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = ambientGlow;
          ctx.beginPath();
          ctx.arc(0, 0, eclipseRadius * 6, 0, Math.PI * 2);
          ctx.fill();

          // Mid-range effervescent glow with animation
          const pulse = Math.sin(time * 0.002) * 0.1 + 1;
          const midGlow = ctx.createRadialGradient(0, 0, eclipseRadius * 0.9, 0, 0, eclipseRadius * 3 * pulse);
          midGlow.addColorStop(0, `rgba(255, 200, 120, ${coronaIntensity * 0.25 * intensity})`);
          midGlow.addColorStop(0.3, `rgba(255, 170, 90, ${coronaIntensity * 0.15 * intensity})`);
          midGlow.addColorStop(0.6, `rgba(255, 140, 70, ${coronaIntensity * 0.06 * intensity})`);
          midGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = midGlow;
          ctx.beginPath();
          ctx.arc(0, 0, eclipseRadius * 3 * pulse, 0, Math.PI * 2);
          ctx.fill();

          // Inner corona glow
          const innerGlow = ctx.createRadialGradient(0, 0, eclipseRadius * 0.95, 0, 0, eclipseRadius * 1.5);
          innerGlow.addColorStop(0, `rgba(255, 220, 150, ${coronaIntensity * 0.4 * intensity})`);
          innerGlow.addColorStop(0.2, `rgba(255, 200, 120, ${coronaIntensity * 0.3 * intensity})`);
          innerGlow.addColorStop(0.5, `rgba(255, 160, 80, ${coronaIntensity * 0.15 * intensity})`);
          innerGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = innerGlow;
          ctx.beginPath();
          ctx.arc(0, 0, eclipseRadius * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Subtle bright rim
          const rimGlow = ctx.createRadialGradient(0, 0, eclipseRadius * 0.97, 0, 0, eclipseRadius * 1.08);
          rimGlow.addColorStop(0, 'transparent');
          rimGlow.addColorStop(0.4, `rgba(255, 240, 200, ${coronaIntensity * 0.5 * intensity})`);
          rimGlow.addColorStop(0.6, `rgba(255, 255, 240, ${coronaIntensity * 0.7 * intensity})`);
          rimGlow.addColorStop(0.8, `rgba(255, 240, 200, ${coronaIntensity * 0.4 * intensity})`);
          rimGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = rimGlow;
          ctx.beginPath();
          ctx.arc(0, 0, eclipseRadius * 1.08, 0, Math.PI * 2);
          ctx.fill();
        }

        // The Moon (dark circle) - perfectly dark center
        const moonGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, eclipseRadius);
        moonGrad.addColorStop(0, '#000000');
        moonGrad.addColorStop(0.7, '#000000');
        moonGrad.addColorStop(0.9, '#020202');
        moonGrad.addColorStop(1, '#050505');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(0, 0, eclipseRadius * eclipsePhase, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // ===== GEOMETRY OVERLAYS - SAME as DisplayWindow =====
      const geometryMode = state?.geometryMode ?? 'mandala';
      const complexity = state?.geometryComplexity ?? 0.5;
      const chaosFactor = state?.chaosFactor ?? 0.15;
      const motionDir = state?.motionDirection ?? 'breathing';

      let rotation = 0;
      if (motionDir === 'clockwise') rotation = time * 0.001;
      else if (motionDir === 'counter' || motionDir === 'ccw') rotation = -time * 0.001;

      let scale = 1;
      if (motionDir === 'breathing') scale = 1 + Math.sin(time * 0.002) * 0.08;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.globalAlpha = intensity * brightness * 0.6;

      // Draw sacred geometry
      if (geometryMode === 'mandala' || geometryMode === 'hexagon') {
        const sides = geometryMode === 'hexagon' ? 6 : Math.floor(complexity * 12 + 6);
        const layers = Math.floor(complexity * 6 + 3);

        for (let layer = 0; layer < layers; layer++) {
          const radius = eclipseRadius * 1.5 + (layer + 1) * (minDim / 8 / layers);
          const alpha = (1 - layer / layers) * 0.4;

          ctx.strokeStyle = `${theme.accent}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const wobble = chaosFactor > 0 ? Math.sin(time * 0.003 + i + layer) * chaosFactor * 10 : 0;
            const x = Math.cos(angle) * (radius + wobble);
            const y = Math.sin(angle) * (radius + wobble);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (geometryMode === 'spiral') {
        const turns = complexity * 6 + 2;
        const maxRadius = minDim * 0.4;
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 360 * turns; i++) {
          const angle = (i / 180) * Math.PI;
          const r = eclipseRadius * 1.3 + (i / (360 * turns)) * (maxRadius - eclipseRadius * 1.3);
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (geometryMode === 'tunnel') {
        const rings = Math.floor(complexity * 12 + 6);
        for (let i = 0; i < rings; i++) {
          const t = (i / rings + time * 0.001) % 1;
          const radius = eclipseRadius * 1.5 + t * minDim * 0.35;
          const alpha = (1 - t) * 0.5;
          ctx.strokeStyle = `${theme.accent}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (geometryMode === 'fractal') {
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 1.5;
        const drawBranch = (x: number, y: number, len: number, angle: number, depth: number) => {
          if (depth === 0 || len < 3) return;
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
        const depth = Math.floor(complexity * 6 + 3);
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          drawBranch(0, 0, eclipseRadius * 1.5, angle, depth);
        }
      }

      ctx.restore();

      // ===== VIBE LAYER EFFECTS - SAME as DisplayWindow =====
      const vibes = vibeLayers || {};
      const activeVibes = Object.entries(vibes).filter(([_, v]) => v && v !== 'OFF');

      for (const [category, value] of activeVibes) {
        if (!value || value === 'OFF') continue;

        ctx.save();
        ctx.globalAlpha = intensity * 0.3;

        if (category === 'SACRED' && value) {
          if (value === 'FLOWER') {
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              const cx = centerX + Math.cos(angle) * eclipseRadius * 1.5;
              const cy = centerY + Math.sin(angle) * eclipseRadius * 1.5;
              ctx.strokeStyle = `${theme.glow}80`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(cx, cy, eclipseRadius * 1.5, 0, Math.PI * 2);
              ctx.stroke();
            }
          } else if (value === 'METATRON') {
            ctx.strokeStyle = `${theme.glow}60`;
            ctx.lineWidth = 1;
            const points: [number, number][] = [];
            for (let i = 0; i < 13; i++) {
              const angle = (i / 6) * Math.PI;
              const r = i < 7 ? eclipseRadius * 2 : eclipseRadius * 3.5;
              points.push([centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r]);
            }
            for (let i = 0; i < points.length; i++) {
              for (let j = i + 1; j < points.length; j++) {
                ctx.beginPath();
                ctx.moveTo(points[i][0], points[i][1]);
                ctx.lineTo(points[j][0], points[j][1]);
                ctx.stroke();
              }
            }
          }
        }

        if (category === 'ELEMENT') {
          if (value === 'FIRE') {
            for (let i = 0; i < 30; i++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = eclipseRadius * 1.5 + Math.random() * minDim * 0.2;
              const x = centerX + Math.cos(angle) * dist;
              const y = centerY + Math.sin(angle) * dist - Math.sin(time * 0.01 + i) * 20;
              ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${0.3 + Math.random() * 0.3})`;
              ctx.beginPath();
              ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (value === 'WATER') {
            ctx.strokeStyle = `${themes.ocean.accent}40`;
            for (let i = 0; i < 5; i++) {
              const waveY = centerY + minDim * 0.2 + i * 15;
              ctx.beginPath();
              for (let x = 0; x < width; x += 5) {
                const y = waveY + Math.sin((x + time * 2) * 0.02) * 10;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          }
        }

        if (category === 'COSMIC') {
          if (value === 'GALAXY') {
            ctx.strokeStyle = `${theme.particles}30`;
            ctx.lineWidth = 3;
            for (let arm = 0; arm < 2; arm++) {
              ctx.beginPath();
              for (let i = 0; i < 200; i++) {
                const angle = (i / 30) + arm * Math.PI + time * 0.0005;
                const r = eclipseRadius * 1.5 + i * 1.5;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          }
        }

        ctx.restore();
      }

      // Theme overlays
      if (themeName === 'matrix' || vibes['ALTERED'] === 'MATRIX') {
        ctx.fillStyle = '#22c55e';
        ctx.font = '14px monospace';
        for (let i = 0; i < 20; i++) {
          const x = (i / 20) * width + ((time * 0.1) % 50);
          for (let j = 0; j < 15; j++) {
            const y = (j / 15) * height + ((time * (0.5 + i * 0.1)) % height);
            const char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
            ctx.globalAlpha = 0.1 + Math.random() * 0.2;
            ctx.fillText(char, x, y);
          }
        }
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [state, vibeLayers]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-zinc-800">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: '#000' }}
      />

      {/* Open Display Window Button */}
      <button
        onClick={openDisplayWindow}
        className={`
          absolute top-2 right-2 p-2 rounded transition-all
          ${displayWindow && !displayWindow.closed
            ? 'bg-green-900/80 text-green-300 border border-green-500/50'
            : 'bg-zinc-900/80 text-zinc-400 border border-zinc-700 hover:bg-zinc-800 hover:text-white hover:border-zinc-500'}
        `}
        title={displayWindow && !displayWindow.closed ? 'Display window active' : 'Open display window'}
      >
        {displayWindow && !displayWindow.closed ? (
          <div className="flex items-center gap-1.5">
            <Monitor className="w-4 h-4" />
            <span className="text-[10px]">LIVE</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4" />
            <span className="text-[10px]">DISPLAY</span>
          </div>
        )}
      </button>

      {/* Overlay info */}
      <div className="absolute bottom-2 left-2 text-[10px] text-zinc-500 font-mono space-y-1">
        <div>MODE: {state?.geometryMode || 'mandala'}</div>
        <div>THEME: {state?.colorPalette || 'cosmos'}</div>
      </div>

      <div className="absolute bottom-2 right-2 text-[10px] text-zinc-500 font-mono">
        PREVIEW
      </div>
    </div>
  );
}
