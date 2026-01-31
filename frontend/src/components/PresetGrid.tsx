// DARTHANDER Visual Consciousness Engine
// Preset Grid Component

import { ReactNode } from 'react';
import {
  Star,
  Circle,
  Sparkles,
  Eye,
  Moon,
  ArrowRight,
  Flame
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  description?: string;
  category: string;
  isCore: boolean;
}

interface PresetGridProps {
  presets: Preset[];
  onSelect: (name: string) => void;
  currentPreset: string | null;
}

// Map preset names to icons
const presetIcons: Record<string, ReactNode> = {
  COSMOS: <Star className="w-5 h-5" />,
  EMERGENCE: <Sparkles className="w-5 h-5" />,
  DESCENT: <ArrowRight className="w-5 h-5 rotate-90" />,
  TOTALITY: <Moon className="w-5 h-5" />,
  PORTAL: <Circle className="w-5 h-5" />,
  FRACTAL_BLOOM: <Flame className="w-5 h-5" />,
  VOID: <Eye className="w-5 h-5" />,
  RETURN: <ArrowRight className="w-5 h-5 -rotate-90" />,
  CLOSE: <Star className="w-5 h-5" />,
  SPIRAL: <Circle className="w-5 h-5" />,
};

// Map preset names to colors
const presetColors: Record<string, string> = {
  COSMOS: 'from-blue-900/50 to-purple-900/50 border-blue-500/30',
  EMERGENCE: 'from-purple-900/50 to-pink-900/50 border-purple-500/30',
  DESCENT: 'from-gray-900/50 to-zinc-900/50 border-gray-500/30',
  TOTALITY: 'from-black to-zinc-900/50 border-white/10',
  PORTAL: 'from-indigo-900/50 to-violet-900/50 border-indigo-500/30',
  FRACTAL_BLOOM: 'from-pink-900/50 to-orange-900/50 border-pink-500/30',
  VOID: 'from-black to-black border-white/5',
  RETURN: 'from-blue-900/30 to-cyan-900/30 border-cyan-500/20',
  CLOSE: 'from-zinc-900/50 to-black border-zinc-500/20',
  SPIRAL: 'from-violet-900/50 to-purple-900/50 border-violet-500/30',
};

export function PresetGrid({ presets, onSelect, currentPreset }: PresetGridProps) {
  // Sort presets: core first, then by sortOrder
  const sortedPresets = [...presets].sort((a, b) => {
    if (a.isCore && !b.isCore) return -1;
    if (!a.isCore && b.isCore) return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-4 gap-2">
      {sortedPresets.map((preset, index) => {
        const isActive = currentPreset === preset.name;
        const colorClass = presetColors[preset.name] || 'from-zinc-800 to-zinc-900 border-zinc-700';
        const icon = presetIcons[preset.name] || <Circle className="w-5 h-5" />;

        return (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.name)}
            className={`
              relative p-3 rounded-lg border transition-all
              bg-gradient-to-br ${colorClass}
              ${isActive ? 'ring-2 ring-white/50' : 'hover:border-white/30'}
              group
            `}
          >
            {/* Keyboard shortcut */}
            {index < 8 && (
              <span className="absolute top-1 left-2 text-[10px] text-zinc-500 font-mono">
                {index + 1}
              </span>
            )}

            <div className="flex flex-col items-center gap-1">
              <div className="text-zinc-300 group-hover:text-white transition-colors">
                {icon}
              </div>
              <span className="text-[10px] font-medium tracking-wider text-zinc-400 group-hover:text-white">
                {preset.name.replace('_', ' ')}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
