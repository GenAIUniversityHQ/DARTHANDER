// DARTHANDER Visual Consciousness Engine
// Parameter Sliders Component

import React from 'react';

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
  geometryMode: string;
  motionDirection: string;
  colorPalette: string;
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

const sliders: SliderConfig[] = [
  { key: 'overallIntensity', label: 'INTENSITY', color: 'bg-purple-500' },
  { key: 'geometryComplexity', label: 'COMPLEXITY', color: 'bg-blue-500' },
  { key: 'chaosFactor', label: 'CHAOS', color: 'bg-red-500' },
  { key: 'motionSpeed', label: 'MOTION', color: 'bg-cyan-500' },
  { key: 'audioReactGeometry', label: 'AUDIO REACT', color: 'bg-green-500' },
  { key: 'eclipsePhase', label: 'ECLIPSE', color: 'bg-yellow-500' },
  { key: 'coronaIntensity', label: 'CORONA BEAMS', color: 'bg-orange-500' },
];

export function ParameterSliders({ state, onChange }: ParameterSlidersProps) {
  if (!state) return null;

  return (
    <div className="space-y-4">
      {sliders.map((slider) => {
        const value = (state as any)[slider.key] ?? 0;
        const percentage = Math.round(value * 100);

        return (
          <div key={slider.key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">{slider.label}</span>
              <span className="text-zinc-400 font-mono">{percentage}%</span>
            </div>
            <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
              {/* Fill */}
              <div
                className={`absolute inset-y-0 left-0 ${slider.color} rounded-full transition-all duration-150`}
                style={{ width: `${percentage}%` }}
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
      <div className="border-t border-zinc-800 pt-4 mt-4">
        <h3 className="text-xs text-zinc-500 mb-3">GEOMETRY MODE</h3>
        <div className="flex flex-wrap gap-2">
          {['stars', 'mandala', 'hexagon', 'fractal', 'spiral', 'tunnel', 'void'].map((mode) => (
            <button
              key={mode}
              onClick={() => onChange('geometryMode', mode as any)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                state.geometryMode === mode
                  ? 'bg-purple-900/50 border-purple-500 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-4">
        <h3 className="text-xs text-zinc-500 mb-3">MOTION DIRECTION</h3>
        <div className="flex flex-wrap gap-2">
          {['outward', 'inward', 'clockwise', 'counter', 'breathing', 'still'].map((dir) => (
            <button
              key={dir}
              onClick={() => onChange('motionDirection', dir as any)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                state.motionDirection === dir
                  ? 'bg-cyan-900/50 border-cyan-500 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-4">
        <h3 className="text-xs text-zinc-500 mb-3">COLOR PALETTE</h3>
        <div className="flex flex-wrap gap-2">
          {['cosmos', 'void', 'fire', 'ice', 'earth', 'neon', 'sacred'].map((palette) => (
            <button
              key={palette}
              onClick={() => onChange('colorPalette', palette as any)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                state.colorPalette === palette
                  ? 'bg-pink-900/50 border-pink-500 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
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
