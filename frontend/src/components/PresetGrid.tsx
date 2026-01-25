// DARTHANDER Visual Consciousness Engine
// Preset Grid Component - STAGE READY

import { Sparkles, Circle, Moon, Star, Flame, Snowflake, Zap, Wind, Sun } from 'lucide-react';
import { Preset } from '../services/storage';

interface PresetGridProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
  currentPreset: Preset | null;
}

// Icons for presets - big and bold
const presetIcons: Record<string, React.ReactNode> = {
  cosmos: <Sparkles className="w-6 h-6" />,
  portal: <Circle className="w-6 h-6" />,
  void: <Moon className="w-6 h-6" />,
  mandala: <Star className="w-6 h-6" />,
  eclipse: <Moon className="w-6 h-6" />,
  fire: <Flame className="w-6 h-6" />,
  ice: <Snowflake className="w-6 h-6" />,
  fractal: <Zap className="w-6 h-6" />,
  chaos: <Wind className="w-6 h-6" />,
  zen: <Sun className="w-6 h-6" />,
};

// Color schemes for presets
const presetColors: Record<string, string> = {
  cosmos: 'from-purple-500 to-pink-500',
  portal: 'from-cyan-400 to-blue-500',
  void: 'from-slate-600 to-slate-800',
  mandala: 'from-amber-400 to-orange-500',
  eclipse: 'from-indigo-500 to-purple-600',
  fire: 'from-orange-500 to-red-600',
  ice: 'from-cyan-300 to-blue-400',
  fractal: 'from-yellow-400 to-pink-500',
  chaos: 'from-red-500 to-purple-600',
  zen: 'from-emerald-400 to-teal-500',
};

export function PresetGrid({ presets, onSelect, currentPreset }: PresetGridProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {presets.map((preset, index) => {
        const isActive = currentPreset?.id === preset.id;
        const icon = presetIcons[preset.id] || presetIcons[preset.name.toLowerCase()] || <Sparkles className="w-6 h-6" />;
        const colorClass = presetColors[preset.id] || presetColors[preset.name.toLowerCase()] || 'from-purple-500 to-pink-500';

        return (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className={`relative group flex flex-col items-center justify-center p-3 rounded-xl
                       transition-all duration-300 transform hover:scale-105 active:scale-95
                       ${isActive
                         ? `bg-gradient-to-br ${colorClass} shadow-[0_0_30px_rgba(139,92,246,0.6)]`
                         : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30'
                       }`}
          >
            {/* Hotkey badge */}
            <span className="absolute top-1 left-1.5 text-[10px] font-bold text-white/40 group-hover:text-white/70">
              {index + 1}
            </span>

            {/* Icon with glow */}
            <div className={`mb-1 transition-all duration-300 ${isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-white/60 group-hover:text-white'}`}>
              {icon}
            </div>

            {/* Name - BOLD and readable */}
            <span className={`text-[11px] font-black uppercase tracking-wider transition-all
                           ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
              {preset.name}
            </span>

            {/* Active glow ring */}
            {isActive && (
              <div className="absolute inset-0 rounded-xl animate-pulse bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}
