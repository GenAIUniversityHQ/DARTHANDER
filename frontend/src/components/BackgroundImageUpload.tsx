// DARTHANDER Visual Consciousness Engine
// Background Image Upload Component - Add custom background images to the visualizer

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';
import { ImagePlus, X, Eye, EyeOff, Trash2, ChevronDown } from 'lucide-react';

const BLEND_MODES: { value: GlobalCompositeOperation; label: string }[] = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'luminosity', label: 'Luminosity' },
  { value: 'saturation', label: 'Saturation' },
];

export function BackgroundImageUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; right: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { backgroundImage, setBackgroundImage, clearBackgroundImage } = useStore();

  // Calculate panel position when opening
  const updatePanelPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePanelPosition();
    }
  }, [isOpen, updatePanelPosition]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Revoke old URL if exists
    if (backgroundImage.url) {
      URL.revokeObjectURL(backgroundImage.url);
    }

    // Create object URL for the image
    const url = URL.createObjectURL(file);
    setBackgroundImage({ url, enabled: true });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    clearBackgroundImage();
  };

  const toggleEnabled = () => {
    setBackgroundImage({ enabled: !backgroundImage.enabled });
  };

  const dropdownPanel = isOpen && panelPos ? createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <div
        className="fixed w-72 bg-zinc-900 border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
        style={{ top: panelPos.top, right: panelPos.right }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <span className="text-sm font-bold text-white">Background Image</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Upload Button / Preview */}
          {!backgroundImage.url ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all">
              <ImagePlus className="w-8 h-8 text-white/40 mb-2" />
              <span className="text-sm text-white/60">Click to upload image</span>
              <span className="text-xs text-white/40 mt-1">PNG, JPG, GIF, WebP</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-3">
              {/* Image Preview */}
              <div className="relative w-full h-24 rounded-lg overflow-hidden border border-white/10">
                <img
                  src={backgroundImage.url}
                  alt="Background"
                  className="w-full h-full object-cover"
                  style={{ opacity: backgroundImage.enabled ? 1 : 0.3 }}
                />
                {!backgroundImage.enabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-xs text-white/60 font-bold">DISABLED</span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={toggleEnabled}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    backgroundImage.enabled
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-zinc-700 hover:bg-zinc-600 text-white/70'
                  }`}
                >
                  {backgroundImage.enabled ? (
                    <><Eye className="w-3.5 h-3.5" /> Visible</>
                  ) : (
                    <><EyeOff className="w-3.5 h-3.5" /> Hidden</>
                  )}
                </button>
                <button
                  onClick={handleRemove}
                  className="px-3 py-2 bg-red-600/80 hover:bg-red-500 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>

              {/* Replace */}
              <label className="flex items-center justify-center w-full py-2 border border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all">
                <ImagePlus className="w-4 h-4 text-white/60 mr-2" />
                <span className="text-xs text-white/60">Replace Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Controls (only show when image is loaded) */}
          {backgroundImage.url && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              {/* Opacity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-white/70">Opacity</label>
                  <span className="text-xs text-white/50">{Math.round(backgroundImage.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={backgroundImage.opacity}
                  onChange={(e) => setBackgroundImage({ opacity: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Blend Mode */}
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Blend Mode</label>
                <select
                  value={backgroundImage.blendMode}
                  onChange={(e) => setBackgroundImage({ blendMode: e.target.value as GlobalCompositeOperation })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {BLEND_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scale */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-white/70">Scale</label>
                  <span className="text-xs text-white/50">{Math.round(backgroundImage.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={backgroundImage.scale}
                  onChange={(e) => setBackgroundImage({ scale: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105 ${
          backgroundImage.url
            ? backgroundImage.enabled
              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-zinc-600 text-white/70'
            : 'bg-zinc-700 hover:bg-zinc-600 text-white/70'
        }`}
        title="Background Image"
      >
        <ImagePlus className="w-4 h-4" />
        BG
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownPanel}
    </div>
  );
}
