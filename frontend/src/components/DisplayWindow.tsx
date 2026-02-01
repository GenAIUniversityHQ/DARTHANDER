// DARTHANDER Visual Consciousness Engine
// Display Window Component - MINIMAL DEBUG VERSION

import { useEffect, useRef, useState } from 'react';

export default function DisplayWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const [status, setStatus] = useState('initializing...');

  useEffect(() => {
    console.log('[DISPLAY] useEffect running');
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('[DISPLAY] No canvas!');
      setStatus('ERROR: No canvas element');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('[DISPLAY] No context!');
      setStatus('ERROR: No 2D context');
      return;
    }

    console.log('[DISPLAY] Canvas and context OK');
    setStatus('Canvas ready, starting draw loop...');

    // Simple resize - just set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log('[DISPLAY] Resized to', canvas.width, 'x', canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;

    const draw = () => {
      frameRef.current++;
      const frame = frameRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark blue
      ctx.fillStyle = '#0a0a2a';
      ctx.fillRect(0, 0, width, height);

      // Draw colorful test pattern
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(50, 50, 200, 100);

      ctx.fillStyle = '#00ff00';
      ctx.fillRect(50, 200, 200, 100);

      ctx.fillStyle = '#0000ff';
      ctx.fillRect(50, 350, 200, 100);

      // Draw cyan circle in center
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 100, 0, Math.PI * 2);
      ctx.fill();

      // Draw frame counter
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(`FRAME: ${frame}`, 300, 100);
      ctx.fillText(`Size: ${width}x${height}`, 300, 150);
      ctx.fillText(`Time: ${new Date().toLocaleTimeString()}`, 300, 200);

      // Update status every 60 frames
      if (frame % 60 === 0) {
        setStatus(`Running - Frame ${frame}`);
      }

      // Request next frame
      animationId = requestAnimationFrame(draw);
    };

    // Start the loop
    draw();

    return () => {
      console.log('[DISPLAY] Cleanup - cancelling animation');
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#000',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        color: '#fff',
        fontSize: '14px',
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.8)',
        padding: '10px',
        borderRadius: '5px',
      }}>
        Status: {status}
      </div>
    </div>
  );
}
