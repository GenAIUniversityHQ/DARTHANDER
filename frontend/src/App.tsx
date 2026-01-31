// DARTHANDER Visual Consciousness Engine
// Main Control Surface Application

import { useEffect, useState } from 'react';
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
  const systemPrompt = `You are the interpretive layer for DARTHANDER: ECLIPSE, a live immersive audiovisual experience. Translate natural language prompts into precise parameter changes.

Available parameters:
- geometryMode: stars, mandala, hexagon, fractal, spiral, tunnel, void
- colorPalette: cosmos, void, fire, ice, earth, neon, sacred
- motionDirection: outward, inward, clockwise, counter, breathing, still
- motionSpeed: 0.0 to 1.0
- geometryComplexity: 0.0 to 1.0
- overallIntensity: 0.0 to 1.0
- eclipsePhase: 0.0 to 1.0
- coronaIntensity: 0.0 to 1.0
- chaosFactor: 0.0 to 1.0
- starDensity: 0.0 to 1.0
- starBrightness: 0.0 to 1.0

Current state: ${JSON.stringify(currentState)}

Respond ONLY with valid JSON:
{
  "interpretation": "Brief description",
  "parameter_changes": { "parameter_name": value }
}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nPrompt: "${prompt}"` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
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

    newSocket.on('state:current', (data: any) => {
      if (data.visual) setVisualState(data.visual);
      if (data.audio) setAudioState(data.audio);
    });

    newSocket.on('state:update', (state: any) => {
      setVisualState(state);
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

  // API calls with Gemini fallback
  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;

    setLastPrompt(prompt);
    setLastInterpretation('Processing...');

    // Try backend first if connected
    if (connected) {
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
        console.log('Backend unavailable, trying Gemini...');
      }
    }

    // Fall back to Gemini if available
    if (geminiApiKey) {
      const result = await interpretWithGemini(prompt, geminiApiKey, visualState);
      if (result && result.parameter_changes) {
        // Apply the parameter changes
        Object.entries(result.parameter_changes).forEach(([key, value]) => {
          updateVisualParameter(key, value);
        });
        setLastInterpretation(result.interpretation || 'Applied via Gemini');
        return;
      }
    }

    // Simple keyword matching fallback
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('dark') || lowerPrompt.includes('void')) {
      loadPreset('VOID');
      setLastInterpretation('Entering the void...');
    } else if (lowerPrompt.includes('chaos') || lowerPrompt.includes('intense')) {
      loadPreset('FRACTAL_BLOOM');
      setLastInterpretation('Unleashing chaos...');
    } else if (lowerPrompt.includes('calm') || lowerPrompt.includes('peace')) {
      loadPreset('COSMOS');
      setLastInterpretation('Finding peace in the cosmos...');
    } else if (lowerPrompt.includes('eclipse') || lowerPrompt.includes('total')) {
      loadPreset('TOTALITY');
      setLastInterpretation('Entering totality...');
    } else if (lowerPrompt.includes('portal') || lowerPrompt.includes('tunnel')) {
      loadPreset('PORTAL');
      setLastInterpretation('Opening the portal...');
    } else if (lowerPrompt.includes('spiral') || lowerPrompt.includes('descend')) {
      loadPreset('DESCENT');
      setLastInterpretation('Beginning descent...');
    } else {
      setLastInterpretation('Try: dark, chaos, calm, eclipse, portal, spiral');
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
              const displayUrl = `${window.location.origin}/display`;
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

        {/* Right Panel - Controls */}
        <div className="w-1/2 flex flex-col overflow-hidden">
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
          <div className="p-4 flex-1 overflow-y-auto">
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
