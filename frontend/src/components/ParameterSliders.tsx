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
// DIMENSIONAL - Higher dimensions & impossible geometry
// ============================================
const dimensionalGeometry = [
  { id: 'tesseract', label: 'TESSERACT', color: 'bg-cyan-500' },
  { id: 'hypersphere', label: 'HYPERSPHERE', color: 'bg-blue-500' },
  { id: 'klein-bottle', label: 'KLEIN', color: 'bg-purple-500' },
  { id: 'mobius', label: 'MÖBIUS', color: 'bg-pink-500' },
  { id: 'penrose', label: 'PENROSE', color: 'bg-amber-400' },
  { id: 'calabi-yau', label: 'CALABI', color: 'bg-indigo-500' },
  { id: 'hyperbolic', label: 'HYPERBOLIC', color: 'bg-violet-500' },
  { id: 'impossible', label: 'IMPOSSIBLE', color: 'bg-red-500' },
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

        {/* DIMENSIONAL - 4D+ geometry */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">4D+</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('geometryLayer7', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).geometryLayer7 || (state as any).geometryLayer7 === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {dimensionalGeometry.map((layer) => (
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
      </div>
    </div>
  );
}
