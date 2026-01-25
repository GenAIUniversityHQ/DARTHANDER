// DARTHANDER Visual Consciousness Engine
// Parameter Sliders Component - STAGE READY

import { Flame, Diamond, Zap, Rocket, Music, Waves } from 'lucide-react';

interface VisualState {
  overallIntensity: number;
  geometryComplexity: number;
  chaosFactor: number;
  motionSpeed: number;
  audioReactGeometry: number;
  bassImpact: number;
  eclipsePhase: number;
  colorBrightness: number;
  depthFocalPoint: number;
  starDensity: number;
  coronaIntensity: number;
  geometryMode?: string;
  motionDirection?: string;
  colorPalette?: string;
  geometryLayer2?: string;
}

interface ParameterSlidersProps {
  state: VisualState | null;
  onChange: (parameter: string, value: number) => void;
}

interface SliderConfig {
  key: string;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Sliders with icons for quick visual recognition
const sliders: SliderConfig[] = [
  { key: 'overallIntensity', label: 'INTENSITY', color: 'from-purple-500 via-pink-500 to-red-500', icon: Flame },
  { key: 'geometryComplexity', label: 'COMPLEXITY', color: 'from-cyan-400 via-blue-500 to-purple-500', icon: Diamond },
  { key: 'chaosFactor', label: 'CHAOS', color: 'from-red-500 via-orange-500 to-yellow-500', icon: Zap },
  { key: 'motionSpeed', label: 'SPEED', color: 'from-green-400 via-cyan-500 to-blue-500', icon: Rocket },
  { key: 'audioReactGeometry', label: 'AUDIO REACT', color: 'from-pink-500 via-purple-500 to-indigo-500', icon: Music },
  { key: 'bassImpact', label: 'BASS IMPACT', color: 'from-red-600 via-red-500 to-orange-500', icon: Waves },
];

// Primary geometry modes
const geometryModes = [
  { id: 'stars', label: 'STARS', color: 'bg-purple-500' },
  { id: 'mandala', label: 'MANDALA', color: 'bg-amber-500' },
  { id: 'hexagon', label: 'HEX', color: 'bg-cyan-500' },
  { id: 'fractal', label: 'FRACTAL', color: 'bg-pink-500' },
  { id: 'spiral', label: 'SPIRAL', color: 'bg-green-500' },
  { id: 'tunnel', label: 'TUNNEL', color: 'bg-blue-500' },
  { id: 'void', label: 'VOID', color: 'bg-slate-600' },
];

// Sacred / Ancient geometry layers
const sacredGeometry = [
  { id: 'flower-of-life', label: 'FLOWER OF LIFE', color: 'bg-amber-400' },
  { id: 'metatron', label: 'METATRON', color: 'bg-violet-500' },
  { id: 'sri-yantra', label: 'SRI YANTRA', color: 'bg-red-500' },
  { id: 'torus', label: 'TORUS', color: 'bg-cyan-400' },
  { id: 'vesica', label: 'VESICA', color: 'bg-blue-400' },
  { id: 'seed-of-life', label: 'SEED', color: 'bg-green-400' },
];

// Quantum / Experiential layers
const quantumGeometry = [
  { id: 'quantum-field', label: 'QUANTUM', color: 'bg-indigo-500' },
  { id: 'wave-function', label: 'WAVE', color: 'bg-blue-500' },
  { id: 'particle-grid', label: 'PARTICLES', color: 'bg-cyan-500' },
  { id: 'neural-net', label: 'NEURAL', color: 'bg-pink-500' },
  { id: 'dna-helix', label: 'DNA', color: 'bg-green-500' },
  { id: 'singularity', label: 'SINGULARITY', color: 'bg-purple-600' },
];

// Cosmic / Nebula layers
const cosmicLayers = [
  { id: 'cosmic-surf', label: 'SURF', color: 'bg-cyan-500' },
  { id: 'star-streaks', label: 'STREAKS', color: 'bg-yellow-400' },
  { id: 'fluid-flow', label: 'FLUID', color: 'bg-pink-500' },
  { id: 'nebula', label: 'NEBULA', color: 'bg-purple-500' },
  { id: 'galaxy', label: 'GALAXY', color: 'bg-indigo-500' },
  { id: 'aurora', label: 'AURORA', color: 'bg-emerald-500' },
  { id: 'wormhole', label: 'WORMHOLE', color: 'bg-violet-600' },
];

// Motion directions
const motionDirs = [
  { id: 'flow', label: 'FLOW', color: 'bg-gradient-to-r from-pink-500 to-purple-500' },
  { id: 'outward', label: 'OUT', color: 'bg-cyan-500' },
  { id: 'inward', label: 'IN', color: 'bg-purple-500' },
  { id: 'clockwise', label: 'CW', color: 'bg-green-500' },
  { id: 'counter', label: 'CCW', color: 'bg-yellow-500' },
  { id: 'breathing', label: 'BREATH', color: 'bg-pink-500' },
  { id: 'still', label: 'STILL', color: 'bg-slate-500' },
];

export function ParameterSliders({ state, onChange }: ParameterSlidersProps) {
  if (!state) return null;

  return (
    <div className="space-y-4 mt-2">
      {/* SLIDERS - Big and chunky */}
      {sliders.map((slider) => {
        const value = (state as any)[slider.key] ?? 0;
        const percentage = Math.round(value * 100);

        return (
          <div key={slider.key} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-white/80 tracking-wider flex items-center gap-2">
                <slider.icon className="w-4 h-4" />
                {slider.label}
              </span>
              <span className="text-sm font-black text-white tabular-nums">{percentage}%</span>
            </div>
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
              {/* Gradient fill */}
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${slider.color} rounded-full transition-all duration-150`}
                style={{ width: `${percentage}%` }}
              />
              {/* Glow effect */}
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${slider.color} rounded-full blur-md opacity-50`}
                style={{ width: `${percentage}%` }}
              />
              {/* Knob */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg
                          transform -translate-x-1/2 group-hover:scale-110 transition-transform"
                style={{ left: `${percentage}%` }}
              />
              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => onChange(slider.key, parseInt(e.target.value) / 100)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        );
      })}

      {/* PRIMARY GEOMETRY */}
      <div className="pt-3 border-t border-white/10">
        <h3 className="text-xs font-black text-white/60 tracking-widest mb-2">GEOMETRY</h3>
        <div className="flex flex-wrap gap-1.5">
          {geometryModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onChange('geometryMode', mode.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide
                         transition-all duration-200 transform hover:scale-105 active:scale-95
                         ${state.geometryMode === mode.id
                           ? `${mode.color} text-white shadow-lg shadow-${mode.color}/50`
                           : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                         }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* SACRED / ANCIENT GEOMETRY LAYER */}
      <div className="pt-3 border-t border-white/10">
        <h3 className="text-xs font-black text-white/60 tracking-widest mb-2">SACRED LAYER</h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onChange('geometryLayer2', 'none' as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide
                       transition-all duration-200 transform hover:scale-105 active:scale-95
                       ${!state.geometryLayer2 || state.geometryLayer2 === 'none'
                         ? 'bg-slate-600 text-white shadow-lg'
                         : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                       }`}
          >
            NONE
          </button>
          {sacredGeometry.map((geo) => (
            <button
              key={geo.id}
              onClick={() => onChange('geometryLayer2', geo.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide
                         transition-all duration-200 transform hover:scale-105 active:scale-95
                         ${state.geometryLayer2 === geo.id
                           ? `${geo.color} text-white shadow-lg`
                           : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                         }`}
            >
              {geo.label}
            </button>
          ))}
        </div>
      </div>

