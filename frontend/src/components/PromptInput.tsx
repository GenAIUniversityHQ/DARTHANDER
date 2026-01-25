// DARTHANDER Visual Consciousness Engine
// Prompt Input Component

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  placeholder?: string;
  compact?: boolean;
}

export function PromptInput({ onSubmit, placeholder = "Enter prompt...", compact = false }: PromptInputProps) {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    onSubmit(value.trim());
    setHistory(prev => [value, ...prev.slice(0, 49)]); // Keep last 50
    setValue('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
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
    <form onSubmit={handleSubmit} className="relative group">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full glass-input rounded-lg pr-10 text-white placeholder-neon-purple/40 font-mono tracking-wide ${
          compact ? 'px-3 py-1.5 text-[11px]' : 'px-5 py-3.5 text-sm rounded-xl pr-14'
        }`}
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className={`absolute right-1 top-1/2 -translate-y-1/2 text-neon-purple/50 hover:text-neon-magenta disabled:opacity-20 transition-all duration-200 hover:scale-110 disabled:hover:scale-100 ${
          compact ? 'p-1.5' : 'p-2.5'
        }`}
      >
        <Send className={compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
      </button>
      {/* Glow effect on focus */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100
                      pointer-events-none transition-opacity duration-300
                      shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
    </form>
  );
}
