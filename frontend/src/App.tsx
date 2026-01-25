// DARTHANDER Visual Consciousness Engine
// Main Control Surface Application (Client-side Only - Netlify MVP)

import { useEffect, useState, useRef } from 'react';
import { useStore } from './store';
import { interpretPrompt, DEFAULT_VISUAL_STATE } from './services/gemini';
import { PreviewMonitor } from './components/PreviewMonitor';
import { PromptInput } from './components/PromptInput';
import { VoiceInput } from './components/VoiceInput';
import { PresetGrid } from './components/PresetGrid';
import { ParameterSliders } from './components/ParameterSliders';
import { AudioSourceSelector } from './components/AudioSourceSelector';
import { Square, Settings, Key, Video, Download, ExternalLink, X } from 'lucide-react';

function App() {
  const [lastInterpretation, setLastInterpretation] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

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

  // Handle prompt submission
  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim() || isProcessing) return;
    setIsProcessing(true);
    setLastInterpretation('Processing...');

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
    setLastInterpretation(`Loaded: ${preset.name}`);
  };

  const handleHold = () => {
    updateVisualParameter('motionSpeed', 0);
    setLastInterpretation('HOLD');
  };

  const handleKill = () => {
    setVisualState({ ...visualState, overallIntensity: 0, starBrightness: 0, colorBrightness: 0 });
    setLastInterpretation('KILL');
  };

  const handleReset = () => {
    setVisualState(DEFAULT_VISUAL_STATE);
    setLastInterpretation('RESET');
  };

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput);
    setShowSettings(false);
  };

  // Recording functions
  const startRecording = () => {
    const canvas = document.querySelector('#preview-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });

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

    const win = window.open('', 'DARTHANDER Display', 'width=1920,height=1080');
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
        destCanvas.width = win.innerWidth;
        destCanvas.height = win.innerHeight;
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
    <div className="h-screen overflow-hidden cosmic-bg text-white font-mono flex flex-col">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-xl p-5 max-w-sm w-full">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-neon-purple flex items-center gap-2">
                <Key className="w-4 h-4" /> API Key
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full glass-input rounded-lg px-3 py-2 text-sm mb-3"
            />
            <button onClick={handleSaveApiKey} className="w-full py-2 bg-neon-purple/30 border border-neon-purple/50 rounded-lg text-sm">
              Save
            </button>
          </div>
        </div>
      )}

      {/* Compact Header */}
      <header className="glass-panel border-b border-neon-purple/20 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-neon-purple to-neon-magenta bg-clip-text text-transparent">
            DARTHANDER
          </h1>
          <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-neon-cyan' : 'bg-yellow-500 animate-pulse'}`} />
        </div>

        <div className="flex items-center gap-2">
          {/* Recording Controls */}
          {!isRecording ? (
            <button onClick={startRecording} className="px-2 py-1 glass-button rounded text-[10px] flex items-center gap-1 text-neon-red hover:shadow-glow-red">
              <Video className="w-3 h-3" /> REC
            </button>
          ) : (
            <button onClick={stopRecording} className="px-2 py-1 bg-neon-red/30 border border-neon-red rounded text-[10px] flex items-center gap-1 text-neon-red animate-pulse">
              <Square className="w-3 h-3" /> {formatTime(recordingTime)}
            </button>
          )}

          {recordedChunks.length > 0 && !isRecording && (
            <button onClick={downloadRecording} className="px-2 py-1 glass-button rounded text-[10px] flex items-center gap-1 text-neon-cyan hover:shadow-glow-cyan">
              <Download className="w-3 h-3" /> SAVE
            </button>
          )}

          {/* Popout Display */}
          <button onClick={handlePopout} className="px-2 py-1 glass-button rounded text-[10px] flex items-center gap-1 text-neon-magenta hover:shadow-glow-magenta" title="Open display window (F)">
            <ExternalLink className="w-3 h-3" /> DISPLAY
          </button>

          <button onClick={() => setShowSettings(true)} className="p-1.5 glass-button rounded" title="Settings">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content - Horizontal Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Preview */}
        <div className="w-[45%] p-2 flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <PreviewMonitor state={visualState} canvasId="preview-canvas" />
          </div>

          {/* Prompt Bar */}
          <div className="mt-2 glass-panel rounded-lg p-2 flex items-center gap-2">
            <VoiceInput isActive={isVoiceActive} onToggle={() => setIsVoiceActive(!isVoiceActive)} onTranscription={handlePromptSubmit} />
            <div className="flex-1">
              <PromptInput onSubmit={handlePromptSubmit} compact />
            </div>
            <span className={`text-[9px] truncate max-w-[150px] ${isProcessing ? 'text-neon-cyan animate-pulse' : 'text-neon-magenta'}`}>
              {lastInterpretation || 'Ready'}
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-[55%] p-2 flex flex-col gap-2 min-h-0 overflow-y-auto">
          {/* Presets + Actions Row */}
          <div className="glass-panel rounded-lg p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-neon-purple/60 tracking-widest">PRESETS</span>
              <div className="flex gap-1">
                <button onClick={handleHold} className="px-2 py-1 glass-button rounded text-[9px] text-neon-cyan">HOLD</button>
                <button onClick={handleKill} className="px-2 py-1 bg-neon-red/10 border border-neon-red/30 rounded text-[9px] text-neon-red">KILL</button>
                <button onClick={handleReset} className="px-2 py-1 glass-button rounded text-[9px] text-neon-purple">RESET</button>
              </div>
            </div>
            <PresetGrid presets={presets} onSelect={handleLoadPreset} currentPreset={null} />
          </div>

          {/* Parameters */}
          <div className="glass-panel rounded-lg p-2 flex-1 min-h-0 overflow-y-auto">
            <span className="text-[9px] text-neon-purple/60 tracking-widest">CONTROLS</span>
            <ParameterSliders state={visualState} onChange={(p, v) => updateVisualParameter(p, v)} compact />
          </div>

          {/* Audio */}
          <div className="glass-panel rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-neon-purple/60 tracking-widest">AUDIO</span>
              <AudioSourceSelector />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
