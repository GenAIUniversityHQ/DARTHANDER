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
  const bands = [
    { key: 'subBass', label: 'SUB', color: 'bg-red-500' },
    { key: 'bass', label: 'BASS', color: 'bg-orange-500' },
    { key: 'lowMid', label: 'LOW', color: 'bg-yellow-500' },
    { key: 'mid', label: 'MID', color: 'bg-green-500' },
    { key: 'highMid', label: 'HIGH', color: 'bg-cyan-500' },
    { key: 'presence', label: 'PRES', color: 'bg-blue-500' },
    { key: 'brilliance', label: 'AIR', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-3">
      {/* Frequency Bands */}
      <div className="flex gap-1 h-16 items-end">
        {bands.map((band) => {
          const value = state ? (state as any)[band.key] ?? 0 : 0;
          const height = Math.max(4, value * 100);

          return (
            <div
              key={band.key}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div className="w-full bg-zinc-900 rounded-t flex items-end h-12">
                <div
                  className={`w-full ${band.color} rounded-t transition-all duration-75`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[8px] text-zinc-500">{band.label}</span>
            </div>
          );
        })}
      </div>

      {/* BPM and Beat */}
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">BPM:</span>
          <span className="font-mono text-white">
            {state?.detectedBpm ? Math.round(state.detectedBpm) : '--'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">BEAT:</span>
          <div 
            className={`w-3 h-3 rounded-full transition-all duration-75 ${
              (state?.beatIntensity ?? 0) > 0.5 
                ? 'bg-white scale-110' 
                : 'bg-zinc-700 scale-100'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500">LEVEL:</span>
          <div className="w-20 h-2 bg-zinc-800 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-75"
              style={{ width: `${(state?.overallAmplitude ?? 0) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
