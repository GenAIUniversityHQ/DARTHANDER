// DARTHANDER Visual Consciousness Engine
// Parameter Sliders Component - STAGE READY

import { useState } from 'react';
import { Flame, Diamond, Zap, Rocket, Music, Waves, Sun, Info } from 'lucide-react';

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

export interface LayerHoverInfo {
  id: string;
  category: string;
  description: string;
  color: string;
}

interface ParameterSlidersProps {
  state: VisualState | null;
  onChange: (parameter: string, value: number) => void;
  onLayerHover?: (layer: LayerHoverInfo | null) => void;
}

// Layer descriptions for hover info
const layerDescriptions: Record<string, string> = {
  // Geometry Modes
  'stars': 'Animated particle starfield - peaceful cosmic backdrop',
  'mandala': 'Symmetrical rotating patterns - meditative sacred geometry',
  'hexagon': '6-sided crystalline structures - ordered perfection',
  'fractal': 'Infinite recursive branching - endless complexity',
  'spiral': 'Multi-armed spiraling vortex - hypnotic flow',
  'tunnel': 'Concentric rings expanding/contracting - portal effect',
  'void': 'Deep empty space with subtle rings - the abyss',
  'fibonacci': 'Golden ratio spiral sequences - nature\'s mathematics',
  'chaos-field': 'Chaotic energy field - raw untamed power',
  // Sacred Geometry
  'flower-of-life': 'Ancient creation pattern - source of all forms',
  'metatron': 'Archangel\'s cube - contains all platonic solids',
  'sri-yantra': 'Hindu meditation diagram - 9 interlocking triangles',
  'torus': 'Donut-shaped energy field - continuous flow',
  'vesica': 'Two overlapping circles - birth of creation',
  'seed-of-life': '7 circles - genesis pattern of life',
  'merkaba': 'Star tetrahedron - light body vehicle',
  'golden-ratio': 'Phi spirals - divine proportion 1.618',
  'tree-of-life': 'Kabbalistic diagram - 10 spheres of existence',
  'platonic': 'Five perfect solids - building blocks of reality',
  // Ancient Wisdom
  'ankh': 'Egyptian key of life - eternal existence',
  'eye-of-horus': 'Egyptian protection - all-seeing eye',
  'ouroboros': 'Snake eating tail - infinite cycle',
  'enso': 'Zen circle - enlightenment and void',
  'om': 'Sanskrit sacred sound - universal vibration',
  'yin-yang': 'Balance of opposites - duality in unity',
  'dharma-wheel': 'Buddhist wheel - path to enlightenment',
  'triskele': 'Celtic triple spiral - earth/sea/sky',
  'hunab-ku': 'Mayan galactic center - source consciousness',
  'chakras': 'Energy centers - rainbow spine alignment',
  // 4D Geometry
  'tesseract': '4D hypercube - cube within cube rotation',
  'hypersphere': '4D sphere - infinite perspectives',
  '24-cell': '24 octahedral cells - self-dual polytope',
  '120-cell': '120 dodecahedral cells - complex beauty',
  '600-cell': '600 tetrahedra - maximum 4D complexity',
  'duocylinder': 'Two perpendicular circles - 4D torus',
  'clifford-torus': 'Flat torus in 4D - twisted space',
  'klein-bottle': 'One-sided surface - no inside/outside',
  // 5D+ Geometry
  'penteract': '5D hypercube - beyond comprehension',
  '5-simplex': '5D tetrahedron - minimal 5D shape',
  '5-orthoplex': '5D cross polytope - perpendicular axes',
  '5-demicube': 'Half 5D cube - alternated vertices',
  'pentasphere': '5D sphere - infinite dimensions glimpsed',
  'hexeract': '6D hypercube - reality layers',
  'e8-lattice': '248-dimensional Lie group - theory of everything',
  '6-simplex': '6D tetrahedron - pure abstraction',
  'gosset': 'E8 root system - mathematical perfection',
  'leech-lattice': '24D sphere packing - densest arrangement',
  // Quantum
  'quantum-field': 'Flickering probability - fundamental reality',
  'wave-function': 'Probability waves - superposition',
  'particle-grid': 'Point particles - discrete quanta',
  'entanglement': 'Spooky action - instant connection',
  'superposition': 'All states at once - before observation',
  'quantum-foam': 'Spacetime bubbles - Planck scale chaos',
  'holographic': 'Information surface - reality as hologram',
  'string-theory': 'Vibrating strings - 11 dimensions',
  'zero-point': 'Vacuum energy - empty space vibrates',
  'vacuum-flux': 'Virtual particles - nothing is empty',
  // Cosmic
  'nebula': 'Gas clouds - stellar nurseries',
  'galaxy': 'Spiral arms - billions of stars',
  'aurora': 'Northern/southern lights - charged particles',
  'wormhole': 'Spacetime tunnel - cosmic shortcut',
  'pulsar': 'Spinning neutron star - cosmic lighthouse',
  'cosmic-web': 'Large scale structure - universe skeleton',
  'event-horizon': 'Black hole boundary - point of no return',
  'big-bang': 'Cosmic birth - explosion of existence',
  'dark-matter': 'Invisible mass - universe scaffolding',
  'multiverse': 'Parallel realities - infinite possibilities',
  // Lifeforce
  'heartbeat': 'Cardiac rhythm - pulse of life',
  'breath': 'Respiratory flow - prana exchange',
  'neurons': 'Brain cells - consciousness network',
  'cells': 'Living units - biological building blocks',
  'mycelium': 'Fungal network - nature\'s internet',
  'biolum': 'Living light - deep sea glow',
  'dna-helix': 'Genetic spiral - code of life',
  'kundalini': 'Coiled energy - spiritual awakening',
  'aura': 'Energy field - bioelectric emanation',
  'cymatics': 'Sound shapes - visible vibration',
  // Consciousness
  'third-eye': 'Pineal activation - inner vision',
  'akashic': 'Cosmic records - all knowledge library',
  'morphic': 'Field resonance - collective memory',
  'dreamtime': 'Aboriginal creation - eternal dreaming',
  'void-source': 'Emptiness - the pregnant nothing',
  'infinity': 'Endless expanse - no boundaries',
  'unity': 'All is one - separation dissolves',
  'transcendence': 'Beyond limits - ego dissolution',
  // Elemental
  'fire': 'Dancing flames - transformation energy',
  'water': 'Flowing liquid - emotional depth',
  'earth': 'Solid ground - stability and growth',
  'air': 'Invisible wind - thought and breath',
  'aether': 'Fifth element - spirit substance',
  'plasma': 'Ionized gas - fourth state of matter',
  'lightning': 'Electric discharge - sudden illumination',
  'ice': 'Frozen crystals - stillness and clarity',
  'smoke': 'Rising vapor - transition and mystery',
  'crystal': 'Geometric solids - amplified energy',
  // Energy
  'chi': 'Life force - Chinese vital energy',
  'prana': 'Breath of life - Hindu life force',
  'reiki': 'Universal energy - healing hands',
  'orgone': 'Reich\'s energy - life accumulator',
  'tesla': 'Electric arcs - free energy',
  'scalar': 'Standing waves - zero-point energy',
  'tachyon': 'Faster than light - time reversal',
  'vortex': 'Spinning energy - implosion power',
  'toroidal': 'Donut field - self-sustaining',
  // Texture
  'liquid': 'Flowing surface - mercury feel',
  'metallic': 'Reflective surface - chrome shine',
  'glass': 'Transparent material - refraction',
  'silk': 'Soft flowing fabric - gentle movement',
  'particle': 'Granular texture - sand/dust',
  'grain': 'Film grain - analog warmth',
  'iridescent': 'Rainbow shimmer - oil on water',
  'holographic': 'Laser interference - 3D surface',
  'neon-glow': 'Electric tubes - 80s aesthetic',
  // Altered States
  'hypnotic': 'Trance induction - spiral focus',
  'trance': 'Deep state - rhythmic absorption',
  'lucid': 'Aware dreaming - conscious sleep',
  'astral': 'Soul travel - etheric projection',
  'obe': 'Out of body - floating above',
  'nde': 'Near death - tunnel of light',
  'ego-death': 'Self dissolution - boundary loss',
  'peak': 'Mystical experience - cosmic unity',
  'flow-state': 'In the zone - effortless action',
  // Celestial
  'sun': 'Solar power - source of light',
  'moon': 'Lunar cycles - reflection and tides',
  'mercury': 'Swift messenger - communication',
  'venus': 'Love planet - beauty and harmony',
  'mars': 'War planet - action and drive',
  'jupiter': 'Giant king - expansion and luck',
  'saturn': 'Ringed one - structure and time',
  'neptune': 'Ocean planet - dreams and illusion',
  'pluto': 'Underworld - death and rebirth',
  'eclipse-total': 'Sun/moon union - cosmic alignment',
  // Emotion
  'joy': 'Pure happiness - golden radiance',
  'peace': 'Inner calm - still water',
  'ecstasy': 'Intense bliss - overwhelming joy',
  'awe': 'Wonder and reverence - humbling vastness',
  'melancholy': 'Sweet sadness - beautiful sorrow',
  'rage': 'Intense anger - explosive fire',
  'grief': 'Deep loss - heavy darkness',
  'love': 'Heart energy - connection warmth',
  'serenity': 'Tranquil peace - undisturbed lake',
  'wonder': 'Childlike amazement - curious magic',
  // Nature
  'forest': 'Dense trees - green sanctuary',
  'ocean': 'Vast water - deep blue mystery',
  'mountain': 'Stone peaks - solid majesty',
  'desert': 'Sand expanse - empty vastness',
  'storm': 'Weather chaos - electric tension',
  'volcano': 'Molten earth - primal power',
  'cave': 'Underground dark - inner journey',
  'waterfall': 'Falling water - powerful flow',
  'northern-lights': 'Aurora borealis - sky dance',
  // Mythic
  'dragon': 'Fire serpent - primal power',
  'phoenix': 'Reborn bird - death to life',
  'serpent': 'Coiled wisdom - kundalini energy',
  'angel': 'Light being - divine messenger',
  'demon': 'Shadow force - inner darkness',
  'spirit': 'Ethereal presence - ghost energy',
  'shadow': 'Dark side - unconscious self',
  'light-being': 'Pure radiance - ascended form',
  'shapeshifter': 'Form changer - fluid identity',
  // Alchemical
  'nigredo': 'Blackening - decomposition stage',
  'albedo': 'Whitening - purification stage',
  'citrinitas': 'Yellowing - awakening stage',
  'rubedo': 'Reddening - completion stage',
  'solve': 'Dissolution - breaking down',
  'coagula': 'Coagulation - coming together',
  'transmute': 'Transform - lead to gold',
  'philosophers-stone': 'Ultimate goal - perfection achieved',
  // Waveform
  'sine': 'Smooth wave - pure tone',
  'square': 'On/off wave - digital/harsh',
  'sawtooth': 'Ramp wave - buzzy/bright',
  'triangle': 'Linear wave - mellow tone',
  'pulse': 'Variable width - rhythmic beat',
  'noise': 'Random - chaos/texture',
  'harmonic': 'Overtones - rich complexity',
  'resonance': 'Amplified frequency - standing wave',
  // Temporal
  'past': 'Before now - sepia memories',
  'future': 'Yet to come - chrome tomorrow',
  'eternal': 'Outside time - always/never',
  'loop': 'Repeating cycle - groundhog day',
  'rewind': 'Going back - reverse time',
  'freeze': 'Stopped time - frozen moment',
  'decay': 'Entropy - things fall apart',
  'bloom': 'Growing - things come together',
  // Fractals
  'mandelbrot': 'Famous fractal - infinite complexity boundary',
  'julia': 'Related set - varying parameter',
  'sierpinski': 'Triangle holes - self-similar',
  'koch': 'Snowflake curve - infinite coastline',
  'dragon': 'Folding curve - paper dragon',
  'tree-fractal': 'Branching pattern - natural growth',
  'menger': 'Sponge cube - infinite holes',
  'apollonian': 'Circle packing - nested circles',
  // Chaos Attractors
  'lorenz': 'Butterfly effect - weather chaos',
  'rossler': 'Simple chaos - folded band',
  'chua': 'Circuit chaos - electronic',
  'halvorsen': 'Cyclic attractor - three lobes',
  'thomas': 'Cyclically symmetric - three-fold',
  'aizawa': 'Spiral chaos - twisted loop',
  // Reality/Paradox
  'matrix': 'Simulation code - green rain',
  'glitch': 'Reality error - broken pixels',
  'simulation': 'Virtual world - is this real?',
  'observer': 'Consciousness collapses - you create reality',
  'collapse': 'Wave function - probability to actuality',
  'indras-net': 'Infinite reflections - all connected',
  'holofractal': 'Fractal hologram - part contains whole',
  'time-crystal': 'Repeating in time - temporal pattern',
  'penrose': 'Impossible staircase - eternal climb',
  'impossible': 'Escher shapes - can\'t exist',
  'mobius': 'One-sided strip - twist in space',
  'hyperbolic': 'Curved space - infinite tiling',
  'non-euclidean': 'Bent geometry - parallel lines meet',
  'recursive': 'Self-referencing - strange loops',
  // Motion
  'flow': 'Smooth organic movement - like a dancer',
  'outward': 'Expanding from center - big bang',
  'inward': 'Contracting to center - black hole',
  'clockwise': 'Rotating right - time forward',
  'counter': 'Rotating left - time backward',
  'breathing': 'In and out - life rhythm',
  'still': 'No movement - frozen time',
};

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
  { key: 'coronaIntensity', label: 'CORONA/BEAMS', color: 'from-yellow-400 via-orange-500 to-red-500', icon: Sun },
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

