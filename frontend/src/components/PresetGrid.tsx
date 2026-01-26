// DARTHANDER Visual Consciousness Engine
// Preset Grid Component - Compact single row with hover info

import {
  Sparkles, Circle, Moon, Star, Flame, Snowflake, Zap, Wind, Sun, Eye,
  Waves, Compass, Box, CloudLightning, Bird, Ghost, Trees, BookOpen,
  Music2, Heart, Cpu, Mountain, Orbit, Crown, Hexagon, Droplets, Atom,
  Tent, Rocket, Gem, Feather, Building2, Activity, Bomb, Flower2
} from 'lucide-react';
import { Preset } from '../services/storage';

interface PresetGridProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
  currentPreset: Preset | null;
  onHover?: (preset: Preset | null) => void;
}

// Icons for ALL presets - unique for each
const presetIcons: Record<string, React.ReactNode> = {
  // Original 11
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
  // New 15 experiential presets
  'dmt-temple': <Hexagon className="w-4 h-4" />,
  'ocean-drift': <Waves className="w-4 h-4" />,
  'kundalini-rise': <Compass className="w-4 h-4" />,
  'tesseract-mind': <Box className="w-4 h-4" />,
  'nebula-birth': <CloudLightning className="w-4 h-4" />,
  'phoenix-rebirth': <Bird className="w-4 h-4" />,
  'astral-projection': <Ghost className="w-4 h-4" />,
  'mycelium-network': <Trees className="w-4 h-4" />,
  'akashic-records': <BookOpen className="w-4 h-4" />,
  'rave-dimension': <Music2 className="w-4 h-4" />,
  'meditation-deep': <Heart className="w-4 h-4" />,
  'electric-dreams': <Cpu className="w-4 h-4" />,
  'aurora-borealis': <Mountain className="w-4 h-4" />,
  'black-hole': <Orbit className="w-4 h-4" />,
  'divine-feminine': <Crown className="w-4 h-4" />,
  // Additional 10 presets
  'liquid-light': <Droplets className="w-4 h-4" />,
  'quantum-dream': <Atom className="w-4 h-4" />,
  'tribal-fire': <Tent className="w-4 h-4" />,
  'cosmic-surf': <Rocket className="w-4 h-4" />,
  'crystal-cave': <Gem className="w-4 h-4" />,
  'shamanic-journey': <Feather className="w-4 h-4" />,
  'neon-tokyo': <Building2 className="w-4 h-4" />,
  'breathwork': <Activity className="w-4 h-4" />,
  'supernova': <Bomb className="w-4 h-4" />,
  'lotus-bloom': <Flower2 className="w-4 h-4" />,
};

// Color schemes for ALL presets
const presetColors: Record<string, string> = {
  // Original 11
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
  // New 15 experiential presets
  'dmt-temple': 'from-fuchsia-500 to-purple-700',
  'ocean-drift': 'from-blue-400 to-teal-600',
  'kundalini-rise': 'from-red-500 to-yellow-500',
  'tesseract-mind': 'from-cyan-500 to-purple-500',
  'nebula-birth': 'from-pink-500 to-indigo-600',
  'phoenix-rebirth': 'from-orange-400 to-red-700',
  'astral-projection': 'from-violet-400 to-indigo-600',
  'mycelium-network': 'from-amber-600 to-green-700',
  'akashic-records': 'from-yellow-500 to-amber-700',
  'rave-dimension': 'from-pink-500 to-cyan-500',
  'meditation-deep': 'from-indigo-400 to-purple-500',
  'electric-dreams': 'from-cyan-400 to-pink-500',
  'aurora-borealis': 'from-green-400 to-blue-500',
  'black-hole': 'from-gray-700 to-purple-900',
  'divine-feminine': 'from-rose-400 to-pink-600',
  // Additional 10 presets
  'liquid-light': 'from-cyan-400 to-yellow-400',
  'quantum-dream': 'from-violet-500 to-cyan-400',
  'tribal-fire': 'from-amber-500 to-red-600',
  'cosmic-surf': 'from-blue-500 to-purple-500',
  'crystal-cave': 'from-purple-400 to-pink-400',
  'shamanic-journey': 'from-green-600 to-amber-500',
  'neon-tokyo': 'from-pink-500 to-blue-500',
  'breathwork': 'from-teal-400 to-blue-400',
  'supernova': 'from-yellow-400 to-red-600',
  'lotus-bloom': 'from-pink-300 to-purple-400',
};

export function PresetGrid({ presets, onSelect, currentPreset, onHover }: PresetGridProps) {
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
            onMouseEnter={() => onHover?.(preset)}
            onMouseLeave={() => onHover?.(null)}
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
