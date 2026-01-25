// DARTHANDER Visual Consciousness Engine
// Main Backend Entry Point

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import { promptRouter } from './api/prompt.js';
import { stateRouter } from './api/state.js';
import { presetRouter } from './api/preset.js';
import { audioRouter } from './api/audio.js';
import { sessionRouter } from './api/session.js';

// Import services
import { initializeOSC } from './osc/client.js';
import { setupWebSocket } from './websocket/index.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO for real-time updates
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Make io available to routes
app.set('io', io);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DARTHANDER Engine',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/prompt', promptRouter);
app.use('/api/state', stateRouter);
app.use('/api/preset', presetRouter);
app.use('/api/audio', audioRouter);
app.use('/api/session', sessionRouter);

// WebSocket setup
setupWebSocket(io);

// Initialize OSC connection to TouchDesigner
if (process.env.OSC_ENABLED === 'true') {
  initializeOSC();
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ██████╗  █████╗ ██████╗ ████████╗██╗  ██╗ █████╗        ║
║     ██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██╔══██╗       ║
║     ██║  ██║███████║██████╔╝   ██║   ███████║███████║       ║
║     ██║  ██║██╔══██║██╔══██╗   ██║   ██╔══██║██╔══██║       ║
║     ██████╔╝██║  ██║██║  ██║   ██║   ██║  ██║██║  ██║       ║
║     ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝       ║
║                                                              ║
║              Visual Consciousness Engine                     ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  Server running on port ${PORT}                                 ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║  OSC: ${process.env.OSC_ENABLED === 'true' ? 'Enabled' : 'Disabled'}                                            ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export { app, io };
