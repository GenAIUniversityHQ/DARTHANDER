// DARTHANDER Visual Consciousness Engine
// STAGE READY - Built for Performance

import { useEffect, useState, useRef } from 'react';
import { useStore } from './store';
import { interpretPrompt, DEFAULT_VISUAL_STATE, createSessionContext, updateSessionContext, SessionContext } from './services/gemini';
import { PreviewMonitor } from './components/PreviewMonitor';
import { PromptInput } from './components/PromptInput';
import { VoiceInput } from './components/VoiceInput';
import { PresetGrid } from './components/PresetGrid';
import { ParameterSliders } from './components/ParameterSliders';
import { AudioSourceSelector } from './components/AudioSourceSelector';
import { Square, Settings, Key, Video, Download, ExternalLink, X, Pause, Power, RotateCcw, Play, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { Preset } from './services/storage';

function App() {
  const [lastInterpretation, setLastInterpretation] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Session context - learns from your style as you give commands
  const [sessionContext, setSessionContext] = useState<SessionContext>(() => createSessionContext());

  // Saved state for GO/RESUME after HOLD/KILL
  const savedStateRef = useRef<typeof visualState | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);

  // Popout window
  const [popoutWindow, setPopoutWindow] = useState<Window | null>(null);

  // Preset info panel
  const [hoveredPreset, setHoveredPreset] = useState<Preset | null>(null);
  const [hoveredLayer, setHoveredLayer] = useState<{id: string, category: string, description: string, color: string} | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  const {
    visualState,
    setVisualState,
    applyParameterChanges,
    updateVisualParameter,
    presets,
    loadPreset,
    apiKey,
    setApiKey,
  } = useStore();

  // Initialize API key input from stored value
  useEffect(() => {
    if (apiKey) setApiKeyInput(apiKey);
  }, [apiKey]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handleHold();
          break;
        case 'Escape':
          handleKill();
          break;
        case 'r':
          if (!e.metaKey && !e.ctrlKey) handleReset();
          break;
        case 'g':
          handleGo();
          break;
        case 'm':
          setIsVoiceActive(!isVoiceActive);
          break;
        case 'f':
          handlePopout();
          break;
        default:
          const num = parseInt(e.key);
          if (num >= 1 && num <= 9 && presets[num - 1]) {
            handleLoadPreset(presets[num - 1]);
          }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presets, isVoiceActive]);

  // Clean up popout window on unmount
  useEffect(() => {
    return () => {
      if (popoutWindow && !popoutWindow.closed) popoutWindow.close();
    };
  }, [popoutWindow]);

  // ============================================
  // REAL-TIME VOICE COMMAND PROCESSOR
  // Direct keyword mapping for instant response
  // ============================================

  // Text normalization for Mac speech recognition
  const normalizeText = (text: string): string => {
    let normalized = text.toLowerCase().trim();

    // Common Mac speech-to-text mishearings and variations
    const replacements: [RegExp, string][] = [
      // Numbers written as words
      [/\bone\s*hundred\b/g, '100'],
      [/\bfifty\b/g, '50'],
      [/\btwenty\b/g, '20'],
      [/\bthirty\b/g, '30'],
      [/\bforty\b/g, '40'],
      [/\bsixty\b/g, '60'],
      [/\bseventy\b/g, '70'],
      [/\beighty\b/g, '80'],
      [/\bninety\b/g, '90'],
      [/\bten\b/g, '10'],
      [/\bzero\b/g, '0'],
      // Common mishearings
      [/\bcollar\b/g, 'color'],
      [/\bcolour\b/g, 'color'],
      [/\bpallet\b/g, 'palette'],
      [/\bpurpel\b/g, 'purple'],
      [/\bviolent\b/g, 'violet'],
      [/\bintensity\s*to\b/g, 'intensity'],
      [/\bspeed\s*to\b/g, 'speed'],
      [/\bset\s*it\s*to\b/g, 'set'],
      [/\bmake\s*it\b/g, ''],
      [/\bthe\b/g, ''],
      [/\ba\s+bit\b/g, 'slightly'],
      [/\ba\s+lot\b/g, 'much'],
      [/\bway\s+more\b/g, 'much more'],
      [/\bsuper\b/g, 'very'],
      [/\breally\b/g, 'very'],
      [/\blike\b/g, ''],
      [/\bum+\b/g, ''],
      [/\buh+\b/g, ''],
      // Geometry mishearings
      [/\bmental\b/g, 'mandala'],
      [/\bmandalas?\b/g, 'mandala'],
      [/\bhexagons?\b/g, 'hexagon'],
      [/\bspirals?\b/g, 'spiral'],
      [/\btunnels?\b/g, 'tunnel'],
      [/\bstars?\b/g, 'stars'],
      // Sacred geometry
      [/\bflower\s*of\s*life\b/g, 'flower'],
      [/\bseed\s*of\s*life\b/g, 'seed'],
      [/\bsri\s*yantra\b/g, 'yantra'],
      [/\bmetatron'?s?\s*cube\b/g, 'metatron'],
      [/\bgolden\s*ratio\b/g, 'phi'],
      // Motion
      [/\bcounter\s*clockwise\b/g, 'counter'],
      [/\banti\s*clockwise\b/g, 'counter'],
    ];

    for (const [pattern, replacement] of replacements) {
      normalized = normalized.replace(pattern, replacement);
    }

    // Clean up extra spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
  };

  // Extract numeric value from text (returns 0-1 scale or null)
  const extractValue = (text: string): number | null => {
    // Look for percentage
    const percentMatch = text.match(/(\d+)\s*%/);
    if (percentMatch) {
      return Math.min(100, Math.max(0, parseInt(percentMatch[1]))) / 100;
    }

    // Look for decimal
    const decimalMatch = text.match(/(\d+\.?\d*)/);
    if (decimalMatch) {
      const val = parseFloat(decimalMatch[1]);
      // If > 1, assume it's a percentage
      if (val > 1) {
        return Math.min(100, Math.max(0, val)) / 100;
      }
      return Math.min(1, Math.max(0, val));
    }

    // Look for words
    if (text.includes('max') || text.includes('full') || text.includes('maximum')) return 1;
    if (text.includes('half') || text.includes('medium') || text.includes('middle')) return 0.5;
    if (text.includes('quarter') || text.includes('low')) return 0.25;
    if (text.includes('min') || text.includes('none') || text.includes('zero') || text.includes('off')) return 0;
    if (text.includes('high')) return 0.75;
    if (text.includes('very high') || text.includes('very much')) return 0.9;
    if (text.includes('slightly') || text.includes('little')) return 0.15;
    if (text.includes('much') || text.includes('lot')) return 0.3;

    return null;
  };

  // Determine adjustment direction and amount
  const getAdjustment = (text: string, current: number): number => {
    const explicitValue = extractValue(text);
    if (explicitValue !== null && !text.includes('more') && !text.includes('less')) {
      return explicitValue; // Absolute value
    }

    // Relative adjustments
    let delta = 0.15; // Default step
    if (text.includes('slightly') || text.includes('little') || text.includes('bit')) delta = 0.08;
    if (text.includes('much') || text.includes('lot') || text.includes('very')) delta = 0.25;
    if (text.includes('way') || text.includes('super') || text.includes('extremely')) delta = 0.35;

    // Direction
    const isIncrease = text.includes('more') || text.includes('up') || text.includes('increase') ||
                       text.includes('higher') || text.includes('brighter') || text.includes('faster') ||
                       text.includes('louder') || text.includes('stronger') || text.includes('bigger');
    const isDecrease = text.includes('less') || text.includes('down') || text.includes('decrease') ||
                       text.includes('lower') || text.includes('darker') || text.includes('slower') ||
                       text.includes('quieter') || text.includes('weaker') || text.includes('smaller');

    if (isDecrease) return Math.max(0, current - delta);
    if (isIncrease) return Math.min(1, current + delta);

    // Default to increase if no direction specified
    return Math.min(1, current + delta);
  };

  const processVoiceCommand = (text: string): boolean => {
    const cmd = normalizeText(text);
    const words = cmd.split(/\s+/);

    console.log('[VOICE CMD] Original:', text);
    console.log('[VOICE CMD] Normalized:', cmd);

    // --- CONTROL COMMANDS ---
    if (cmd.includes('hold') || cmd.includes('freeze') || cmd.includes('pause visualization')) {
      handleHold();
      return true;
    }
    if ((cmd.includes('kill') || cmd.includes('blackout') || cmd.includes('lights out')) && !cmd.includes('background')) {
      handleKill();
      return true;
    }
    if ((cmd.includes('go') || cmd.includes('resume') || cmd.includes('play') || cmd.includes('start')) &&
        !cmd.includes('slower') && !cmd.includes('faster')) {
      handleGo();
      return true;
    }
    if (cmd.includes('reset') || cmd.includes('default') || cmd.includes('start over')) {
      handleReset();
      return true;
    }

    // --- PRESETS ---
    const presetMap: Record<string, string> = {
      'awe': 'awe', 'wonder': 'awe', 'stargazing': 'awe',
      'cosmos': 'cosmos', 'cosmic': 'cosmos', 'space': 'cosmos',
      'portal': 'portal', 'vortex': 'portal',
      'void': 'void', 'dark': 'void', 'darkness': 'void',
      'mandala': 'mandala', 'sacred': 'mandala',
      'eclipse': 'eclipse', 'sun': 'eclipse',
      'fire': 'fire', 'flame': 'fire', 'inferno': 'fire',
      'ice': 'ice', 'frozen': 'ice', 'cold': 'ice',
      'fractal': 'fractal', 'fractals': 'fractal',
      'chaos': 'chaos', 'chaotic': 'chaos',
      'zen': 'zen', 'calm': 'zen', 'peaceful': 'zen',
    };
    for (const [keyword, presetId] of Object.entries(presetMap)) {
      if (cmd.includes(keyword)) {
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
          handleLoadPreset(preset);
          return true;
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // TRANSCENDENTAL EXPERIENCES - Complex multi-layer presets
    // ═══════════════════════════════════════════════════════════════════

    // DMT / Breakthrough
    if (cmd.includes('dmt') || cmd.includes('breakthrough') || cmd.includes('hyperspace') || cmd.includes('machine elves')) {
      updateVisualParameter('geometryMode', 'fractal');
      updateVisualParameter('geometryLayer2', 'flower-of-life');
      updateVisualParameter('geometryLayer7', 'tesseract');
      updateVisualParameter('geometryLayer11', 'julia');
      updateVisualParameter('geometryLayer14', 'non-euclidean');
      updateVisualParameter('colorPalette', 'spectrum');
      updateVisualParameter('motionDirection', 'inward');
      updateVisualParameter('motionSpeed', 0.7);
      updateVisualParameter('chaosFactor', 0.6);
      updateVisualParameter('overallIntensity', 0.9);
      setLastInterpretation('🚀 BREAKTHROUGH');
      return true;
    }

    // Kundalini Rising
    if (cmd.includes('kundalini') || cmd.includes('shakti') || cmd.includes('energy rising')) {
      updateVisualParameter('geometryMode', 'spiral');
      updateVisualParameter('geometryLayer5', 'kundalini');
      updateVisualParameter('geometryLayer6', 'chakras');
      updateVisualParameter('geometryLayer8', 'third-eye');
      updateVisualParameter('colorPalette', 'spectrum');
      updateVisualParameter('motionDirection', 'outward');
      updateVisualParameter('overallIntensity', 0.8);
      setLastInterpretation('🐍 KUNDALINI');
      return true;
    }

    // Shamanic Journey
    if (cmd.includes('shamanic') || cmd.includes('tribal') || cmd.includes('primal') || cmd.includes('drum')) {
      updateVisualParameter('geometryMode', 'mandala');
      updateVisualParameter('geometryLayer6', 'hunab-ku');
      updateVisualParameter('geometryLayer5', 'mycelium');
      updateVisualParameter('colorPalette', 'ancient');
      updateVisualParameter('motionDirection', 'breathing');
      updateVisualParameter('bassImpact', 0.9);
      setLastInterpretation('🥁 SHAMANIC');
      return true;
    }

    // Om / Meditation
    if (cmd.includes('om') || cmd.includes('meditation') || cmd.includes('stillness') || cmd.includes('inner peace')) {
      updateVisualParameter('geometryMode', 'mandala');
      updateVisualParameter('geometryLayer2', 'flower-of-life');
      updateVisualParameter('geometryLayer6', 'om');
      updateVisualParameter('geometryLayer8', 'void-source');
      updateVisualParameter('colorPalette', 'ethereal');
      updateVisualParameter('motionDirection', 'breathing');
      updateVisualParameter('motionSpeed', 0.08);
      updateVisualParameter('overallIntensity', 0.35);
      setLastInterpretation('🕉️ OM');
      return true;
    }

    // Divine Light / Angel
    if (cmd.includes('angel') || cmd.includes('divine') || cmd.includes('heavenly') || cmd.includes('seraphim')) {
      updateVisualParameter('geometryMode', 'mandala');
      updateVisualParameter('geometryLayer2', 'merkaba');
      updateVisualParameter('geometryLayer8', 'transcendence');
      updateVisualParameter('colorPalette', 'light');
      updateVisualParameter('colorBrightness', 1.0);
      updateVisualParameter('coronaIntensity', 0.7);
      setLastInterpretation('👼 DIVINE');
      return true;
    }

    // Shadow Work
    if (cmd.includes('shadow') || cmd.includes('underworld') || cmd.includes('shadow work')) {
      updateVisualParameter('geometryMode', 'void');
      updateVisualParameter('geometryLayer8', 'void-source');
      updateVisualParameter('geometryLayer12', 'rossler');
      updateVisualParameter('colorPalette', 'obsidian');
      updateVisualParameter('motionDirection', 'inward');
      updateVisualParameter('overallIntensity', 0.4);
      setLastInterpretation('🌑 SHADOW');
      return true;
    }

    // Holofractal
    if (cmd.includes('holofractal') || cmd.includes('holographic') || cmd.includes('as above')) {
      updateVisualParameter('geometryMode', 'fractal');
      updateVisualParameter('geometryLayer13', 'holofractal');
      updateVisualParameter('geometryLayer11', 'mandelbrot');
      updateVisualParameter('geometryLayer2', 'metatron');
      updateVisualParameter('geometryComplexity', 0.9);
      setLastInterpretation('🔮 HOLOFRACTAL');
      return true;
    }

    // Akashic Records
    if (cmd.includes('akashic') || cmd.includes('records') || cmd.includes('all knowledge')) {
      updateVisualParameter('geometryMode', 'void');
      updateVisualParameter('geometryLayer8', 'akashic');
      updateVisualParameter('geometryLayer2', 'tree-of-life');
      updateVisualParameter('colorPalette', 'ancient');
      updateVisualParameter('starDensity', 1.0);
      setLastInterpretation('📜 AKASHIC');
      return true;
    }

    // Glitch / Simulation
    if (cmd.includes('glitch') || cmd.includes('simulation') || cmd.includes('matrix break')) {
      updateVisualParameter('geometryMode', 'fractal');
      updateVisualParameter('geometryLayer13', 'glitch');
      updateVisualParameter('geometryLayer14', 'impossible');
      updateVisualParameter('colorPalette', 'neon');
      updateVisualParameter('chaosFactor', 0.8);
      updateVisualParameter('motionTurbulence', 0.7);
      setLastInterpretation('⚡ GLITCH');
      return true;
    }

    // Creation / Genesis
    if (cmd.includes('creation') || cmd.includes('genesis') || cmd.includes('big bang')) {
      updateVisualParameter('geometryMode', 'void');
      updateVisualParameter('geometryLayer4', 'pulsar');
      updateVisualParameter('geometryLayer7', 'hypersphere');
      updateVisualParameter('colorPalette', 'light');
      updateVisualParameter('motionDirection', 'outward');
      updateVisualParameter('eclipsePhase', 0.8);
      updateVisualParameter('coronaIntensity', 0.9);
      setLastInterpretation('✨ CREATION');
      return true;
    }

    // Rebirth / Phoenix
    if (cmd.includes('rebirth') || cmd.includes('phoenix') || cmd.includes('transform')) {
      updateVisualParameter('geometryMode', 'void');
      updateVisualParameter('geometryLayer8', 'transcendence');
      updateVisualParameter('geometryLayer6', 'ouroboros');
      updateVisualParameter('geometryLayer4', 'wormhole');
      updateVisualParameter('colorPalette', 'bloodmoon');
      updateVisualParameter('motionDirection', 'inward');
      setLastInterpretation('🔥 REBIRTH');
      return true;
    }

    // Floating / Cosmic Ocean
    if (cmd.includes('floating') || cmd.includes('weightless') || cmd.includes('drift')) {
      updateVisualParameter('geometryMode', 'void');
      updateVisualParameter('geometryLayer4', 'nebula');
      updateVisualParameter('geometryLayer5', 'jellyfish');
      updateVisualParameter('colorPalette', 'ocean');
      updateVisualParameter('motionDirection', 'flow');
      updateVisualParameter('motionSpeed', 0.1);
      setLastInterpretation('🌊 FLOATING');
      return true;
    }

    // Bioluminescent
    if (cmd.includes('bioluminescent') || cmd.includes('deep sea') || cmd.includes('luminous')) {
      updateVisualParameter('geometryMode', 'void');
      updateVisualParameter('geometryLayer5', 'biolum');
      updateVisualParameter('geometryLayer4', 'nebula');
      updateVisualParameter('colorPalette', 'ocean');
      updateVisualParameter('motionDirection', 'flow');
      setLastInterpretation('🦑 BIOLUMINESCENT');
      return true;
    }

    // Telepathy / Mind Meld
    if (cmd.includes('telepathy') || cmd.includes('mind meld') || cmd.includes('psychic')) {
      updateVisualParameter('geometryLayer3', 'neural-net');
      updateVisualParameter('geometryLayer8', 'third-eye');
      updateVisualParameter('geometryLayer3', 'entanglement');
      updateVisualParameter('colorPalette', 'cosmos');
      updateVisualParameter('audioReactGeometry', 0.7);
      setLastInterpretation('🧠 TELEPATHY');
      return true;
    }

    // E8 Lattice / Unified Field
    if (cmd.includes('e8') || cmd.includes('unified field') || cmd.includes('theory of everything')) {
      updateVisualParameter('geometryMode', 'hexagon');
      updateVisualParameter('geometryLayer10', 'e8-lattice');
      updateVisualParameter('geometryLayer9', 'penteract');
      updateVisualParameter('colorPalette', 'spectrum');
      updateVisualParameter('geometryComplexity', 1.0);
      setLastInterpretation('🌐 E8 LATTICE');
      return true;
    }

    // --- GEOMETRY MODES ---
    const geometryMap: Record<string, string> = {
      'stars': 'stars', 'star': 'stars', 'starfield': 'stars',
      'mandala': 'mandala', 'mandalas': 'mandala',
      'hexagon': 'hexagon', 'hex': 'hexagon', 'hexagons': 'hexagon',
      'fractal': 'fractal', 'fractals': 'fractal',
      'spiral': 'spiral', 'spirals': 'spiral',
      'tunnel': 'tunnel', 'tunnels': 'tunnel',
      'void': 'void',
      'fibonacci': 'fibonacci', 'fib': 'fibonacci', 'golden': 'fibonacci',
      'chaos field': 'chaos-field', 'chaos': 'chaos-field',
    };
    for (const [keyword, mode] of Object.entries(geometryMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryMode', mode);
        setLastInterpretation(`🔷 ${mode.toUpperCase()}`);
        return true;
      }
    }

    // --- SACRED GEOMETRY LAYER ---
    const sacredMap: Record<string, string> = {
      'flower': 'flower-of-life', 'flower of life': 'flower-of-life',
      'metatron': 'metatron', 'metatrons': 'metatron',
      'sri yantra': 'sri-yantra', 'sri': 'sri-yantra', 'yantra': 'sri-yantra',
      'torus': 'torus',
      'vesica': 'vesica', 'vesica piscis': 'vesica',
      'seed': 'seed-of-life', 'seed of life': 'seed-of-life',
      'merkaba': 'merkaba', 'merkabah': 'merkaba',
      'phi': 'golden-ratio', 'golden ratio': 'golden-ratio',
    };
    for (const [keyword, layer] of Object.entries(sacredMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer2', layer);
        setLastInterpretation(`✨ SACRED: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- QUANTUM LAYER ---
    const quantumMap: Record<string, string> = {
      'quantum': 'quantum-field', 'quantum field': 'quantum-field',
      'wave': 'wave-function', 'wave function': 'wave-function', 'waves': 'wave-function',
      'particles': 'particle-grid', 'particle': 'particle-grid',
      'neural': 'neural-net', 'neural net': 'neural-net', 'neurons': 'neural-net',
      'dna': 'dna-helix', 'helix': 'dna-helix',
      'singularity': 'singularity',
      'entangle': 'entanglement', 'entanglement': 'entanglement',
      'superposition': 'superposition', 'super': 'superposition',
    };
    for (const [keyword, layer] of Object.entries(quantumMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer3', layer);
        setLastInterpretation(`⚛️ QUANTUM: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- COSMIC LAYER ---
    const cosmicMap: Record<string, string> = {
      'surf': 'cosmic-surf', 'surfing': 'cosmic-surf', 'cosmic surf': 'cosmic-surf',
      'streaks': 'star-streaks', 'star streaks': 'star-streaks',
      'fluid': 'fluid-flow', 'flow': 'fluid-flow',
      'nebula': 'nebula', 'nebulae': 'nebula',
      'galaxy': 'galaxy', 'galaxies': 'galaxy',
      'aurora': 'aurora', 'northern lights': 'aurora',
      'wormhole': 'wormhole',
      'pulsar': 'pulsar',
      'web': 'cosmic-web', 'cosmic web': 'cosmic-web',
    };
    for (const [keyword, layer] of Object.entries(cosmicMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer4', layer);
        setLastInterpretation(`🌌 COSMIC: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- LIFEFORCE LAYER ---
    const lifeMap: Record<string, string> = {
      'heartbeat': 'heartbeat', 'heart': 'heartbeat',
      'breath': 'breath', 'breathing': 'breath',
      'neurons': 'neurons', 'neuron': 'neurons', 'brain': 'neurons',
      'cells': 'cells', 'cell': 'cells',
      'mycelium': 'mycelium', 'mushroom': 'mycelium', 'fungal': 'mycelium',
      'biolum': 'biolum', 'bioluminescence': 'biolum',
      'roots': 'roots', 'root': 'roots', 'tree': 'roots',
      'jellyfish': 'jellyfish', 'jelly': 'jellyfish',
      'dna': 'dna-helix', 'helix': 'dna-helix',
      'kundalini': 'kundalini', 'serpent': 'kundalini',
      'aura': 'aura', 'energy field': 'aura',
      'cymatics': 'cymatics', 'sound waves': 'cymatics',
    };
    for (const [keyword, layer] of Object.entries(lifeMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer5', layer);
        setLastInterpretation(`🧬 LIFE: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- ANCIENT WISDOM LAYER ---
    const ancientMap: Record<string, string> = {
      'ankh': 'ankh', 'key of life': 'ankh',
      'horus': 'eye-of-horus', 'eye of horus': 'eye-of-horus', 'egyptian eye': 'eye-of-horus',
      'ouroboros': 'ouroboros', 'serpent circle': 'ouroboros',
      'enso': 'enso', 'zen circle': 'enso', 'zen': 'enso',
      'om': 'om', 'ohm': 'om', 'aum': 'om',
      'yin yang': 'yin-yang', 'yinyang': 'yin-yang', 'balance': 'yin-yang',
      'dharma': 'dharma-wheel', 'dharma wheel': 'dharma-wheel', 'buddhist': 'dharma-wheel',
      'triskele': 'triskele', 'triple spiral': 'triskele', 'celtic': 'triskele',
      'hunab': 'hunab-ku', 'hunab ku': 'hunab-ku', 'mayan': 'hunab-ku',
      'chakra': 'chakras', 'chakras': 'chakras', 'energy centers': 'chakras',
    };
    for (const [keyword, layer] of Object.entries(ancientMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer6', layer);
        setLastInterpretation(`🏛️ ANCIENT: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- DIMENSIONAL LAYER (4D+) ---
    const dimensionalMap: Record<string, string> = {
      'tesseract': 'tesseract', 'hypercube': 'tesseract', '4d cube': 'tesseract',
      'hypersphere': 'hypersphere', '4d sphere': 'hypersphere', 'glome': 'hypersphere',
      'klein': 'klein-bottle', 'klein bottle': 'klein-bottle',
      'mobius': 'mobius', 'möbius': 'mobius', 'mobius strip': 'mobius',
      'penrose': 'penrose', 'impossible triangle': 'penrose',
      'calabi': 'calabi-yau', 'calabi yau': 'calabi-yau', 'string theory': 'calabi-yau',
      'hyperbolic': 'hyperbolic', 'poincare': 'hyperbolic',
      'impossible': 'impossible', 'impossible geometry': 'impossible',
    };
    for (const [keyword, layer] of Object.entries(dimensionalMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer7', layer);
        setLastInterpretation(`🔮 4D+: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- CONSCIOUSNESS LAYER ---
    const consciousnessMap: Record<string, string> = {
      'third eye': 'third-eye', 'thirdeye': 'third-eye', 'ajna': 'third-eye',
      'akashic': 'akashic', 'akashic records': 'akashic', 'records': 'akashic',
      'morphic': 'morphic', 'morphic field': 'morphic', 'resonance': 'morphic',
      'dreamtime': 'dreamtime', 'dream': 'dreamtime', 'aboriginal': 'dreamtime',
      'void source': 'void-source', 'source': 'void-source', 'emptiness': 'void-source',
      'infinity': 'infinity', 'infinite': 'infinity', 'eternal': 'infinity',
      'unity': 'unity', 'oneness': 'unity', 'all is one': 'unity',
      'transcend': 'transcendence', 'transcendence': 'transcendence', 'ascend': 'transcendence',
    };
    for (const [keyword, layer] of Object.entries(consciousnessMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer8', layer);
        setLastInterpretation(`👁️ CONSC: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- 5D GEOMETRY LAYER ---
    const geometry5DMap: Record<string, string> = {
      'penteract': 'penteract', '5d cube': 'penteract', '5-cube': 'penteract',
      '5 simplex': '5-simplex', '5simplex': '5-simplex', 'hexateron': '5-simplex',
      '5 orthoplex': '5-orthoplex', '5orthoplex': '5-orthoplex', 'pentacross': '5-orthoplex',
      '5 demicube': '5-demicube', '5demicube': '5-demicube', 'demipenteract': '5-demicube',
      'pentasphere': 'pentasphere', '5d sphere': 'pentasphere', '5sphere': 'pentasphere',
    };
    for (const [keyword, layer] of Object.entries(geometry5DMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer9', layer);
        setLastInterpretation(`5D: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- 6D+ GEOMETRY LAYER ---
    const geometry6DMap: Record<string, string> = {
      'hexeract': 'hexeract', '6d cube': 'hexeract', '6-cube': 'hexeract',
      'e8': 'e8-lattice', 'e8 lattice': 'e8-lattice', 'exceptional': 'e8-lattice',
      '6 simplex': '6-simplex', '6simplex': '6-simplex', 'heptapeton': '6-simplex',
      'gosset': 'gosset', '421 polytope': 'gosset',
      'leech': 'leech-lattice', 'leech lattice': 'leech-lattice',
    };
    for (const [keyword, layer] of Object.entries(geometry6DMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer10', layer);
        setLastInterpretation(`6D+: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- FRACTAL LAYER ---
    const fractalMap: Record<string, string> = {
      'mandelbrot': 'mandelbrot', 'mandel': 'mandelbrot',
      'julia': 'julia', 'julia set': 'julia',
      'sierpinski': 'sierpinski', 'sierpinski triangle': 'sierpinski',
      'koch': 'koch', 'koch snowflake': 'koch', 'snowflake': 'koch',
      'dragon': 'dragon', 'dragon curve': 'dragon',
      'tree fractal': 'tree-fractal', 'fractal tree': 'tree-fractal',
      'menger': 'menger', 'menger sponge': 'menger', 'sponge': 'menger',
      'apollonian': 'apollonian', 'apollonian gasket': 'apollonian', 'gasket': 'apollonian',
    };
    for (const [keyword, layer] of Object.entries(fractalMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer11', layer);
        setLastInterpretation(`FRACTAL: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- CHAOS ATTRACTOR LAYER ---
    const chaosMap: Record<string, string> = {
      'lorenz': 'lorenz', 'lorenz attractor': 'lorenz', 'butterfly': 'lorenz',
      'rossler': 'rossler', 'rössler': 'rossler', 'rossler attractor': 'rossler',
      'chua': 'chua', 'chua circuit': 'chua',
      'halvorsen': 'halvorsen',
      'thomas': 'thomas', 'thomas attractor': 'thomas',
      'aizawa': 'aizawa', 'aizawa attractor': 'aizawa',
    };
    for (const [keyword, layer] of Object.entries(chaosMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer12', layer);
        setLastInterpretation(`CHAOS: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- REALITY LAYER ---
    const realityMap: Record<string, string> = {
      'matrix': 'matrix', 'matrix rain': 'matrix',
      'glitch': 'glitch', 'glitchy': 'glitch',
      'simulation': 'simulation', 'sim': 'simulation',
      'observer': 'observer', 'observer effect': 'observer',
      'collapse': 'collapse', 'wave collapse': 'collapse',
      'indra': 'indras-net', 'indras net': 'indras-net', 'indra\'s net': 'indras-net',
      'holofractal': 'holofractal', 'holographic': 'holofractal',
      'time crystal': 'time-crystal', 'timecrystal': 'time-crystal',
    };
    for (const [keyword, layer] of Object.entries(realityMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer13', layer);
        setLastInterpretation(`REALITY: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- PARADOX/IMPOSSIBLE LAYER ---
    const paradoxMap: Record<string, string> = {
      'penrose triangle': 'penrose', 'impossible triangle': 'penrose',
      'impossible cube': 'impossible', 'impossible geometry': 'impossible',
      'mobius strip': 'mobius', 'möbius': 'mobius',
      'hyperbolic plane': 'hyperbolic', 'poincare disk': 'hyperbolic',
      'non euclidean': 'non-euclidean', 'noneuclidean': 'non-euclidean', 'lovecraftian': 'non-euclidean',
      'recursive': 'recursive', 'infinite recursion': 'recursive', 'droste': 'recursive',
    };
    for (const [keyword, layer] of Object.entries(paradoxMap)) {
      if (cmd.includes(keyword)) {
        updateVisualParameter('geometryLayer14', layer);
        setLastInterpretation(`PARADOX: ${layer.toUpperCase()}`);
        return true;
      }
    }

    // --- MOTION DIRECTIONS ---
    const motionMap: Record<string, string> = {
      'flow': 'flow', 'dance': 'flow', 'dancer': 'flow',
      'outward': 'outward', 'out': 'outward', 'expand': 'outward',
      'inward': 'inward', 'in': 'inward', 'collapse': 'inward',
      'clockwise': 'clockwise', 'cw': 'clockwise',
      'counter': 'counter', 'ccw': 'counter', 'counterclockwise': 'counter',
      'breathing': 'breathing',
      'still': 'still', 'stop': 'still', 'stationary': 'still',
    };
    for (const [keyword, direction] of Object.entries(motionMap)) {
      if (words.includes(keyword)) {
        updateVisualParameter('motionDirection', direction);
        setLastInterpretation(`🌀 MOTION: ${direction.toUpperCase()}`);
        return true;
      }
    }

    // --- COLOR PALETTES ---
    const colorMap: Record<string, string> = {
      // Original
      'cosmos': 'cosmos', 'purple': 'cosmos',
      'void': 'void',
      'fire': 'fire', 'red': 'fire', 'orange': 'fire',
      'ice': 'ice', 'cyan': 'ice',
      'earth': 'earth', 'green': 'earth',
      'neon': 'neon', 'magenta': 'neon',
      'sacred': 'sacred',
      'ocean': 'ocean', 'sea': 'ocean',
      'sunset': 'sunset', 'warm': 'sunset',
      // Full spectrum
      'spectrum': 'spectrum', 'full spectrum': 'spectrum',
      'rainbow': 'rainbow',
      // Light palettes
      'light': 'light', 'bright': 'light', 'white': 'light',
      'ethereal': 'ethereal', 'heavenly': 'ethereal',
      'pastel': 'pastel', 'soft': 'pastel',
      // Ice variations
      'glacier': 'glacier',
      'arctic': 'arctic', 'frozen': 'arctic',
      'frost': 'frost', 'cold': 'frost',
      // Dark prism
      'bloodmoon': 'bloodmoon', 'blood': 'bloodmoon',
      'darkprism': 'darkprism', 'dark prism': 'darkprism',
      'crimson': 'crimson', 'dark red': 'crimson',
      'amethyst': 'amethyst',
      'obsidian': 'obsidian',
      // Monochrome
      'monochrome': 'monochrome', 'black and white': 'monochrome', 'bw': 'monochrome',
      'noir': 'noir', 'dark': 'noir',
      'silver': 'silver', 'gray': 'silver', 'grey': 'silver',
      // Mystical
      'ancient': 'ancient', 'gold': 'ancient', 'golden': 'ancient',
      'mystic': 'mystic', 'mystical': 'mystic',
      'alchemical': 'alchemical', 'alchemy': 'alchemical',
    };
    for (const [keyword, palette] of Object.entries(colorMap)) {
      if (cmd.includes(keyword) && (cmd.includes('color') || cmd.includes('palette') || words.length <= 2)) {
        updateVisualParameter('colorPalette', palette);
        setLastInterpretation(`COLOR: ${palette.toUpperCase()}`);
        return true;
      }
    }

    // --- INTENSITY CONTROLS ---
    // "intensity 50%", "set intensity to 80", "more intense", "less intense", "intensity up", "way more intensity"
    if (cmd.includes('intensity') || cmd.includes('intense') ||
        (words.length <= 3 && (cmd.includes('more') || cmd.includes('less') || cmd.includes('stronger') || cmd.includes('weaker')))) {
      const current = visualState.overallIntensity || 0.5;
      const newVal = getAdjustment(cmd, current);
      updateVisualParameter('overallIntensity', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`INTENSITY ${pct}%`);
      return true;
    }

    // --- SPEED CONTROLS ---
    // "speed 50%", "faster", "slower", "way faster", "half speed", "full speed"
    if (cmd.includes('speed') || cmd.includes('faster') || cmd.includes('slower') || cmd.includes('quick')) {
      const current = visualState.motionSpeed || 0.3;
      let newVal: number;
      if (cmd.includes('stop') || cmd.includes('still') || cmd.includes('freeze motion')) {
        newVal = 0;
      } else if (cmd.includes('faster') || cmd.includes('quick')) {
        newVal = getAdjustment(cmd.replace('faster', 'more').replace('quick', 'more'), current);
      } else if (cmd.includes('slower') || cmd.includes('slow')) {
        newVal = getAdjustment(cmd.replace('slower', 'less').replace('slow', 'less'), current);
      } else {
        newVal = getAdjustment(cmd, current);
      }
      updateVisualParameter('motionSpeed', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`SPEED ${pct}%`);
      return true;
    }

    // --- LAYER OFF COMMANDS ---
    if (cmd.includes('sacred off') || cmd.includes('no sacred') || cmd.includes('remove sacred')) {
      updateVisualParameter('geometryLayer2', 'none');
      setLastInterpretation('❌ SACRED OFF');
      return true;
    }
    if (cmd.includes('quantum off') || cmd.includes('no quantum') || cmd.includes('remove quantum')) {
      updateVisualParameter('geometryLayer3', 'none');
      setLastInterpretation('❌ QUANTUM OFF');
      return true;
    }
    if (cmd.includes('cosmic off') || cmd.includes('no cosmic') || cmd.includes('remove cosmic')) {
      updateVisualParameter('geometryLayer4', 'none');
      setLastInterpretation('❌ COSMIC OFF');
      return true;
    }
    if (cmd.includes('life off') || cmd.includes('no life') || cmd.includes('remove life')) {
      updateVisualParameter('geometryLayer5', 'none');
      setLastInterpretation('❌ LIFE OFF');
      return true;
    }
    if (cmd.includes('ancient off') || cmd.includes('no ancient') || cmd.includes('remove ancient')) {
      updateVisualParameter('geometryLayer6', 'none');
      setLastInterpretation('❌ ANCIENT OFF');
      return true;
    }
    if (cmd.includes('dimensional off') || cmd.includes('4d off') || cmd.includes('no 4d') || cmd.includes('remove 4d')) {
      updateVisualParameter('geometryLayer7', 'none');
      setLastInterpretation('❌ 4D OFF');
      return true;
    }
    if (cmd.includes('consciousness off') || cmd.includes('no consciousness') || cmd.includes('consc off')) {
      updateVisualParameter('geometryLayer8', 'none');
      setLastInterpretation('❌ CONSC OFF');
      return true;
    }
    if (cmd.includes('5d off') || cmd.includes('no 5d') || cmd.includes('remove 5d')) {
      updateVisualParameter('geometryLayer9', 'none');
      setLastInterpretation('❌ 5D OFF');
      return true;
    }
    if (cmd.includes('6d off') || cmd.includes('no 6d') || cmd.includes('remove 6d')) {
      updateVisualParameter('geometryLayer10', 'none');
      setLastInterpretation('❌ 6D OFF');
      return true;
    }
    if (cmd.includes('fractal off') || cmd.includes('no fractal') || cmd.includes('remove fractal')) {
      updateVisualParameter('geometryLayer11', 'none');
      setLastInterpretation('❌ FRACTAL OFF');
      return true;
    }
    if (cmd.includes('chaos off') || cmd.includes('no chaos') || cmd.includes('remove chaos') || cmd.includes('attractor off')) {
      updateVisualParameter('geometryLayer12', 'none');
      setLastInterpretation('❌ CHAOS OFF');
      return true;
    }
    if (cmd.includes('reality off') || cmd.includes('no reality') || cmd.includes('remove reality')) {
      updateVisualParameter('geometryLayer13', 'none');
      setLastInterpretation('❌ REALITY OFF');
      return true;
    }
    if (cmd.includes('paradox off') || cmd.includes('no paradox') || cmd.includes('remove paradox') || cmd.includes('impossible off')) {
      updateVisualParameter('geometryLayer14', 'none');
      setLastInterpretation('❌ PARADOX OFF');
      return true;
    }
    if (cmd.includes('clear') || cmd.includes('all off') || cmd.includes('clean')) {
      updateVisualParameter('geometryLayer2', 'none');
      updateVisualParameter('geometryLayer3', 'none');
      updateVisualParameter('geometryLayer4', 'none');
      updateVisualParameter('geometryLayer5', 'none');
      updateVisualParameter('geometryLayer6', 'none');
      updateVisualParameter('geometryLayer7', 'none');
      updateVisualParameter('geometryLayer8', 'none');
      updateVisualParameter('geometryLayer9', 'none');
      updateVisualParameter('geometryLayer10', 'none');
      updateVisualParameter('geometryLayer11', 'none');
      updateVisualParameter('geometryLayer12', 'none');
      updateVisualParameter('geometryLayer13', 'none');
      updateVisualParameter('geometryLayer14', 'none');
      setLastInterpretation('🧹 ALL LAYERS CLEARED');
      return true;
    }

    // --- ECLIPSE/CORONA/BEAMS ---
    // Turn OFF beams/corona/rays
    if (cmd.includes('beams off') || cmd.includes('no beams') || cmd.includes('rays off') || cmd.includes('no rays')) {
      updateVisualParameter('coronaIntensity', 0);
      setLastInterpretation('BEAMS OFF');
      return true;
    }
    if (cmd.includes('corona off') || cmd.includes('no corona')) {
      updateVisualParameter('coronaIntensity', 0);
      setLastInterpretation('CORONA OFF');
      return true;
    }
    if (cmd.includes('eclipse off') || cmd.includes('no eclipse')) {
      updateVisualParameter('eclipsePhase', 0);
      updateVisualParameter('coronaIntensity', 0);
      setLastInterpretation('ECLIPSE OFF');
      return true;
    }
    // Turn ON eclipse
    if (cmd.includes('eclipse')) {
      updateVisualParameter('eclipsePhase', 0.7);
      updateVisualParameter('coronaIntensity', 0.6);
      setLastInterpretation('ECLIPSE ON');
      return true;
    }
    // --- CORONA/BEAMS ---
    // "corona 50%", "more beams", "less glow", "rays up"
    if (cmd.includes('corona') || cmd.includes('glow') || cmd.includes('beams') || cmd.includes('rays')) {
      const current = visualState.coronaIntensity || 0;
      const newVal = getAdjustment(cmd, current);
      updateVisualParameter('coronaIntensity', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`CORONA ${pct}%`);
      return true;
    }

    // --- CHAOS ---
    // "chaos 80%", "more chaotic", "wild", "less chaos", "calm down"
    if (cmd.includes('chaos') || cmd.includes('chaotic') || cmd.includes('wild') || cmd.includes('crazy')) {
      const current = visualState.chaosFactor || 0;
      let newVal: number;
      if (cmd.includes('calm') || cmd.includes('order') || cmd.includes('stable')) {
        newVal = getAdjustment('less ' + cmd, current);
      } else {
        newVal = getAdjustment(cmd, current);
      }
      updateVisualParameter('chaosFactor', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`CHAOS ${pct}%`);
      return true;
    }

    // --- BASS IMPACT ---
    // "bass 70%", "more punch", "less impact", "bass reactivity up"
    if (cmd.includes('bass') || cmd.includes('punch') || cmd.includes('impact') || cmd.includes('reactive') || cmd.includes('reactivity')) {
      const current = visualState.bassImpact || 0.5;
      const newVal = getAdjustment(cmd, current);
      updateVisualParameter('bassImpact', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`BASS ${pct}%`);
      return true;
    }

    // --- HUE SHIFT ---
    // "shift hue", "rotate colors", "hue 180", "reset hue"
    if (cmd.includes('hue') || cmd.includes('shift color') || cmd.includes('rotate color') || cmd.includes('color rotate')) {
      if (cmd.includes('reset') || cmd.includes('normal') || cmd.includes('zero')) {
        updateVisualParameter('colorHueShift', 0);
        setLastInterpretation('HUE RESET');
      } else {
        const current = (visualState as any).colorHueShift || 0;
        // Check for explicit degree value
        const degMatch = cmd.match(/(\d+)\s*(?:deg|degrees?|°)?/);
        let newHue: number;
        if (degMatch) {
          newHue = (parseInt(degMatch[1]) % 360) / 360;
        } else {
          newHue = (current + 0.15) % 1;
        }
        updateVisualParameter('colorHueShift', newHue);
        setLastInterpretation(`HUE: ${Math.round(newHue * 360)}°`);
      }
      return true;
    }

    // --- SATURATION ---
    // "saturation 70%", "more vivid", "less saturated", "muted colors", "vibrant"
    if (cmd.includes('saturation') || cmd.includes('saturate') || cmd.includes('vivid') || cmd.includes('vibrant') || cmd.includes('muted')) {
      const current = (visualState as any).colorSaturation || 0.5;
      let newVal: number;
      if (cmd.includes('muted') || cmd.includes('desaturate') || cmd.includes('gray')) {
        newVal = getAdjustment(cmd.replace('muted', 'less'), current);
      } else if (cmd.includes('vivid') || cmd.includes('vibrant')) {
        newVal = getAdjustment(cmd.replace('vivid', 'more').replace('vibrant', 'more'), current);
      } else {
        newVal = getAdjustment(cmd, current);
      }
      updateVisualParameter('colorSaturation', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`SATURATION ${pct}%`);
      return true;
    }

    // --- BRIGHTNESS ---
    // "brightness 80%", "brighter", "darker", "dim", "way brighter"
    if (cmd.includes('brightness') || cmd.includes('bright') || cmd.includes('luminance') || cmd.includes('dim') || cmd.includes('dark')) {
      const current = (visualState as any).colorBrightness || 0.5;
      let newVal: number;
      if (cmd.includes('dim') || cmd.includes('darker') || cmd.includes('dark')) {
        newVal = getAdjustment(cmd.replace('dim', 'less').replace('darker', 'less').replace('dark', 'less'), current);
      } else if (cmd.includes('brighter') || cmd.includes('lighter')) {
        newVal = getAdjustment(cmd.replace('brighter', 'more').replace('lighter', 'more'), current);
      } else {
        newVal = getAdjustment(cmd, current);
      }
      updateVisualParameter('colorBrightness', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`BRIGHTNESS ${pct}%`);
      return true;
    }

    // --- BACKGROUND COLOR ---
    // Map color names to hue values (0-360)
    const bgColorMap: Record<string, number> = {
      'red': 0, 'crimson': 350, 'scarlet': 5,
      'orange': 30, 'amber': 45,
      'yellow': 60, 'gold': 50,
      'lime': 90, 'chartreuse': 75,
      'green': 120, 'emerald': 140, 'forest': 135,
      'teal': 170, 'cyan': 180, 'turquoise': 175,
      'sky': 200, 'azure': 210,
      'blue': 240, 'indigo': 260, 'navy': 230,
      'purple': 270, 'violet': 280, 'magenta': 300,
      'pink': 330, 'rose': 345, 'fuchsia': 315,
      'white': -1, 'black': -2, // Special cases
    };

    if (cmd.includes('background')) {
      // Check for specific colors
      for (const [colorName, hue] of Object.entries(bgColorMap)) {
        if (cmd.includes(colorName)) {
          if (hue === -1) { // white - high lightness, low saturation look
            updateVisualParameter('backgroundHue', 0);
            setLastInterpretation('BACKGROUND WHITE');
          } else if (hue === -2) { // black - keep purple-ish but very dark
            updateVisualParameter('backgroundHue', 270);
            setLastInterpretation('BACKGROUND BLACK');
          } else {
            updateVisualParameter('backgroundHue', hue);
            setLastInterpretation(`BACKGROUND ${colorName.toUpperCase()}`);
          }
          return true;
        }
      }
      // Shift hue if no specific color
      if (cmd.includes('shift') || cmd.includes('rotate') || cmd.includes('change')) {
        const current = (visualState as any).backgroundHue || 270;
        const newHue = (current + 30) % 360;
        updateVisualParameter('backgroundHue', newHue);
        setLastInterpretation(`BACKGROUND HUE: ${newHue}°`);
        return true;
      }
    }

    // Also check for "[color] background" patterns
    for (const [colorName, hue] of Object.entries(bgColorMap)) {
      if (cmd.includes(`${colorName} background`) || cmd.includes(`${colorName} bg`)) {
        if (hue >= 0) {
          updateVisualParameter('backgroundHue', hue);
          setLastInterpretation(`BACKGROUND ${colorName.toUpperCase()}`);
          return true;
        }
      }
    }

    // --- COMPLEXITY ---
    // "complexity 60%", "more complex", "simpler", "detailed"
    if (cmd.includes('complex') || cmd.includes('detail') || cmd.includes('simple') || cmd.includes('intricate')) {
      const current = visualState.geometryComplexity || 0.3;
      let newVal: number;
      if (cmd.includes('simple') || cmd.includes('simpler') || cmd.includes('basic')) {
        newVal = getAdjustment(cmd.replace('simple', 'less').replace('simpler', 'less').replace('basic', 'less'), current);
      } else {
        newVal = getAdjustment(cmd, current);
      }
      updateVisualParameter('geometryComplexity', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`COMPLEXITY ${pct}%`);
      return true;
    }

    // --- STARS ---
    // "more stars", "star density 80%", "less stars", "starfield"
    if ((cmd.includes('star') && (cmd.includes('more') || cmd.includes('less') || cmd.includes('density'))) ||
        cmd.includes('starfield density')) {
      const current = visualState.starDensity || 0.5;
      const newVal = getAdjustment(cmd, current);
      updateVisualParameter('starDensity', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`STARS ${pct}%`);
      return true;
    }

    // --- AUDIO REACTIVITY ---
    // "audio react 70%", "more reactive", "less audio response"
    if (cmd.includes('audio react') || cmd.includes('reactiv') || cmd.includes('respond to music') || cmd.includes('music react')) {
      const current = visualState.audioReactGeometry || 0.5;
      const newVal = getAdjustment(cmd, current);
      updateVisualParameter('audioReactGeometry', newVal);
      updateVisualParameter('audioReactColor', newVal);
      updateVisualParameter('audioReactMotion', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`AUDIO REACT ${pct}%`);
      return true;
    }

    // --- DEPTH/PARALLAX ---
    // "more depth", "depth 60%", "less parallax", "3d effect"
    if (cmd.includes('depth') || cmd.includes('parallax') || cmd.includes('3d')) {
      const current = (visualState as any).depthParallax || 0.3;
      const newVal = getAdjustment(cmd, current);
      updateVisualParameter('depthParallax', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`DEPTH ${pct}%`);
      return true;
    }

    // --- NEBULA ---
    // "more nebula", "nebula 50%", "cosmic clouds"
    if (cmd.includes('nebula') || cmd.includes('cloud') || cmd.includes('cosmic dust')) {
      const current = visualState.nebulaPresence || 0.2;
      const newVal = getAdjustment(cmd, current);
      updateVisualParameter('nebulaPresence', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`NEBULA ${pct}%`);
      return true;
    }

    // --- GEOMETRY SCALE ---
    // "bigger", "smaller", "scale up", "scale 150%", "zoom in"
    if (cmd.includes('scale') || cmd.includes('bigger') || cmd.includes('smaller') || cmd.includes('zoom') || cmd.includes('size')) {
      const current = (visualState as any).geometryScale || 1;
      let newVal: number;
      if (cmd.includes('smaller') || cmd.includes('zoom out') || cmd.includes('shrink')) {
        newVal = Math.max(0.2, current - 0.2);
      } else if (cmd.includes('bigger') || cmd.includes('zoom in') || cmd.includes('larger') || cmd.includes('enlarge')) {
        newVal = Math.min(3, current + 0.3);
      } else {
        // Check for percentage
        const pctMatch = cmd.match(/(\d+)\s*%/);
        if (pctMatch) {
          newVal = parseInt(pctMatch[1]) / 100;
        } else {
          newVal = Math.min(3, current + 0.2);
        }
      }
      updateVisualParameter('geometryScale', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`SCALE ${pct}%`);
      return true;
    }

    // --- SYMMETRY ---
    // "symmetry 8", "6 fold symmetry", "more symmetric"
    if (cmd.includes('symmetr') || cmd.includes('fold')) {
      const numMatch = cmd.match(/(\d+)\s*(?:fold|sided|point|way)?/);
      if (numMatch) {
        const sym = Math.max(2, Math.min(16, parseInt(numMatch[1])));
        updateVisualParameter('geometrySymmetry', sym);
        setLastInterpretation(`SYMMETRY ${sym}-FOLD`);
        return true;
      }
    }

    // --- TURBULENCE ---
    // "more turbulence", "turbulent", "smooth motion"
    if (cmd.includes('turbul') || (cmd.includes('smooth') && cmd.includes('motion'))) {
      const current = (visualState as any).motionTurbulence || 0;
      let newVal: number;
      if (cmd.includes('smooth') || cmd.includes('calm')) {
        newVal = Math.max(0, current - 0.2);
      } else {
        newVal = getAdjustment(cmd, current);
      }
      updateVisualParameter('motionTurbulence', newVal);
      const pct = Math.round(newVal * 100);
      setLastInterpretation(`TURBULENCE ${pct}%`);
      return true;
    }

    return false; // Not a recognized command - will fall through to AI
  };

  // Update session context after a command (learns your style)
  const updateContext = (prompt: string, interpretation: string, changes: Record<string, string | number>) => {
    setSessionContext(prev => updateSessionContext(prev, prompt, interpretation, changes));
    console.log('[CONTEXT] Updated session context:', sessionContext.currentVibe);
  };

  // Handle prompt submission (voice or typed)
  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;

    // Try instant keyword processing first
    if (processVoiceCommand(prompt)) {
      // Update context even for instant commands
      updateContext(prompt, lastInterpretation, {});
      return; // Command was handled instantly
    }

    // Fall back to AI interpretation for complex commands
    if (isProcessing) return;
    setIsProcessing(true);
    setLastInterpretation('🤖 AI thinking...');

    try {
      // Pass session context to AI for style-aware interpretation
      const result = await interpretPrompt(prompt, visualState, apiKey || undefined, sessionContext);
      if (result.success && result.parameterChanges) {
        applyParameterChanges(result.parameterChanges);
        setLastInterpretation(result.interpretation || 'Applied');

        // Update session context with what the AI learned
        updateContext(prompt, result.interpretation || 'Applied', result.parameterChanges);

        // Log the current vibe for debugging
        console.log('[SESSION] Current vibe:', sessionContext.currentVibe);
        console.log('[SESSION] Detected style:', sessionContext.detectedStyle);
      } else {
        setLastInterpretation(result.error || 'Could not interpret');
      }
    } catch {
      setLastInterpretation('Error processing prompt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadPreset = (preset: typeof presets[0]) => {
    loadPreset(preset);
    setActivePreset(preset.id);
    setLastInterpretation(`PRESET: ${preset.name}`);
  };

  const handleHold = () => {
    // Save current state before freezing
    savedStateRef.current = { ...visualState };
    updateVisualParameter('motionSpeed', 0);
    setLastInterpretation('⏸️ HOLD');
  };

  const handleKill = () => {
    // Save current state before killing
    savedStateRef.current = { ...visualState };
    setVisualState({ ...visualState, overallIntensity: 0, starBrightness: 0, colorBrightness: 0 });
    setLastInterpretation('🔴 KILL');
  };

  const handleGo = () => {
    // Restore saved state, or bring back to default values
    if (savedStateRef.current) {
      setVisualState(savedStateRef.current);
      savedStateRef.current = null;
      setLastInterpretation('▶️ GO');
    } else {
      // If no saved state, bring back to moderate levels
      setVisualState({
        ...visualState,
        overallIntensity: 0.5,
        motionSpeed: 0.3,
        colorBrightness: 0.6,
      });
      setLastInterpretation('▶️ GO');
    }
  };

  const handleReset = () => {
    setVisualState(DEFAULT_VISUAL_STATE);
    setActivePreset(null);
    setLastInterpretation('🔄 RESET');
  };

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput);
    setShowSettings(false);
  };

  // Recording functions - FIXED: Get fresh audio stream from store
  const startRecording = () => {
    const canvas = document.querySelector('#preview-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Log recording resolution
    console.log(`Recording at ${canvas.width}x${canvas.height} (canvas resolution)`);

    // Get video stream from canvas at 60fps for smooth playback
    const videoStream = canvas.captureStream(60);

    // Get FRESH audio stream from store state (not stale closure)
    const currentAudioStream = useStore.getState().audioStream;

    // Combine video and audio streams if audio is available
    let combinedStream: MediaStream;
    if (currentAudioStream && currentAudioStream.getAudioTracks().length > 0) {
      // Clone audio tracks to avoid issues
      const audioTracks = currentAudioStream.getAudioTracks();
      combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioTracks,
      ]);
      // Audio included in recording
      console.log('Recording with audio:', audioTracks.length, 'tracks');
    } else {
      combinedStream = videoStream;
      // No audio in recording
      console.log('Recording without audio - no audio stream available');
    }

    // Try to use the best codec available with high quality settings
    let mimeType = 'video/webm; codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm; codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }
    // HIGH QUALITY settings for YouTube (16 Mbps for 1080p60)
    const options: MediaRecorderOptions = {
      mimeType,
      videoBitsPerSecond: 16000000,  // 16 Mbps for YouTube 1080p60
      audioBitsPerSecond: 320000,    // 320 kbps high quality audio
    };

    const recorder = new MediaRecorder(combinedStream, options);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
    };

    recorder.start(100);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordingTime(0);
    setRecordedChunks([]);

    recordingIntervalRef.current = window.setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  };

  // Download recording as WebM (instant, YouTube-compatible)
  const downloadWebM = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `darthander-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Popout window for fullscreen display
  const handlePopout = () => {
    if (popoutWindow && !popoutWindow.closed) {
      popoutWindow.focus();
      return;
    }

    // YouTube-optimized 16:9 aspect ratio (1920x1080)
    const win = window.open('', 'DARTHANDER Display', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
    if (!win) return;

    setPopoutWindow(win);

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DARTHANDER Display</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #000; overflow: hidden; cursor: none; }
            canvas { width: 100vw; height: 100vh; display: block; }
          </style>
        </head>
        <body>
          <canvas id="display-canvas"></canvas>
        </body>
      </html>
    `);
    win.document.close();

    // Sync the display canvas with our preview
    const syncDisplay = () => {
      if (win.closed) return;
      const sourceCanvas = document.querySelector('#preview-canvas') as HTMLCanvasElement;
      const destCanvas = win.document.querySelector('#display-canvas') as HTMLCanvasElement;
      if (sourceCanvas && destCanvas) {
        const ctx = destCanvas.getContext('2d');
        if (ctx) {
          // Set dest canvas to match source (1920x1080)
          if (destCanvas.width !== sourceCanvas.width || destCanvas.height !== sourceCanvas.height) {
            destCanvas.width = sourceCanvas.width;
            destCanvas.height = sourceCanvas.height;
          }
          // Draw the source canvas to display
          ctx.drawImage(sourceCanvas, 0, 0);
        }
      }
      requestAnimationFrame(syncDisplay);
    };
    setTimeout(syncDisplay, 100);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="h-screen overflow-hidden bg-black text-white font-sans flex flex-col">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" /> API Key
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white mb-4 focus:border-purple-500 outline-none"
            />
            <button
              onClick={handleSaveApiKey}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-black hover:opacity-90 transition-opacity"
            >
              SAVE
            </button>
          </div>
        </div>
      )}

      {/* Header - BOLD and readable */}
      <header className="bg-zinc-900/80 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            DARTHANDER
          </h1>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${apiKey ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
            {apiKey ? 'AI READY' : 'NO KEY'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* LIVE CONTROLS - Quick access */}
          <button
            onClick={handleGo}
            className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105"
            title="Resume visuals (G)"
          >
            <Play className="w-4 h-4" /> GO
          </button>
          <button
            onClick={handleHold}
            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105"
            title="Freeze motion (Space)"
          >
            <Pause className="w-4 h-4" /> HOLD
          </button>
          <button
            onClick={handleKill}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105"
            title="Blackout (Esc)"
          >
            <Power className="w-4 h-4" /> KILL
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105"
            title="Reset to default (R)"
          >
            <RotateCcw className="w-4 h-4" /> RESET
          </button>

          <div className="w-px h-6 bg-white/20 mx-1" />

          {/* Audio Source - Inline in nav */}
          <AudioSourceSelector />

          <div className="w-px h-6 bg-white/20 mx-1" />

          {/* Recording Controls */}
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-3 py-2 bg-red-600/80 hover:bg-red-500 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Video className="w-4 h-4" /> REC
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-3 py-2 bg-red-600 rounded-lg text-xs font-black flex items-center gap-1.5 animate-pulse"
            >
              <Square className="w-4 h-4" /> {formatTime(recordingTime)}
            </button>
          )}

          {recordedChunks.length > 0 && !isRecording && (
            <>
              <button
                onClick={downloadWebM}
                className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105"
                title="Instant download (WebM) - works with YouTube & most editors"
              >
                <Download className="w-4 h-4" /> SAVE
              </button>
            </>
          )}

          <div className="w-px h-6 bg-white/20 mx-1" />

          {/* Popout Display */}
          <button
            onClick={handlePopout}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105"
            title="Open display window (F)"
          >
            <ExternalLink className="w-4 h-4" /> DISPLAY
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: VISUALIZER - The Star of the Show */}
        <div className="w-1/2 p-2 flex flex-col min-h-0">
          <div className="flex-1 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-purple-500/20 bg-black relative">
            <div className="absolute inset-0">
              <PreviewMonitor state={visualState} canvasId="preview-canvas" />
            </div>
          </div>

          {/* Prompt Bar - Clean and simple */}
          <div className="mt-3 bg-zinc-900/80 backdrop-blur rounded-2xl p-3 flex items-center gap-3 border border-white/10">
            <VoiceInput isActive={isVoiceActive} onToggle={() => setIsVoiceActive(!isVoiceActive)} onTranscription={handlePromptSubmit} />
            <div className="flex-1">
              <PromptInput onSubmit={handlePromptSubmit} placeholder="Type a command..." compact />
            </div>
            <div className={`text-sm font-bold px-3 py-1 rounded-lg ${isProcessing ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' : 'bg-white/5 text-white/60'}`}>
              {lastInterpretation || 'Ready'}
            </div>
          </div>

          {/* Session Context Indicator - Shows what AI is learning about your style */}
          {sessionContext.recentCommands.length > 0 && (
            <div className="mt-1 flex items-center gap-2 text-[9px] text-white/40 px-2">
              <span className="text-purple-400/60">VIBE:</span>
              <span className="text-white/50">{sessionContext.currentVibe}</span>
              {sessionContext.detectedStyle.preferredLayers.length > 0 && (
                <>
                  <span className="text-purple-400/40">•</span>
                  <span className="text-cyan-400/50">{sessionContext.detectedStyle.preferredLayers.slice(0, 2).join(', ')}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: CONTROLS */}
        <div className={`${showInfoPanel ? 'w-[40%]' : 'w-1/2'} p-3 flex flex-col gap-2 min-h-0 transition-all duration-300`}>
          {/* PRESETS - Compact row */}
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl border border-white/10 px-3 py-2 overflow-x-hidden">
            <PresetGrid
              presets={presets}
              onSelect={handleLoadPreset}
              currentPreset={presets.find(p => p.id === activePreset) || null}
              onHover={setHoveredPreset}
            />
          </div>

          {/* CONTROLS - Takes remaining space */}
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl border border-white/10 overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="px-3 py-2 overflow-y-auto overflow-x-hidden flex-1">
              <ParameterSliders state={visualState} onChange={(p, v) => updateVisualParameter(p, v)} onLayerHover={setHoveredLayer} />
            </div>
          </div>
        </div>

        {/* Info Panel - Collapsible - LAYER PREVIEW */}
        <div className={`${showInfoPanel ? 'w-[18%] min-w-[180px]' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          {showInfoPanel && (
            <div className="h-full p-3 pl-0">
              <div className={`h-full backdrop-blur rounded-xl border p-3 flex flex-col transition-all duration-200 ${
                hoveredLayer
                  ? 'bg-gradient-to-b from-purple-900/60 to-zinc-900/90 border-purple-500/40 shadow-lg shadow-purple-500/20'
                  : 'bg-zinc-900/80 border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Info className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {hoveredLayer ? 'Layer Preview' : 'Info'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowInfoPanel(false)}
                    className="text-white/40 hover:text-white/70 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {hoveredLayer ? (
                  <div className="flex-1 flex flex-col">
                    {/* Visual color preview - LARGE */}
                    <div className={`w-full h-24 rounded-xl mb-3 ${hoveredLayer.color} relative overflow-hidden shadow-lg`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {/* Animated shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                      <div className="absolute bottom-2 right-2 text-[9px] text-white/80 uppercase tracking-wider font-bold bg-black/30 px-2 py-0.5 rounded">
                        {hoveredLayer.category}
                      </div>
                    </div>
                    <div className="text-base font-bold text-white mb-1 uppercase tracking-wide">{hoveredLayer.id.replace(/-/g, ' ')}</div>
                    <div className="text-[11px] text-purple-400 uppercase tracking-wide mb-2 font-medium">{hoveredLayer.category}</div>
                    <div className="text-sm text-white/80 leading-relaxed flex-1">{hoveredLayer.description}</div>
                  </div>
                ) : hoveredPreset ? (
                  <div className="flex-1 flex flex-col">
                    <div className="text-sm font-bold text-white mb-1">{hoveredPreset.name}</div>
                    <div className="text-[10px] text-purple-400 uppercase tracking-wide mb-2">{hoveredPreset.category}</div>
                    <div className="text-xs text-white/70 leading-relaxed">{hoveredPreset.description || 'Experience this visual journey'}</div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Info className="w-6 h-6 text-white/20" />
                      </div>
                      <span className="text-[11px] text-white/30">Hover any layer<br/>to see preview</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Collapsed Info Panel Toggle */}
        {!showInfoPanel && (
          <div className="p-3 pl-0">
            <button
              onClick={() => setShowInfoPanel(true)}
              className="h-full bg-zinc-900/80 backdrop-blur rounded-xl border border-white/10 px-2 flex items-center justify-center hover:bg-zinc-800/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white/60" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
