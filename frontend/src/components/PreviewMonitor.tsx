// DARTHANDER Visual Consciousness Engine
// Preview Monitor Component - Visual representation of current state

import React, { useEffect, useRef } from 'react';

interface VisualState {
  geometryMode: string;
  geometryComplexity: number;
  colorPalette: string;
  colorBrightness: number;
  motionSpeed: number;
  motionDirection: string;
  starDensity: number;
  starBrightness: number;
  eclipsePhase: number;
  coronaIntensity: number;
  overallIntensity: number;
  depthMode: string;
}

interface PreviewMonitorProps {
  state: VisualState | null;
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

export function PreviewMonitor({ state }: PreviewMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

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

      // Get current palette
      const palette = state?.colorPalette 
        ? palettes[state.colorPalette] || palettes.cosmos
        : palettes.cosmos;

      // Clear with background
      const brightness = state?.colorBrightness ?? 0.6;
      const intensity = state?.overallIntensity ?? 0.4;
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, width, height);

      // Eclipse overlay
      const eclipsePhase = state?.eclipsePhase ?? 0;
      if (eclipsePhase > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${eclipsePhase * 0.9})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Update time
      const motionSpeed = state?.motionSpeed ?? 0.1;
      timeRef.current += 0.016 * motionSpeed * 60;

      // Draw stars
      const starDensity = state?.starDensity ?? 0.8;
      const starBrightness = state?.starBrightness ?? 0.7;
      const numStars = Math.floor(starDensity * 200);
      
      for (let i = 0; i < numStars; i++) {
        const seed = i * 12345.6789;
        const x = ((Math.sin(seed) + 1) / 2) * width;
        const y = ((Math.cos(seed * 2) + 1) / 2) * height;
        const size = ((Math.sin(seed * 3) + 1) / 2) * 2 + 0.5;
        const twinkle = Math.sin(timeRef.current * 0.01 + seed) * 0.3 + 0.7;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${starBrightness * twinkle * intensity * (1 - eclipsePhase)})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw geometry based on mode
      const geometryMode = state?.geometryMode ?? 'stars';
      const complexity = state?.geometryComplexity ?? 0.2;
      const motionDir = state?.motionDirection ?? 'clockwise';

      // Rotation based on direction
      let rotation = 0;
      if (motionDir === 'clockwise') rotation = timeRef.current * 0.001;
      else if (motionDir === 'counter') rotation = -timeRef.current * 0.001;

      // Breathing scale
      let scale = 1;
      if (motionDir === 'breathing') {
        scale = 1 + Math.sin(timeRef.current * 0.002) * 0.1;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Draw based on geometry mode
      if (geometryMode === 'mandala' || geometryMode === 'hexagon') {
        const sides = geometryMode === 'hexagon' ? 6 : Math.floor(complexity * 16 + 4);
        const layers = Math.floor(complexity * 5 + 2);

        for (let layer = 0; layer < layers; layer++) {
          const radius = (layer + 1) * (Math.min(width, height) / 3 / layers);
          const alpha = intensity * brightness * (1 - layer / layers) * 0.5 * (1 - eclipsePhase);

          ctx.strokeStyle = layer % 2 === 0 
            ? `${palette.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
            : `${palette.secondary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 1;

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
        const turns = complexity * 5 + 2;
        const maxRadius = Math.min(width, height) / 2.5;
        const alpha = intensity * brightness * 0.6 * (1 - eclipsePhase);

        ctx.strokeStyle = `${palette.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;
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
        const rings = Math.floor(complexity * 10 + 5);
        
        for (let i = 0; i < rings; i++) {
          const t = (i + timeRef.current * 0.002) % 1;
          const radius = t * Math.min(width, height) / 2;
          const alpha = (1 - t) * intensity * brightness * 0.5 * (1 - eclipsePhase);

          ctx.strokeStyle = `${palette.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (geometryMode === 'fractal') {
        // Simple recursive pattern
        const alpha = intensity * brightness * 0.4 * (1 - eclipsePhase);
        ctx.strokeStyle = `${palette.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1;

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

        const depth = Math.floor(complexity * 6 + 3);
        drawBranch(0, 50, 80, -Math.PI / 2, depth);
      }

      ctx.restore();

      // Corona effect during eclipse
      if (eclipsePhase > 0.5 && (state?.coronaIntensity ?? 0) > 0) {
        const coronaAlpha = (eclipsePhase - 0.5) * 2 * (state?.coronaIntensity ?? 0) * 0.3;
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 30,
          centerX, centerY, 150
        );
        gradient.addColorStop(0, `rgba(255, 200, 100, ${coronaAlpha})`);
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [state]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-zinc-800">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: '#000' }}
      />
      
      {/* Overlay info */}
      <div className="absolute bottom-2 left-2 text-[10px] text-zinc-500 font-mono space-y-1">
        <div>MODE: {state?.geometryMode || 'stars'}</div>
        <div>DEPTH: {state?.depthMode || 'deep'}</div>
      </div>
      
      <div className="absolute bottom-2 right-2 text-[10px] text-zinc-500 font-mono">
        PREVIEW
      </div>
    </div>
  );
}
