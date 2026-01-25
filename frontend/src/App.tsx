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
import { Square, Settings, Key, Video, Download, ExternalLink, X, Pause, Power, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';

function App() {
  const [lastInterpretation, setLastInterpretation] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Collapsible sections
  const [showPresets, setShowPresets] = useState(true);

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
    setActivePreset(preset.id);
    setLastInterpretation(`🎨 ${preset.name}`);
  };

  const handleHold = () => {
    updateVisualParameter('motionSpeed', 0);
    setLastInterpretation('⏸️ HOLD');
  };

  const handleKill = () => {
    setVisualState({ ...visualState, overallIntensity: 0, starBrightness: 0, colorBrightness: 0 });
    setLastInterpretation('🔴 KILL');
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
        {/* Left: VISUALIZER - The Star of the Show */}
        <div className="w-1/2 p-3 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-purple-500/20">
            <PreviewMonitor state={visualState} canvasId="preview-canvas" />
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

        {/* Right: CONTROLS - Big and Bold */}
        <div className="w-1/2 p-3 flex flex-col gap-2 min-h-0">
          {/* PRESETS - Collapsible */}
          <div className="bg-zinc-900/80 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <h2 className="text-sm font-black text-white/60 tracking-widest">PRESETS</h2>
              {showPresets ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
            </button>
            {showPresets && (
              <div className="px-4 pb-4">
                <PresetGrid presets={presets} onSelect={handleLoadPreset} currentPreset={presets.find(p => p.id === activePreset) || null} />
              </div>
            )}
          </div>

          {/* CONTROLS - Always visible, takes remaining space */}
          <div className="bg-zinc-900/80 backdrop-blur rounded-2xl border border-white/10 overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="px-4 py-2 border-b border-white/10 shrink-0">
              <h2 className="text-xs font-black text-white/60 tracking-widest">CONTROLS</h2>
            </div>
            <div className="px-3 py-2 overflow-y-auto flex-1">
              <ParameterSliders state={visualState} onChange={(p, v) => updateVisualParameter(p, v)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
