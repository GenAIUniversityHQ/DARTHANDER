// DARTHANDER Visual Consciousness Engine
// Audio API Routes

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/audio';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ============================================
// GET /api/audio/tracks
// List all uploaded tracks
// ============================================

router.get('/tracks', async (req: Request, res: Response) => {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ tracks });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// ============================================
// GET /api/audio/tracks/:id
// Get single track details
// ============================================

router.get('/tracks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const track = await prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    return res.json({ track });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch track' });
  }
});

// ============================================
// POST /api/audio/upload
// Upload a new audio track
// ============================================

router.post('/upload', async (req: Request, res: Response) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioFile = req.files.file as any;
    const { title, artist, album } = req.body;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/ogg'];
    if (!allowedTypes.includes(audioFile.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Allowed: MP3, WAV, FLAC, M4A, OGG' 
      });
    }

    // Generate unique filename
    const ext = path.extname(audioFile.name);
    const uniqueName = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    // Move file to uploads directory
    await audioFile.mv(filePath);

    // Create track record
    const track = await prisma.track.create({
      data: {
        filename: audioFile.name,
        filePath: filePath,
        fileSize: BigInt(audioFile.size),
        title: title || audioFile.name.replace(ext, ''),
        artist: artist || null,
        album: album || null,
      },
    });

    // Emit event for background analysis
    const io = req.app.get('io');
    io.emit('track:uploaded', { trackId: track.id, filename: track.filename });

    // Queue for analysis (would be handled by Python service)
    // This is a placeholder - actual analysis happens in the Python service
    io.emit('track:analyze', { trackId: track.id, filePath: track.filePath });

    return res.json({
      success: true,
      track: {
        ...track,
        fileSize: track.fileSize?.toString(),
      },
      message: 'Track uploaded. Analysis starting in background.',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload track' });
  }
});

// ============================================
// PUT /api/audio/tracks/:id
// Update track metadata or analysis
// ============================================

router.put('/tracks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.filePath;
    delete updates.createdAt;

    const track = await prisma.track.update({
      where: { id },
      data: updates,
    });

    return res.json({ track });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update track' });
  }
});

// ============================================
// DELETE /api/audio/tracks/:id
// Delete a track
// ============================================

router.delete('/tracks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const track = await prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Delete file
    if (fs.existsSync(track.filePath)) {
      fs.unlinkSync(track.filePath);
    }

    // Delete record
    await prisma.track.delete({
      where: { id },
    });

    return res.json({ success: true, deleted: id });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete track' });
  }
});

// ============================================
// POST /api/audio/source
// Switch audio source
// ============================================

router.post('/source', async (req: Request, res: Response) => {
  try {
    const { source } = req.body; // 'upload', 'live', 'stream'

    if (!['upload', 'live', 'stream'].includes(source)) {
      return res.status(400).json({ error: 'Invalid source. Use: upload, live, stream' });
    }

    const io = req.app.get('io');
    io.emit('audio:source', { source });

    return res.json({ success: true, source });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to switch audio source' });
  }
});

// ============================================
// POST /api/audio/play
// Play an uploaded track
// ============================================

router.post('/play', async (req: Request, res: Response) => {
  try {
    const { trackId, position } = req.body;

    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Update last played
    await prisma.track.update({
      where: { id: trackId },
      data: { lastPlayedAt: new Date() },
    });

    const io = req.app.get('io');
    io.emit('audio:play', {
      trackId,
      filePath: track.filePath,
      position: position || 0,
      track: {
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        bpm: track.bpm,
        sections: track.sections,
      },
    });

    return res.json({
      success: true,
      playing: {
        trackId,
        title: track.title,
        position: position || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to play track' });
  }
});

// ============================================
// POST /api/audio/pause
// Pause playback
// ============================================

router.post('/pause', async (req: Request, res: Response) => {
  try {
    const io = req.app.get('io');
    io.emit('audio:pause', {});

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to pause' });
  }
});

// ============================================
// POST /api/audio/seek
// Seek to position
// ============================================

router.post('/seek', async (req: Request, res: Response) => {
  try {
    const { position } = req.body; // in seconds

    const io = req.app.get('io');
    io.emit('audio:seek', { position });

    return res.json({ success: true, position });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to seek' });
  }
});

// ============================================
// POST /api/audio/analysis
// Receive audio analysis from Python service
// ============================================

router.post('/analysis', async (req: Request, res: Response) => {
  try {
    const {
      trackId,
      bpm,
      key,
      overallEnergy,
      mood,
      sections,
      analysisTimeline,
      duration,
      suggestedPreset,
    } = req.body;

    const track = await prisma.track.update({
      where: { id: trackId },
      data: {
        bpm,
        key,
        overallEnergy,
        mood,
        sections,
        analysisTimeline,
        duration,
        suggestedPreset,
      },
    });

    const io = req.app.get('io');
    io.emit('track:analyzed', { trackId, track });

    return res.json({ success: true, track });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save analysis' });
  }
});

// ============================================
// POST /api/audio/realtime
// Receive real-time audio analysis
// ============================================

router.post('/realtime', async (req: Request, res: Response) => {
  try {
    const {
      subBass,
      bass,
      lowMid,
      mid,
      highMid,
      presence,
      brilliance,
      overallAmplitude,
      peakAmplitude,
      dynamicRange,
      detectedBpm,
      beatIntensity,
      onsetDensity,
      spectralCentroid,
      spectralFlux,
      harmonicRatio,
    } = req.body;

    // Update audio state in database
    const audioState = await prisma.audioState.findFirst({
      where: { isActive: true },
    });

    if (audioState) {
      await prisma.audioState.update({
        where: { id: audioState.id },
        data: {
          subBass: subBass ?? audioState.subBass,
          bass: bass ?? audioState.bass,
          lowMid: lowMid ?? audioState.lowMid,
          mid: mid ?? audioState.mid,
          highMid: highMid ?? audioState.highMid,
          presence: presence ?? audioState.presence,
          brilliance: brilliance ?? audioState.brilliance,
          overallAmplitude: overallAmplitude ?? audioState.overallAmplitude,
          peakAmplitude: peakAmplitude ?? audioState.peakAmplitude,
          dynamicRange: dynamicRange ?? audioState.dynamicRange,
          detectedBpm: detectedBpm ?? audioState.detectedBpm,
          beatIntensity: beatIntensity ?? audioState.beatIntensity,
          onsetDensity: onsetDensity ?? audioState.onsetDensity,
          spectralCentroid: spectralCentroid ?? audioState.spectralCentroid,
          spectralFlux: spectralFlux ?? audioState.spectralFlux,
          harmonicRatio: harmonicRatio ?? audioState.harmonicRatio,
        },
      });
    }

    // Broadcast to all clients
    const io = req.app.get('io');
    io.emit('audio:analysis', req.body);

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process audio analysis' });
  }
});

export { router as audioRouter };
