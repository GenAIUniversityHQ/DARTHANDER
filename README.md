# DARTHANDER Visual Consciousness Engine

A promptable, audio-reactive visual generation system for immersive dome experiences.

## What This Is

DARTHANDER Engine is a complete system for creating live, improvised visual experiences synchronized to music. It combines:

- **Claude AI** as the creative interpreter (translates natural language to visual parameters)
- **Real-time audio analysis** (frequency, tempo, energy extraction)
- **Generative visuals** (geometry, particles, cosmic environments)
- **Voice and text control** (conduct the experience with prompts)
- **Dome projection mapping** (360° immersive output)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AUDIO SOURCES                               │
│     [Upload MP3/WAV]  [Live Musicians]  [Streaming]                 │
└─────────────────────────────────────┬───────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AUDIO ANALYSIS ENGINE                            │
│   Frequency bands, BPM, energy, onsets, spectral character          │
└─────────────────────────────────────┬───────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API + CLAUDE LAYER                             │
│   Interprets prompts, manages state, coordinates everything         │
└─────────────────────────────────────┬───────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VISUAL GENERATION ENGINE                         │
│   TouchDesigner / Web-based Three.js fallback                       │
└─────────────────────────────────────┬───────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      OUTPUT + CONTROL                               │
│   Dome projection, preview monitor, conductor interface             │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (or use Supabase)
- Python 3.9+ (for audio analysis)
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/darthander-engine.git
cd darthander-engine

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install audio analysis dependencies
cd ../audio-analysis
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Initialize database
cd ../backend
npm run db:migrate

# Start development servers
npm run dev
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/darthander

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (for Whisper voice transcription)
OPENAI_API_KEY=sk-...

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# File Storage (optional - for uploaded tracks)
S3_BUCKET=darthander-audio
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## Project Structure

```
darthander-engine/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── api/            # Express routes
│   │   ├── services/       # Business logic
│   │   ├── claude/         # Claude integration
│   │   ├── audio/          # Audio routing
│   │   ├── osc/            # TouchDesigner bridge
│   │   └── db/             # Database models
│   ├── prisma/             # Database schema
│   └── package.json
│
├── frontend/               # React control surface
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── stores/         # State management
│   │   └── utils/          # Helpers
│   └── package.json
│
├── audio-analysis/         # Python audio processing
│   ├── analyzer.py         # Real-time analysis
│   ├── uploader.py         # Track pre-analysis
│   └── requirements.txt
│
├── touchdesigner/          # TouchDesigner project files
│   ├── DARTHANDER.toe      # Main project
│   └── modules/            # Reusable components
│
├── visuals-web/            # Three.js web fallback
│   └── (browser-based visuals)
│
└── docs/                   # Documentation
    ├── API.md
    ├── PROMPTS.md
    └── TOUCHDESIGNER.md
```

## Core Concepts

### Visual Parameters

Every aspect of the visuals is controlled by parameters:

| Category | Parameters |
|----------|------------|
| Geometry | mode, complexity, scale, rotation, symmetry |
| Color | palette, saturation, brightness, shift_speed |
| Motion | direction, speed, turbulence |
| Depth | mode, focal_point, parallax |
| Environment | star_density, eclipse_phase, corona_intensity |
| Audio Reactivity | react_geometry, react_color, react_motion |

### Presets

Pre-configured parameter sets for instant recall:

- **COSMOS** - Night sky, stars, peaceful
- **EMERGENCE** - Geometry appears, building
- **DESCENT** - Eclipse approaching, tension
- **TOTALITY** - Full darkness, intimate
- **PORTAL** - Interdimensional tunnel
- **FRACTAL_BLOOM** - Organic complexity explosion
- **VOID** - Near-empty darkness
- **RETURN** - Coming back, softening

### Prompting

Control the visuals with natural language:

```
"open the portal slowly"
→ Transitions to tunnel geometry with gradual inward motion

"make it breathe"
→ Sets motion to rhythmic expand/contract synced to audio

"bring them home"
→ Returns to familiar star field, softens everything
```

## Usage Modes

### Mode 1: Live Event (ECLIPSE)

Musicians perform live, you conduct visuals in real-time.

```bash
# Start with live audio input
npm run start:live
```

### Mode 2: Uploaded Track

Upload any song, system analyzes and visualizes automatically.

```bash
# Upload and analyze a track
curl -X POST http://localhost:3001/audio/upload \
  -F "file=@mysong.mp3"

# Play it
curl -X POST http://localhost:3001/audio/play \
  -d '{"track_id": "..."}'
```

### Mode 3: Auto-Pilot

Let the system run automatically based on song analysis.

```bash
# Enable auto-pilot for current track
curl -X POST http://localhost:3001/session/autopilot \
  -d '{"enabled": true}'
```

## API Documentation

See [docs/API.md](docs/API.md) for complete API reference.

## Deployment

### Netlify (Frontend)

```bash
cd frontend
npm run build
netlify deploy --prod
```

### Railway/Render (Backend)

```bash
# Railway
railway up

# Or Render
# Connect your GitHub repo in Render dashboard
```

### Database (Supabase)

1. Create a Supabase project
2. Run migrations: `npx prisma migrate deploy`
3. Update DATABASE_URL in production environment

## License

MIT - Use freely, attribution appreciated.

## Credits

Created for DARTHANDER: ECLIPSE
An immersive experience by Gen AI University
