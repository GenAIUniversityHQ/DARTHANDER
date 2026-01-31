// DARTHANDER Visual Consciousness Engine
// Vibe Layer Panel - Extended visual controls

import { useStore } from '../store';

interface VibeCategory {
  name: string;
  options: string[];
}

const vibeCategories: VibeCategory[] = [
  { name: 'SACRED', options: ['OFF', 'FLOWER', 'METATRON', 'SRI', 'TORUS', 'VESICA', 'SEED', 'MERKABA', 'PHI', 'TREE', 'PLATONIC'] },
  { name: 'QUANTUM', options: ['OFF', 'FIELD', 'WAVE', 'PARTICLE', 'ENTANGLE', 'SUPER', 'FOAM', 'HOLO', 'STRING', 'ZEROPOINT'] },
  { name: 'COSMIC', options: ['OFF', 'NEBULA', 'GALAXY', 'AURORA', 'WORMHOLE', 'PULSAR', 'WEB', 'HORIZON', 'DARKMATTER'] },
  { name: 'LIFE', options: ['OFF', 'HEART', 'BREATH', 'NEURONS', 'CELLS', 'MYCELIUM', 'BIOLUM', 'DNA', 'KUNDALINI', 'AURA', 'CYMATICS'] },
  { name: 'ANCIENT', options: ['OFF', 'ANKH', 'HORUS', 'OUROBOROS', 'ENSO', 'OM', 'YINYANG', 'DHARMA', 'TRISKELE', 'RUNAR', 'CHAKRA'] },
  { name: '4D', options: ['OFF', 'TESSERACT', 'ASPHERE', '24CELL', '120CELL', '600CELL', 'DUOCYL', 'CLIFFORD', 'KLEIN'] },
  { name: 'FRACTAL', options: ['OFF', 'MANDELBROT', 'JULIA', 'SIERPINSKI', 'KOCH', 'DRAGON', 'TREE', 'MENGER', 'APOLLONIAN'] },
  { name: 'CHAOS', options: ['OFF', 'LORENZ', 'ROSSLER', 'CHUA', 'HALVORSEN', 'THOMAS', 'AIZAWA'] },
  { name: 'ELEMENT', options: ['OFF', 'FIRE', 'WATER', 'EARTH', 'AIR', 'AETHER', 'PLASMA', 'LIGHTNING', 'ICE', 'SMOKE', 'CRYSTAL'] },
  { name: 'CELESTIAL', options: ['OFF', 'SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'NEPTUNE', 'PLUTO', 'ECLIPSE'] },
  { name: 'EMOTION', options: ['OFF', 'JOY', 'PEACE', 'ECSTASY', 'AWE', 'MELANCHOLY', 'RAGE', 'GRIEF', 'LOVE', 'SERENITY', 'WONDER'] },
  { name: 'NATURE', options: ['OFF', 'FOREST', 'OCEAN', 'MOUNTAIN', 'DESERT', 'STORM', 'VOLCANO', 'CAVE', 'WATERFALL', 'AURORA'] },
  { name: 'MYTHIC', options: ['OFF', 'DRAGON', 'PHOENIX', 'SERPENT', 'ANGEL', 'DEMON', 'SPIRIT', 'SHADOW', 'LIGHTBEING', 'SHIFTER'] },
  { name: 'ALCHEMY', options: ['OFF', 'NIGREDO', 'ALBEDO', 'CITRINITAS', 'RUBEDO', 'SOLVE', 'COAGULA', 'TRANSMUTE', 'PHILSTONE'] },
  { name: 'WAVE', options: ['OFF', 'SINE', 'SQUARE', 'SAW', 'TRI', 'PULSE', 'NOISE', 'HARMONIC', 'RESONANCE'] },
  { name: 'TEMPORAL', options: ['OFF', 'PAST', 'FUTURE', 'ETERNAL', 'LOOP', 'REWIND', 'FREEZE', 'DECAY', 'BLOOM'] },
];

const geometryModes = ['STARS', 'MANDALA', 'HEX', 'FRACTAL', 'SPIRAL', 'TUNNEL', 'VOID', 'FIB', 'CHAOS'];
const motionModes = ['FLOW', 'OUT', 'IN', 'CW', 'CCW', 'BREATH', 'STILL'];

const colorPalettes = [
  { name: 'cosmos', colors: ['#4a4aff', '#8a4aff', '#0a0a1a'] },
  { name: 'void', colors: ['#1a1a1a', '#2a2a2a', '#000000'] },
  { name: 'fire', colors: ['#ff4a00', '#ffaa00', '#1a0a00'] },
  { name: 'ice', colors: ['#00aaff', '#aaffff', '#001a2a'] },
  { name: 'earth', colors: ['#4a8a4a', '#8a6a4a', '#0a1a0a'] },
  { name: 'neon', colors: ['#ff00ff', '#00ffff', '#0a001a'] },
  { name: 'sacred', colors: ['#ffd700', '#8a4aff', '#1a0a1a'] },
  { name: 'sunset', colors: ['#ff6b35', '#f7931e', '#1a0505'] },
  { name: 'ocean', colors: ['#006994', '#40e0d0', '#001a2a'] },
  { name: 'forest', colors: ['#228b22', '#90ee90', '#0a1a0a'] },
  { name: 'royal', colors: ['#4169e1', '#9370db', '#0a0a2a'] },
  { name: 'blood', colors: ['#8b0000', '#dc143c', '#1a0000'] },
];

export function VibeLayerPanel() {
  const { visualState, updateVisualParameter, vibeLayers, setVibeLayer } = useStore();

  const handleGeometrySelect = (mode: string) => {
    updateVisualParameter('geometryMode', mode.toLowerCase());
  };

  const handleMotionSelect = (motion: string) => {
    const motionMap: Record<string, string> = {
      'FLOW': 'outward',
      'OUT': 'outward',
      'IN': 'inward',
      'CW': 'clockwise',
      'CCW': 'counter',
      'BREATH': 'breathing',
      'STILL': 'still',
    };
    updateVisualParameter('motionDirection', motionMap[motion] || 'clockwise');
  };

  const handlePaletteSelect = (palette: string) => {
    updateVisualParameter('colorPalette', palette);
  };

  const handleVibeLayerSelect = (category: string, option: string) => {
    if (setVibeLayer) {
      setVibeLayer(category, option === 'OFF' ? null : option);
    }
  };

  const currentGeometry = (visualState?.geometryMode || 'stars').toUpperCase();
  const currentMotion = visualState?.motionDirection || 'clockwise';
  const currentPalette = visualState?.colorPalette || 'cosmos';

  const motionToButton: Record<string, string> = {
    'outward': 'OUT',
    'inward': 'IN',
    'clockwise': 'CW',
    'counter': 'CCW',
    'breathing': 'BREATH',
    'still': 'STILL',
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Color Palette */}
      <div>
        <div className="text-zinc-500 mb-2">COLOR PALETTE</div>
        <div className="flex flex-wrap gap-1">
          {colorPalettes.map((palette) => (
            <button
              key={palette.name}
              onClick={() => handlePaletteSelect(palette.name)}
              className={`
                w-6 h-6 rounded border-2 transition-all
                ${currentPalette === palette.name ? 'border-white scale-110' : 'border-transparent hover:border-zinc-500'}
              `}
              style={{
                background: `linear-gradient(135deg, ${palette.colors[0]}, ${palette.colors[1]})`,
              }}
              title={palette.name}
            />
          ))}
        </div>
      </div>

      {/* Geometry Modes */}
      <div>
        <div className="text-zinc-500 mb-2">GEOMETRY</div>
        <div className="flex flex-wrap gap-1">
          {geometryModes.map((mode) => (
            <button
              key={mode}
              onClick={() => handleGeometrySelect(mode)}
              className={`
                px-2 py-1 rounded text-[10px] font-medium transition-colors
                ${currentGeometry === mode || (mode === 'HEX' && currentGeometry === 'HEXAGON')
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}
              `}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Motion Modes */}
      <div>
        <div className="text-zinc-500 mb-2">MOTION</div>
        <div className="flex flex-wrap gap-1">
          {motionModes.map((motion) => (
            <button
              key={motion}
              onClick={() => handleMotionSelect(motion)}
              className={`
                px-2 py-1 rounded text-[10px] font-medium transition-colors
                ${motionToButton[currentMotion] === motion
                  ? 'bg-cyan-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}
              `}
            >
              {motion}
            </button>
          ))}
        </div>
      </div>

      {/* Vibe Layers */}
      <div className="border-t border-zinc-800 pt-4">
        <div className="text-zinc-500 mb-3">VIBE LAYERS</div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {vibeCategories.map((category) => {
            const currentValue = vibeLayers?.[category.name] || 'OFF';
            return (
              <div key={category.name} className="flex items-start gap-2">
                <span className="text-zinc-500 w-16 flex-shrink-0 pt-0.5">{category.name}</span>
                <div className="flex flex-wrap gap-1 flex-1">
                  {category.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleVibeLayerSelect(category.name, option)}
                      className={`
                        px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors
                        ${currentValue === option
                          ? option === 'OFF'
                            ? 'bg-zinc-700 text-zinc-300'
                            : 'bg-purple-600 text-white'
                          : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'}
                      `}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