// ============================================
// ELEMENTAL - Classical & modern elements
// ============================================
const elementalLayers = [
  { id: 'fire', label: 'FIRE', color: 'bg-orange-500' },
  { id: 'water', label: 'WATER', color: 'bg-blue-500' },
  { id: 'earth', label: 'EARTH', color: 'bg-amber-700' },
  { id: 'air', label: 'AIR', color: 'bg-sky-300' },
  { id: 'aether', label: 'AETHER', color: 'bg-violet-400' },
  { id: 'plasma', label: 'PLASMA', color: 'bg-pink-400' },
  { id: 'lightning', label: 'LIGHTNING', color: 'bg-yellow-300' },
  { id: 'ice', label: 'ICE', color: 'bg-cyan-200' },
  { id: 'smoke', label: 'SMOKE', color: 'bg-gray-500' },
  { id: 'crystal', label: 'CRYSTAL', color: 'bg-gradient-to-r from-cyan-300 to-pink-300' },
];

// ============================================
// ENERGY - Subtle energy systems
// ============================================
const energyLayers = [
  { id: 'chi', label: 'CHI', color: 'bg-emerald-500' },
  { id: 'prana', label: 'PRANA', color: 'bg-orange-400' },
  { id: 'reiki', label: 'REIKI', color: 'bg-violet-500' },
  { id: 'orgone', label: 'ORGONE', color: 'bg-blue-500' },
  { id: 'tesla', label: 'TESLA', color: 'bg-cyan-400' },
  { id: 'scalar', label: 'SCALAR', color: 'bg-indigo-500' },
  { id: 'tachyon', label: 'TACHYON', color: 'bg-pink-500' },
  { id: 'vortex', label: 'VORTEX', color: 'bg-purple-500' },
  { id: 'toroidal', label: 'TOROIDAL', color: 'bg-cyan-500' },
];

