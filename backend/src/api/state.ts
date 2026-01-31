// DARTHANDER Visual Consciousness Engine
// State API Routes

import { Router, Request, Response } from 'express';
import { 
  getCurrentState, 
  updateVisualState, 
  loadPreset,
  getAudioState,
  holdState,
  killVisuals,
  resetToCosmos,
} from '../services/state.js';
import { sendOSCUpdate } from '../osc/client.js';

const router = Router();

// ============================================
// GET /api/state
// Get current visual state
// ============================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const state = await getCurrentState();
    return res.json({ state });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get state' });
  }
});

// ============================================
// POST /api/state/preset
// Load a preset
// ============================================

router.post('/preset', async (req: Request, res: Response) => {
  try {
    const { name, transitionDuration } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Preset name is required' });
    }

    const result = await loadPreset(name, transitionDuration);
    
    sendOSCUpdate(result.state);
    
    const io = req.app.get('io');
    io.emit('state:update', result.state);
    io.emit('preset:loaded', { preset: name });

    return res.json({
      success: true,
      preset: name,
      state: result.state,
      transitionDuration: result.transitionDuration,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to load preset',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================
// POST /api/state/parameter
// Update single parameter
// ============================================

router.post('/parameter', async (req: Request, res: Response) => {
  try {
    const { parameter, value, transitionDuration } = req.body;

    if (!parameter) {
      return res.status(400).json({ error: 'Parameter name is required' });
    }

    const result = await updateVisualState(
      { [parameter]: value },
      transitionDuration || 1000
    );
    
    sendOSCUpdate(result.state);
    
    const io = req.app.get('io');
    io.emit('state:update', result.state);

    return res.json({
      success: true,
      parameter,
      value,
      state: result.state,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update parameter' });
  }
});

// ============================================
// POST /api/state/parameters
// Update multiple parameters
// ============================================

router.post('/parameters', async (req: Request, res: Response) => {
  try {
    const { parameters, transitionDuration } = req.body;

    if (!parameters || typeof parameters !== 'object') {
      return res.status(400).json({ error: 'Parameters object is required' });
    }

    const result = await updateVisualState(parameters, transitionDuration || 2000);
    
    sendOSCUpdate(result.state);
    
    const io = req.app.get('io');
    io.emit('state:update', result.state);

    return res.json({
      success: true,
      changes: result.changes,
      state: result.state,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update parameters' });
  }
});

// ============================================
// POST /api/state/hold
// Freeze current state
// ============================================

router.post('/hold', async (req: Request, res: Response) => {
  try {
    const result = await holdState();
    
    sendOSCUpdate(result.state);
    
    const io = req.app.get('io');
    io.emit('state:update', result.state);
    io.emit('state:held', {});

    return res.json({ success: true, state: result.state });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to hold state' });
  }
});

// ============================================
// POST /api/state/kill
// Fade to black
// ============================================

router.post('/kill', async (req: Request, res: Response) => {
  try {
    const result = await killVisuals();
    
    sendOSCUpdate(result.state);
    
    const io = req.app.get('io');
    io.emit('state:update', result.state);
    io.emit('state:killed', {});

    return res.json({ success: true, state: result.state });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to kill visuals' });
  }
});

// ============================================
// POST /api/state/reset
// Reset to COSMOS
// ============================================

router.post('/reset', async (req: Request, res: Response) => {
  try {
    const result = await resetToCosmos();
    
    sendOSCUpdate(result.state);
    
    const io = req.app.get('io');
    io.emit('state:update', result.state);
    io.emit('state:reset', {});

    return res.json({ success: true, state: result.state });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reset' });
  }
});

// ============================================
// GET /api/state/audio
// Get current audio analysis state
// ============================================

router.get('/audio', async (req: Request, res: Response) => {
  try {
    const state = await getAudioState();
    return res.json({ state });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get audio state' });
  }
});

export { router as stateRouter };
