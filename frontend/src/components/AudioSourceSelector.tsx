// DARTHANDER Visual Consciousness Engine
// Audio Source Selector Component

import React from 'react';
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
    <div className="flex gap-1">
      {sources.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => handleSourceChange(key)}
          className={`
            px-2 py-1 text-[10px] rounded flex items-center gap-1 transition-colors
            ${audioSource === key
              ? 'bg-purple-900/50 text-purple-300 border border-purple-500/50'
              : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-600'}
          `}
        >
          <Icon className="w-3 h-3" />
          {label}
        </button>
      ))}
    </div>
  );
}
