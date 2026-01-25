// DARTHANDER Visual Consciousness Engine
// Preset Grid Component

import type { ReactNode } from 'react';
import {
  Star,
  Circle,
  Sparkles,
  Eye,
  Moon,
  Flame,
  Snowflake,
  Zap,
  Wind,
  Sun
} from 'lucide-react';
import type { Preset } from '../services/storage';

interface PresetGridProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
  currentPreset: string | null;
}

// Map preset names to icons
const presetIcons: Record<string, ReactNode> = {
  cosmos: <Star className="w-5 h-5" />,
  Cosmos: <Star className="w-5 h-5" />,
  COSMOS: <Star className="w-5 h-5" />,
  portal: <Circle className="w-5 h-5" />,
  Portal: <Circle className="w-5 h-5" />,
  PORTAL: <Circle className="w-5 h-5" />,
  void: <Eye className="w-5 h-5" />,
  Void: <Eye className="w-5 h-5" />,
  VOID: <Eye className="w-5 h-5" />,
  mandala: <Sparkles className="w-5 h-5" />,
  'Sacred Mandala': <Sparkles className="w-5 h-5" />,
  eclipse: <Moon className="w-5 h-5" />,
  Eclipse: <Moon className="w-5 h-5" />,
  fire: <Flame className="w-5 h-5" />,
  Fire: <Flame className="w-5 h-5" />,
  ice: <Snowflake className="w-5 h-5" />,
  Ice: <Snowflake className="w-5 h-5" />,
  fractal: <Zap className="w-5 h-5" />,
  Fractal: <Zap className="w-5 h-5" />,
  chaos: <Wind className="w-5 h-5" />,
  Chaos: <Wind className="w-5 h-5" />,
  zen: <Sun className="w-5 h-5" />,
  Zen: <Sun className="w-5 h-5" />,
};

// Map categories to colors
const categoryColors: Record<string, { gradient: string; border: string; glow: string; iconColor: string }> = {
  cosmos: { gradient: 'from-deep-purple/60 to-neon-purple/20', border: 'border-neon-purple/30', glow: 'hover:shadow-glow-purple', iconColor: 'text-neon-purple' },
  portal: { gradient: 'from-neon-purple/40 to-neon-cyan/20', border: 'border-neon-cyan/30', glow: 'hover:shadow-glow-cyan', iconColor: 'text-neon-cyan' },
  geometry: { gradient: 'from-neon-purple/30 to-neon-magenta/20', border: 'border-neon-magenta/30', glow: 'hover:shadow-glow-magenta', iconColor: 'text-neon-magenta' },
  energy: { gradient: 'from-neon-magenta/30 to-neon-red/20', border: 'border-neon-red/30', glow: 'hover:shadow-glow-red', iconColor: 'text-neon-red' },
  custom: { gradient: 'from-deep-purple/40 to-void-black', border: 'border-neon-purple/20', glow: 'hover:shadow-glow-purple', iconColor: 'text-neon-purple/60' },
};

export function PresetGrid({ presets, onSelect, currentPreset }: PresetGridProps) {
  // Sort presets: core first
  const sortedPresets = [...presets].sort((a, b) => {
    if (a.isCore && !b.isCore) return -1;
    if (!a.isCore && b.isCore) return 1;
    return 0;
  });

  const defaultColors = { gradient: 'from-deep-purple/40 to-void-black', border: 'border-neon-purple/20', glow: 'hover:shadow-glow-purple', iconColor: 'text-neon-purple/60' };

  return (
    <div className="grid grid-cols-5 gap-2">
      {sortedPresets.map((preset, index) => {
        const isActive = currentPreset === preset.name;
        const colors = categoryColors[preset.category] || defaultColors;
        const icon = presetIcons[preset.name] || <Circle className="w-5 h-5" />;

        return (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            title={preset.description}
            className={`
              relative p-2.5 rounded-xl border transition-all duration-300
              bg-gradient-to-br ${colors.gradient} ${colors.border}
              backdrop-blur-sm
              ${isActive
                ? 'ring-2 ring-neon-purple/60 shadow-glow-purple'
                : `hover:border-neon-purple/50 ${colors.glow}`}
              group
            `}
          >
            {/* Keyboard shortcut */}
            {index < 9 && (
              <span className="absolute top-0.5 left-1.5 text-[8px] text-neon-purple/40 font-mono">
                {index + 1}
              </span>
            )}

            <div className="flex flex-col items-center gap-1">
              <div className={`${colors.iconColor} group-hover:text-white transition-colors duration-200`}>
                {icon}
              </div>
              <span className="text-[8px] font-medium tracking-wider text-neon-purple/60 group-hover:text-white transition-colors truncate w-full text-center">
                {preset.name.toUpperCase()}
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