// ============================================
// TEXTURE - Visual textures & materials
// ============================================
const textureLayers = [
  { id: 'liquid', label: 'LIQUID', color: 'bg-blue-400' },
  { id: 'metallic', label: 'METAL', color: 'bg-gray-400' },
  { id: 'glass', label: 'GLASS', color: 'bg-cyan-200' },
  { id: 'silk', label: 'SILK', color: 'bg-pink-300' },
  { id: 'particle', label: 'PARTICLE', color: 'bg-amber-400' },
  { id: 'grain', label: 'GRAIN', color: 'bg-stone-500' },
  { id: 'iridescent', label: 'IRIDESCENT', color: 'bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400' },
  { id: 'holographic', label: 'HOLO', color: 'bg-gradient-to-r from-cyan-400 to-pink-400' },
  { id: 'neon-glow', label: 'NEONGLOW', color: 'bg-pink-500' },
];

// ============================================
// ALTERED - Altered states of consciousness
// ============================================
const alteredLayers = [
  { id: 'hypnotic', label: 'HYPNOTIC', color: 'bg-purple-600' },
  { id: 'trance', label: 'TRANCE', color: 'bg-indigo-500' },
  { id: 'lucid', label: 'LUCID', color: 'bg-cyan-400' },
  { id: 'astral', label: 'ASTRAL', color: 'bg-violet-400' },
  { id: 'obe', label: 'OBE', color: 'bg-blue-300' },
  { id: 'nde', label: 'NDE', color: 'bg-gradient-to-r from-black via-white to-amber-300' },
  { id: 'ego-death', label: 'EGODEATH', color: 'bg-slate-700' },
  { id: 'peak', label: 'PEAK', color: 'bg-gradient-to-r from-amber-400 to-white' },
  { id: 'flow-state', label: 'FLOWSTATE', color: 'bg-emerald-400' },
];

