// DARTHANDER Visual Consciousness Engine
// Parameter Sliders Component

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
}

// DARTHANDER brand color sliders
const sliders: SliderConfig[] = [
  { key: 'overallIntensity', label: 'INTENSITY', color: 'bg-gradient-to-r from-neon-purple to-neon-magenta' },
  { key: 'geometryComplexity', label: 'COMPLEXITY', color: 'bg-gradient-to-r from-neon-purple/80 to-neon-cyan' },
  { key: 'chaosFactor', label: 'CHAOS', color: 'bg-gradient-to-r from-neon-red to-neon-magenta' },
  { key: 'motionSpeed', label: 'MOTION', color: 'bg-gradient-to-r from-neon-cyan to-neon-purple' },
  { key: 'audioReactGeometry', label: 'AUDIO REACT', color: 'bg-gradient-to-r from-neon-magenta to-neon-purple' },
  { key: 'eclipsePhase', label: 'ECLIPSE', color: 'bg-gradient-to-r from-white/80 to-neon-purple/50' },
];

export function ParameterSliders({ state, onChange }: ParameterSlidersProps) {
  if (!state) return null;

  return (
    <div className="space-y-5">
      {sliders.map((slider) => {
        const value = (state as any)[slider.key] ?? 0;
        const percentage = Math.round(value * 100);

        return (
          <div key={slider.key} className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neon-purple/60 tracking-wider">{slider.label}</span>
              <span className="text-neon-cyan font-mono">{percentage}%</span>
            </div>
            <div className="relative h-2.5 glass rounded-full overflow-hidden">
              {/* Fill */}
              <div
                className={`absolute inset-y-0 left-0 ${slider.color} rounded-full transition-all duration-200`}
                style={{ width: `${percentage}%` }}
              />
              {/* Glow effect */}
              <div
                className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-50 transition-all duration-200"
                style={{
                  width: `${percentage}%`,
                  background: 'linear-gradient(to right, #8B5CF6, #EC4899)'
                }}
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

      {/* Additional quick toggles */}
      <div className="border-t border-neon-purple/10 pt-4 mt-4">
        <h3 className="text-xs text-neon-purple/50 mb-3 tracking-widest">GEOMETRY MODE</h3>
        <div className="flex flex-wrap gap-2">
          {['stars', 'mandala', 'hexagon', 'fractal', 'spiral', 'tunnel', 'void'].map((mode) => (
            <button
              key={mode}
              onClick={() => onChange('geometryMode', mode as any)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 ${
                state.geometryMode === mode
                  ? 'bg-neon-purple/20 border-neon-purple/50 text-neon-purple shadow-glow-purple'
                  : 'glass-button text-neon-purple/50 hover:text-neon-purple'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-neon-purple/10 pt-4">
        <h3 className="text-xs text-neon-purple/50 mb-3 tracking-widest">MOTION DIRECTION</h3>
        <div className="flex flex-wrap gap-2">
          {['outward', 'inward', 'clockwise', 'counter', 'breathing', 'still'].map((dir) => (
            <button
              key={dir}
              onClick={() => onChange('motionDirection', dir as any)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 ${
                state.motionDirection === dir
                  ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan shadow-glow-cyan'
                  : 'glass-button text-neon-cyan/50 hover:text-neon-cyan'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-neon-purple/10 pt-4">
        <h3 className="text-xs text-neon-purple/50 mb-3 tracking-widest">COLOR PALETTE</h3>
        <div className="flex flex-wrap gap-2">
          {['cosmos', 'void', 'fire', 'ice', 'earth', 'neon', 'sacred'].map((palette) => (
            <button
              key={palette}
              onClick={() => onChange('colorPalette', palette as any)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 ${
                state.colorPalette === palette
                  ? 'bg-neon-magenta/20 border-neon-magenta/50 text-neon-magenta shadow-glow-magenta'
                  : 'glass-button text-neon-magenta/50 hover:text-neon-magenta'
              }`}
            >
              {palette}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
