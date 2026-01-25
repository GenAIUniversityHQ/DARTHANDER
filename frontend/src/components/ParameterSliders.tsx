// DARTHANDER Visual Consciousness Engine
// Parameter Sliders Component - STAGE READY

interface VisualState {
  overallIntensity: number;
  geometryComplexity: number;
  chaosFactor: number;
  motionSpeed: number;
  audioReactGeometry: number;
  eclipsePhase: number;
  colorBrightness: number;
  depthFocalPoint: number;
  starDensity: number;
  coronaIntensity: number;
  geometryMode?: string;
  motionDirection?: string;
  colorPalette?: string;
}

interface ParameterSlidersProps {
  state: VisualState | null;
  onChange: (parameter: string, value: number) => void;
}

interface SliderConfig {
  key: string;
  label: string;
  color: string;
  emoji: string;
}

// Sliders with emojis for quick visual recognition
const sliders: SliderConfig[] = [
  { key: 'overallIntensity', label: 'INTENSITY', color: 'from-purple-500 via-pink-500 to-red-500', emoji: '🔥' },
  { key: 'geometryComplexity', label: 'COMPLEXITY', color: 'from-cyan-400 via-blue-500 to-purple-500', emoji: '💎' },
  { key: 'chaosFactor', label: 'CHAOS', color: 'from-red-500 via-orange-500 to-yellow-500', emoji: '⚡' },
  { key: 'motionSpeed', label: 'SPEED', color: 'from-green-400 via-cyan-500 to-blue-500', emoji: '🚀' },
  { key: 'audioReactGeometry', label: 'AUDIO', color: 'from-pink-500 via-purple-500 to-indigo-500', emoji: '🎵' },
];

// Geometry modes with colors
const geometryModes = [
  { id: 'stars', label: 'STARS', color: 'bg-purple-500' },
  { id: 'mandala', label: 'MANDALA', color: 'bg-amber-500' },
  { id: 'hexagon', label: 'HEX', color: 'bg-cyan-500' },
  { id: 'fractal', label: 'FRACTAL', color: 'bg-pink-500' },
  { id: 'spiral', label: 'SPIRAL', color: 'bg-green-500' },
  { id: 'tunnel', label: 'TUNNEL', color: 'bg-blue-500' },
  { id: 'void', label: 'VOID', color: 'bg-slate-600' },
];

// Motion directions
const motionDirs = [
  { id: 'outward', label: 'OUT', color: 'bg-cyan-500' },
  { id: 'inward', label: 'IN', color: 'bg-purple-500' },
  { id: 'clockwise', label: 'CW', color: 'bg-green-500' },
  { id: 'counter', label: 'CCW', color: 'bg-yellow-500' },
  { id: 'breathing', label: 'BREATH', color: 'bg-pink-500' },
  { id: 'still', label: 'STILL', color: 'bg-slate-500' },
];

// Color palettes with actual colors
const colorPalettes = [
  { id: 'cosmos', label: 'COSMOS', colors: ['#8B5CF6', '#EC4899'] },
  { id: 'void', label: 'VOID', colors: ['#1e293b', '#334155'] },
  { id: 'fire', label: 'FIRE', colors: ['#f97316', '#ef4444'] },
  { id: 'ice', label: 'ICE', colors: ['#06b6d4', '#3b82f6'] },
  { id: 'earth', label: 'EARTH', colors: ['#22c55e', '#eab308'] },
  { id: 'neon', label: 'NEON', colors: ['#ff00ff', '#00ffff'] },
  { id: 'sacred', label: 'SACRED', colors: ['#ffd700', '#8B5CF6'] },
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
                <span className="text-base">{slider.emoji}</span>
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

      {/* GEOMETRY MODE - Big colorful buttons */}
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
                         ${state.motionDirection === dir.id
                           ? `${dir.color} text-white shadow-lg`
                           : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                         }`}
            >
              {dir.label}
            </button>
          ))}
        </div>
      </div>

      {/* COLOR PALETTE - Show actual colors */}
      <div className="pt-3 border-t border-white/10">
        <h3 className="text-xs font-black text-white/60 tracking-widest mb-2">COLORS</h3>
        <div className="flex flex-wrap gap-1.5">
          {colorPalettes.map((palette) => (
            <button
              key={palette.id}
              onClick={() => onChange('colorPalette', palette.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide
                         transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-1.5
                         ${state.colorPalette === palette.id
                           ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                           : 'hover:ring-1 hover:ring-white/50'
                         }`}
              style={{
                background: `linear-gradient(135deg, ${palette.colors[0]}, ${palette.colors[1]})`
              }}
            >
              <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{palette.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
