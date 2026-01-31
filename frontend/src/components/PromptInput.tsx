// DARTHANDER Visual Consciousness Engine
// Prompt Input Component

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  placeholder?: string;
}

export function PromptInput({ onSubmit, placeholder = "Enter prompt... (e.g., 'go deeper', 'open the portal')" }: PromptInputProps) {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    onSubmit(value.trim());
    setHistory(prev => [value, ...prev.slice(0, 49)]); // Keep last 50
    setValue('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Navigate history with arrow keys
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setValue(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setValue(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setValue('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 pr-12 
                   text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500
                   font-mono text-sm"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 
                   text-zinc-500 hover:text-purple-400 disabled:opacity-30
                   transition-colors"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}
