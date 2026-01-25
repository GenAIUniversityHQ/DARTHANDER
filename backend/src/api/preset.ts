// DARTHANDER Visual Consciousness Engine
// Preset API Routes

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// GET /api/preset
// List all presets
// ============================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const presets = await prisma.preset.findMany({
      orderBy: [
        { isCore: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return res.json({ presets });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch presets' });
  }
});

// ============================================
// GET /api/preset/core
// List only core presets
// ============================================

router.get('/core', async (req: Request, res: Response) => {
  try {
    const presets = await prisma.preset.findMany({
      where: { isCore: true },
      orderBy: { sortOrder: 'asc' },
    });

    return res.json({ presets });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch core presets' });
  }
});

// ============================================
// GET /api/preset/:name
// Get single preset by name
// ============================================

router.get('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const preset = await prisma.preset.findUnique({
      where: { name },
    });

    if (!preset) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    return res.json({ preset });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch preset' });
  }
});

// ============================================
// POST /api/preset
// Create new preset
// ============================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      // All the visual parameters
      geometryMode,
      geometryComplexity,
      geometryScale,
      geometryRotation,
      geometrySymmetry,
      colorPalette,
      colorSaturation,
      colorBrightness,
      colorShiftSpeed,
      motionDirection,
      motionSpeed,
      motionTurbulence,
      depthMode,
      depthFocalPoint,
      depthParallax,
      starDensity,
      starBrightness,
      eclipsePhase,
      coronaIntensity,
      nebulaPresence,
      overallIntensity,
      chaosFactor,
      audioReactGeometry,
      audioReactColor,
      audioReactMotion,
      audioReactScale,
      suggestedPhase,
      transitionDuration,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Preset name is required' });
    }

    // Check if name already exists
    const existing = await prisma.preset.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({ error: 'Preset name already exists' });
    }

    const preset = await prisma.preset.create({
      data: {
        name,
        description,
        category: category || 'custom',
        geometryMode: geometryMode || 'stars',
        geometryComplexity: geometryComplexity ?? 0.2,
        geometryScale: geometryScale ?? 1.0,
        geometryRotation: geometryRotation ?? 0.0,
        geometrySymmetry: geometrySymmetry ?? 6,
        colorPalette: colorPalette || 'cosmos',
        colorSaturation: colorSaturation ?? 0.7,
        colorBrightness: colorBrightness ?? 0.6,
        colorShiftSpeed: colorShiftSpeed ?? 0.1,
        motionDirection: motionDirection || 'clockwise',
        motionSpeed: motionSpeed ?? 0.1,
        motionTurbulence: motionTurbulence ?? 0.0,
        depthMode: depthMode || 'deep',
        depthFocalPoint: depthFocalPoint ?? 0.5,
        depthParallax: depthParallax ?? 0.3,
        starDensity: starDensity ?? 0.8,
        starBrightness: starBrightness ?? 0.7,
        eclipsePhase: eclipsePhase ?? 0.0,
        coronaIntensity: coronaIntensity ?? 0.0,
        nebulaPresence: nebulaPresence ?? 0.2,
        overallIntensity: overallIntensity ?? 0.4,
        chaosFactor: chaosFactor ?? 0.0,
        audioReactGeometry: audioReactGeometry ?? 0.3,
        audioReactColor: audioReactColor ?? 0.2,
        audioReactMotion: audioReactMotion ?? 0.3,
        audioReactScale: audioReactScale ?? 0.2,
        suggestedPhase,
        transitionDuration: transitionDuration ?? 3000,
        isCore: false,
      },
    });

    return res.json({ preset });
  } catch (error) {
    console.error('Create preset error:', error);
    return res.status(500).json({ error: 'Failed to create preset' });
  }
});

// ============================================
// PUT /api/preset/:name
// Update existing preset
// ============================================

router.put('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const updates = req.body;

    // Prevent updating core presets' names
    const existing = await prisma.preset.findUnique({
      where: { name },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.isCore;
    delete updates.createdAt;

    const preset = await prisma.preset.update({
      where: { name },
      data: updates,
    });

    return res.json({ preset });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update preset' });
  }
});

// ============================================
// DELETE /api/preset/:name
// Delete a preset (only non-core)
// ============================================

router.delete('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const preset = await prisma.preset.findUnique({
      where: { name },
    });

    if (!preset) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    if (preset.isCore) {
      return res.status(400).json({ error: 'Cannot delete core presets' });
    }

    await prisma.preset.delete({
      where: { name },
    });

    return res.json({ success: true, deleted: name });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete preset' });
  }
});

// ============================================
// POST /api/preset/from-current
// Create preset from current state
// ============================================

router.post('/from-current', async (req: Request, res: Response) => {
  try {
    const { name, description, category } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Preset name is required' });
    }

    // Get current state
    const currentState = await prisma.visualState.findFirst({
      where: { isActive: true },
    });

    if (!currentState) {
      return res.status(500).json({ error: 'No active state found' });
    }

    // Check if name exists
    const existing = await prisma.preset.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({ error: 'Preset name already exists' });
    }

    const preset = await prisma.preset.create({
      data: {
        name,
        description,
        category: category || 'custom',
        geometryMode: currentState.geometryMode,
        geometryComplexity: currentState.geometryComplexity,
        geometryScale: currentState.geometryScale,
        geometryRotation: currentState.geometryRotation,
        geometrySymmetry: currentState.geometrySymmetry,
        colorPalette: currentState.colorPalette,
        colorSaturation: currentState.colorSaturation,
        colorBrightness: currentState.colorBrightness,
        colorShiftSpeed: currentState.colorShiftSpeed,
        motionDirection: currentState.motionDirection,
        motionSpeed: currentState.motionSpeed,
        motionTurbulence: currentState.motionTurbulence,
        depthMode: currentState.depthMode,
        depthFocalPoint: currentState.depthFocalPoint,
        depthParallax: currentState.depthParallax,
        starDensity: currentState.starDensity,
        starBrightness: currentState.starBrightness,
        eclipsePhase: currentState.eclipsePhase,
        coronaIntensity: currentState.coronaIntensity,
        nebulaPresence: currentState.nebulaPresence,
        overallIntensity: currentState.overallIntensity,
        chaosFactor: currentState.chaosFactor,
        audioReactGeometry: currentState.audioReactGeometry,
        audioReactColor: currentState.audioReactColor,
        audioReactMotion: currentState.audioReactMotion,
        audioReactScale: currentState.audioReactScale,
        suggestedPhase: currentState.currentPhase,
        transitionDuration: currentState.transitionDuration,
        isCore: false,
      },
    });

    return res.json({ preset });
  } catch (error) {
    console.error('Create from current error:', error);
    return res.status(500).json({ error: 'Failed to create preset from current state' });
  }
});

export { router as presetRouter };
