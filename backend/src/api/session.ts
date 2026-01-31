// DARTHANDER Visual Consciousness Engine
// Session API Routes

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// GET /api/session
// List all sessions
// ============================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
    });

    return res.json({ sessions });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// ============================================
// GET /api/session/:id
// Get single session with logs
// ============================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { timestamp: 'asc' },
        },
        tracks: {
          include: { track: true },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({ session });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// ============================================
// POST /api/session/start
// Start a new session
// ============================================

router.post('/start', async (req: Request, res: Response) => {
  try {
    const { name, audioSource, autoPilot } = req.body;

    const session = await prisma.session.create({
      data: {
        name: name || `Session ${new Date().toISOString()}`,
        audioSource: audioSource || 'live',
        autoPilot: autoPilot || false,
      },
    });

    const io = req.app.get('io');
    io.emit('session:started', { sessionId: session.id, name: session.name });

    return res.json({ session });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to start session' });
  }
});

// ============================================
// POST /api/session/:id/end
// End a session
// ============================================

router.post('/:id/end', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await prisma.session.update({
      where: { id },
      data: { endedAt: new Date() },
    });

    const io = req.app.get('io');
    io.emit('session:ended', { sessionId: id });

    return res.json({ session });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to end session' });
  }
});

// ============================================
// POST /api/session/:id/log
// Add a log entry to session
// ============================================

router.post('/:id/log', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      promptReceived, 
      claudeInterpretation, 
      parametersChanged, 
      audioEnergyLevel,
      presetTriggered,
      notes,
    } = req.body;

    const log = await prisma.sessionLog.create({
      data: {
        sessionId: id,
        promptReceived,
        claudeInterpretation,
        parametersChanged,
        audioEnergyLevel,
        presetTriggered,
        notes,
      },
    });

    return res.json({ log });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create log' });
  }
});

// ============================================
// GET /api/session/:id/log
// Get session logs
// ============================================

router.get('/:id/log', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const logs = await prisma.sessionLog.findMany({
      where: { sessionId: id },
      orderBy: { timestamp: 'asc' },
    });

    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// ============================================
// POST /api/session/autopilot
// Toggle autopilot mode
// ============================================

router.post('/autopilot', async (req: Request, res: Response) => {
  try {
    const { enabled, sessionId } = req.body;

    if (sessionId) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { autoPilot: enabled },
      });
    }

    const io = req.app.get('io');
    io.emit('autopilot:toggle', { enabled });

    return res.json({ success: true, autoPilot: enabled });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle autopilot' });
  }
});

// ============================================
// DELETE /api/session/:id
// Delete a session
// ============================================

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete logs first (cascade should handle this but being explicit)
    await prisma.sessionLog.deleteMany({
      where: { sessionId: id },
    });

    await prisma.sessionTrack.deleteMany({
      where: { sessionId: id },
    });

    await prisma.session.delete({
      where: { id },
    });

    return res.json({ success: true, deleted: id });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete session' });
  }
});

export { router as sessionRouter };
