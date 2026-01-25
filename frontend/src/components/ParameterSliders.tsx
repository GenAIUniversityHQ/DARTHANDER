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

// ============================================
// COLOR PALETTES - Easy access
// ============================================
const colorPalettes = [
  // Core
  { id: 'cosmos', label: 'COSMOS', bg: 'bg-purple-600' },
  { id: 'fire', label: 'FIRE', bg: 'bg-orange-500' },
  { id: 'ice', label: 'ICE', bg: 'bg-cyan-400' },
  { id: 'neon', label: 'NEON', bg: 'bg-pink-500' },
  { id: 'earth', label: 'EARTH', bg: 'bg-emerald-500' },
  // Spectrum
  { id: 'spectrum', label: 'SPECTRUM', bg: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500' },
  { id: 'rainbow', label: 'RAINBOW', bg: 'bg-gradient-to-r from-red-500 via-green-500 to-violet-500' },
  // Light
  { id: 'light', label: 'LIGHT', bg: 'bg-white' },
  { id: 'ethereal', label: 'ETHEREAL', bg: 'bg-violet-200' },
  { id: 'pastel', label: 'PASTEL', bg: 'bg-pink-200' },
  // Ice
  { id: 'glacier', label: 'GLACIER', bg: 'bg-blue-300' },
  { id: 'arctic', label: 'ARCTIC', bg: 'bg-cyan-200' },
  { id: 'frost', label: 'FROST', bg: 'bg-teal-200' },
  // Dark
  { id: 'void', label: 'VOID', bg: 'bg-slate-800' },
  { id: 'bloodmoon', label: 'BLOOD', bg: 'bg-red-900' },
  { id: 'darkprism', label: 'DARKPRISM', bg: 'bg-purple-900' },
  { id: 'crimson', label: 'CRIMSON', bg: 'bg-red-700' },
  { id: 'amethyst', label: 'AMETHYST', bg: 'bg-violet-700' },
  { id: 'obsidian', label: 'OBSIDIAN', bg: 'bg-zinc-900' },
  // Mono
  { id: 'monochrome', label: 'MONO', bg: 'bg-gradient-to-r from-white to-black' },
  { id: 'noir', label: 'NOIR', bg: 'bg-zinc-700' },
  { id: 'silver', label: 'SILVER', bg: 'bg-gray-400' },
  // Sacred
  { id: 'sacred', label: 'SACRED', bg: 'bg-amber-400' },
  { id: 'ancient', label: 'ANCIENT', bg: 'bg-amber-600' },
  { id: 'mystic', label: 'MYSTIC', bg: 'bg-violet-600' },
  { id: 'alchemical', label: 'ALCHEMY', bg: 'bg-gradient-to-r from-amber-400 via-gray-400 to-amber-700' },
  // Other
  { id: 'ocean', label: 'OCEAN', bg: 'bg-blue-500' },
  { id: 'sunset', label: 'SUNSET', bg: 'bg-gradient-to-r from-orange-500 to-pink-500' },
];

// Primary geometry modes - expanded
const geometryModes = [
  { id: 'stars', label: 'STARS', color: 'bg-purple-500' },
  { id: 'mandala', label: 'MANDALA', color: 'bg-amber-500' },
  { id: 'hexagon', label: 'HEX', color: 'bg-cyan-500' },
  { id: 'fractal', label: 'FRACTAL', color: 'bg-pink-500' },
  { id: 'spiral', label: 'SPIRAL', color: 'bg-green-500' },
  { id: 'tunnel', label: 'TUNNEL', color: 'bg-blue-500' },
  { id: 'void', label: 'VOID', color: 'bg-slate-600' },
  { id: 'fibonacci', label: 'FIB', color: 'bg-amber-400' },
  { id: 'chaos-field', label: 'CHAOS', color: 'bg-red-500' },
];

// ============================================
// SACRED GEOMETRY - Universal patterns
// ============================================
const sacredGeometry = [
  { id: 'flower-of-life', label: 'FLOWER', color: 'bg-amber-400' },
  { id: 'metatron', label: 'METATRON', color: 'bg-violet-500' },
  { id: 'sri-yantra', label: 'SRI', color: 'bg-red-500' },
  { id: 'torus', label: 'TORUS', color: 'bg-cyan-400' },
  { id: 'vesica', label: 'VESICA', color: 'bg-blue-400' },
  { id: 'seed-of-life', label: 'SEED', color: 'bg-green-400' },
  { id: 'merkaba', label: 'MERKABA', color: 'bg-yellow-400' },
  { id: 'golden-ratio', label: 'PHI', color: 'bg-amber-500' },
  { id: 'tree-of-life', label: 'TREE', color: 'bg-emerald-500' },
  { id: 'platonic', label: 'PLATONIC', color: 'bg-indigo-400' },
];

// ============================================
// ANCIENT WISDOM - Cultural sacred symbols
// ============================================
const ancientGeometry = [
  { id: 'ankh', label: 'ANKH', color: 'bg-amber-500' },
  { id: 'eye-of-horus', label: 'HORUS', color: 'bg-yellow-400' },
  { id: 'ouroboros', label: 'OUROBOROS', color: 'bg-emerald-500' },
  { id: 'enso', label: 'ENSO', color: 'bg-slate-400' },
  { id: 'om', label: 'OM', color: 'bg-orange-500' },
  { id: 'yin-yang', label: 'YINYANG', color: 'bg-zinc-400' },
  { id: 'dharma-wheel', label: 'DHARMA', color: 'bg-amber-400' },
  { id: 'triskele', label: 'TRISKELE', color: 'bg-green-500' },
  { id: 'hunab-ku', label: 'HUNAB', color: 'bg-violet-500' },
  { id: 'chakras', label: 'CHAKRA', color: 'bg-gradient-to-r from-red-500 via-yellow-500 to-violet-500' },
];

// ============================================
// 4D GEOMETRY - Fourth dimensional objects
// ============================================
const geometry4D = [
  { id: 'tesseract', label: 'TESSERACT', color: 'bg-cyan-500' },
  { id: 'hypersphere', label: '4SPHERE', color: 'bg-blue-500' },
  { id: '24-cell', label: '24CELL', color: 'bg-violet-500' },
  { id: '120-cell', label: '120CELL', color: 'bg-purple-500' },
  { id: '600-cell', label: '600CELL', color: 'bg-pink-500' },
  { id: 'duocylinder', label: 'DUOCYL', color: 'bg-indigo-400' },
  { id: 'clifford-torus', label: 'CLIFFORD', color: 'bg-cyan-400' },
  { id: 'klein-bottle', label: 'KLEIN', color: 'bg-purple-400' },
];

// ============================================
// 5D GEOMETRY - Fifth dimensional objects
// ============================================
const geometry5D = [
  { id: 'penteract', label: 'PENTERACT', color: 'bg-indigo-500' },
  { id: '5-simplex', label: '5SIMPLEX', color: 'bg-violet-500' },
  { id: '5-orthoplex', label: '5ORTHO', color: 'bg-purple-500' },
  { id: '5-demicube', label: '5DEMI', color: 'bg-blue-500' },
  { id: 'pentasphere', label: '5SPHERE', color: 'bg-cyan-500' },
];

// ============================================
// 6D+ GEOMETRY - Sixth and higher dimensions
// ============================================
const geometry6D = [
  { id: 'hexeract', label: 'HEXERACT', color: 'bg-indigo-600' },
  { id: 'e8-lattice', label: 'E8', color: 'bg-gradient-to-r from-violet-500 to-pink-500' },
  { id: '6-simplex', label: '6SIMPLEX', color: 'bg-purple-600' },
  { id: 'gosset', label: 'GOSSET', color: 'bg-cyan-600' },
  { id: 'leech-lattice', label: 'LEECH', color: 'bg-blue-600' },
];

// ============================================
// IMPOSSIBLE / PARADOX - Mind-bending geometry
// ============================================
const impossibleGeometry = [
  { id: 'penrose', label: 'PENROSE', color: 'bg-amber-400' },
  { id: 'impossible', label: 'ESCHER', color: 'bg-red-500' },
  { id: 'mobius', label: 'MÖBIUS', color: 'bg-pink-500' },
  { id: 'hyperbolic', label: 'HYPERBOLIC', color: 'bg-violet-500' },
  { id: 'non-euclidean', label: 'NONEUC', color: 'bg-emerald-500' },
  { id: 'recursive', label: 'RECURSIVE', color: 'bg-cyan-500' },
];

// ============================================
// FRACTAL - Infinite self-similar patterns
// ============================================
const fractalGeometry = [
  { id: 'mandelbrot', label: 'MANDELBROT', color: 'bg-blue-600' },
  { id: 'julia', label: 'JULIA', color: 'bg-purple-500' },
  { id: 'sierpinski', label: 'SIERPINSKI', color: 'bg-red-500' },
  { id: 'koch', label: 'KOCH', color: 'bg-cyan-500' },
  { id: 'dragon', label: 'DRAGON', color: 'bg-green-500' },
  { id: 'tree-fractal', label: 'TREE', color: 'bg-emerald-500' },
  { id: 'menger', label: 'MENGER', color: 'bg-amber-500' },
  { id: 'apollonian', label: 'APOLLONIAN', color: 'bg-pink-400' },
];

// ============================================
// CHAOS / ATTRACTORS - Strange attractors & chaos theory
// ============================================
const chaosGeometry = [
  { id: 'lorenz', label: 'LORENZ', color: 'bg-blue-500' },
  { id: 'rossler', label: 'RÖSSLER', color: 'bg-purple-500' },
  { id: 'chua', label: 'CHUA', color: 'bg-red-500' },
  { id: 'halvorsen', label: 'HALVORSEN', color: 'bg-cyan-500' },
  { id: 'thomas', label: 'THOMAS', color: 'bg-pink-500' },
  { id: 'aizawa', label: 'AIZAWA', color: 'bg-indigo-500' },
];

// ============================================
// REALITY - Simulation / Meta-reality concepts
// ============================================
const realityGeometry = [
  { id: 'matrix', label: 'MATRIX', color: 'bg-green-500' },
  { id: 'glitch', label: 'GLITCH', color: 'bg-red-500' },
  { id: 'simulation', label: 'SIMULATION', color: 'bg-cyan-400' },
  { id: 'observer', label: 'OBSERVER', color: 'bg-violet-500' },
  { id: 'collapse', label: 'COLLAPSE', color: 'bg-blue-500' },
  { id: 'indras-net', label: 'INDRA', color: 'bg-amber-400' },
  { id: 'holofractal', label: 'HOLOFRACTAL', color: 'bg-gradient-to-r from-cyan-500 to-purple-500' },
  { id: 'time-crystal', label: 'TIMECRYSTAL', color: 'bg-gradient-to-r from-blue-400 to-pink-400' },
];

// ============================================
// QUANTUM / Experiential - Subatomic reality
// ============================================
const quantumGeometry = [
  { id: 'quantum-field', label: 'FIELD', color: 'bg-indigo-500' },
  { id: 'wave-function', label: 'WAVE', color: 'bg-blue-500' },
  { id: 'particle-grid', label: 'PARTICLE', color: 'bg-cyan-500' },
  { id: 'entanglement', label: 'ENTANGLE', color: 'bg-violet-500' },
  { id: 'superposition', label: 'SUPER', color: 'bg-blue-400' },
  { id: 'quantum-foam', label: 'FOAM', color: 'bg-slate-400' },
  { id: 'holographic', label: 'HOLO', color: 'bg-cyan-300' },
  { id: 'string-theory', label: 'STRING', color: 'bg-amber-400' },
  { id: 'zero-point', label: 'ZEROPOINT', color: 'bg-white' },
  { id: 'vacuum-flux', label: 'VACUUM', color: 'bg-slate-600' },
];

// ============================================
// COSMIC - Universal phenomena
// ============================================
const cosmicLayers = [
  { id: 'nebula', label: 'NEBULA', color: 'bg-purple-500' },
  { id: 'galaxy', label: 'GALAXY', color: 'bg-indigo-500' },
  { id: 'aurora', label: 'AURORA', color: 'bg-emerald-500' },
  { id: 'wormhole', label: 'WORMHOLE', color: 'bg-violet-600' },
  { id: 'pulsar', label: 'PULSAR', color: 'bg-yellow-300' },
  { id: 'cosmic-web', label: 'WEB', color: 'bg-blue-300' },
  { id: 'event-horizon', label: 'HORIZON', color: 'bg-slate-600' },
  { id: 'big-bang', label: 'BIGBANG', color: 'bg-orange-500' },
  { id: 'dark-matter', label: 'DARKMATTER', color: 'bg-zinc-700' },
  { id: 'multiverse', label: 'MULTIVERSE', color: 'bg-gradient-to-r from-violet-500 to-pink-500' },
];

// ============================================
// LIFEFORCE - Biological & consciousness
// ============================================
const lifeforceGeometry = [
  { id: 'heartbeat', label: 'HEART', color: 'bg-red-500' },
  { id: 'breath', label: 'BREATH', color: 'bg-sky-400' },
  { id: 'neurons', label: 'NEURONS', color: 'bg-pink-400' },
  { id: 'cells', label: 'CELLS', color: 'bg-green-400' },
  { id: 'mycelium', label: 'MYCELIUM', color: 'bg-amber-600' },
  { id: 'biolum', label: 'BIOLUM', color: 'bg-cyan-300' },
  { id: 'dna-helix', label: 'DNA', color: 'bg-green-500' },
  { id: 'kundalini', label: 'KUNDALINI', color: 'bg-gradient-to-r from-red-500 to-violet-500' },
  { id: 'aura', label: 'AURA', color: 'bg-gradient-to-r from-blue-400 to-purple-400' },
  { id: 'cymatics', label: 'CYMATICS', color: 'bg-cyan-500' },
];

// ============================================
// CONSCIOUSNESS - Beyond the physical
// ============================================
const consciousnessGeometry = [
  { id: 'third-eye', label: '3RDEYE', color: 'bg-indigo-500' },
  { id: 'akashic', label: 'AKASHIC', color: 'bg-violet-400' },
  { id: 'morphic', label: 'MORPHIC', color: 'bg-emerald-400' },
  { id: 'dreamtime', label: 'DREAM', color: 'bg-purple-400' },
  { id: 'void-source', label: 'VOID', color: 'bg-slate-800' },
  { id: 'infinity', label: 'INFINITY', color: 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500' },
  { id: 'unity', label: 'UNITY', color: 'bg-white' },
  { id: 'transcendence', label: 'TRANSCEND', color: 'bg-gradient-to-r from-amber-300 to-white' },
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
    <div className="space-y-2 overflow-x-hidden">
      {/* SLIDERS - Compact */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {sliders.map((slider) => {
          const value = (state as any)[slider.key] ?? 0;
          const percentage = Math.round(value * 100);

          return (
            <div key={slider.key}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/70 flex items-center gap-1">
                  <slider.icon className="w-3 h-3" />
                  {slider.label}
                </span>
                <span className="text-[10px] font-bold text-white/50 tabular-nums">{percentage}%</span>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${slider.color} rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow
                            transform -translate-x-1/2"
                  style={{ left: `${percentage}%` }}
                />
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
      </div>

      {/* COLOR PALETTE - Direct access */}
      <div className="pt-2 border-t border-white/10">
        <h3 className="text-[10px] font-bold text-white/50 mb-1">COLOR PALETTE</h3>
        <div className="flex flex-wrap gap-1">
          {colorPalettes.map((p) => (
            <button
              key={p.id}
              onClick={() => onChange('colorPalette', p.id as any)}
              title={p.label}
              className={`w-6 h-6 rounded ${p.bg} border-2 transition-transform hover:scale-110
                         ${(state as any).colorPalette === p.id
                           ? 'border-white scale-110'
                           : 'border-transparent'}`}
            />
          ))}
        </div>
        {/* Color control sliders */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div>
            <span className="text-[9px] font-bold text-white/50">HUE SHIFT</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(((state as any).colorHueShift || 0) * 100)}
              onChange={(e) => onChange('colorHueShift', parseInt(e.target.value) / 100)}
              className="w-full h-1.5 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full appearance-none cursor-pointer"
            />
          </div>
          <div>
            <span className="text-[9px] font-bold text-white/50">SATURATION</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(((state as any).colorSaturation || 0.5) * 100)}
              onChange={(e) => onChange('colorSaturation', parseInt(e.target.value) / 100)}
              className="w-full h-1.5 bg-gradient-to-r from-gray-400 to-purple-500 rounded-full appearance-none cursor-pointer"
            />
          </div>
          <div>
            <span className="text-[9px] font-bold text-white/50">BRIGHTNESS</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(((state as any).colorBrightness || 0.5) * 100)}
              onChange={(e) => onChange('colorBrightness', parseInt(e.target.value) / 100)}
              className="w-full h-1.5 bg-gradient-to-r from-black to-white rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* GEOMETRY + MOTION in one row */}
      <div className="pt-2 border-t border-white/10 flex gap-4">
        <div className="flex-1">
          <h3 className="text-[10px] font-bold text-white/50 mb-1">GEOMETRY</h3>
          <div className="flex flex-wrap gap-1">
            {geometryModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onChange('geometryMode', mode.id as any)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                           ${state.geometryMode === mode.id
                             ? `${mode.color} text-white`
                             : 'bg-white/10 text-white/50 hover:bg-white/20'
                           }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <h3 className="text-[10px] font-bold text-white/50 mb-1">MOTION</h3>
          <div className="flex flex-wrap gap-1">
            {motionDirs.map((dir) => (
              <button
                key={dir.id}
                onClick={() => onChange('motionDirection', dir.id as any)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                           ${dir.id === 'flow' ? 'relative' : ''}
                           ${state.motionDirection === dir.id
                             ? `${dir.color} text-white ${dir.id === 'flow' ? 'animate-pulse' : ''}`
                             : 'bg-white/10 text-white/50 hover:bg-white/20'
                           }`}
              >
                {dir.id === 'flow' && <span className="absolute -top-0.5 -right-0.5 text-[6px]">✦</span>}
                {dir.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LAYERS - All in compact rows */}
      <div className="pt-2 border-t border-white/10 space-y-1.5">
        {/* SACRED */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">SACRED</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer2', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!state.geometryLayer2 || state.geometryLayer2 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {sacredGeometry.map((geo) => (
              <button
                key={geo.id}
                onClick={() => onChange('geometryLayer2', geo.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${state.geometryLayer2 === geo.id
                             ? `${geo.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {geo.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* QUANTUM */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">QUANTUM</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer3', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer3 || (state as any).geometryLayer3 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {quantumGeometry.map((geo) => (
              <button
                key={geo.id}
                onClick={() => onChange('geometryLayer3', geo.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer3 === geo.id
                             ? `${geo.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {geo.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* COSMIC */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">COSMIC</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer4', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer4 || (state as any).geometryLayer4 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {cosmicLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('geometryLayer4', layer.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer4 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* LIFEFORCE - Biological/Organic */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">LIFE</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer5', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer5 || (state as any).geometryLayer5 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {lifeforceGeometry.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('geometryLayer5', layer.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer5 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* ANCIENT - Cultural sacred symbols */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">ANCIENT</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer6', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer6 || (state as any).geometryLayer6 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {ancientGeometry.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('geometryLayer6', layer.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer6 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4D - Fourth dimension */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">4D</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer7', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer7 || (state as any).geometryLayer7 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {geometry4D.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('geometryLayer7', layer.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer7 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5D - Fifth dimension */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">5D</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer9', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer9 || (state as any).geometryLayer9 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {geometry5D.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('geometryLayer9', layer.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer9 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6D+ - Sixth dimension and beyond */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">6D+</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer10', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer10 || (state as any).geometryLayer10 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {geometry6D.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('geometryLayer10', layer.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer10 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONSCIOUSNESS - Beyond physical */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">CONSC</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer8', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer8 || (state as any).geometryLayer8 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {consciousnessGeometry.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('geometryLayer8', layer.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer8 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* FRACTAL - Infinite patterns */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">FRACTAL</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer11', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer11 || (state as any).geometryLayer11 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {fractalGeometry.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('geometryLayer11', layer.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer11 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* CHAOS - Strange attractors */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">CHAOS</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer12', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer12 || (state as any).geometryLayer12 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {chaosGeometry.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('geometryLayer12', layer.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer12 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* REALITY - Simulation / Meta */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">REALITY</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer13', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer13 || (state as any).geometryLayer13 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {realityGeometry.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('geometryLayer13', layer.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer13 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* IMPOSSIBLE - Mind-bending geometry */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">PARADOX</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer14', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer14 || (state as any).geometryLayer14 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {impossibleGeometry.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('geometryLayer14', layer.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer14 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
