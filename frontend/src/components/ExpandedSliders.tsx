// DARTHANDER Visual Consciousness Engine
// Expanded Sliders Panel - All visual controls

import { useStore } from '../store';

interface SliderConfig {
  key: string;
  label: string;
  color: string;
  icon?: string;
}

const mainSliders: SliderConfig[] = [
  { key: 'overallIntensity', label: 'INTENSITY', color: 'bg-purple-500', icon: '✧' },
  { key: 'geometryComplexity', label: 'COMPLEXITY', color: 'bg-blue-500', icon: '◎' },
  { key: 'chaosFactor', label: 'CHAOS', color: 'bg-red-500', icon: '✦' },
  { key: 'motionSpeed', label: 'SPEED', color: 'bg-cyan-500', icon: '◈' },
];

const audioSliders: SliderConfig[] = [
  { key: 'audioReactGeometry', label: 'AUDIO REACT', color: 'bg-green-500', icon: '♫' },
  { key: 'bassImpactSensitivity', label: 'BASS IMPACT', color: 'bg-orange-500', icon: '◉' },
  { key: 'bassPulseSensitivity', label: 'BASS PULSE', color: 'bg-pink-500', icon: '◎' },
  { key: 'coronaIntensity', label: 'CORONA/BEAMS', color: 'bg-yellow-500', icon: '☀' },
];

const colorSliders: SliderConfig[] = [
  { key: 'colorHueShift', label: 'HUE SHIFT', color: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500' },
  { key: 'colorSaturation', label: 'SATURATION', color: 'bg-pink-500' },
  { key: 'colorBrightness', label: 'BRIGHTNESS', color: 'bg-white' },
];

interface ExpandedSlidersProps {
  showAudioMeters?: boolean;
}

export function ExpandedSliders({ showAudioMeters = true }: ExpandedSlidersProps) {
  const { visualState, audioState, updateVisualParameter } = useStore();

  const handleChange = (key: string, value: number) => {
    updateVisualParameter(key, value);
  };

  const getValue = (key: string): number => {
    if (!visualState) return 0;
    return (visualState as any)[key] ?? 0;
  };

  const getAudioMeterValue = (key: string): number => {
    if (!audioState) return 0;
    if (key === 'bassImpactMeter') return audioState.beatIntensity ?? 0;
    if (key === 'bassPulseMeter') return ((audioState.subBass ?? 0) + (audioState.bass ?? 0)) / 2;
    return (audioState as any)[key] ?? 0;
  };

  const renderSlider = (slider: SliderConfig, isAudioMeter = false) => {
    const value = isAudioMeter ? getAudioMeterValue(slider.key) : getValue(slider.key);
    const percentage = Math.round(value * 100);

    return (
      <div key={slider.key} className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-zinc-500 flex items-center gap-1">
            {slider.icon && <span>{slider.icon}</span>}
            {slider.label}
          </span>
          <span className="text-zinc-400 font-mono">{percentage}%</span>
        </div>
        <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          {/* Fill */}
          <div
            className={`absolute inset-y-0 left-0 ${slider.color} rounded-full transition-all duration-75`}
            style={{ width: `${percentage}%` }}
          />
          {/* Slider Input (only for non-audio meters) */}
          {!isAudioMeter && (
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => handleChange(slider.key, parseInt(e.target.value) / 100)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {mainSliders.map((slider) => renderSlider(slider))}
      </div>

      {/* Audio Reactive Controls */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {audioSliders.map((slider) => renderSlider(slider, false))}
        </div>
        {/* Live Audio Meters */}
        {showAudioMeters && (
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="space-y-0.5">
              <div className="text-[9px] text-zinc-600">BASS LEVEL</div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-75"
                  style={{ width: `${getAudioMeterValue('bassPulseMeter') * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[9px] text-zinc-600">BEAT</div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all duration-75"
                  style={{ width: `${getAudioMeterValue('bassImpactMeter') * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color Controls */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="space-y-2">
          {colorSliders.map((slider) => renderSlider(slider))}
        </div>
      </div>

      {/* Eclipse Control */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500 flex items-center gap-1">
              <span>◐</span> ECLIPSE
            </span>
            <span className="text-zinc-400 font-mono">{Math.round(getValue('eclipsePhase') * 100)}%</span>
          </div>
          <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full transition-all duration-75"
              style={{ width: `${getValue('eclipsePhase') * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={getValue('eclipsePhase') * 100}
              onChange={(e) => handleChange('eclipsePhase', parseInt(e.target.value) / 100)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Star Controls */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-500">★ STAR DENSITY</span>
              <span className="text-zinc-400 font-mono">{Math.round(getValue('starDensity') * 100)}%</span>
            </div>
            <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-white/70 rounded-full transition-all duration-75"
                style={{ width: `${getValue('starDensity') * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={getValue('starDensity') * 100}
                onChange={(e) => handleChange('starDensity', parseInt(e.target.value) / 100)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-500">✦ STAR GLOW</span>
              <span className="text-zinc-400 font-mono">{Math.round(getValue('starBrightness') * 100)}%</span>
            </div>
            <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-75"
                style={{ width: `${getValue('starBrightness') * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={getValue('starBrightness') * 100}
                onChange={(e) => handleChange('starBrightness', parseInt(e.target.value) / 100)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
