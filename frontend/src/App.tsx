// DARTHANDER Visual Consciousness Engine
// Main Control Surface Application (Client-side Only - Netlify MVP)

import { useEffect, useState } from 'react';
import { useStore } from './store';
import { interpretPrompt, DEFAULT_VISUAL_STATE } from './services/gemini';
import { PreviewMonitor } from './components/PreviewMonitor';
import { PromptInput } from './components/PromptInput';
import { VoiceInput } from './components/VoiceInput';
import { PresetGrid } from './components/PresetGrid';
import { ParameterSliders } from './components/ParameterSliders';
import { AudioVisualizer } from './components/AudioVisualizer';
import { AudioSourceSelector } from './components/AudioSourceSelector';
import { SessionStatus } from './components/SessionStatus';
import { Pause, Square, RotateCcw, Settings, Key } from 'lucide-react';

function App() {
  const [lastPrompt, setLastPrompt] = useState('');
  const [lastInterpretation, setLastInterpretation] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const {
    visualState,
    audioState,
    setVisualState,
    applyParameterChanges,
    updateVisualParameter,
    presets,
    loadPreset,
    sessionId,
    setSessionId,
    apiKey,
    setApiKey,
  } = useStore();

  // Initialize API key input from stored value
  useEffect(() => {
    if (apiKey) {
      setApiKeyInput(apiKey);
    }
  }, [apiKey]);

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
        case '9':
          const index = parseInt(e.key) - 1;
          if (presets[index]) {
            handleLoadPreset(presets[index]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presets, isVoiceActive]);

  // Handle prompt submission - uses client-side Gemini
  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    setLastPrompt(prompt);
    setLastInterpretation('Processing...');

    try {
      const result = await interpretPrompt(prompt, visualState, apiKey || undefined);

      if (result.success && result.parameterChanges) {
        applyParameterChanges(result.parameterChanges);
        setLastInterpretation(result.interpretation || 'Applied');
      } else {
        setLastInterpretation(result.error || 'Could not interpret');
      }
    } catch (error) {
      console.error('Prompt error:', error);
      setLastInterpretation('Error processing prompt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadPreset = (preset: typeof presets[0]) => {
    loadPreset(preset);
    setLastInterpretation(`Loaded preset: ${preset.name}`);
  };

  const handleHold = () => {
    updateVisualParameter('motionSpeed', 0);
    setLastInterpretation('HOLD - Motion frozen');
  };

  const handleKill = () => {
    setVisualState({
      ...visualState,
      overallIntensity: 0,
      starBrightness: 0,
      colorBrightness: 0,
    });
    setLastInterpretation('KILL - Fade to black');
  };

  const handleReset = () => {
    setVisualState(DEFAULT_VISUAL_STATE);
    setLastInterpretation('RESET - Returning to COSMOS');
  };

  const handleParameterChange = (parameter: string, value: number) => {
    updateVisualParameter(parameter, value);
  };

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput);
    setShowSettings(false);
    setLastInterpretation('API key saved!');
  };

  return (
    <div className="min-h-screen cosmic-bg text-white font-mono">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-neon-purple mb-4 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Gemini API Key
            </h2>
            <p className="text-sm text-white/60 mb-4">
              Enter your Gemini API key for AI-powered prompt interpretation.
              Without a key, basic keyword commands still work.
            </p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full glass-input rounded-lg px-4 py-3 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 glass-button rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="flex-1 py-2 bg-neon-purple/30 border border-neon-purple/50 rounded-lg hover:bg-neon-purple/40 transition-all"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-white/40 mt-4">
              Get a free API key at{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline">
                aistudio.google.com
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="glass-panel border-b border-neon-purple/20 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-wider glow-text bg-gradient-to-r from-neon-purple to-neon-magenta bg-clip-text text-transparent">
            DARTHANDER
          </h1>
          <span className="text-neon-purple/60 font-display">ECLIPSE</span>
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            apiKey
              ? 'bg-neon-cyan shadow-glow-cyan'
              : 'bg-yellow-500 animate-pulse'
          }`} title={apiKey ? 'AI Enabled' : 'Keyword Mode (set API key for AI)'} />
        </div>

        <div className="flex items-center gap-6">
          <span className="text-neon-purple/60 text-sm">
            Phase: <span className="text-neon-magenta font-medium">{visualState?.currentPhase || 'arrival'}</span>
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 glass-button rounded-lg hover:shadow-glow-purple transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
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
                  <div className={`truncate ${isProcessing ? 'text-neon-cyan animate-pulse' : 'text-neon-magenta'}`}>
                    → {lastInterpretation}
                  </div>
                )}
              </div>
            </div>

            {!apiKey && (
              <div className="text-xs text-yellow-400/70 bg-yellow-500/10 rounded-lg px-3 py-2">
                Keywords work: portal, void, deeper, home, mandala, fire, ice, spiral, chaos, calm.
                <button onClick={() => setShowSettings(true)} className="text-neon-cyan ml-1 hover:underline">
                  Add API key
                </button> for full AI prompts.
              </div>
            )}
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
