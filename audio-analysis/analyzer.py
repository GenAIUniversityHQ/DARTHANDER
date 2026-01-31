#!/usr/bin/env python3
"""
DARTHANDER Visual Consciousness Engine
Real-time Audio Analysis Service

This service performs real-time audio analysis and sends data to the backend.
"""

import numpy as np
import librosa
import soundfile as sf
import socketio
import requests
import json
import time
import threading
from queue import Queue
import argparse

# Configuration
API_URL = "http://localhost:3001"
SAMPLE_RATE = 44100
HOP_LENGTH = 512
FRAME_SIZE = 2048


class AudioAnalyzer:
    """Real-time audio analyzer with frequency band extraction."""

    def __init__(self, sample_rate=SAMPLE_RATE):
        self.sample_rate = sample_rate
        self.hop_length = HOP_LENGTH
        self.frame_size = FRAME_SIZE

        # Frequency band boundaries (Hz)
        self.bands = {
            'subBass': (20, 60),
            'bass': (60, 250),
            'lowMid': (250, 500),
            'mid': (500, 2000),
            'highMid': (2000, 4000),
            'presence': (4000, 6000),
            'brilliance': (6000, 20000),
        }

        # BPM tracking
        self.recent_bpm = []
        self.last_onset_time = 0
        self.onset_times = []

        # Smoothing
        self.smooth_factor = 0.3
        self.prev_values = {}

    def analyze_frame(self, audio_frame: np.ndarray) -> dict:
        """Analyze a single audio frame."""
        # Ensure mono
        if len(audio_frame.shape) > 1:
            audio_frame = np.mean(audio_frame, axis=1)

        # Compute FFT
        fft = np.abs(np.fft.rfft(audio_frame * np.hanning(len(audio_frame))))
        freqs = np.fft.rfftfreq(len(audio_frame), 1 / self.sample_rate)

        # Extract frequency bands
        band_values = {}
        for band_name, (low, high) in self.bands.items():
            mask = (freqs >= low) & (freqs < high)
            if np.any(mask):
                band_energy = np.mean(fft[mask])
                # Normalize and smooth
                normalized = min(1.0, band_energy / 1000)  # Adjust divisor as needed
                
                if band_name in self.prev_values:
                    normalized = (self.smooth_factor * normalized + 
                                  (1 - self.smooth_factor) * self.prev_values[band_name])
                
                self.prev_values[band_name] = normalized
                band_values[band_name] = float(normalized)
            else:
                band_values[band_name] = 0.0

        # Overall amplitude
        amplitude = float(np.mean(np.abs(audio_frame)))
        peak_amplitude = float(np.max(np.abs(audio_frame)))

        # Spectral features
        spectral_centroid = librosa.feature.spectral_centroid(
            y=audio_frame, sr=self.sample_rate, n_fft=self.frame_size
        )
        centroid_normalized = float(np.mean(spectral_centroid) / (self.sample_rate / 2))

        # Spectral flux (rate of change)
        spectral_flux = float(np.mean(np.abs(np.diff(fft))))

        # Onset detection for beat tracking
        onset_env = librosa.onset.onset_strength(
            y=audio_frame, sr=self.sample_rate, hop_length=self.hop_length
        )
        beat_intensity = float(np.mean(onset_env))

        return {
            **band_values,
            'overallAmplitude': min(1.0, amplitude * 10),
            'peakAmplitude': min(1.0, peak_amplitude),
            'spectralCentroid': centroid_normalized,
            'spectralFlux': min(1.0, spectral_flux / 100),
            'beatIntensity': min(1.0, beat_intensity),
            'detectedBpm': self.estimate_bpm(onset_env),
        }

    def estimate_bpm(self, onset_env: np.ndarray) -> float:
        """Estimate BPM from onset envelope."""
        try:
            tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=self.sample_rate)
            bpm = float(tempo) if np.isscalar(tempo) else float(tempo[0])
            
            # Smooth BPM estimate
            self.recent_bpm.append(bpm)
            if len(self.recent_bpm) > 10:
                self.recent_bpm.pop(0)
            
            return float(np.median(self.recent_bpm))
        except:
            return 120.0  # Default


