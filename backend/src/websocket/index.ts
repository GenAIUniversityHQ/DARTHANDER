// DARTHANDER Visual Consciousness Engine
// WebSocket Setup for Real-time Communication

import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { sendOSCUpdate, sendOSCAudio } from '../osc/client.js';

const prisma = new PrismaClient();

// ============================================
// SETUP WEBSOCKET HANDLERS
// ============================================

export function setupWebSocket(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send current state on connection
    sendCurrentState(socket);

    // ============================================
    // CLIENT EVENTS
    // ============================================

    // Request current state
    socket.on('state:get', async () => {
      await sendCurrentState(socket);
    });

    // Request presets
    socket.on('presets:get', async () => {
      const presets = await prisma.preset.findMany({
        where: { isCore: true },
        orderBy: { sortOrder: 'asc' },
      });
      socket.emit('presets:list', { presets });
    });

    // Load preset
    socket.on('preset:load', async (data: { name: string; transitionDuration?: number }) => {
      try {
        const preset = await prisma.preset.findUnique({
          where: { name: data.name },
        });

        if (!preset) {
          socket.emit('error', { message: `Preset "${data.name}" not found` });
          return;
        }

        // Update state
        const currentState = await prisma.visualState.findFirst({
          where: { isActive: true },
        });

        if (currentState) {
          const updatedState = await prisma.visualState.update({
            where: { id: currentState.id },
            data: {
              geometryMode: preset.geometryMode,
              geometryComplexity: preset.geometryComplexity,
              geometryScale: preset.geometryScale,
              geometryRotation: preset.geometryRotation,
              geometrySymmetry: preset.geometrySymmetry,
              colorPalette: preset.colorPalette,
              colorSaturation: preset.colorSaturation,
              colorBrightness: preset.colorBrightness,
              colorShiftSpeed: preset.colorShiftSpeed,
              motionDirection: preset.motionDirection,
              motionSpeed: preset.motionSpeed,
              motionTurbulence: preset.motionTurbulence,
              depthMode: preset.depthMode,
              depthFocalPoint: preset.depthFocalPoint,
              depthParallax: preset.depthParallax,
              starDensity: preset.starDensity,
              starBrightness: preset.starBrightness,
              eclipsePhase: preset.eclipsePhase,
              coronaIntensity: preset.coronaIntensity,
              nebulaPresence: preset.nebulaPresence,
              overallIntensity: preset.overallIntensity,
              chaosFactor: preset.chaosFactor,
              audioReactGeometry: preset.audioReactGeometry,
              audioReactColor: preset.audioReactColor,
              audioReactMotion: preset.audioReactMotion,
              audioReactScale: preset.audioReactScale,
              currentPhase: preset.suggestedPhase || currentState.currentPhase,
              transitionDuration: data.transitionDuration || preset.transitionDuration,
            },
          });

          // Send OSC update
          sendOSCUpdate(updatedState);

          // Broadcast to all clients
          io.emit('state:update', updatedState);
          io.emit('preset:loaded', { preset: data.name });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to load preset' });
      }
    });

    // Parameter change
    socket.on('parameter:set', async (data: { parameter: string; value: any }) => {
      try {
        const currentState = await prisma.visualState.findFirst({
          where: { isActive: true },
        });

        if (currentState) {
          const updatedState = await prisma.visualState.update({
            where: { id: currentState.id },
            data: { [data.parameter]: data.value },
          });

          sendOSCUpdate(updatedState);
          io.emit('state:update', updatedState);
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to update parameter' });
      }
    });

    // Multiple parameters
    socket.on('parameters:set', async (data: { parameters: Record<string, any> }) => {
      try {
        const currentState = await prisma.visualState.findFirst({
          where: { isActive: true },
        });

        if (currentState) {
          const updatedState = await prisma.visualState.update({
            where: { id: currentState.id },
            data: data.parameters,
          });

          sendOSCUpdate(updatedState);
          io.emit('state:update', updatedState);
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to update parameters' });
      }
    });

    // ============================================
    // AUDIO EVENTS (from Python analyzer)
    // ============================================

    socket.on('audio:analysis', async (data: any) => {
      // Update audio state
      const audioState = await prisma.audioState.findFirst({
        where: { isActive: true },
      });

      if (audioState) {
        await prisma.audioState.update({
          where: { id: audioState.id },
          data: {
            subBass: data.subBass ?? audioState.subBass,
            bass: data.bass ?? audioState.bass,
            lowMid: data.lowMid ?? audioState.lowMid,
            mid: data.mid ?? audioState.mid,
            highMid: data.highMid ?? audioState.highMid,
            presence: data.presence ?? audioState.presence,
            brilliance: data.brilliance ?? audioState.brilliance,
            overallAmplitude: data.overallAmplitude ?? audioState.overallAmplitude,
            detectedBpm: data.detectedBpm ?? audioState.detectedBpm,
            beatIntensity: data.beatIntensity ?? audioState.beatIntensity,
            spectralCentroid: data.spectralCentroid ?? audioState.spectralCentroid,
            spectralFlux: data.spectralFlux ?? audioState.spectralFlux,
          },
        });
      }

      // Send to TouchDesigner
      sendOSCAudio(data);

      // Broadcast to all clients
      io.emit('audio:update', data);
    });

    // ============================================
    // SYSTEM EVENTS
    // ============================================

    socket.on('system:hold', async () => {
      const state = await prisma.visualState.findFirst({ where: { isActive: true } });
      if (state) {
        const updated = await prisma.visualState.update({
          where: { id: state.id },
          data: { motionSpeed: 0 },
        });
        sendOSCUpdate(updated);
        io.emit('state:update', updated);
        io.emit('system:held', {});
      }
    });

    socket.on('system:kill', async () => {
      const state = await prisma.visualState.findFirst({ where: { isActive: true } });
      if (state) {
        const updated = await prisma.visualState.update({
          where: { id: state.id },
          data: {
            overallIntensity: 0,
            starBrightness: 0,
            colorBrightness: 0,
          },
        });
        sendOSCUpdate(updated);
        io.emit('state:update', updated);
        io.emit('system:killed', {});
      }
    });

    socket.on('system:reset', async () => {
      // Load COSMOS preset
      const cosmos = await prisma.preset.findUnique({ where: { name: 'COSMOS' } });
      if (cosmos) {
        const state = await prisma.visualState.findFirst({ where: { isActive: true } });
        if (state) {
          const updated = await prisma.visualState.update({
            where: { id: state.id },
            data: {
              geometryMode: cosmos.geometryMode,
              geometryComplexity: cosmos.geometryComplexity,
              // ... all other fields
              overallIntensity: cosmos.overallIntensity,
            },
          });
          sendOSCUpdate(updated);
          io.emit('state:update', updated);
          io.emit('system:reset', {});
        }
      }
    });

    // ============================================
    // DISCONNECT
    // ============================================

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

// ============================================
// HELPER: Send current state to socket
// ============================================

async function sendCurrentState(socket: Socket) {
  const visualState = await prisma.visualState.findFirst({
    where: { isActive: true },
  });

  const audioState = await prisma.audioState.findFirst({
    where: { isActive: true },
  });

  socket.emit('state:current', {
    visual: visualState,
    audio: audioState,
  });
}
