// DARTHANDER Visual Consciousness Engine
// Display Window Component - Immersive Eclipse Visualization

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { defaultVisualState } from '../store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface VisualState {
  geometryMode: string;
  geometryComplexity: number;
  geometryScale: number;
  colorPalette: string;
  colorBrightness: number;
  colorSaturation: number;
  colorHueShift: number;
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
  bassImpactSensitivity: number;
  bassPulseSensitivity: number;
}

interface VibeLayers {
  [category: string]: string | null;
}

// Theme color configurations
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

export default function DisplayWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const stateRef = useRef<VisualState>(defaultVisualState as VisualState);
  const vibeLayersRef = useRef<VibeLayers>({});
  const socketRef = useRef<Socket | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const lastSyncRef = useRef<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'fill' | '16:9'>('16:9');
  const [showControls, setShowControls] = useState(true);

  // Load background image from localStorage
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
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darthander_bg') loadBgImage();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync visual state and vibe layers from localStorage - HIGH FREQUENCY for audio reactivity
  useEffect(() => {
    const syncFromLocalStorage = () => {
      const stateData = localStorage.getItem('darthander_state');
      if (stateData) {
        try {
          const parsed = JSON.parse(stateData);
          // Only update if data has changed (check timestamp)
          const timestamp = localStorage.getItem('darthander_state_timestamp');
          if (timestamp !== lastSyncRef.current) {
            stateRef.current = parsed;
            lastSyncRef.current = timestamp;
          }
        } catch (e) {
          console.error('Failed to parse state');
        }
      }
      const vibeData = localStorage.getItem('darthander_vibes');
      if (vibeData) {
        try {
          vibeLayersRef.current = JSON.parse(vibeData);
        } catch (e) {
          console.error('Failed to parse vibe layers');
        }
      }
    };

    syncFromLocalStorage();
    // Poll at 30fps for smoother audio-reactive sync
    const pollInterval = setInterval(syncFromLocalStorage, 33);
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('darthander_')) syncFromLocalStorage();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // WebSocket connection
  useEffect(() => {
    const socket = io(API_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => socket.emit('state:get'));
    socket.on('state:current', (data: any) => {
      if (data.visual) stateRef.current = data.visual;
    });
    socket.on('state:update', (state: any) => {
      stateRef.current = state;
    });
    socketRef.current = socket;
    return () => { socket.close(); };
  }, []);

  // Main rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const state = stateRef.current;
      const vibes = vibeLayersRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Calculate 16:9 viewport
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
      const minDim = Math.min(viewW, viewH);

      // Clear screen
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Get theme
      const themeName = state?.colorPalette || 'cosmos';
      const theme = themes[themeName] || themes.cosmos;
      const intensity = state?.overallIntensity ?? 0.7;
      const brightness = state?.colorBrightness ?? 0.6;

      // Draw gradient background
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, minDim);
      bgGradient.addColorStop(0, theme.bg[2]);
      bgGradient.addColorStop(0.5, theme.bg[1]);
      bgGradient.addColorStop(1, theme.bg[0]);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(viewX, viewY, viewW, viewH);

      // Draw background image if set
      if (bgImageRef.current) {
        const img = bgImageRef.current;
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
        ctx.globalAlpha = 0.5;
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.globalAlpha = 1.0;
      }

      // Update time
      const motionSpeed = state?.motionSpeed ?? 0.15;
      timeRef.current += 0.016 * motionSpeed * 60;
      const time = timeRef.current;

      // ===== GALACTIC BACKDROP =====
      const starDensity = state?.starDensity ?? 0.7;
      const starBrightness = state?.starBrightness ?? 0.6;
      const nebulaPresence = state?.nebulaPresence ?? 0.5;

      // Galaxy spiral arms (subtle, behind everything)
      if (nebulaPresence > 0.2) {
        ctx.save();
        ctx.globalAlpha = nebulaPresence * 0.15 * intensity;
        for (let arm = 0; arm < 2; arm++) {
          ctx.beginPath();
          for (let i = 0; i < 300; i++) {
            const armAngle = (i / 40) + arm * Math.PI + time * 0.0002;
            const armRadius = minDim * 0.15 + i * 1.2;
            const x = centerX + Math.cos(armAngle) * armRadius;
            const y = centerY + Math.sin(armAngle) * armRadius;
            const thickness = 3 + Math.sin(i * 0.05) * 2;

            ctx.fillStyle = `${theme.particles}`;
            ctx.beginPath();
            ctx.arc(x, y, thickness, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // Cosmic dust clouds (softer nebula effect)
      if (nebulaPresence > 0) {
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + time * 0.0003;
          const dist = minDim * 0.25 + Math.sin(time * 0.0008 + i * 1.5) * minDim * 0.08;
          const nx = centerX + Math.cos(angle) * dist;
          const ny = centerY + Math.sin(angle) * dist;
          const nebulaGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, minDim * 0.2);
          nebulaGrad.addColorStop(0, `${theme.accent}${Math.floor(nebulaPresence * 20).toString(16).padStart(2, '0')}`);
          nebulaGrad.addColorStop(0.5, `${theme.glow}${Math.floor(nebulaPresence * 10).toString(16).padStart(2, '0')}`);
          nebulaGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = nebulaGrad;
          ctx.fillRect(viewX, viewY, viewW, viewH);
        }
      }

      // Stars field - distributed throughout the galaxy
      const numStars = Math.floor(starDensity * 600);
      for (let i = 0; i < numStars; i++) {
        const seed = i * 12345.6789;
        // Distribute stars with slight concentration toward center (galactic core)
        const distFromCenter = Math.pow(Math.random(), 0.7); // Bias toward outer regions
        const starAngle = Math.random() * Math.PI * 2;
        const starDist = distFromCenter * minDim * 0.55;
        const x = centerX + Math.cos(starAngle) * starDist + (Math.random() - 0.5) * viewW * 0.3;
        const y = centerY + Math.sin(starAngle) * starDist + (Math.random() - 0.5) * viewH * 0.3;

        // Keep stars within viewport
        if (x < viewX || x > viewX + viewW || y < viewY || y > viewY + viewH) continue;

        const size = ((Math.sin(seed * 3) + 1) / 2) * 2 + 0.3;
        const twinkle = Math.sin(time * 0.015 + seed) * 0.3 + 0.7;

        // Vary star colors slightly
        const colorVariant = Math.floor(seed % 3);
        let starColor = '255, 255, 255';
        if (colorVariant === 1) starColor = '255, 240, 220'; // warm
        if (colorVariant === 2) starColor = '220, 240, 255'; // cool

        ctx.fillStyle = `rgba(${starColor}, ${starBrightness * twinkle * intensity * 0.9})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ===== ECLIPSE - DARK CENTER WITH EFFERVESCENT GLOW =====
      const eclipsePhase = state?.eclipsePhase ?? 0.8;
      const coronaIntensity = state?.coronaIntensity ?? 0.7;
      const eclipseRadius = minDim * 0.1;

      if (eclipsePhase > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);

        // Soft outer glow - effervescent aura (multiple soft layers)
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

          // Mid-range effervescent glow with slight animation
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

          // Inner corona glow - bright edge around the dark moon
          const innerGlow = ctx.createRadialGradient(0, 0, eclipseRadius * 0.95, 0, 0, eclipseRadius * 1.5);
          innerGlow.addColorStop(0, `rgba(255, 220, 150, ${coronaIntensity * 0.4 * intensity})`);
          innerGlow.addColorStop(0.2, `rgba(255, 200, 120, ${coronaIntensity * 0.3 * intensity})`);
          innerGlow.addColorStop(0.5, `rgba(255, 160, 80, ${coronaIntensity * 0.15 * intensity})`);
          innerGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = innerGlow;
          ctx.beginPath();
          ctx.arc(0, 0, eclipseRadius * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Subtle bright rim at the edge of the moon
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

      // ===== GEOMETRY OVERLAYS =====
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

      // Draw sacred geometry around the eclipse
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

      // ===== VIBE LAYER EFFECTS =====
      const activeVibes = Object.entries(vibes).filter(([_, v]) => v && v !== 'OFF');

      for (const [category, value] of activeVibes) {
        if (!value || value === 'OFF') continue;

        ctx.save();
        ctx.globalAlpha = intensity * 0.3;

        if (category === 'SACRED' && value) {
          // Sacred geometry overlays
          const sacredPatterns: Record<string, () => void> = {
            'FLOWER': () => {
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
            },
            'METATRON': () => {
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
            },
          };
          if (sacredPatterns[value]) sacredPatterns[value]();
        }

        if (category === 'ELEMENT') {
          // Element-based particle effects
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
              for (let x = viewX; x < viewX + viewW; x += 5) {
                const y = waveY + Math.sin((x + time * 2) * 0.02) * 10;
                if (x === viewX) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          }
        }

        if (category === 'COSMIC') {
          if (value === 'GALAXY') {
            // Spiral galaxy arms
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

      // ===== THEME OVERLAYS =====
      // Matrix effect
      if (themeName === 'matrix' || vibes['ALTERED'] === 'MATRIX') {
        ctx.fillStyle = '#22c55e';
        ctx.font = '14px monospace';
        for (let i = 0; i < 20; i++) {
          const x = viewX + (i / 20) * viewW + ((time * 0.1) % 50);
          for (let j = 0; j < 15; j++) {
            const y = viewY + (j / 15) * viewH + ((time * (0.5 + i * 0.1)) % viewH);
            const char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
            ctx.globalAlpha = 0.1 + Math.random() * 0.2;
            ctx.fillText(char, x, y);
          }
        }
        ctx.globalAlpha = 1;
      }

      // Desert heat shimmer
      if (themeName === 'desert') {
        ctx.fillStyle = `rgba(255, 200, 100, 0.05)`;
        for (let i = 0; i < 10; i++) {
          const shimmerY = viewY + viewH * 0.7 + Math.sin(time * 0.005 + i) * 20;
          ctx.fillRect(viewX, shimmerY, viewW, 30);
        }
      }

      // Ocean waves
      if (themeName === 'ocean') {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.lineWidth = 2;
        for (let wave = 0; wave < 3; wave++) {
          ctx.beginPath();
          for (let x = viewX; x <= viewX + viewW; x += 3) {
            const y = viewY + viewH * 0.85 + Math.sin((x + time * 3 + wave * 50) * 0.015) * (15 + wave * 5);
            if (x === viewX) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      // Letterbox bars for 16:9
      if (aspectRatio === '16:9') {
        ctx.fillStyle = '#000000';
        if (viewX > 0) {
          ctx.fillRect(0, 0, viewX, height);
          ctx.fillRect(viewX + viewW, 0, viewX + 1, height);
        }
        if (viewY > 0) {
          ctx.fillRect(0, 0, width, viewY);
          ctx.fillRect(0, viewY + viewH, width, viewY + 1);
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [aspectRatio]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
      }
      if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
      if (e.key === 'a' || e.key === 'A') setAspectRatio(prev => prev === 'fill' ? '16:9' : 'fill');
      if (e.key === 'h' || e.key === 'H') setShowControls(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-hide controls
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
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

      <div style={{
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
      }}>
        <div style={{ marginBottom: '4px', color: aspectRatio === '16:9' ? '#a855f7' : 'inherit' }}>
          [A] Aspect: {aspectRatio}
        </div>
        <div>[F] Fullscreen</div>
        <div>[H] Hide controls</div>
      </div>

      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '10px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s',
      }}>
        DARTHANDER ECLIPSE
      </div>
    </div>
  );
}
