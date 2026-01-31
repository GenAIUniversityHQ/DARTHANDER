// DARTHANDER Visual Consciousness Engine
// Background Image Upload Component

import React, { useState, useRef } from 'react';
import { Image, Upload, X, Trash2, CheckCircle } from 'lucide-react';
import { useStore } from '../store';

export function BackgroundImageUpload() {
  const { backgroundImage, setBackgroundImage } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(backgroundImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Create a data URL for the image
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      setBackgroundImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className={`
          px-2 py-1 text-[10px] rounded flex items-center gap-1 transition-colors
          ${backgroundImage
            ? 'bg-green-900/50 text-green-300 border border-green-500/50'
            : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-600'}
        `}
      >
        <Image className="w-3 h-3" />
        {backgroundImage ? 'BG SET' : 'BG IMAGE'}
      </button>

      {/* Upload Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div
            className="relative bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg mx-4 shadow-2xl"
            style={{ zIndex: 10000 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Background Image</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Image Preview */}
            {previewUrl && (
              <div className="mb-4 relative">
                <img
                  src={previewUrl}
                  alt="Background preview"
                  className="w-full h-40 object-cover rounded-lg border border-zinc-700"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 bg-red-900/80 hover:bg-red-800 text-white rounded-lg transition-colors"
                  title="Remove background"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-green-900/80 text-green-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </div>
              </div>
            )}

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${dragOver
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-zinc-500" />
                <div>
                  <p className="text-zinc-300">
                    {previewUrl ? 'Drop new image to replace' : 'Drop image here or click to browse'}
                  </p>
                  <p className="text-zinc-500 text-sm mt-1">JPG, PNG, GIF, WebP supported</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <p className="mt-4 text-xs text-zinc-500">
              The background image will be displayed behind the visual effects on both the preview and display window.
            </p>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