class TrackAnalyzer:
    """Analyzes complete audio tracks for pre-processing."""

    def __init__(self, sample_rate=SAMPLE_RATE):
        self.sample_rate = sample_rate
        self.analyzer = AudioAnalyzer(sample_rate)

    def analyze_track(self, file_path: str) -> dict:
        """Analyze a complete audio track."""
        print(f"Loading track: {file_path}")
        
        # Load audio
        y, sr = librosa.load(file_path, sr=self.sample_rate)
        duration = librosa.get_duration(y=y, sr=sr)

        print(f"Duration: {duration:.1f}s, Sample rate: {sr}")

        # Global tempo
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        bpm = float(tempo) if np.isscalar(tempo) else float(tempo[0])
        print(f"Detected BPM: {bpm:.1f}")

        # Key detection (simplified)
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        key_idx = np.argmax(np.sum(chroma, axis=1))
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        detected_key = keys[key_idx]

        # Overall energy
        rms = librosa.feature.rms(y=y)
        overall_energy = float(np.mean(rms))

        # Mood estimation (simplified based on spectral features)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        brightness = float(np.mean(spectral_centroid) / (sr / 2))
        
        if brightness > 0.4 and overall_energy > 0.5:
            mood = 'euphoric'
        elif brightness < 0.3 and overall_energy < 0.3:
            mood = 'dark'
        elif overall_energy > 0.6:
            mood = 'driving'
        else:
            mood = 'melancholic'

        # Section detection
        sections = self.detect_sections(y, sr)

        # Timeline analysis (per-second data)
        timeline = self.create_timeline(y, sr)

        # Suggested starting preset
        if mood == 'dark':
            suggested_preset = 'VOID'
        elif mood == 'euphoric':
            suggested_preset = 'EMERGENCE'
        elif mood == 'driving':
            suggested_preset = 'FRACTAL_BLOOM'
        else:
            suggested_preset = 'COSMOS'

        return {
            'duration': duration,
            'bpm': bpm,
            'key': detected_key,
            'overallEnergy': overall_energy,
            'mood': mood,
            'sections': sections,
            'analysisTimeline': timeline,
            'suggestedPreset': suggested_preset,
        }

    def detect_sections(self, y: np.ndarray, sr: int) -> list:
        """Detect song sections using spectral clustering."""
        try:
            # Compute beat-synchronous chroma
            chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
            
            # Simple segmentation based on spectral changes
            bounds = librosa.segment.agglomerative(chroma, k=8)
            bound_times = librosa.frames_to_time(bounds, sr=sr)

            sections = []
            section_types = ['intro', 'verse', 'buildup', 'chorus', 'breakdown', 'drop', 'outro']
            
            for i in range(len(bound_times) - 1):
                start = float(bound_times[i])
                end = float(bound_times[i + 1])
                
                # Get energy for this section
                start_frame = int(start * sr)
                end_frame = int(end * sr)
                section_audio = y[start_frame:end_frame]
                
                rms = librosa.feature.rms(y=section_audio)
                energy = float(np.mean(rms))
                
                # Estimate section type based on energy
                if i == 0:
                    section_type = 'intro'
                elif i == len(bound_times) - 2:
                    section_type = 'outro'
                elif energy > 0.6:
                    section_type = 'drop' if i > 2 else 'chorus'
                elif energy < 0.3:
                    section_type = 'breakdown'
                else:
                    section_type = 'verse'

                sections.append({
                    'start': start,
                    'end': end,
                    'type': section_type,
                    'energy': energy,
                    'suggestedPreset': self.suggest_preset_for_section(section_type, energy),
                })

            return sections
        except Exception as e:
            print(f"Section detection error: {e}")
            return []

    def suggest_preset_for_section(self, section_type: str, energy: float) -> str:
        """Suggest a preset based on section type."""
        presets = {
            'intro': 'COSMOS',
            'verse': 'EMERGENCE',
            'buildup': 'DESCENT',
            'chorus': 'PORTAL',
            'breakdown': 'VOID',
            'drop': 'FRACTAL_BLOOM',
            'outro': 'RETURN',
        }
        return presets.get(section_type, 'COSMOS')

    def create_timeline(self, y: np.ndarray, sr: int, resolution: float = 1.0) -> list:
        """Create per-second analysis timeline."""
        duration = len(y) / sr
        timeline = []

        samples_per_window = int(sr * resolution)

        for i in range(int(duration / resolution)):
            start_sample = i * samples_per_window
            end_sample = min(start_sample + samples_per_window, len(y))
            window = y[start_sample:end_sample]

            # Basic features
            rms = float(np.mean(librosa.feature.rms(y=window)))
            spectral_centroid = librosa.feature.spectral_centroid(y=window, sr=sr)
            brightness = float(np.mean(spectral_centroid) / (sr / 2))

            timeline.append({
                'time': float(i * resolution),
                'energy': min(1.0, rms * 10),
                'brightness': brightness,
            })

        return timeline


def send_realtime_analysis(data: dict):
    """Send real-time analysis to backend."""
    try:
        requests.post(
            f"{API_URL}/api/audio/realtime",
            json=data,
            timeout=0.5
        )
    except Exception as e:
        print(f"Failed to send analysis: {e}")


def analyze_file(file_path: str, track_id: str):
    """Analyze a complete file and send results to backend."""
    analyzer = TrackAnalyzer()
    
    try:
        results = analyzer.analyze_track(file_path)
        results['trackId'] = track_id
        
        response = requests.post(
            f"{API_URL}/api/audio/analysis",
            json=results,
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"Analysis complete for track {track_id}")
        else:
            print(f"Failed to save analysis: {response.text}")
            
    except Exception as e:
        print(f"Analysis error: {e}")


def main():
    parser = argparse.ArgumentParser(description='DARTHANDER Audio Analysis Service')
    parser.add_argument('--mode', choices=['realtime', 'file'], default='realtime',
                        help='Analysis mode')
    parser.add_argument('--file', type=str, help='File path for file mode')
    parser.add_argument('--track-id', type=str, help='Track ID for file mode')
    parser.add_argument('--api-url', type=str, default=API_URL, help='Backend API URL')
    
    args = parser.parse_args()
    
    global API_URL
    API_URL = args.api_url

    if args.mode == 'file':
        if not args.file or not args.track_id:
            print("File mode requires --file and --track-id")
            return
        analyze_file(args.file, args.track_id)
    else:
        print("Real-time mode requires audio input device - not implemented in this example")
        print("Use with pyaudio or sounddevice for microphone/line-in capture")


if __name__ == "__main__":
    main()
