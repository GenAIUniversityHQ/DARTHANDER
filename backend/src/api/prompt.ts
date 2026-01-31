// DARTHANDER Visual Consciousness Engine
// Prompt API Routes

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import fs from 'fs';
import { 
  interpretPrompt, 
  checkQuickCommand, 
  checkPromptMapping 
} from '../claude/interpreter.js';
import { updateVisualState } from '../services/state.js';
import { sendOSCUpdate } from '../osc/client.js';

const router = Router();
const prisma = new PrismaClient();

// Initialize OpenAI for Whisper
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// POST /api/prompt/text
// Submit a text prompt
// ============================================

router.post('/text', async (req: Request, res: Response) => {
  try {
    const { prompt, sessionId } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const trimmedPrompt = prompt.trim().toLowerCase();

    // 1. Check for quick voice commands first (bypass Claude)
    const quickCommand = await checkQuickCommand(trimmedPrompt);
    if (quickCommand) {
      let result;
      
      if (quickCommand.action === 'load_preset' && quickCommand.targetPreset) {
        const preset = await prisma.preset.findUnique({
          where: { name: quickCommand.targetPreset },
        });
        
        if (preset) {
          result = await updateVisualState(preset, 3000);
          sendOSCUpdate(result.state);
          
          const io = req.app.get('io');
          io.emit('state:update', result.state);
          io.emit('preset:loaded', { preset: preset.name });
          
          return res.json({
            success: true,
            type: 'quick_command',
            action: 'load_preset',
            preset: preset.name,
            state: result.state,
          });
        }
      } else if (quickCommand.action === 'system_action') {
        const params = quickCommand.parameters as any;
        
        if (params?.action === 'hold') {
          result = await updateVisualState({ motionSpeed: 0 }, 500);
        } else if (params?.action === 'kill') {
          result = await updateVisualState({
            overallIntensity: 0,
            starBrightness: 0,
            colorBrightness: 0,
          }, 1000);
        } else if (params?.action === 'reset') {
          const cosmos = await prisma.preset.findUnique({
            where: { name: 'COSMOS' },
          });
          if (cosmos) {
            result = await updateVisualState(cosmos, 3000);
          }
        }
        
        if (result) {
          sendOSCUpdate(result.state);
          const io = req.app.get('io');
          io.emit('state:update', result.state);
          
          return res.json({
            success: true,
            type: 'quick_command',
            action: params?.action,
            state: result.state,
          });
        }
      } else if (quickCommand.action === 'parameter_change' && quickCommand.parameters) {
        result = await updateVisualState(quickCommand.parameters as any, 2000);
        
        sendOSCUpdate(result.state);
        const io = req.app.get('io');
        io.emit('state:update', result.state);
        
        return res.json({
          success: true,
          type: 'quick_command',
          action: 'parameter_change',
          state: result.state,
        });
      }
    }

    // 2. Check for known prompt mappings
    const mapping = await checkPromptMapping(trimmedPrompt);
    if (mapping) {
      const result = await updateVisualState(
        mapping.parameterChanges as any,
        mapping.transitionDuration
      );
      
      sendOSCUpdate(result.state);
      const io = req.app.get('io');
      io.emit('state:update', result.state);
      io.emit('prompt:mapped', {
        trigger: mapping.triggerPhrase,
        intent: mapping.intent,
      });
      
      if (sessionId) {
        await prisma.sessionLog.create({
          data: {
            sessionId,
            promptReceived: prompt,
            claudeInterpretation: `Mapped: ${mapping.intent}`,
            parametersChanged: mapping.parameterChanges as any,
          },
        });
      }
      
      return res.json({
        success: true,
        type: 'mapped_prompt',
        interpretation: mapping.intent,
        parameterChanges: mapping.parameterChanges,
        transition: {
          style: mapping.transitionStyle,
          duration_ms: mapping.transitionDuration,
        },
        state: result.state,
      });
    }

    // 3. Full Claude interpretation
    const interpretation = await interpretPrompt(prompt, sessionId);
    
    if (!interpretation.success) {
      return res.status(500).json({
        error: 'Failed to interpret prompt',
        details: interpretation.error,
      });
    }

    const result = await updateVisualState(
      interpretation.parameterChanges!,
      interpretation.transition?.duration_ms || 3000
    );
    
    sendOSCUpdate(result.state);
    
    const io = req.app.get('io');
    io.emit('state:update', result.state);
    io.emit('prompt:interpreted', {
      prompt,
      interpretation: interpretation.interpretation,
      narrative: interpretation.narrativeNote,
    });

    return res.json({
      success: true,
      type: 'claude_interpretation',
      interpretation: interpretation.interpretation,
      parameterChanges: interpretation.parameterChanges,
      transition: interpretation.transition,
      narrativeNote: interpretation.narrativeNote,
      state: result.state,
    });

  } catch (error) {
    console.error('Prompt error:', error);
    return res.status(500).json({
      error: 'Failed to process prompt',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================
// POST /api/prompt/voice
// Submit audio for transcription + prompt
// ============================================

router.post('/voice', async (req: Request, res: Response) => {
  try {
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioFile = req.files.audio as any;
    const sessionId = req.body.sessionId;

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.tempFilePath),
      model: 'whisper-1',
      language: 'en',
    });

    const transcribedText = transcription.text;

    // Clean up temp file
    fs.unlink(audioFile.tempFilePath, () => {});

    const io = req.app.get('io');
    io.emit('voice:transcribed', { text: transcribedText });

    // Full interpretation
    const interpretation = await interpretPrompt(transcribedText, sessionId);
    
    if (!interpretation.success) {
      return res.status(500).json({
        error: 'Failed to interpret voice prompt',
        transcription: transcribedText,
        details: interpretation.error,
      });
    }

    const result = await updateVisualState(
      interpretation.parameterChanges!,
      interpretation.transition?.duration_ms || 3000
    );
    
    sendOSCUpdate(result.state);
    
    io.emit('state:update', result.state);
    io.emit('prompt:interpreted', {
      prompt: transcribedText,
      interpretation: interpretation.interpretation,
      source: 'voice',
    });

    return res.json({
      success: true,
      transcription: transcribedText,
      interpretation: interpretation.interpretation,
      parameterChanges: interpretation.parameterChanges,
      transition: interpretation.transition,
      state: result.state,
    });

  } catch (error) {
    console.error('Voice prompt error:', error);
    return res.status(500).json({
      error: 'Failed to process voice prompt',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================
// GET /api/prompt/mappings
// ============================================

router.get('/mappings', async (req: Request, res: Response) => {
  try {
    const mappings = await prisma.promptMapping.findMany({
      orderBy: { triggerPhrase: 'asc' },
    });
    return res.json({ mappings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch mappings' });
  }
});

// ============================================
// POST /api/prompt/mappings
// ============================================

router.post('/mappings', async (req: Request, res: Response) => {
  try {
    const { triggerPhrase, intent, parameterChanges, transitionStyle, transitionDuration, notes } = req.body;
    
    const mapping = await prisma.promptMapping.create({
      data: {
        triggerPhrase,
        intent,
        parameterChanges,
        transitionStyle: transitionStyle || 'gradual',
        transitionDuration: transitionDuration || 5000,
        notes,
      },
    });
    
    return res.json({ mapping });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create mapping' });
  }
});

export { router as promptRouter };
