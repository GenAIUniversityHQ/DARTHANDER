// DARTHANDER Visual Consciousness Engine
// Display Window Component - Standalone visualization for external display

import React, { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

export default function DisplayWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const stateRef = useRef<VisualState | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

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

  // Sync state from localStorage (works without backend)
  useEffect(() => {
    const syncFromLocalStorage = () => {
      const stateData = localStorage.getItem('darthander_state');
      if (stateData) {
        try {
          stateRef.current = JSON.parse(stateData);
        } catch (e) {
          console.error('Failed to parse state from localStorage');
        }
      }
    };

    // Initial sync
    syncFromLocalStorage();

    // Poll for changes at 60fps for smooth updates
    const pollInterval = setInterval(syncFromLocalStorage, 16);

    // Also listen for storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darthander_state') {
        syncFromLocalStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Try WebSocket as secondary sync method (if backend exists)
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    socket.on('connect', () => {
      console.log('Display connected to backend (optional)');
      socket.emit('state:get');
    });

    socket.on('state:current', (data: any) => {
      if (data.visual) {
        stateRef.current = data.visual;
      }
    });

    socket.on('state:update', (state: any) => {
      stateRef.current = state;
    });

    socketRef.current = socket;

    return () => {
      socket.close();
    };
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
      const state = stateRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
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

      // Draw background image if set
      if (bgImageRef.current) {
        const img = bgImageRef.current;
        // Cover the canvas while maintaining aspect ratio
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

        ctx.globalAlpha = 0.7; // Slight transparency so effects show through
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.globalAlpha = 1.0;
      }

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
      const numStars = Math.floor(starDensity * 400); // More stars for fullscreen

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
        const layers = Math.floor(complexity * 8 + 3); // More layers for fullscreen

        for (let layer = 0; layer < layers; layer++) {
          const radius = (layer + 1) * (Math.min(width, height) / 2.5 / layers);
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
        const maxRadius = Math.min(width, height) / 2.2;
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
          const radius = t * Math.min(width, height) / 2;
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

      // Corona beams effect - ONLY appears during eclipse AND when corona is enabled
      const coronaIntensity = state?.coronaIntensity ?? 0;
      if (eclipsePhase > 0.5 && coronaIntensity > 0) {
        const coronaStrength = (eclipsePhase - 0.5) * 2 * coronaIntensity;
        const numBeams = 16; // More beams for fullscreen
        const maxBeamLength = Math.min(width, height) * 0.45;

        ctx.save();
        ctx.translate(centerX, centerY);

        // Draw radiating beams
        for (let i = 0; i < numBeams; i++) {
          const angle = (i / numBeams) * Math.PI * 2 + timeRef.current * 0.0002;
          const beamLength = maxBeamLength * (0.6 + Math.sin(timeRef.current * 0.003 + i) * 0.4);

          const gradient = ctx.createLinearGradient(
            0, 0,
            Math.cos(angle) * beamLength,
            Math.sin(angle) * beamLength
          );

          gradient.addColorStop(0, `rgba(255, 220, 150, ${coronaStrength * 0.6})`);
          gradient.addColorStop(0.3, `rgba(255, 180, 80, ${coronaStrength * 0.4})`);
          gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');

          ctx.beginPath();
          ctx.moveTo(0, 0);
          const beamWidth = 0.08 + coronaIntensity * 0.05;
          ctx.lineTo(
            Math.cos(angle - beamWidth) * beamLength,
            Math.sin(angle - beamWidth) * beamLength
          );
          ctx.lineTo(
            Math.cos(angle + beamWidth) * beamLength,
            Math.sin(angle + beamWidth) * beamLength
          );
          ctx.closePath();
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Inner glow around eclipse center
        const glowGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 120);
        glowGradient.addColorStop(0, `rgba(255, 240, 200, ${coronaStrength * 0.5})`);
        glowGradient.addColorStop(0.5, `rgba(255, 200, 100, ${coronaStrength * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 120, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Handle fullscreen toggle with 'f' key
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#000',
      cursor: 'none'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      {/* Minimal overlay - hidden after 3 seconds of no mouse movement */}
      <div
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '10px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
        }}
      >
        Press F for fullscreen
      </div>
    </div>
  );
}
