// DARTHANDER Visual Consciousness Engine
// Main Control Surface Application

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from './store';
import { PreviewMonitor } from './components/PreviewMonitor';
import { PromptInput } from './components/PromptInput';
import { VoiceInput } from './components/VoiceInput';
import { PresetGrid } from './components/PresetGrid';
import { ParameterSliders } from './components/ParameterSliders';
import { AudioVisualizer } from './components/AudioVisualizer';
import { AudioSourceSelector } from './components/AudioSourceSelector';
import { SessionStatus } from './components/SessionStatus';
import { Pause, Square, RotateCcw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
    presets,
    setPresets,
    sessionId,
    setSessionId,
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

  // API calls
  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/prompt/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sessionId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setLastPrompt(prompt);
        setLastInterpretation(data.interpretation || data.action || 'Applied');
      }
    } catch (error) {
      console.error('Prompt error:', error);
    }
  };

  const handleLoadPreset = async (name: string) => {
    socket?.emit('preset:load', { name });
  };

  const handleHold = () => {
    socket?.emit('system:hold');
    setLastInterpretation('HOLD - Motion frozen');
  };

  const handleKill = () => {
    socket?.emit('system:kill');
    setLastInterpretation('KILL - Fade to black');
  };

  const handleReset = () => {
    socket?.emit('system:reset');
    setLastInterpretation('RESET - Returning to COSMOS');
  };

  const handleParameterChange = (parameter: string, value: number) => {
    socket?.emit('parameter:set', { parameter, value });
  };

  return (
    <div className="min-h-screen cosmic-bg text-white font-mono">
      {/* Header */}
      <header className="glass-panel border-b border-neon-purple/20 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-wider glow-text bg-gradient-to-r from-neon-purple to-neon-magenta bg-clip-text text-transparent">
            DARTHANDER
          </h1>
          <span className="text-neon-purple/60 font-display">ECLIPSE</span>
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            connected
              ? 'bg-neon-cyan shadow-glow-cyan'
              : 'bg-neon-red shadow-glow-red animate-pulse'
          }`} />
        </div>

        <div className="flex items-center gap-6">
          <span className="text-neon-purple/60 text-sm">
            Phase: <span className="text-neon-magenta font-medium">{visualState?.currentPhase || 'arrival'}</span>
          </span>
          <SessionStatus sessionId={sessionId} onSessionChange={setSessionId} />
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Panel - Preview & Prompt */}
        <div className="w-1/2 border-r border-neon-purple/10 flex flex-col">
          {/* Preview Monitor */}
          <div className="flex-1 p-4">
            <PreviewMonitor state={visualState} />
          </div>

          {/* Prompt Section */}
          <div className="glass-panel border-t border-neon-purple/20 p-4 space-y-4 m-4 rounded-xl">
            <PromptInput onSubmit={handlePromptSubmit} />

            <div className="flex items-center gap-4">
              <VoiceInput
                isActive={isVoiceActive}
                onToggle={() => setIsVoiceActive(!isVoiceActive)}
                onTranscription={handlePromptSubmit}
              />

              <div className="text-sm text-neon-purple/50 flex-1">
                {lastPrompt && (
                  <div className="truncate">
                    <span className="text-neon-purple/70">Last:</span> {lastPrompt}
                  </div>
                )}
                {lastInterpretation && (
                  <div className="text-neon-magenta truncate">→ {lastInterpretation}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="w-1/2 flex flex-col overflow-hidden p-4 gap-4">
          {/* Presets */}
          <div className="glass-panel rounded-xl p-4">
            <h2 className="text-xs text-neon-purple/60 mb-3 tracking-widest">PRESETS</h2>
            <PresetGrid
              presets={presets}
              onSelect={handleLoadPreset}
              currentPreset={null}
            />

            {/* Quick Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleHold}
                className="flex-1 py-2.5 px-4 glass-button rounded-lg text-sm flex items-center justify-center gap-2 text-neon-cyan hover:shadow-glow-cyan"
              >
                <Pause className="w-4 h-4" />
                HOLD
              </button>
              <button
                onClick={handleKill}
                className="flex-1 py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2
                           bg-neon-red/10 border border-neon-red/30 text-neon-red
                           hover:bg-neon-red/20 hover:border-neon-red/50 hover:shadow-glow-red transition-all"
              >
                <Square className="w-4 h-4" />
                KILL
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 px-4 glass-button rounded-lg text-sm flex items-center justify-center gap-2 text-neon-purple hover:shadow-glow-purple"
              >
                <RotateCcw className="w-4 h-4" />
                RESET
              </button>
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="glass-panel rounded-xl p-4 flex-1 overflow-y-auto">
            <h2 className="text-xs text-neon-purple/60 mb-3 tracking-widest">QUICK CONTROLS</h2>
            <ParameterSliders
              state={visualState}
              onChange={handleParameterChange}
            />
          </div>

          {/* Audio Section */}
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs text-neon-purple/60 tracking-widest">AUDIO</h2>
              <AudioSourceSelector />
            </div>
            <AudioVisualizer state={audioState} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
