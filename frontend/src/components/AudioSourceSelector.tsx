// DARTHANDER Visual Consciousness Engine
// Audio Source Selector Component

import React, { useState, useRef } from 'react';
import { Radio, Upload, Wifi, X, Music, CheckCircle, Loader } from 'lucide-react';
import { useStore } from '../store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AudioSourceSelector() {
  const { audioSource, setAudioSource, tracks, setTracks } = useStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sources = [
    { key: 'live', label: 'LIVE', icon: Radio },
    { key: 'upload', label: 'FILE', icon: Upload },
    { key: 'stream', label: 'STREAM', icon: Wifi },
  ] as const;

  const handleSourceChange = async (source: 'upload' | 'live' | 'stream') => {
    if (source === 'upload') {
      setShowUploadModal(true);
    }

    setAudioSource(source);

    try {
      await fetch(`${API_URL}/api/audio/source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      });
    } catch (error) {
      console.error('Failed to switch audio source:', error);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/ogg', 'audio/x-m4a'];

    if (!allowedTypes.includes(file.type)) {
      setUploadProgress('Error: Invalid file type. Use MP3, WAV, FLAC, M4A, or OGG');
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

    try {
      const response = await fetch(`${API_URL}/api/audio/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadProgress('Upload complete!');
        // Refresh tracks list
        const tracksResponse = await fetch(`${API_URL}/api/audio/tracks`);
        const tracksData = await tracksResponse.json();
        if (tracksData.tracks) {
          setTracks(tracksData.tracks);
        }
        setTimeout(() => {
          setUploadProgress('');
        }, 2000);
      } else {
        setUploadProgress(`Error: ${data.error || 'Upload failed'}`);
      }
    } catch (error) {
      setUploadProgress('Error: Failed to upload file');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const playTrack = async (trackId: string) => {
    try {
      await fetch(`${API_URL}/api/audio/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  return (
    <>
      <div className="flex gap-1">
        {sources.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleSourceChange(key)}
            className={`
              px-2 py-1 text-[10px] rounded flex items-center gap-1 transition-colors
              ${audioSource === key
                ? 'bg-purple-900/50 text-purple-300 border border-purple-500/50'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-600'}
            `}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          />

          {/* Modal Content */}
          <div
            className="relative bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg mx-4 shadow-2xl"
            style={{ zIndex: 10000 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Upload Audio</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                accept="audio/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-10 h-10 text-purple-500 animate-spin" />
                  <p className="text-zinc-300">{uploadProgress}</p>
                </div>
              ) : uploadProgress.includes('complete') ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                  <p className="text-green-400">{uploadProgress}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-10 h-10 text-zinc-500" />
                  <div>
                    <p className="text-zinc-300">Drop audio file here or click to browse</p>
                    <p className="text-zinc-500 text-sm mt-1">MP3, WAV, FLAC, M4A, OGG supported</p>
                  </div>
                  {uploadProgress && uploadProgress.includes('Error') && (
                    <p className="text-red-400 text-sm">{uploadProgress}</p>
                  )}
                </div>
              )}
            </div>

            {/* Tracks List */}
            {tracks && tracks.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm text-zinc-500 mb-2">UPLOADED TRACKS</h3>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {tracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => playTrack(track.id)}
                      className="w-full flex items-center gap-3 p-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-left"
                    >
                      <Music className="w-4 h-4 text-purple-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{track.title || track.filename}</p>
                        {track.artist && (
                          <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
                        )}
                      </div>
                      {track.bpm && (
                        <span className="text-xs text-zinc-500">{track.bpm} BPM</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setShowUploadModal(false)}
              className="mt-4 w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
