// DARTHANDER Visual Consciousness Engine
// Expanded Sliders Panel - All visual controls

import { useStore } from '../store';

interface SliderConfig {
  key: string;
  label: string;
  color: string;
  icon?: string;
}

// MAIN CONTROLS - These are your base values that you set manually
const mainSliders: SliderConfig[] = [
  { key: 'overallIntensity', label: 'INTENSITY', color: 'bg-purple-500', icon: '✧' },
  { key: 'geometryComplexity', label: 'COMPLEXITY', color: 'bg-blue-500', icon: '◎' },
  { key: 'chaosFactor', label: 'CHAOS', color: 'bg-red-500', icon: '✦' },
  { key: 'motionSpeed', label: 'SPEED', color: 'bg-cyan-500', icon: '◈' },
];

// AUDIO SENSITIVITY CONTROLS - These control HOW MUCH audio affects the visuals
// Higher = more reactive to audio, Lower = less reactive, 0 = no audio reaction
const audioSensitivitySliders: SliderConfig[] = [
  { key: 'bassImpactSensitivity', label: 'BASS IMPACT', color: 'bg-orange-500', icon: '◉' },
  { key: 'bassPulseSensitivity', label: 'BASS PULSE', color: 'bg-pink-500', icon: '◎' },
  { key: 'audioReactMotion', label: 'MOTION REACT', color: 'bg-green-500', icon: '↻' },
  { key: 'audioReactColor', label: 'COLOR REACT', color: 'bg-blue-400', icon: '◈' },
  { key: 'audioReactGeometry', label: 'GEO REACT', color: 'bg-purple-400', icon: '◇' },
];

// COLOR CONTROLS - Manual adjustments
const colorSliders: SliderConfig[] = [
  { key: 'colorHueShift', label: 'HUE SHIFT', color: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500' },
  { key: 'colorSaturation', label: 'SATURATION', color: 'bg-pink-500' },
  { key: 'colorBrightness', label: 'BRIGHTNESS', color: 'bg-white' },
];

// COSMIC CONTROLS - Manual adjustments (NOT affected by audio)
const cosmicSliders: SliderConfig[] = [
  { key: 'starDensity', label: 'STAR DENSITY', color: 'bg-white/70', icon: '★' },
  { key: 'starBrightness', label: 'STAR GLOW', color: 'bg-white', icon: '✦' },
  { key: 'nebulaPresence', label: 'NEBULA', color: 'bg-purple-600', icon: '☁' },
  { key: 'coronaIntensity', label: 'CORONA', color: 'bg-yellow-500', icon: '☀' },
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

  // Get live audio values for meters (read-only display)
  const getAudioMeterValue = (type: string): number => {
    if (!audioState) return 0;
    switch (type) {
      case 'bass': return ((audioState.subBass ?? 0) + (audioState.bass ?? 0)) / 2;
      case 'beat': return audioState.beatIntensity ?? 0;
      case 'mid': return ((audioState.lowMid ?? 0) + (audioState.mid ?? 0)) / 2;
      case 'high': return ((audioState.highMid ?? 0) + (audioState.presence ?? 0)) / 2;
      case 'overall': return audioState.overallAmplitude ?? 0;
      default: return 0;
    }
  };

  const renderSlider = (slider: SliderConfig) => {
    const value = getValue(slider.key);
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
          <div
            className={`absolute inset-y-0 left-0 ${slider.color} rounded-full transition-all duration-75`}
            style={{ width: `${percentage}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => handleChange(slider.key, parseInt(e.target.value) / 100)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    );
  };

  const renderAudioMeter = (label: string, type: string, color: string) => {
    const value = getAudioMeterValue(type);
    const percentage = Math.round(value * 100);

    return (
      <div key={type} className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-zinc-600">{label}</span>
          <span className="text-zinc-500 font-mono">{percentage}%</span>
        </div>
        <div className="relative h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 ${color} rounded-full transition-all duration-75`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Controls - Your base manual settings */}
      <div>
        <div className="text-[9px] text-zinc-600 mb-2 uppercase tracking-wider">Main Controls</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {mainSliders.map((slider) => renderSlider(slider))}
        </div>
      </div>

      {/* Audio Sensitivity - Control HOW MUCH audio affects visuals */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[9px] text-zinc-600 mb-2 uppercase tracking-wider">Audio Sensitivity (how much audio affects visuals)</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {audioSensitivitySliders.map((slider) => renderSlider(slider))}
        </div>
      </div>

      {/* Live Audio Meters - Read-only display of current audio levels */}
      {showAudioMeters && (
        <div className="border-t border-zinc-800 pt-3">
          <div className="text-[9px] text-zinc-600 mb-2 uppercase tracking-wider">Live Audio (read-only)</div>
          <div className="grid grid-cols-3 gap-x-3 gap-y-1">
            {renderAudioMeter('BASS', 'bass', 'bg-orange-500/60')}
            {renderAudioMeter('BEAT', 'beat', 'bg-red-500/60')}
            {renderAudioMeter('MID', 'mid', 'bg-green-500/60')}
            {renderAudioMeter('HIGH', 'high', 'bg-cyan-500/60')}
            {renderAudioMeter('ALL', 'overall', 'bg-white/40')}
          </div>
        </div>
      )}

      {/* Cosmic Controls - Manual only, NOT audio reactive */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[9px] text-zinc-600 mb-2 uppercase tracking-wider">Cosmic (manual only)</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {cosmicSliders.map((slider) => renderSlider(slider))}
        </div>
      </div>

      {/* Color Controls */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[9px] text-zinc-600 mb-2 uppercase tracking-wider">Color</div>
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
    </div>
  );
}
