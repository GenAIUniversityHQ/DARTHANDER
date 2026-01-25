// DARTHANDER Visual Consciousness Engine
// Preset Grid Component - Compact single row

import { Sparkles, Circle, Moon, Star, Flame, Snowflake, Zap, Wind, Sun, Eye } from 'lucide-react';
import { Preset } from '../services/storage';

interface PresetGridProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
  currentPreset: Preset | null;
}

// Icons for presets - compact
const presetIcons: Record<string, React.ReactNode> = {
  awe: <Eye className="w-4 h-4" />,
  cosmos: <Sparkles className="w-4 h-4" />,
  portal: <Circle className="w-4 h-4" />,
  void: <Moon className="w-4 h-4" />,
  mandala: <Star className="w-4 h-4" />,
  eclipse: <Moon className="w-4 h-4" />,
  fire: <Flame className="w-4 h-4" />,
  ice: <Snowflake className="w-4 h-4" />,
  fractal: <Zap className="w-4 h-4" />,
  chaos: <Wind className="w-4 h-4" />,
  zen: <Sun className="w-4 h-4" />,
};

// Color schemes for presets
const presetColors: Record<string, string> = {
  awe: 'from-violet-500 to-purple-600',
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
    <div className="flex gap-1.5 flex-wrap">
      {presets.map((preset, index) => {
        const isActive = currentPreset?.id === preset.id;
        const icon = presetIcons[preset.id] || presetIcons[preset.name.toLowerCase()] || <Sparkles className="w-4 h-4" />;
        const colorClass = presetColors[preset.id] || presetColors[preset.name.toLowerCase()] || 'from-purple-500 to-pink-500';

        return (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            title={`${index + 1}: ${preset.name}`}
            className={`relative group flex items-center justify-center w-9 h-9 rounded-lg
                       transition-all duration-200 transform hover:scale-110 active:scale-95
                       ${isActive
                         ? `bg-gradient-to-br ${colorClass} shadow-lg`
                         : 'bg-white/10 hover:bg-white/20 border border-white/10'
                       }`}
          >
            <div className={`transition-all ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
              {icon}
            </div>
          </button>
        );
      })}
    </div>
  );
}