// ============================================
// CELESTIAL - Planets & cosmic bodies
// ============================================
const celestialLayers = [
  { id: 'sun', label: 'SUN', color: 'bg-yellow-500' },
  { id: 'moon', label: 'MOON', color: 'bg-gray-300' },
  { id: 'mercury', label: 'MERCURY', color: 'bg-gray-500' },
  { id: 'venus', label: 'VENUS', color: 'bg-amber-300' },
  { id: 'mars', label: 'MARS', color: 'bg-red-600' },
  { id: 'jupiter', label: 'JUPITER', color: 'bg-orange-400' },
  { id: 'saturn', label: 'SATURN', color: 'bg-amber-600' },
  { id: 'neptune', label: 'NEPTUNE', color: 'bg-blue-500' },
  { id: 'pluto', label: 'PLUTO', color: 'bg-slate-600' },
  { id: 'eclipse-total', label: 'ECLIPSE', color: 'bg-gradient-to-r from-black via-orange-500 to-black' },
];

// ============================================
// EMOTION - Emotional states & moods
// ============================================
const emotionLayers = [
  { id: 'joy', label: 'JOY', color: 'bg-yellow-400' },
  { id: 'peace', label: 'PEACE', color: 'bg-sky-300' },
  { id: 'ecstasy', label: 'ECSTASY', color: 'bg-pink-500' },
  { id: 'awe', label: 'AWE', color: 'bg-violet-500' },
  { id: 'melancholy', label: 'MELANCHOLY', color: 'bg-blue-700' },
  { id: 'rage', label: 'RAGE', color: 'bg-red-600' },
  { id: 'grief', label: 'GRIEF', color: 'bg-slate-600' },
  { id: 'love', label: 'LOVE', color: 'bg-pink-400' },
  { id: 'serenity', label: 'SERENITY', color: 'bg-teal-400' },
  { id: 'wonder', label: 'WONDER', color: 'bg-gradient-to-r from-purple-400 to-pink-400' },
];

