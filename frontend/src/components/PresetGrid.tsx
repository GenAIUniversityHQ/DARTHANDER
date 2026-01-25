// DARTHANDER Visual Consciousness Engine
// Preset Grid Component

import type { ReactNode } from 'react';
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

// Map preset names to colors - DARTHANDER brand palette with glassmorphism
const presetColors: Record<string, { gradient: string; border: string; glow: string; iconColor: string }> = {
  COSMOS: { gradient: 'from-deep-purple/60 to-neon-purple/20', border: 'border-neon-purple/30', glow: 'hover:shadow-glow-purple', iconColor: 'text-neon-purple' },
  EMERGENCE: { gradient: 'from-neon-purple/30 to-neon-magenta/20', border: 'border-neon-magenta/30', glow: 'hover:shadow-glow-magenta', iconColor: 'text-neon-magenta' },
  DESCENT: { gradient: 'from-void-black/80 to-deep-purple/40', border: 'border-neon-purple/20', glow: 'hover:shadow-glow-purple', iconColor: 'text-neon-purple/70' },
  TOTALITY: { gradient: 'from-void-black to-void-dark', border: 'border-white/10', glow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]', iconColor: 'text-white/50' },
  PORTAL: { gradient: 'from-neon-purple/40 to-neon-cyan/20', border: 'border-neon-cyan/30', glow: 'hover:shadow-glow-cyan', iconColor: 'text-neon-cyan' },
  FRACTAL_BLOOM: { gradient: 'from-neon-magenta/30 to-neon-red/20', border: 'border-neon-magenta/30', glow: 'hover:shadow-glow-magenta', iconColor: 'text-neon-magenta' },
  VOID: { gradient: 'from-void-black to-void-black', border: 'border-white/5', glow: 'hover:shadow-none', iconColor: 'text-white/30' },
  RETURN: { gradient: 'from-neon-cyan/20 to-neon-purple/20', border: 'border-neon-cyan/20', glow: 'hover:shadow-glow-cyan', iconColor: 'text-neon-cyan' },
  CLOSE: { gradient: 'from-deep-purple/30 to-void-black', border: 'border-neon-purple/10', glow: 'hover:shadow-glow-purple', iconColor: 'text-neon-purple/50' },
  SPIRAL: { gradient: 'from-neon-purple/30 to-neon-magenta/30', border: 'border-neon-purple/30', glow: 'hover:shadow-glow-purple', iconColor: 'text-neon-purple' },
};

export function PresetGrid({ presets, onSelect, currentPreset }: PresetGridProps) {
  // Sort presets: core first, then by sortOrder
  const sortedPresets = [...presets].sort((a, b) => {
    if (a.isCore && !b.isCore) return -1;
    if (!a.isCore && b.isCore) return 1;
    return 0;
  });

  const defaultColors = { gradient: 'from-deep-purple/40 to-void-black', border: 'border-neon-purple/20', glow: 'hover:shadow-glow-purple', iconColor: 'text-neon-purple/60' };

  return (
    <div className="grid grid-cols-4 gap-3">
      {sortedPresets.map((preset, index) => {
        const isActive = currentPreset === preset.name;
        const colors = presetColors[preset.name] || defaultColors;
        const icon = presetIcons[preset.name] || <Circle className="w-5 h-5" />;

        return (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.name)}
            className={`
              relative p-3 rounded-xl border transition-all duration-300
              bg-gradient-to-br ${colors.gradient} ${colors.border}
              backdrop-blur-sm
              ${isActive
                ? 'ring-2 ring-neon-purple/60 shadow-glow-purple'
                : `hover:border-neon-purple/50 ${colors.glow}`}
              group
            `}
          >
            {/* Keyboard shortcut */}
            {index < 8 && (
              <span className="absolute top-1 left-2 text-[9px] text-neon-purple/40 font-mono">
                {index + 1}
              </span>
            )}

            <div className="flex flex-col items-center gap-1.5">
              <div className={`${colors.iconColor} group-hover:text-white transition-colors duration-200`}>
                {icon}
              </div>
              <span className="text-[9px] font-medium tracking-wider text-neon-purple/60 group-hover:text-white transition-colors">
                {preset.name.replace('_', ' ')}
              </span>
            </div>

            {/* Active indicator */}
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-purple shadow-glow-purple" />
            )}
          </button>
        );
      })}
    </div>
  );
}
