// DARTHANDER Visual Consciousness Engine
// Audio Visualizer Component


interface AudioState {
  subBass: number;
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  presence: number;
  brilliance: number;
  overallAmplitude: number;
  detectedBpm: number;
  beatIntensity: number;
}

interface AudioVisualizerProps {
  state: AudioState | null;
}

export function AudioVisualizer({ state }: AudioVisualizerProps) {
  // DARTHANDER brand gradient colors for frequency bands
  const bands = [
    { key: 'subBass', label: 'SUB', gradient: 'from-crimson-deep to-neon-red' },
    { key: 'bass', label: 'BASS', gradient: 'from-neon-red to-neon-magenta' },
    { key: 'lowMid', label: 'LOW', gradient: 'from-neon-magenta to-neon-purple' },
    { key: 'mid', label: 'MID', gradient: 'from-neon-purple to-neon-purple' },
    { key: 'highMid', label: 'HIGH', gradient: 'from-neon-purple to-neon-cyan' },
    { key: 'presence', label: 'PRES', gradient: 'from-neon-cyan to-neon-cyan' },
    { key: 'brilliance', label: 'AIR', gradient: 'from-neon-cyan to-white/80' },
  ];

  return (
    <div className="space-y-4">
      {/* Frequency Bands */}
      <div className="flex gap-1.5 h-16 items-end">
        {bands.map((band) => {
          const value = state ? (state as any)[band.key] ?? 0 : 0;
          const height = Math.max(8, value * 100);

          return (
            <div
              key={band.key}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <div className="w-full glass rounded-t-lg flex items-end h-12 overflow-hidden">
                <div
                  className={`w-full bg-gradient-to-t ${band.gradient} rounded-t-lg transition-all duration-100`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[8px] text-neon-purple/50 tracking-wider">{band.label}</span>
            </div>
          );
        })}
      </div>

      {/* BPM and Beat */}
      <div className="flex justify-between items-center text-xs glass px-3 py-2 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-neon-purple/50">BPM:</span>
          <span className="font-mono text-neon-magenta">
            {state?.detectedBpm ? Math.round(state.detectedBpm) : '--'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neon-purple/50">BEAT:</span>
          <div
            className={`w-3 h-3 rounded-full transition-all duration-100 ${
              (state?.beatIntensity ?? 0) > 0.5
                ? 'bg-neon-magenta scale-125 shadow-glow-magenta'
                : 'bg-neon-purple/30 scale-100'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neon-purple/50">LEVEL:</span>
          <div className="w-20 h-2.5 glass rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-red transition-all duration-100"
              style={{ width: `${(state?.overallAmplitude ?? 0) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