// ============================================
// NATURE - Natural phenomena
// ============================================
const natureLayers = [
  { id: 'forest', label: 'FOREST', color: 'bg-green-600' },
  { id: 'ocean', label: 'OCEAN', color: 'bg-blue-600' },
  { id: 'mountain', label: 'MOUNTAIN', color: 'bg-stone-500' },
  { id: 'desert', label: 'DESERT', color: 'bg-amber-500' },
  { id: 'storm', label: 'STORM', color: 'bg-slate-500' },
  { id: 'volcano', label: 'VOLCANO', color: 'bg-red-700' },
  { id: 'cave', label: 'CAVE', color: 'bg-stone-700' },
  { id: 'waterfall', label: 'WATERFALL', color: 'bg-cyan-500' },
  { id: 'northern-lights', label: 'AURORA', color: 'bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500' },
];

// ============================================
// MYTHIC - Mythological archetypes
// ============================================
const mythicLayers = [
  { id: 'dragon', label: 'DRAGON', color: 'bg-red-500' },
  { id: 'phoenix', label: 'PHOENIX', color: 'bg-orange-500' },
  { id: 'serpent', label: 'SERPENT', color: 'bg-green-600' },
  { id: 'angel', label: 'ANGEL', color: 'bg-white' },
  { id: 'demon', label: 'DEMON', color: 'bg-red-900' },
  { id: 'spirit', label: 'SPIRIT', color: 'bg-cyan-300' },
  { id: 'shadow', label: 'SHADOW', color: 'bg-slate-800' },
  { id: 'light-being', label: 'LIGHTBEING', color: 'bg-gradient-to-r from-white to-amber-200' },
  { id: 'shapeshifter', label: 'SHIFTER', color: 'bg-gradient-to-r from-purple-500 to-green-500' },
];

