// DARTHANDER Visual Consciousness Engine
// Audio Source Selector Component

import { Radio, Upload, Wifi } from 'lucide-react';
import { useStore } from '../store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AudioSourceSelector() {
  const { audioSource, setAudioSource } = useStore();

  const sources = [
    { key: 'live', label: 'LIVE', icon: Radio },
    { key: 'upload', label: 'FILE', icon: Upload },
    { key: 'stream', label: 'STREAM', icon: Wifi },
  ] as const;

  const handleSourceChange = async (source: 'upload' | 'live' | 'stream') => {
    setAudioSource(source);
    
    try {
      await fetch(`${API_URL}/api/audio/source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      });
    } catch (error) {
      console.error('Failed to switch audio source:', error);
    }
  };

  return (
    <div className="flex gap-1.5">
      {sources.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => handleSourceChange(key)}
          className={`
            px-2.5 py-1.5 text-[10px] rounded-lg flex items-center gap-1.5 transition-all duration-200
            ${audioSource === key
              ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40 shadow-glow-purple'
              : 'glass-button text-neon-purple/50 hover:text-neon-purple'}
          `}
        >
          <Icon className="w-3 h-3" />
          {label}
        </button>
      ))}
    </div>
  );
}
