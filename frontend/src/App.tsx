// DARTHANDER Visual Consciousness Engine
// Main Control Surface Application

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from './store';
import { PreviewMonitor } from './components/PreviewMonitor';
import { PromptInput } from './components/PromptInput';
import { VoiceInput } from './components/VoiceInput';
import { PresetGrid } from './components/PresetGrid';
import { ExpandedSliders } from './components/ExpandedSliders';
import { VibeLayerPanel } from './components/VibeLayerPanel';
import { AudioVisualizer } from './components/AudioVisualizer';
import { AudioSourceSelector } from './components/AudioSourceSelector';
import { AudioEngine } from './components/AudioEngine';
import { BackgroundImageUpload } from './components/BackgroundImageUpload';
import { SessionStatus } from './components/SessionStatus';
import { GeminiSettings } from './components/GeminiSettings';
import {
  Pause,
  Square,
  RotateCcw,
  Maximize2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Gemini prompt interpretation (client-side)
async function interpretWithGemini(prompt: string, apiKey: string, currentState: any): Promise<any> {
  const systemPrompt = `You are the AI brain for DARTHANDER: ECLIPSE, a live immersive visual experience for DJs. Interpret spoken/typed prompts and translate them into parameter changes.

AVAILABLE PARAMETERS:

GEOMETRY (string values):
- geometryMode: "stars" | "mandala" | "hexagon" | "fractal" | "spiral" | "tunnel" | "void"
- motionDirection: "outward" | "inward" | "clockwise" | "counter" | "breathing" | "still"
- colorPalette: "cosmos" | "void" | "fire" | "ice" | "earth" | "neon" | "sacred" | "sunset" | "ocean" | "forest" | "royal" | "blood"

NUMERIC PARAMETERS (0.0-1.0):
- overallIntensity: master brightness/intensity
- geometryComplexity: detail level of geometry
- geometryScale: size of geometry (0.5-2.0, default 1.0)
- motionSpeed: animation speed
- motionTurbulence: randomness/drift in motion
- chaosFactor: visual chaos/wobble
- starDensity: number of stars
- starBrightness: star glow intensity
- nebulaPresence: cosmic cloud intensity
- eclipsePhase: 0=no eclipse, 1=full eclipse
- coronaIntensity: eclipse glow beams
- colorBrightness: color vibrancy
- colorSaturation: color intensity
- colorHueShift: shift all colors (0-1 = 0-360 degrees)

AUDIO SENSITIVITY (0.0-1.0, how much audio affects visuals):
- bassImpactSensitivity: bass hits boost corona
- bassPulseSensitivity: bass presence boost
- audioReactMotion: audio affects speed
- audioReactColor: audio affects brightness
- audioReactGeometry: audio affects chaos/scale

INTERPRETATION GUIDELINES:
- "intense/brighter/more" → increase overallIntensity, maybe coronaIntensity
- "darker/dim/less" → decrease overallIntensity
- "faster/speed" → increase motionSpeed
- "slower/calm/peace" → decrease motionSpeed, chaosFactor
- "chaos/wild/crazy" → increase chaosFactor
- "bigger/larger" → increase geometryScale
- "smaller" → decrease geometryScale
- "stars/cosmic" → geometryMode: stars, high starDensity
- "mandala/sacred" → geometryMode: mandala
- "spiral" → geometryMode: spiral, motionDirection: inward or outward
- "tunnel/portal" → geometryMode: tunnel, motionDirection: inward
- "void/darkness" → colorPalette: void, low overallIntensity
- "fire/flames" → colorPalette: fire, high coronaIntensity
- "ice/cold" → colorPalette: ice
- "eclipse/totality" → high eclipsePhase and coronaIntensity
- "nebula/clouds" → high nebulaPresence
- "spin/rotate" → motionDirection: clockwise or counter
- "breathe" → motionDirection: breathing
- "stop/still/freeze" → motionDirection: still, low motionSpeed
- "flow out" → motionDirection: outward
- "flow in" → motionDirection: inward
- "more bass/reactive" → increase bassImpactSensitivity
- "less reactive" → decrease audio sensitivity parameters

Current state: ${JSON.stringify(currentState)}

Respond with ONLY valid JSON (no markdown, no explanation):
{"interpretation": "2-5 word description", "parameter_changes": {"param": value}}`;

  try {
    console.log('Calling Gemini API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nUser prompt: "${prompt}"` }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
        }
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('Gemini raw response:', data);

    // Check for API errors
    if (data.error) {
      console.error('Gemini API error:', data.error);
      return null;
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini text:', text);

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = text;
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    // Find JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('Gemini parsed:', parsed);
      return parsed;
    }

    console.log('No JSON found in Gemini response');
    return null;
  } catch (error) {
    console.error('Gemini interpretation error:', error);
    return null;
  }
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');
  const [lastInterpretation, setLastInterpretation] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  // When true, prevent backend socket from overwriting visual state
  // This ensures manual slider controls stay where the user sets them
  const [manualControlMode, setManualControlMode] = useState(true);
  const manualControlModeRef = useRef(true);

  // Keep ref in sync with state
  useEffect(() => {
    manualControlModeRef.current = manualControlMode;
  }, [manualControlMode]);

  const {
    visualState,
    audioState,
    setVisualState,
    setAudioState,
    updateVisualParameter,
    presets,
    setPresets,
    currentPreset,
    loadPreset,
    sessionId,
    setSessionId,
    geminiApiKey,
  } = useStore();

  // CRITICAL: Broadcast current state to localStorage immediately on mount
  // This ensures display window always gets the current state, not stale data
  useEffect(() => {
    if (visualState) {
      localStorage.setItem('darthander_state', JSON.stringify(visualState));
      localStorage.setItem('darthander_state_timestamp', Date.now().toString());
      console.log('Control panel: Broadcast initial state to localStorage');
    }
  }, []); // Only on mount

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to DARTHANDER Engine');
      setConnected(true);

      // Request initial state
      newSocket.emit('state:get');
      newSocket.emit('presets:get');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from DARTHANDER Engine');
      setConnected(false);
    });

    // DISABLED: Socket visual state updates are completely disabled
    // The frontend is the MASTER - sliders stay exactly where user sets them
    // Backend state updates were causing slider fluctuation during live audio
    newSocket.on('state:current', (data: any) => {
      // ONLY accept audio state, NEVER visual state from backend
      if (data.audio) setAudioState(data.audio);
      // Visual state is managed 100% locally
      console.log('Ignored backend visual state - manual control enabled');
    });

    newSocket.on('state:update', (_state: any) => {
      // COMPLETELY DISABLED - frontend controls are MASTER
      // Backend can never override slider positions
      console.log('Ignored backend state:update - manual control enabled');
    });

    newSocket.on('audio:update', (state: any) => {
      setAudioState(state);
    });

    newSocket.on('presets:list', (data: any) => {
      setPresets(data.presets);
    });

    newSocket.on('prompt:interpreted', (data: any) => {
      setLastPrompt(data.prompt);
      setLastInterpretation(data.interpretation);
    });

    newSocket.on('voice:transcribed', (data: any) => {
      setLastPrompt(`🎤 ${data.text}`);
    });

    newSocket.on('preset:loaded', (data: any) => {
      setLastInterpretation(`Loaded preset: ${data.preset}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

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
        case 'm':
          setIsVoiceActive(!isVoiceActive);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
          const index = parseInt(e.key) - 1;
          if (presets[index]) {
            handleLoadPreset(presets[index].name);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presets, isVoiceActive]);

  // API calls - Gemini preferred for AI interpretation
  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;

    setLastPrompt(prompt);
    setLastInterpretation('🔮 Interpreting...');

    // PREFER Gemini for AI interpretation when API key is available
    if (geminiApiKey) {
      console.log('Using Gemini to interpret:', prompt);
      setLastInterpretation('🔮 Gemini interpreting...');

      try {
        const result = await interpretWithGemini(prompt, geminiApiKey, visualState);
        if (result && result.parameter_changes) {
          // Apply the parameter changes
          const changes = Object.entries(result.parameter_changes);
          console.log('Gemini changes:', changes);

          changes.forEach(([key, value]) => {
            updateVisualParameter(key, value);
          });

          setLastInterpretation(`✨ ${result.interpretation || 'Applied'}`);
          return;
        } else {
          console.log('Gemini returned no changes, falling back...');
        }
      } catch (error) {
        console.error('Gemini error:', error);
        setLastInterpretation('⚠️ Gemini error, using keywords...');
      }
    }

    // Try backend if connected and no Gemini
    if (connected && !geminiApiKey) {
      try {
        const response = await fetch(`${API_URL}/api/prompt/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, sessionId }),
        });

        const data = await response.json();

        if (data.success) {
          setLastInterpretation(data.interpretation || data.action || 'Applied');
          return;
        }
      } catch (error) {
        console.log('Backend unavailable');
      }
    }

    // Keyword matching fallback (works without API)
    const lowerPrompt = prompt.toLowerCase();

    // Intensity controls
    if (lowerPrompt.includes('intense') || lowerPrompt.includes('more') || lowerPrompt.includes('brighter')) {
      updateVisualParameter('overallIntensity', Math.min(1, (visualState?.overallIntensity ?? 0.5) + 0.2));
      updateVisualParameter('coronaIntensity', Math.min(1, (visualState?.coronaIntensity ?? 0.5) + 0.2));
      setLastInterpretation('↑ Intensity increased');
    } else if (lowerPrompt.includes('less') || lowerPrompt.includes('dim') || lowerPrompt.includes('darker')) {
      updateVisualParameter('overallIntensity', Math.max(0.1, (visualState?.overallIntensity ?? 0.5) - 0.2));
      setLastInterpretation('↓ Intensity decreased');
    }
    // Speed controls
    else if (lowerPrompt.includes('faster') || lowerPrompt.includes('speed up')) {
      updateVisualParameter('motionSpeed', Math.min(1, (visualState?.motionSpeed ?? 0.3) + 0.2));
      setLastInterpretation('⚡ Speed increased');
    } else if (lowerPrompt.includes('slower') || lowerPrompt.includes('slow down')) {
      updateVisualParameter('motionSpeed', Math.max(0, (visualState?.motionSpeed ?? 0.3) - 0.2));
      setLastInterpretation('🐢 Speed decreased');
    }
    // Chaos controls
    else if (lowerPrompt.includes('chaos') || lowerPrompt.includes('wild') || lowerPrompt.includes('crazy')) {
      updateVisualParameter('chaosFactor', Math.min(1, (visualState?.chaosFactor ?? 0.2) + 0.3));
      setLastInterpretation('🌀 Chaos unleashed');
    } else if (lowerPrompt.includes('calm') || lowerPrompt.includes('peace')) {
      updateVisualParameter('chaosFactor', 0.05);
      updateVisualParameter('motionSpeed', 0.1);
      setLastInterpretation('🧘 Finding peace...');
    }
    // Motion direction controls
    else if (lowerPrompt.includes('stop') || lowerPrompt.includes('freeze') || lowerPrompt.includes('still')) {
      updateVisualParameter('motionDirection', 'still');
      updateVisualParameter('motionSpeed', 0);
      setLastInterpretation('⏸️ Motion stopped');
    } else if (lowerPrompt.includes('spin') || lowerPrompt.includes('rotate')) {
      updateVisualParameter('motionDirection', lowerPrompt.includes('counter') || lowerPrompt.includes('left') ? 'counter' : 'clockwise');
      setLastInterpretation('🔄 Spinning...');
    } else if (lowerPrompt.includes('breathe') || lowerPrompt.includes('pulse')) {
      updateVisualParameter('motionDirection', 'breathing');
      setLastInterpretation('🫁 Breathing...');
    } else if (lowerPrompt.includes('flow out') || lowerPrompt.includes('expand') || lowerPrompt.includes('outward')) {
      updateVisualParameter('motionDirection', 'outward');
      setLastInterpretation('↗️ Flowing outward');
    } else if (lowerPrompt.includes('flow in') || lowerPrompt.includes('contract') || lowerPrompt.includes('inward')) {
      updateVisualParameter('motionDirection', 'inward');
      setLastInterpretation('↙️ Flowing inward');
    }
    // Scale controls
    else if (lowerPrompt.includes('bigger') || lowerPrompt.includes('larger') || lowerPrompt.includes('grow')) {
      updateVisualParameter('geometryScale', Math.min(2, (visualState?.geometryScale ?? 1) + 0.3));
      setLastInterpretation('📈 Scale increased');
    } else if (lowerPrompt.includes('smaller') || lowerPrompt.includes('shrink')) {
      updateVisualParameter('geometryScale', Math.max(0.5, (visualState?.geometryScale ?? 1) - 0.3));
      setLastInterpretation('📉 Scale decreased');
    }
    // Star controls
    else if (lowerPrompt.includes('more star')) {
      updateVisualParameter('starDensity', Math.min(1, (visualState?.starDensity ?? 0.5) + 0.2));
      updateVisualParameter('starBrightness', Math.min(1, (visualState?.starBrightness ?? 0.5) + 0.2));
      setLastInterpretation('✨ More stars');
    } else if (lowerPrompt.includes('less star') || lowerPrompt.includes('fewer star')) {
      updateVisualParameter('starDensity', Math.max(0, (visualState?.starDensity ?? 0.5) - 0.3));
      setLastInterpretation('🌑 Fewer stars');
    }
    // Nebula controls
    else if (lowerPrompt.includes('more nebula') || lowerPrompt.includes('more cloud')) {
      updateVisualParameter('nebulaPresence', Math.min(1, (visualState?.nebulaPresence ?? 0.3) + 0.3));
      setLastInterpretation('☁️ More nebula');
    } else if (lowerPrompt.includes('less nebula') || lowerPrompt.includes('less cloud') || lowerPrompt.includes('clear')) {
      updateVisualParameter('nebulaPresence', Math.max(0, (visualState?.nebulaPresence ?? 0.3) - 0.3));
      setLastInterpretation('🌌 Clearing nebula');
    }
    // Audio reactivity controls
    else if (lowerPrompt.includes('more reactive') || lowerPrompt.includes('more bass')) {
      updateVisualParameter('bassImpactSensitivity', Math.min(1, (visualState?.bassImpactSensitivity ?? 0.5) + 0.2));
      updateVisualParameter('bassPulseSensitivity', Math.min(1, (visualState?.bassPulseSensitivity ?? 0.5) + 0.2));
      setLastInterpretation('🎵 More audio reactive');
    } else if (lowerPrompt.includes('less reactive') || lowerPrompt.includes('no bass')) {
      updateVisualParameter('bassImpactSensitivity', 0);
      updateVisualParameter('bassPulseSensitivity', 0);
      updateVisualParameter('audioReactMotion', 0);
      updateVisualParameter('audioReactColor', 0);
      setLastInterpretation('🔇 Audio reactivity off');
    }
    // Preset triggers
    else if (lowerPrompt.includes('dark') || lowerPrompt.includes('void') || lowerPrompt.includes('black')) {
      loadPreset('VOID');
      setLastInterpretation('🌑 Entering the void...');
    } else if (lowerPrompt.includes('eclipse') || lowerPrompt.includes('total')) {
      loadPreset('TOTALITY');
      setLastInterpretation('🌒 Totality achieved');
    } else if (lowerPrompt.includes('portal') || lowerPrompt.includes('tunnel') || lowerPrompt.includes('warp')) {
      loadPreset('PORTAL');
      setLastInterpretation('🌀 Portal opening...');
    } else if (lowerPrompt.includes('cosmic') || lowerPrompt.includes('galaxy') || lowerPrompt.includes('universe')) {
      loadPreset('COSMIC_AWE');
      setLastInterpretation('🌌 Cosmic expansion...');
    } else if (lowerPrompt.includes('fire') || lowerPrompt.includes('flame') || lowerPrompt.includes('burn')) {
      loadPreset('GENESIS');
      setLastInterpretation('🔥 Igniting...');
    } else if (lowerPrompt.includes('star') || lowerPrompt.includes('supernova') || lowerPrompt.includes('explode')) {
      loadPreset('SUPERNOVA');
      setLastInterpretation('💥 Supernova!');
    } else if (lowerPrompt.includes('sacred') || lowerPrompt.includes('spiritual') || lowerPrompt.includes('ancient')) {
      loadPreset('SACRED');
      setLastInterpretation('🕉️ Sacred geometry...');
    } else if (lowerPrompt.includes('nebula') || lowerPrompt.includes('cloud')) {
      loadPreset('NEBULA');
      setLastInterpretation('☁️ Nebula forming...');
    } else if (lowerPrompt.includes('meditat') || lowerPrompt.includes('zen')) {
      loadPreset('MEDITATION');
      setLastInterpretation('🧘 Deep meditation...');
    } else if (lowerPrompt.includes('ocean') || lowerPrompt.includes('water') || lowerPrompt.includes('sea')) {
      loadPreset('OCEAN');
      setLastInterpretation('🌊 Ocean depths...');
    } else if (lowerPrompt.includes('desert') || lowerPrompt.includes('sand')) {
      loadPreset('DESERT');
      setLastInterpretation('🏜️ Desert eclipse...');
    } else if (lowerPrompt.includes('matrix') || lowerPrompt.includes('digital') || lowerPrompt.includes('code')) {
      loadPreset('MATRIX');
      setLastInterpretation('💚 Entering the Matrix...');
    } else if (lowerPrompt.includes('hyperdrive') || lowerPrompt.includes('warp') || lowerPrompt.includes('jump')) {
      loadPreset('HYPERDRIVE');
      setLastInterpretation('🚀 Engaging hyperdrive!');
    } else {
      // No match - show hint
      setLastInterpretation(geminiApiKey ? '🤔 Try being more specific' : '💡 Add Gemini API key for AI interpretation');
    }
  };

  const handleLoadPreset = (name: string) => {
    // Load preset locally first (always works)
    loadPreset(name);
    setLastInterpretation(`Loaded: ${name}`);

    // Also emit to backend if connected
    if (socket?.connected) {
      socket.emit('preset:load', { name });
    }
  };

  const handleHold = () => {
    // Apply locally
    updateVisualParameter('motionSpeed', 0);
    setLastInterpretation('HOLD - Motion frozen');

    // Also emit to backend if connected
    if (socket?.connected) {
      socket.emit('system:hold');
    }
  };

  const handleKill = () => {
    // Apply locally - fade to darkness
    updateVisualParameter('overallIntensity', 0);
    updateVisualParameter('starBrightness', 0);
    updateVisualParameter('colorBrightness', 0.1);
    setLastInterpretation('KILL - Fade to black');

    // Also emit to backend if connected
    if (socket?.connected) {
      socket.emit('system:kill');
    }
  };

  const handleReset = () => {
    // Load COSMOS preset locally
    loadPreset('COSMOS');
    setLastInterpretation('RESET - Returning to COSMOS');

    // Also emit to backend if connected
    if (socket?.connected) {
      socket.emit('system:reset');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-wider">
            DARTHANDER
          </h1>
          <span className="text-zinc-500">ECLIPSE</span>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'}`}
               title={connected ? 'Connected to backend' : 'Standalone mode'} />
        </div>

        <div className="flex items-center gap-4">
          <AudioEngine />
          <span className="text-zinc-500 text-sm">
            Phase: <span className="text-white">{visualState?.currentPhase || 'arrival'}</span>
          </span>
          <GeminiSettings />
          <SessionStatus sessionId={sessionId} onSessionChange={setSessionId} />
          <button
            onClick={() => {
              // IMPORTANT: Use ?display=true query param - main.tsx checks for this
              const displayUrl = `${window.location.origin}?display=true`;
              window.open(displayUrl, 'darthander_display', 'width=1920,height=1080');
            }}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            title="Open display window (YouTube 16:9 format)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-49px)]">
        {/* Left Panel - Preview & Prompt */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col">
          {/* Preview Monitor */}
          <div className="flex-1 p-4">
            <PreviewMonitor state={visualState} />
          </div>

          {/* Prompt Section */}
          <div className="border-t border-zinc-800 p-4 space-y-4">
            <PromptInput onSubmit={handlePromptSubmit} />

            <div className="flex items-center gap-4">
              <VoiceInput
                isActive={isVoiceActive}
                onToggle={() => setIsVoiceActive(!isVoiceActive)}
                onTranscription={handlePromptSubmit}
              />

              <div className="text-sm text-zinc-500">
                {lastPrompt && (
                  <div>
                    <span className="text-zinc-400">Last:</span> {lastPrompt}
                  </div>
                )}
                {lastInterpretation && (
                  <div className="text-purple-400">→ {lastInterpretation}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Controls (scrollable) */}
        <div className="w-1/2 flex flex-col overflow-y-auto">
          {/* Presets & Quick Actions */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-zinc-500">PRESETS</h2>
              <div className="flex gap-2">
                <BackgroundImageUpload />
                <AudioSourceSelector />
              </div>
            </div>
            <PresetGrid
              presets={presets}
              onSelect={handleLoadPreset}
              currentPreset={currentPreset}
            />

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleHold}
                className="flex-1 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded text-sm flex items-center justify-center gap-2"
              >
                <Pause className="w-4 h-4" />
                HOLD
              </button>
              <button
                onClick={handleKill}
                className="flex-1 py-2 px-4 bg-red-900/50 hover:bg-red-900 rounded text-sm flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4" />
                KILL
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded text-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                RESET
              </button>
            </div>
          </div>

          {/* Expanded Sliders - All Controls */}
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-sm text-zinc-500 mb-3">CONTROLS</h2>
            <ExpandedSliders showAudioMeters={true} />
          </div>

          {/* Vibe Layers Panel */}
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-sm text-zinc-500 mb-3">VIBE LAYERS</h2>
            <VibeLayerPanel />
          </div>

          {/* Audio Visualizer */}
          <div className="p-4 border-t border-zinc-800">
            <AudioVisualizer state={audioState} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