// ============================================
// ALCHEMICAL - Stages of transformation
// ============================================
const alchemicalLayers = [
  { id: 'nigredo', label: 'NIGREDO', color: 'bg-black' },
  { id: 'albedo', label: 'ALBEDO', color: 'bg-white' },
  { id: 'citrinitas', label: 'CITRINITAS', color: 'bg-yellow-400' },
  { id: 'rubedo', label: 'RUBEDO', color: 'bg-red-500' },
  { id: 'solve', label: 'SOLVE', color: 'bg-blue-400' },
  { id: 'coagula', label: 'COAGULA', color: 'bg-amber-600' },
  { id: 'transmute', label: 'TRANSMUTE', color: 'bg-gradient-to-r from-gray-400 to-amber-400' },
  { id: 'philosophers-stone', label: 'PHILSTONE', color: 'bg-gradient-to-r from-red-500 via-amber-400 to-white' },
];

// ============================================
// WAVEFORM - Audio visualization shapes
// ============================================
const waveformLayers = [
  { id: 'sine', label: 'SINE', color: 'bg-blue-400' },
  { id: 'square', label: 'SQUARE', color: 'bg-green-500' },
  { id: 'sawtooth', label: 'SAW', color: 'bg-orange-500' },
  { id: 'triangle', label: 'TRI', color: 'bg-cyan-500' },
  { id: 'pulse', label: 'PULSE', color: 'bg-pink-500' },
  { id: 'noise', label: 'NOISE', color: 'bg-gray-500' },
  { id: 'harmonic', label: 'HARMONIC', color: 'bg-violet-500' },
  { id: 'resonance', label: 'RESONANCE', color: 'bg-amber-500' },
];

