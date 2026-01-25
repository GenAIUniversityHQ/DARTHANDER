// DARTHANDER Visual Consciousness Engine
// Main Control Surface Application

import React, { useEffect, useState } from 'react';
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
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Zap,
  Moon
} from 'lucide-react';

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
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-wider">
            DARTHANDER
          </h1>
          <span className="text-zinc-500">ECLIPSE</span>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 text-sm">
            Phase: <span className="text-white">{visualState?.currentPhase || 'arrival'}</span>
          </span>
          <SessionStatus sessionId={sessionId} onSessionChange={setSessionId} />
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
          {/* Presets */}
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-sm text-zinc-500 mb-3">PRESETS</h2>
            <PresetGrid 
              presets={presets} 
              onSelect={handleLoadPreset}
              currentPreset={null}
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

          {/* Parameter Sliders */}
          <div className="p-4 border-b border-zinc-800 flex-1 overflow-y-auto">
            <h2 className="text-sm text-zinc-500 mb-3">QUICK CONTROLS</h2>
            <ParameterSliders 
              state={visualState}
              onChange={handleParameterChange}
            />
          </div>

          {/* Audio Section */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-zinc-500">AUDIO</h2>
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
