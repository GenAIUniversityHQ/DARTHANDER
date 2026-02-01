// DARTHANDER Visual Consciousness Engine
// Preview Monitor Component - Visual representation of current state

import { useEffect, useRef, useState } from 'react';
import { Monitor, ExternalLink } from 'lucide-react';
import { useStore } from '../store';

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
  const motionOffsetRef = useRef({ x: 0, y: 0 });
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const [displayWindow, setDisplayWindow] = useState<Window | null>(null);
  const { backgroundImage, vibeLayers, audioState, visualState } = useStore();

  // Merged state: prefer store visualState, fall back to prop state
  const vs = visualState || state;

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
    // Build URL from current location, preserving path but setting display=true
    const url = new URL(window.location.href);
    url.search = ''; // Clear existing query params
    url.searchParams.set('display', 'true');
    const displayUrl = url.toString();

    console.log('Opening display window at:', displayUrl);

    // Open in new window optimized for fullscreen
    const newWindow = window.open(
      displayUrl,
      'DARTHANDER_DISPLAY',
      'popup=yes,width=1920,height=1080'
    );

    if (newWindow) {
      setDisplayWindow(newWindow);

      // Check if window is closed
      const checkWindow = setInterval(() => {
        if (newWindow.closed) {
          setDisplayWindow(null);
          clearInterval(checkWindow);
        }
      }, 1000);
    }
  };

  // Close display window when component unmounts
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
      // Reset transform before scaling (scale is cumulative!)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // ============================================
      // AUDIO-REACTIVE VISUAL BOOSTS
      // These add to user's base values for DISPLAY ONLY
      // ============================================
      const bassImpactSens = (vs as any)?.bassImpactSensitivity ?? 0;
      const bassPulseSens = (vs as any)?.bassPulseSensitivity ?? 0;
      const audioReactMotion = (vs as any)?.audioReactMotion ?? 0;
      const audioReactColor = (vs as any)?.audioReactColor ?? 0;
      const audioReactGeo = (vs as any)?.audioReactGeometry ?? 0;

      // Calculate audio boosts
      let coronaBoost = 0;
      let motionBoost = 0;
      let brightnessBoost = 0;
      let chaosBoost = 0;
      let scaleBoost = 0;

      if (audioState) {
        const bassImpact = audioState.bassImpact ?? 0;
        const bassPulse = audioState.bassPulse ?? 0;
        const beatIntensity = audioState.beatIntensity ?? 0;
        const overallAmp = audioState.overallAmplitude ?? 0;
        const mid = audioState.mid ?? 0;
        const highMid = audioState.highMid ?? 0;

        coronaBoost = (bassImpact * bassImpactSens * 0.5 + bassPulse * bassPulseSens * 0.3) * 0.6;
        motionBoost = (overallAmp * 0.4 + beatIntensity * 0.4) * audioReactMotion * 0.5;
        brightnessBoost = (mid * 0.3 + overallAmp * 0.2) * audioReactColor * 0.4;
        chaosBoost = (beatIntensity * 0.3 + highMid * 0.3 + bassImpact * 0.2) * audioReactGeo * 0.5;
        if (bassImpactSens > 0.5 && bassImpact > 0.4) {
          scaleBoost = bassImpact * bassImpactSens * 0.08;
        }
      }

      // Get current palette - USE vs (store state) for consistency
      const palette = vs?.colorPalette
        ? palettes[vs.colorPalette] || palettes.cosmos
        : palettes.cosmos;

      // Apply audio boost to brightness (VISUAL ONLY) - USE vs for consistency
      const baseBrightness = vs?.colorBrightness ?? 0.6;
      const brightness = Math.min(1, baseBrightness + brightnessBoost);
      const intensity = vs?.overallIntensity ?? 0.4;
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

      // ============================================
      // DRAMATIC ECLIPSE RENDERING
      // ============================================
      const eclipsePhase = vs?.eclipsePhase ?? 0;
      const baseCoronaIntensity = vs?.coronaIntensity ?? 0;
      // Apply audio boost to corona for pulsing effect
      const coronaIntensity = Math.min(1, baseCoronaIntensity + coronaBoost);

      if (eclipsePhase > 0) {
        // Subtle ambient darkening (reduced from 0.9 to let eclipse shine)
        ctx.fillStyle = `rgba(0, 0, 0, ${eclipsePhase * 0.6})`;
        ctx.fillRect(0, 0, width, height);

        // Eclipse disc size scales with phase
        const maxDiscRadius = Math.min(width, height) * 0.15;
        const discRadius = maxDiscRadius * Math.min(1, eclipsePhase * 1.2);

        // Only draw eclipse visuals when phase is significant
        if (eclipsePhase > 0.2) {
          ctx.save();
          ctx.translate(centerX, centerY);

          // OUTER CORONA - ethereal glow extending far out
          if (coronaIntensity > 0) {
            const outerCoronaRadius = discRadius * (3 + coronaIntensity * 2);
            const outerGlow = ctx.createRadialGradient(0, 0, discRadius, 0, 0, outerCoronaRadius);
            outerGlow.addColorStop(0, `rgba(255, 250, 240, ${coronaIntensity * 0.4 * eclipsePhase})`);
            outerGlow.addColorStop(0.2, `rgba(255, 220, 180, ${coronaIntensity * 0.25 * eclipsePhase})`);
            outerGlow.addColorStop(0.5, `rgba(255, 180, 120, ${coronaIntensity * 0.1 * eclipsePhase})`);
            outerGlow.addColorStop(1, 'rgba(255, 150, 80, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, outerCoronaRadius, 0, Math.PI * 2);
            ctx.fill();

            // PLASMA STREAMERS - dynamic tendrils
            const numStreamers = 16;
            for (let i = 0; i < numStreamers; i++) {
              const baseAngle = (i / numStreamers) * Math.PI * 2;
              const wobble = Math.sin(timeRef.current * 0.001 + i * 0.7) * 0.15;
              const angle = baseAngle + wobble;
              const streamerLength = discRadius * (1.5 + Math.sin(timeRef.current * 0.002 + i * 1.3) * 0.8) * coronaIntensity;

              const gradient = ctx.createLinearGradient(
                Math.cos(angle) * discRadius * 0.9,
                Math.sin(angle) * discRadius * 0.9,
                Math.cos(angle) * (discRadius + streamerLength),
                Math.sin(angle) * (discRadius + streamerLength)
              );
              gradient.addColorStop(0, `rgba(255, 240, 200, ${coronaIntensity * 0.7 * eclipsePhase})`);
              gradient.addColorStop(0.4, `rgba(255, 200, 100, ${coronaIntensity * 0.4 * eclipsePhase})`);
              gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');

              ctx.beginPath();
              ctx.moveTo(Math.cos(angle - 0.05) * discRadius * 0.95, Math.sin(angle - 0.05) * discRadius * 0.95);
              ctx.quadraticCurveTo(
                Math.cos(angle) * (discRadius + streamerLength * 0.5),
                Math.sin(angle) * (discRadius + streamerLength * 0.5),
                Math.cos(angle + wobble * 0.5) * (discRadius + streamerLength),
                Math.sin(angle + wobble * 0.5) * (discRadius + streamerLength)
              );
              ctx.quadraticCurveTo(
                Math.cos(angle) * (discRadius + streamerLength * 0.5),
                Math.sin(angle) * (discRadius + streamerLength * 0.5),
                Math.cos(angle + 0.05) * discRadius * 0.95,
                Math.sin(angle + 0.05) * discRadius * 0.95
              );
              ctx.fillStyle = gradient;
              ctx.fill();
            }
          }

          // INNER CORONA RING - bright edge glow
          const innerCoronaWidth = discRadius * 0.3;
          const innerCorona = ctx.createRadialGradient(0, 0, discRadius - 2, 0, 0, discRadius + innerCoronaWidth);
          innerCorona.addColorStop(0, `rgba(255, 100, 50, ${eclipsePhase * 0.8})`); // Chromosphere red
          innerCorona.addColorStop(0.1, `rgba(255, 200, 100, ${eclipsePhase * 0.9})`);
          innerCorona.addColorStop(0.3, `rgba(255, 255, 240, ${eclipsePhase * 0.7})`); // Bright white edge
          innerCorona.addColorStop(0.6, `rgba(255, 230, 180, ${eclipsePhase * 0.4})`);
          innerCorona.addColorStop(1, 'rgba(255, 200, 150, 0)');
          ctx.fillStyle = innerCorona;
          ctx.beginPath();
          ctx.arc(0, 0, discRadius + innerCoronaWidth, 0, Math.PI * 2);
          ctx.fill();

          // DIAMOND RING EFFECT - brilliant point during partial phases
          if (eclipsePhase > 0.3 && eclipsePhase < 0.8) {
            const diamondAngle = timeRef.current * 0.0003;
            const diamondX = Math.cos(diamondAngle) * discRadius * 0.95;
            const diamondY = Math.sin(diamondAngle) * discRadius * 0.95;
            const diamondIntensity = Math.sin((eclipsePhase - 0.3) * Math.PI / 0.5) * 0.8;

            const diamondGlow = ctx.createRadialGradient(diamondX, diamondY, 0, diamondX, diamondY, discRadius * 0.5);
            diamondGlow.addColorStop(0, `rgba(255, 255, 255, ${diamondIntensity})`);
            diamondGlow.addColorStop(0.2, `rgba(255, 250, 220, ${diamondIntensity * 0.6})`);
            diamondGlow.addColorStop(0.5, `rgba(255, 220, 150, ${diamondIntensity * 0.3})`);
            diamondGlow.addColorStop(1, 'rgba(255, 200, 100, 0)');
            ctx.fillStyle = diamondGlow;
            ctx.beginPath();
            ctx.arc(diamondX, diamondY, discRadius * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // THE DARK DISC (Moon) - solid black center
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(0, 0, discRadius, 0, Math.PI * 2);
          ctx.fill();

          // Subtle edge definition on disc
          ctx.strokeStyle = `rgba(40, 20, 10, ${eclipsePhase * 0.5})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.restore();
        }
      }

      // Update time and motion (with audio boost for VISUAL ONLY) - USE vs for consistency
      const baseMotionSpeed = vs?.motionSpeed ?? 0.1;
      const motionSpeed = Math.min(1, baseMotionSpeed + motionBoost);
      const motionTurbulence = vs?.motionTurbulence ?? 0.1;
      const motionDir = vs?.motionDirection ?? 'clockwise';

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

      // Draw nebula clouds (BEFORE stars)
      const nebulaPresence = vs?.nebulaPresence ?? 0;
      if (nebulaPresence > 0) {
        const numClouds = Math.floor(nebulaPresence * 5 + 1);
        for (let i = 0; i < numClouds; i++) {
          const seed = i * 7654.321;
          const cloudX = ((Math.sin(seed) + 1) / 2) * width;
          const cloudY = ((Math.cos(seed * 1.5) + 1) / 2) * height;
          const cloudSize = 40 + ((Math.sin(seed * 2) + 1) / 2) * 80;
          const pulse = Math.sin(timeRef.current * 0.001 + seed) * 0.2 + 0.8;

          const nebulaGradient = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudSize);
          const hueShift = vs?.colorHueShift ?? 0;
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
      const starDensity = vs?.starDensity ?? 0.8;
      const starBrightness = vs?.starBrightness ?? 0.7;
      const numStars = Math.floor(starDensity * 200);

      for (let i = 0; i < numStars; i++) {
        const seed = i * 12345.6789;
        let x = ((Math.sin(seed) + 1) / 2) * width;
        let y = ((Math.cos(seed * 2) + 1) / 2) * height;

        // Apply motion based on direction
        if (motionDir === 'outward') {
          const dx = x - centerX;
          const dy = y - centerY;
          const expandFactor = (motionOffsetRef.current.x + (seed % 1)) % 1;
          x = centerX + dx * (0.5 + expandFactor * 0.8);
          y = centerY + dy * (0.5 + expandFactor * 0.8);
        } else if (motionDir === 'inward') {
          const dx = x - centerX;
          const dy = y - centerY;
          const contractFactor = (1 - motionOffsetRef.current.x + (seed % 1)) % 1;
          x = centerX + dx * (0.2 + contractFactor * 0.8);
          y = centerY + dy * (0.2 + contractFactor * 0.8);
        }

        // Add turbulence
        if (motionTurbulence > 0) {
          x += Math.sin(timeRef.current * 0.002 + seed) * motionTurbulence * 10;
          y += Math.cos(timeRef.current * 0.002 + seed * 1.5) * motionTurbulence * 10;
        }

        const size = ((Math.sin(seed * 3) + 1) / 2) * 2 + 0.5;
        const twinkle = Math.sin(timeRef.current * 0.01 + seed) * 0.3 + 0.7;

        ctx.fillStyle = `rgba(255, 255, 255, ${starBrightness * twinkle * intensity * (1 - eclipsePhase)})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw geometry based on mode (with audio boosts for VISUAL ONLY)
      const geometryMode = vs?.geometryMode ?? 'stars';
      const complexity = vs?.geometryComplexity ?? 0.2;
      const baseGeometryScale = vs?.geometryScale ?? 1.0;
      const baseChaos = vs?.chaosFactor ?? 0;

      // Apply audio boosts
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

      // ============================================
      // AMBIENT PARTICLE SYSTEM
      // Floating energy motes for depth and atmosphere
      // ============================================
      const particleCount = Math.floor(intensity * 30 + 10);
      const time = timeRef.current;
      for (let i = 0; i < particleCount; i++) {
        const seed = i * 456.789;
        // Particle position with gentle floating motion
        const px = (Math.sin(seed * 1.1 + time * 0.0003) * 0.5 + 0.5) * width;
        const py = (Math.cos(seed * 0.9 + time * 0.0004) * 0.5 + 0.5) * height;
        // Particle properties
        const particleSize = 1 + Math.sin(seed) * 1.5;
        const particleAlpha = (0.2 + Math.sin(time * 0.002 + seed) * 0.15) * intensity * (1 - eclipsePhase * 0.5);
        // Audio reactivity - particles brighten with audio
        const audioBoost = audioState ? (audioState.overallAmplitude ?? 0) * 0.3 : 0;

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, particleSize * 3);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${particleAlpha + audioBoost})`);
        gradient.addColorStop(0.5, `rgba(200, 220, 255, ${particleAlpha * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, particleSize * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw vibe layer effects
      if (vibeLayers && Object.keys(vibeLayers).length > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        const time = timeRef.current;

        // ============================================
        // SACRED GEOMETRY OVERLAYS
        // ============================================
        if (vibeLayers.SACRED && vibeLayers.SACRED !== 'OFF') {
          const sacredAlpha = intensity * 0.5 * Math.max(0.3, 1 - eclipsePhase);
          ctx.strokeStyle = `rgba(255, 215, 0, ${sacredAlpha})`;
          ctx.lineWidth = 1.5;

          if (vibeLayers.SACRED === 'FLOWER' || vibeLayers.SACRED === 'SEED') {
            // Flower of Life - animated breathing
            const breathe = 1 + Math.sin(time * 0.001) * 0.05;
            const radius = Math.min(width, height) * 0.1 * breathe;
            ctx.save();
            ctx.rotate(time * 0.0001);
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, radius, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          } else if (vibeLayers.SACRED === 'METATRON') {
            // Metatron's Cube - rotating interconnected circles
            const r = Math.min(width, height) * 0.08;
            ctx.save();
            ctx.rotate(time * 0.0002);
            // Inner hexagon of circles
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, r * 0.4, 0, Math.PI * 2);
              ctx.stroke();
            }
            // Outer hexagon
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(Math.cos(angle) * r * 2, Math.sin(angle) * r * 2, r * 0.4, 0, Math.PI * 2);
              ctx.stroke();
            }
            // Center circle
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
            ctx.stroke();
            // Connecting lines
            ctx.globalAlpha = sacredAlpha * 0.5;
            for (let i = 0; i < 6; i++) {
              const a1 = (i / 6) * Math.PI * 2;
              const a2 = ((i + 1) % 6 / 6) * Math.PI * 2;
              ctx.beginPath();
              ctx.moveTo(Math.cos(a1) * r * 2, Math.sin(a1) * r * 2);
              ctx.lineTo(Math.cos(a2) * r * 2, Math.sin(a2) * r * 2);
              ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
          } else if (vibeLayers.SACRED === 'SRI') {
            // Sri Yantra - interlocking triangles
            const size = Math.min(width, height) * 0.15;
            ctx.save();
            ctx.rotate(time * 0.00015);
            for (let i = 0; i < 9; i++) {
              const scale = 1 - i * 0.08;
              const rotation = i % 2 === 0 ? 0 : Math.PI;
              ctx.save();
              ctx.rotate(rotation);
              ctx.beginPath();
              ctx.moveTo(0, -size * scale);
              ctx.lineTo(size * scale * 0.866, size * scale * 0.5);
              ctx.lineTo(-size * scale * 0.866, size * scale * 0.5);
              ctx.closePath();
              ctx.stroke();
              ctx.restore();
            }
            ctx.restore();
          } else if (vibeLayers.SACRED === 'TORUS') {
            // Torus energy field - flowing rings
            const torusRadius = Math.min(width, height) * 0.12;
            ctx.save();
            for (let ring = 0; ring < 12; ring++) {
              const ringPhase = (ring / 12) * Math.PI * 2 + time * 0.001;
              const y = Math.sin(ringPhase) * torusRadius * 0.6;
              const ringRadius = Math.cos(ringPhase) * torusRadius * 0.3 + torusRadius * 0.5;
              ctx.globalAlpha = sacredAlpha * (0.3 + Math.cos(ringPhase) * 0.3);
              ctx.beginPath();
              ctx.ellipse(0, y, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
          } else if (vibeLayers.SACRED === 'MERKABA') {
            // Merkaba - 3D star tetrahedron
            const merkSize = Math.min(width, height) * 0.12;
            ctx.save();
            ctx.rotate(time * 0.0003);
            // Upward triangle
            ctx.beginPath();
            ctx.moveTo(0, -merkSize);
            ctx.lineTo(merkSize * 0.866, merkSize * 0.5);
            ctx.lineTo(-merkSize * 0.866, merkSize * 0.5);
            ctx.closePath();
            ctx.stroke();
            // Downward triangle (rotated)
            ctx.rotate(Math.PI);
            ctx.beginPath();
            ctx.moveTo(0, -merkSize * 0.9);
            ctx.lineTo(merkSize * 0.78, merkSize * 0.45);
            ctx.lineTo(-merkSize * 0.78, merkSize * 0.45);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
          }
        }

        // ============================================
        // COSMIC EFFECTS
        // ============================================
        if (vibeLayers.COSMIC && vibeLayers.COSMIC !== 'OFF') {
          const cosmicAlpha = intensity * 0.4;

          if (vibeLayers.COSMIC === 'AURORA') {
            // Northern lights - flowing ribbons
            for (let i = 0; i < 5; i++) {
              const waveY = Math.sin(time * 0.0008 + i * 0.7) * 30 - height * 0.15;
              const gradient = ctx.createLinearGradient(-width / 2, waveY - 25, -width / 2, waveY + 25);
              gradient.addColorStop(0, 'transparent');
              gradient.addColorStop(0.3, `rgba(0, 255, 150, ${cosmicAlpha * 0.4})`);
              gradient.addColorStop(0.5, `rgba(100, 255, 200, ${cosmicAlpha * 0.6})`);
              gradient.addColorStop(0.7, `rgba(0, 200, 255, ${cosmicAlpha * 0.4})`);
              gradient.addColorStop(1, 'transparent');
              ctx.fillStyle = gradient;
              ctx.fillRect(-width / 2, waveY - 25, width, 50);
            }
          } else if (vibeLayers.COSMIC === 'GALAXY') {
            // Spiral galaxy arms
            ctx.strokeStyle = `rgba(180, 160, 255, ${cosmicAlpha})`;
            ctx.lineWidth = 1.5;
            const arms = 4;
            for (let arm = 0; arm < arms; arm++) {
              ctx.beginPath();
              for (let i = 0; i < 150; i++) {
                const angle = (arm / arms) * Math.PI * 2 + (i / 25) + time * 0.0002;
                const r = i * 0.8;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r * 0.5;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          } else if (vibeLayers.COSMIC === 'NEBULA') {
            // Nebula clouds overlay
            for (let i = 0; i < 4; i++) {
              const cloudX = Math.sin(i * 2.5 + time * 0.0003) * width * 0.2;
              const cloudY = Math.cos(i * 1.7 + time * 0.0002) * height * 0.15;
              const cloudSize = 40 + Math.sin(time * 0.001 + i) * 10;
              const gradient = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudSize);
              const hue = (i * 60 + time * 0.01) % 360;
              gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, ${cosmicAlpha * 0.5})`);
              gradient.addColorStop(0.5, `hsla(${hue + 30}, 70%, 50%, ${cosmicAlpha * 0.25})`);
              gradient.addColorStop(1, 'transparent');
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (vibeLayers.COSMIC === 'WORMHOLE') {
            // Wormhole tunnel effect
            ctx.strokeStyle = `rgba(150, 100, 255, ${cosmicAlpha})`;
            for (let ring = 0; ring < 10; ring++) {
              const ringPhase = (ring / 10 + time * 0.001) % 1;
              const ringRadius = ringPhase * Math.min(width, height) * 0.2;
              ctx.globalAlpha = cosmicAlpha * (1 - ringPhase);
              ctx.lineWidth = 1 + ringPhase * 2;
              ctx.beginPath();
              ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.globalAlpha = 1;
          }
        }

        // ============================================
        // ELEMENT EFFECTS
        // ============================================
        if (vibeLayers.ELEMENT && vibeLayers.ELEMENT !== 'OFF') {
          const elemAlpha = intensity * 0.35;

          if (vibeLayers.ELEMENT === 'FIRE') {
            // Fire particles rising
            for (let i = 0; i < 15; i++) {
              const seed = i * 123.456;
              const flameX = Math.sin(seed) * width * 0.2;
              const flamePhase = ((time * 0.002 + seed) % 1);
              const flameY = height * 0.25 - flamePhase * height * 0.3;
              const flameSize = 15 + Math.sin(seed * 2) * 10;
              const gradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize);
              gradient.addColorStop(0, `rgba(255, 220, 100, ${elemAlpha * (1 - flamePhase)})`);
              gradient.addColorStop(0.4, `rgba(255, 120, 20, ${elemAlpha * 0.6 * (1 - flamePhase)})`);
              gradient.addColorStop(1, 'transparent');
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (vibeLayers.ELEMENT === 'WATER') {
            // Water waves
            ctx.strokeStyle = `rgba(0, 150, 255, ${elemAlpha})`;
            ctx.lineWidth = 1.5;
            for (let wave = 0; wave < 4; wave++) {
              ctx.beginPath();
              for (let x = -width / 2; x < width / 2; x += 5) {
                const waveY = Math.sin(x * 0.03 + time * 0.002 + wave * 0.8) * 15 + wave * 20;
                if (x === -width / 2) ctx.moveTo(x, waveY);
                else ctx.lineTo(x, waveY);
              }
              ctx.stroke();
            }
          } else if (vibeLayers.ELEMENT === 'LIGHTNING') {
            // Lightning bolts
            if (Math.random() < 0.03) {
              ctx.strokeStyle = `rgba(200, 220, 255, ${elemAlpha * 2})`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              let lx = (Math.random() - 0.5) * width * 0.3;
              let ly = -height * 0.3;
              ctx.moveTo(lx, ly);
              for (let seg = 0; seg < 8; seg++) {
                lx += (Math.random() - 0.5) * 30;
                ly += height * 0.08;
                ctx.lineTo(lx, ly);
              }
              ctx.stroke();
            }
          } else if (vibeLayers.ELEMENT === 'PLASMA') {
            // Plasma energy field
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2 + time * 0.001;
              const dist = 30 + Math.sin(time * 0.002 + i) * 15;
              const px = Math.cos(angle) * dist;
              const py = Math.sin(angle) * dist;
              const gradient = ctx.createRadialGradient(px, py, 0, px, py, 25);
              gradient.addColorStop(0, `rgba(255, 100, 255, ${elemAlpha})`);
              gradient.addColorStop(0.5, `rgba(100, 150, 255, ${elemAlpha * 0.5})`);
              gradient.addColorStop(1, 'transparent');
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(px, py, 25, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // ============================================
        // CELESTIAL EFFECTS
        // ============================================
        if (vibeLayers.CELESTIAL && vibeLayers.CELESTIAL !== 'OFF') {
          const celestAlpha = intensity * 0.4;

          if (vibeLayers.CELESTIAL === 'ECLIPSE') {
            // Additional eclipse ring overlay
            const ringRadius = Math.min(width, height) * 0.08;
            const gradient = ctx.createRadialGradient(0, 0, ringRadius * 0.8, 0, 0, ringRadius * 1.5);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.4, `rgba(255, 200, 100, ${celestAlpha * 0.8})`);
            gradient.addColorStop(0.6, `rgba(255, 150, 50, ${celestAlpha * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius * 1.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (vibeLayers.CELESTIAL === 'SUN') {
            // Sun rays
            const rayCount = 12;
            for (let i = 0; i < rayCount; i++) {
              const angle = (i / rayCount) * Math.PI * 2 + time * 0.0002;
              const rayLen = 40 + Math.sin(time * 0.003 + i) * 15;
              const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
              gradient.addColorStop(0, `rgba(255, 220, 100, ${celestAlpha})`);
              gradient.addColorStop(1, 'transparent');
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
              ctx.stroke();
            }
          } else if (vibeLayers.CELESTIAL === 'MOON') {
            // Moon phases glow
            const moonRadius = Math.min(width, height) * 0.06;
            const gradient = ctx.createRadialGradient(-moonRadius * 0.3, 0, 0, 0, 0, moonRadius);
            gradient.addColorStop(0, `rgba(220, 220, 240, ${celestAlpha})`);
            gradient.addColorStop(0.7, `rgba(180, 180, 200, ${celestAlpha * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, moonRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // ============================================
        // QUANTUM EFFECTS
        // ============================================
        if (vibeLayers.QUANTUM && vibeLayers.QUANTUM !== 'OFF') {
          const quantumAlpha = intensity * 0.3;

          if (vibeLayers.QUANTUM === 'FIELD') {
            // Quantum field grid
            ctx.strokeStyle = `rgba(100, 200, 255, ${quantumAlpha * 0.5})`;
            ctx.lineWidth = 0.5;
            const gridSize = 20;
            for (let x = -width / 2; x < width / 2; x += gridSize) {
              for (let y = -height / 2; y < height / 2; y += gridSize) {
                const distort = Math.sin(x * 0.01 + y * 0.01 + time * 0.001) * 3;
                ctx.beginPath();
                ctx.arc(x + distort, y + distort, 2, 0, Math.PI * 2);
                ctx.stroke();
              }
            }
          } else if (vibeLayers.QUANTUM === 'WAVE') {
            // Wave function visualization
            ctx.strokeStyle = `rgba(150, 100, 255, ${quantumAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let x = -width / 2; x < width / 2; x += 3) {
              const wave1 = Math.sin(x * 0.05 + time * 0.002) * 20;
              const wave2 = Math.sin(x * 0.03 - time * 0.001) * 15;
              const y = wave1 + wave2;
              if (x === -width / 2) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          } else if (vibeLayers.QUANTUM === 'PARTICLE') {
            // Particle trails
            for (let i = 0; i < 20; i++) {
              const seed = i * 987.654;
              const px = Math.sin(seed + time * 0.001) * width * 0.3;
              const py = Math.cos(seed * 1.3 + time * 0.0012) * height * 0.25;
              ctx.fillStyle = `rgba(200, 150, 255, ${quantumAlpha})`;
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // ============================================
        // EMOTION EFFECTS
        // ============================================
        if (vibeLayers.EMOTION && vibeLayers.EMOTION !== 'OFF') {
          const emotionAlpha = intensity * 0.35;

          if (vibeLayers.EMOTION === 'AWE' || vibeLayers.EMOTION === 'WONDER') {
            // Radiant light burst
            const rayCount = 24;
            for (let i = 0; i < rayCount; i++) {
              const angle = (i / rayCount) * Math.PI * 2;
              const rayLen = 60 + Math.sin(time * 0.002 + i * 0.5) * 20;
              const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
              gradient.addColorStop(0, `rgba(255, 255, 255, ${emotionAlpha * 0.8})`);
              gradient.addColorStop(0.3, `rgba(255, 240, 200, ${emotionAlpha * 0.4})`);
              gradient.addColorStop(1, 'transparent');
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
              ctx.stroke();
            }
          } else if (vibeLayers.EMOTION === 'LOVE') {
            // Heart pulse
            const pulse = 1 + Math.sin(time * 0.003) * 0.1;
            const heartSize = 25 * pulse;
            ctx.fillStyle = `rgba(255, 100, 150, ${emotionAlpha})`;
            ctx.beginPath();
            ctx.moveTo(0, heartSize * 0.3);
            ctx.bezierCurveTo(-heartSize, -heartSize * 0.3, -heartSize, heartSize * 0.5, 0, heartSize);
            ctx.bezierCurveTo(heartSize, heartSize * 0.5, heartSize, -heartSize * 0.3, 0, heartSize * 0.3);
            ctx.fill();
          }
        }

        ctx.restore();
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
        <div>MODE: {vs?.geometryMode || 'stars'}</div>
        <div>DEPTH: {vs?.depthMode || 'deep'}</div>
      </div>

      <div className="absolute bottom-2 right-2 text-[10px] text-zinc-500 font-mono">
        PREVIEW
      </div>
    </div>
  );
}