      {/* QUANTUM / EXPERIENTIAL LAYER */}
      <div className="pt-3 border-t border-white/10">
        <h3 className="text-xs font-black text-white/60 tracking-widest mb-2">QUANTUM LAYER</h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onChange('geometryLayer3', 'none' as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide
                       transition-all duration-200 transform hover:scale-105 active:scale-95
                       ${!(state as any).geometryLayer3 || (state as any).geometryLayer3 === 'none'
                         ? 'bg-slate-600 text-white shadow-lg'
                         : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                       }`}
          >
            NONE
          </button>
          {quantumGeometry.map((geo) => (
            <button
              key={geo.id}
              onClick={() => onChange('geometryLayer3', geo.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide
                         transition-all duration-200 transform hover:scale-105 active:scale-95
                         ${(state as any).geometryLayer3 === geo.id
                           ? `${geo.color} text-white shadow-lg`
                           : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                         }`}
            >
              {geo.label}
            </button>
          ))}
        </div>
      </div>

      {/* COSMIC / NEBULA LAYER */}
      <div className="pt-3 border-t border-white/10">
        <h3 className="text-xs font-black text-white/60 tracking-widest mb-2">COSMIC LAYER</h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onChange('geometryLayer4', 'none' as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide
                       transition-all duration-200 transform hover:scale-105 active:scale-95
                       ${!(state as any).geometryLayer4 || (state as any).geometryLayer4 === 'none'
                         ? 'bg-slate-600 text-white shadow-lg'
                         : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                       }`}
          >
            NONE
          </button>
          {cosmicLayers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => onChange('geometryLayer4', layer.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide
                         transition-all duration-200 transform hover:scale-105 active:scale-95
                         ${(state as any).geometryLayer4 === layer.id
                           ? `${layer.color} text-white shadow-lg`
                           : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                         }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* MOTION DIRECTION */}
      <div className="pt-3 border-t border-white/10">
        <h3 className="text-xs font-black text-white/60 tracking-widest mb-2">MOTION</h3>
        <div className="flex flex-wrap gap-1.5">
          {motionDirs.map((dir) => (
            <button
              key={dir.id}
              onClick={() => onChange('motionDirection', dir.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide
                         transition-all duration-200 transform hover:scale-105 active:scale-95
                         ${dir.id === 'flow' ? 'relative' : ''}
                         ${state.motionDirection === dir.id
                           ? `${dir.color} text-white shadow-lg ${dir.id === 'flow' ? 'shadow-purple-500/50 animate-pulse' : ''}`
                           : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                         }`}
            >
              {dir.id === 'flow' && <span className="absolute -top-1 -right-1 text-[8px]">✦</span>}
              {dir.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
