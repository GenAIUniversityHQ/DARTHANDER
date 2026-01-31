// DARTHANDER Visual Consciousness Engine
// Gemini API Settings Component

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useStore } from '../store';

export function GeminiSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const { geminiApiKey, setGeminiApiKey } = useStore();

  const handleSave = () => {
    if (inputKey.trim()) {
      setGeminiApiKey(inputKey.trim());
      setInputKey('');
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setGeminiApiKey(null);
    setInputKey('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded transition-colors ${
          geminiApiKey
            ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-900'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        }`}
        title={geminiApiKey ? 'Gemini AI enabled' : 'Configure Gemini AI'}
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Gemini AI Settings
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-zinc-400 mb-4">
              Add your Gemini API key to enable AI-powered prompt interpretation.
              This allows natural language control of the visuals without a backend.
            </p>

            {geminiApiKey ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-700/50 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-300 text-sm">Gemini API key configured</span>
                </div>
                <button
                  onClick={handleClear}
                  className="w-full py-2 px-4 bg-red-900/50 hover:bg-red-900 rounded text-sm"
                >
                  Remove API Key
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Get your API key from{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
                <button
                  onClick={handleSave}
                  disabled={!inputKey.trim()}
                  className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium"
                >
                  Save API Key
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-medium mb-2">How it works</h3>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>• Type natural prompts like "go deeper" or "make it chaos"</li>
                <li>• Gemini interprets and adjusts visual parameters</li>
                <li>• Works offline without backend connection</li>
                <li>• Your API key is stored locally in your browser</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
