// DARTHANDER Visual Consciousness Engine
// STAGE READY - Built for Performance

import { useEffect, useState, useRef } from 'react';
import { useStore } from './store';
import { interpretPrompt, DEFAULT_VISUAL_STATE } from './services/gemini';
import { PreviewMonitor } from './components/PreviewMonitor';
import { PromptInput } from './components/PromptInput';
import { VoiceInput } from './components/VoiceInput';
import { PresetGrid } from './components/PresetGrid';
import { ParameterSliders } from './components/ParameterSliders';
import { AudioSourceSelector } from './components/AudioSourceSelector';
import { Square, Settings, Key, Video, Download, ExternalLink, X, Pause, Power, RotateCcw, Play } from 'lucide-react';

function App() {
  const [lastInterpretation, setLastInterpretation] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);

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
  const processVoiceCommand = (text: string): boolean => {
    const cmd = text.toLowerCase().trim();
    const words = cmd.split(/\s+/);

    // --- CONTROL COMMANDS ---
    if (cmd.includes('hold') || cmd.includes('freeze') || cmd.includes('pause')) {
      handleHold();
      return true;
    }
    if (cmd.includes('kill') || cmd.includes('black') || cmd.includes('off')) {
      handleKill();
      return true;
    }
    if (cmd.includes('go') || cmd.includes('resume') || cmd.includes('play') || cmd.includes('start')) {
      handleGo();
      return true;
    }
    if (cmd.includes('reset') || cmd.includes('default')) {
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
        setLastInterpretation(`🎨 COLOR: ${palette.toUpperCase()}`);
        return true;
      }
    }

    // --- INTENSITY CONTROLS ---
    if (cmd.includes('more') || cmd.includes('increase') || cmd.includes('up') || cmd.includes('higher') || cmd.includes('intense')) {
      const currentIntensity = visualState.overallIntensity || 0.5;
      updateVisualParameter('overallIntensity', Math.min(1, currentIntensity + 0.15));
      setLastInterpretation('⬆️ INTENSITY UP');
      return true;
    }
    if (cmd.includes('less') || cmd.includes('decrease') || cmd.includes('down') || cmd.includes('lower') || cmd.includes('subtle')) {
      const currentIntensity = visualState.overallIntensity || 0.5;
      updateVisualParameter('overallIntensity', Math.max(0, currentIntensity - 0.15));
      setLastInterpretation('⬇️ INTENSITY DOWN');
      return true;
    }

    // --- SPEED CONTROLS ---
    if (cmd.includes('faster') || cmd.includes('speed up') || cmd.includes('quick')) {
      const currentSpeed = visualState.motionSpeed || 0.3;
      updateVisualParameter('motionSpeed', Math.min(1, currentSpeed + 0.15));
      setLastInterpretation('⚡ FASTER');
      return true;
    }
    if (cmd.includes('slower') || cmd.includes('slow down') || cmd.includes('slow')) {
      const currentSpeed = visualState.motionSpeed || 0.3;
      updateVisualParameter('motionSpeed', Math.max(0, currentSpeed - 0.15));
      setLastInterpretation('🐢 SLOWER');
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
    if (cmd.includes('clear') || cmd.includes('all off') || cmd.includes('clean')) {
      updateVisualParameter('geometryLayer2', 'none');
      updateVisualParameter('geometryLayer3', 'none');
      updateVisualParameter('geometryLayer4', 'none');
      updateVisualParameter('geometryLayer5', 'none');
      updateVisualParameter('geometryLayer6', 'none');
      updateVisualParameter('geometryLayer7', 'none');
      updateVisualParameter('geometryLayer8', 'none');
      setLastInterpretation('🧹 ALL LAYERS CLEARED');
      return true;
    }

    // --- ECLIPSE/CORONA ---
    if (cmd.includes('eclipse')) {
      updateVisualParameter('eclipsePhase', 0.7);
      updateVisualParameter('coronaIntensity', 0.6);
      setLastInterpretation('🌑 ECLIPSE');
      return true;
    }
    if (cmd.includes('corona') || cmd.includes('glow')) {
      const current = visualState.coronaIntensity || 0;
      updateVisualParameter('coronaIntensity', Math.min(1, current + 0.2));
      setLastInterpretation('☀️ CORONA UP');
      return true;
    }

    // --- CHAOS ---
    if (cmd.includes('chaos') || cmd.includes('chaotic') || cmd.includes('wild')) {
      const current = visualState.chaosFactor || 0;
      updateVisualParameter('chaosFactor', Math.min(1, current + 0.2));
      setLastInterpretation('🌪️ CHAOS UP');
      return true;
    }

    // --- BASS IMPACT ---
    if (cmd.includes('bass') || cmd.includes('punch') || cmd.includes('impact')) {
      const current = visualState.bassImpact || 0.5;
      updateVisualParameter('bassImpact', Math.min(1, current + 0.2));
      setLastInterpretation('🔊 BASS IMPACT UP');
      return true;
    }

    return false; // Not a recognized command - will fall through to AI
  };

  // Handle prompt submission (voice or typed)
  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;

    // Try instant keyword processing first
    if (processVoiceCommand(prompt)) {
      return; // Command was handled instantly
    }

    // Fall back to AI interpretation for complex commands
    if (isProcessing) return;
    setIsProcessing(true);
    setLastInterpretation('🤖 AI thinking...');

    try {
      const result = await interpretPrompt(prompt, visualState, apiKey || undefined);
      if (result.success && result.parameterChanges) {
        applyParameterChanges(result.parameterChanges);
        setLastInterpretation(result.interpretation || 'Applied');
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
    setLastInterpretation(`🎨 ${preset.name}`);
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

    // Get video stream from canvas
    const videoStream = canvas.captureStream(30);

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

    // Try to use the best codec available
    let mimeType = 'video/webm; codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm; codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }
    const options: MediaRecorderOptions = { mimeType };

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

  const downloadRecording = () => {
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

    // Sync the display canvas with our preview (16:9 YouTube optimized)
    const syncDisplay = () => {
      if (win.closed) return;
      const sourceCanvas = document.querySelector('#preview-canvas') as HTMLCanvasElement;
      const destCanvas = win.document.querySelector('#display-canvas') as HTMLCanvasElement;
      if (sourceCanvas && destCanvas) {
        // Force 16:9 aspect ratio for YouTube
        const targetWidth = win.innerWidth;
        const targetHeight = win.innerHeight;
        const aspectRatio = 16 / 9;

        let renderWidth = targetWidth;
        let renderHeight = targetWidth / aspectRatio;

        if (renderHeight > targetHeight) {
          renderHeight = targetHeight;
          renderWidth = targetHeight * aspectRatio;
        }

        destCanvas.width = renderWidth;
        destCanvas.height = renderHeight;
        destCanvas.style.width = `${renderWidth}px`;
        destCanvas.style.height = `${renderHeight}px`;
        destCanvas.style.position = 'absolute';
        destCanvas.style.left = `${(targetWidth - renderWidth) / 2}px`;
        destCanvas.style.top = `${(targetHeight - renderHeight) / 2}px`;

        const ctx = destCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(sourceCanvas, 0, 0, destCanvas.width, destCanvas.height);
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
            <button
              onClick={downloadRecording}
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" /> SAVE
            </button>
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
      <div className="flex-1 flex min-h-0">
        {/* Left: VISUALIZER - The Star of the Show (16:9 YouTube optimized) */}
        <div className="w-1/2 p-3 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 flex items-center justify-center bg-black/50 rounded-2xl">
            <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-purple-500/20">
              <div className="absolute inset-0">
                <PreviewMonitor state={visualState} canvasId="preview-canvas" />
              </div>
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
        </div>

        {/* Right: CONTROLS */}
        <div className="w-1/2 p-3 flex flex-col gap-2 min-h-0">
          {/* PRESETS - Compact row */}
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl border border-white/10 px-3 py-2 overflow-x-hidden">
            <PresetGrid presets={presets} onSelect={handleLoadPreset} currentPreset={presets.find(p => p.id === activePreset) || null} />
          </div>

          {/* CONTROLS - Takes remaining space */}
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl border border-white/10 overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="px-3 py-2 overflow-y-auto overflow-x-hidden flex-1">
              <ParameterSliders state={visualState} onChange={(p, v) => updateVisualParameter(p, v)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