// ============================================
// TEMPORAL - Time-based effects
// ============================================
const temporalLayers = [
  { id: 'past', label: 'PAST', color: 'bg-sepia' },
  { id: 'future', label: 'FUTURE', color: 'bg-cyan-400' },
  { id: 'eternal', label: 'ETERNAL', color: 'bg-gradient-to-r from-amber-300 to-violet-400' },
  { id: 'loop', label: 'LOOP', color: 'bg-green-500' },
  { id: 'rewind', label: 'REWIND', color: 'bg-blue-500' },
  { id: 'freeze', label: 'FREEZE', color: 'bg-cyan-200' },
  { id: 'decay', label: 'DECAY', color: 'bg-stone-600' },
  { id: 'bloom', label: 'BLOOM', color: 'bg-pink-400' },
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

// Helper to get color for a layer from our layer arrays
const getLayerColor = (id: string): string => {
  // Search through all layer arrays to find the color
  const allLayers = [
    ...geometryModes, ...sacredGeometry, ...ancientGeometry, ...geometry4D,
    ...geometry5D, ...geometry6D, ...impossibleGeometry, ...fractalGeometry,
    ...chaosGeometry, ...realityGeometry, ...quantumGeometry, ...cosmicLayers,
    ...lifeforceGeometry, ...consciousnessGeometry, ...elementalLayers,
    ...energyLayers, ...textureLayers, ...alteredLayers, ...celestialLayers,
    ...emotionLayers, ...natureLayers, ...mythicLayers, ...alchemicalLayers,
    ...waveformLayers, ...temporalLayers, ...motionDirs
  ];
  const found = allLayers.find(l => l.id === id);
  return found?.color || 'bg-purple-500';
};

export function ParameterSliders({ state, onChange, onLayerHover }: ParameterSlidersProps) {
  const [hoveredLayer, setHoveredLayer] = useState<{id: string, category: string} | null>(null);

  if (!state) return null;

  const beamsOn = (state.coronaIntensity ?? 0) > 0.05;

  // Handler to set local hover state AND notify parent
  const handleLayerHover = (id: string, category: string) => {
    setHoveredLayer({ id, category });
    if (onLayerHover) {
      onLayerHover({
        id,
        category,
        description: layerDescriptions[id] || 'Visual layer effect',
        color: getLayerColor(id)
      });
    }
  };

  const handleLayerLeave = () => {
    setHoveredLayer(null);
    if (onLayerHover) {
      onLayerHover(null);
    }
  };

  return (
    <div className="space-y-2 overflow-x-hidden relative">
      {/* LAYER INFO PANEL - Sticky at top, always visible */}
      <div className="sticky top-0 z-20 -mx-3 px-3 py-2 bg-zinc-900/95 backdrop-blur-sm border-b border-white/10">
        <div className={`rounded-lg p-2.5 min-h-[56px] flex items-center transition-all duration-200
                        ${hoveredLayer
                          ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30'
                          : 'bg-white/5 border border-white/10'}`}>
          {hoveredLayer ? (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-bold text-white uppercase tracking-wide">{hoveredLayer.id.replace(/-/g, ' ')}</div>
                <div className="text-[9px] text-purple-400 uppercase mb-0.5">{hoveredLayer.category}</div>
                <div className="text-[11px] text-white/80 leading-snug">
                  {layerDescriptions[hoveredLayer.id] || 'Visual layer effect'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-white/40">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <span className="text-[11px]">Hover any layer button to see what it does</span>
            </div>
          )}
        </div>
      </div>
      {/* BEAMS TOGGLE - Big clear button */}
      <div className="flex items-center gap-3 pb-2 border-b border-white/20">
        <button
          onClick={() => onChange('coronaIntensity', beamsOn ? 0 : 0.7)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all
                     ${beamsOn
                       ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                       : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
        >
          <Sun className="w-5 h-5" />
          BEAMS {beamsOn ? 'ON' : 'OFF'}
        </button>
        <span className="text-[10px] text-white/40">
          Click to toggle corona rays
        </span>
      </div>

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
                onMouseEnter={() => handleLayerHover(mode.id, 'Geometry Mode')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(dir.id, 'Motion Direction')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(geo.id, 'Sacred Geometry')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(geo.id, 'Quantum')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(layer.id, 'Cosmic')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(layer.id, 'Lifeforce')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(layer.id, 'Ancient Wisdom')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(layer.id, '4D Geometry')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(layer.id, '5D Geometry')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(layer.id, '6D+ Geometry')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(layer.id, 'Consciousness')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(layer.id, 'Fractal')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(layer.id, 'Chaos Attractor')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(layer.id, 'Reality / Simulation')}
                onMouseLeave={handleLayerLeave}
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
                onMouseEnter={() => handleLayerHover(layer.id, 'Impossible / Paradox')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).geometryLayer14 === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* ====== NEW VIBE LAYERS ====== */}
        <div className="pt-2 mt-2 border-t border-white/20">
          <h2 className="text-[11px] font-bold text-white/70 mb-2">VIBE LAYERS</h2>
        </div>

        {/* ELEMENTAL */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">ELEMENT</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('elementalLayer', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).elementalLayer || (state as any).elementalLayer === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {elementalLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('elementalLayer', layer.id as any)}
                onMouseEnter={() => handleLayerHover(layer.id, 'Elemental')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).elementalLayer === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* ENERGY */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">ENERGY</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('energyLayer', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).energyLayer || (state as any).energyLayer === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {energyLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('energyLayer', layer.id as any)}
                onMouseEnter={() => handleLayerHover(layer.id, 'Energy')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).energyLayer === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* TEXTURE */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">TEXTURE</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('textureLayer', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).textureLayer || (state as any).textureLayer === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {textureLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('textureLayer', layer.id as any)}
                onMouseEnter={() => handleLayerHover(layer.id, 'Texture')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).textureLayer === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* ALTERED */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">ALTERED</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('alteredLayer', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).alteredLayer || (state as any).alteredLayer === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {alteredLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('alteredLayer', layer.id as any)}
                onMouseEnter={() => handleLayerHover(layer.id, 'Altered States')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).alteredLayer === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* CELESTIAL */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">CELESTIAL</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('celestialLayer', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).celestialLayer || (state as any).celestialLayer === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {celestialLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('celestialLayer', layer.id as any)}
                onMouseEnter={() => handleLayerHover(layer.id, 'Celestial')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).celestialLayer === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* EMOTION */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">EMOTION</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('emotionLayer', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).emotionLayer || (state as any).emotionLayer === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {emotionLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('emotionLayer', layer.id as any)}
                onMouseEnter={() => handleLayerHover(layer.id, 'Emotion')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).emotionLayer === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* NATURE */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">NATURE</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('natureLayer', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).natureLayer || (state as any).natureLayer === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {natureLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('natureLayer', layer.id as any)}
                onMouseEnter={() => handleLayerHover(layer.id, 'Nature')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).natureLayer === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* MYTHIC */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">MYTHIC</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('mythicLayer', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).mythicLayer || (state as any).mythicLayer === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {mythicLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('mythicLayer', layer.id as any)}
                onMouseEnter={() => handleLayerHover(layer.id, 'Mythic')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).mythicLayer === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* ALCHEMICAL */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">ALCHEMY</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('alchemicalLayer', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).alchemicalLayer || (state as any).alchemicalLayer === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {alchemicalLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('alchemicalLayer', layer.id as any)}
                onMouseEnter={() => handleLayerHover(layer.id, 'Alchemical')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).alchemicalLayer === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* WAVEFORM */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">WAVE</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('waveformLayer', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).waveformLayer || (state as any).waveformLayer === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {waveformLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('waveformLayer', layer.id as any)}
                onMouseEnter={() => handleLayerHover(layer.id, 'Waveform')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).waveformLayer === layer.id
                             ? `${layer.color} text-white` : 'bg-white/10 text-white/50'}`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* TEMPORAL */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold text-white/50 w-16 shrink-0">TEMPORAL</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange('temporalLayer', 'none' as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                         ${!(state as any).temporalLayer || (state as any).temporalLayer === 'none'
                           ? 'bg-slate-600 text-white' : 'bg-white/10 text-white/50'}`}
            >
              OFF
            </button>
            {temporalLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onChange('temporalLayer', layer.id as any)}
                onMouseEnter={() => handleLayerHover(layer.id, 'Temporal')}
                onMouseLeave={handleLayerLeave}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                           ${(state as any).temporalLayer === layer.id
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
