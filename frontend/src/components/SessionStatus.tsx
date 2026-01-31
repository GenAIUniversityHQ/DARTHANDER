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
        className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-500/30 
                   rounded text-sm text-green-400 hover:bg-green-900/50 transition-colors"
      >
        <Play className="w-3 h-3" />
        {isStarting ? 'Starting...' : 'Start Session'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Circle className="w-2 h-2 fill-red-500 text-red-500 animate-pulse" />
        <span className="text-zinc-400">Recording</span>
      </div>
      <button
        onClick={endSession}
        className="flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-500/30 
                   rounded text-sm text-red-400 hover:bg-red-900/50 transition-colors"
      >
        <Square className="w-3 h-3" />
        End
      </button>
    </div>
  );
}
