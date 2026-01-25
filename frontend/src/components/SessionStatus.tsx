// DARTHANDER Visual Consciousness Engine
// Session Status Component

import { useState } from 'react';
import { Circle, Play, Square } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SessionStatusProps {
  sessionId: string | null;
  onSessionChange: (id: string | null) => void;
}

export function SessionStatus({ sessionId, onSessionChange }: SessionStatusProps) {
  const [isStarting, setIsStarting] = useState(false);

  const startSession = async () => {
    setIsStarting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: `Session ${new Date().toLocaleString()}` 
        }),
      });
      
      const data = await response.json();
      onSessionChange(data.session.id);
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    
    try {
      await fetch(`${API_URL}/api/session/${sessionId}/end`, {
        method: 'POST',
      });
      onSessionChange(null);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  if (!sessionId) {
    return (
      <button
        onClick={startSession}
        disabled={isStarting}
        className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all duration-200
                   bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan
                   hover:bg-neon-cyan/20 hover:border-neon-cyan/50 hover:shadow-glow-cyan
                   disabled:opacity-50"
      >
        <Play className="w-3 h-3" />
        {isStarting ? 'Starting...' : 'Start Session'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm glass px-3 py-1.5 rounded-lg">
        <Circle className="w-2 h-2 fill-neon-red text-neon-red animate-pulse" />
        <span className="text-neon-red/70">Recording</span>
      </div>
      <button
        onClick={endSession}
        className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all duration-200
                   bg-neon-red/10 border border-neon-red/30 text-neon-red
                   hover:bg-neon-red/20 hover:border-neon-red/50 hover:shadow-glow-red"
      >
        <Square className="w-3 h-3" />
        End
      </button>
    </div>
  );
}
