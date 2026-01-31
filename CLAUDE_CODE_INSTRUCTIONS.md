# DARTHANDER Visual Consciousness Engine
## Complete Instructions for Claude Code

This document contains everything you need to build and deploy the DARTHANDER Visual Consciousness Engine.

---

## Project Overview

DARTHANDER is a promptable, AI-powered visual generation system for immersive dome experiences. It combines:
- **Claude AI** for natural language interpretation of visual prompts
- **Real-time audio analysis** for music-reactive visuals
- **TouchDesigner** (or web-based fallback) for visual rendering
- **Voice and text control** for live conducting

---

## Quick Start Commands

```bash
# 1. Clone and enter directory
git clone https://github.com/yourusername/darthander-engine.git
cd darthander-engine

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npx prisma migrate dev
npm run db:seed
npm run dev

# 3. Setup frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev

# 4. Access at http://localhost:3000
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AUDIO SOURCES                            │
│     [Upload MP3/WAV]  [Live Musicians]  [Streaming]             │
└─────────────────────────────────┬───────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AUDIO ANALYSIS ENGINE                         │
│  Frequency bands, BPM, energy, onsets, spectral character       │
└─────────────────────────────────┬───────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API + CLAUDE LAYER                          │
│  Interprets prompts, manages state, coordinates everything      │
└─────────────────────────────────┬───────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   VISUAL GENERATION ENGINE                      │
│  TouchDesigner / Web-based Three.js fallback                    │
└─────────────────────────────────┬───────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     OUTPUT + CONTROL                            │
│  Dome projection, preview monitor, conductor interface          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
darthander-engine/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── api/            # Express routes
│   │   │   ├── prompt.ts   # Prompt handling
│   │   │   ├── state.ts    # State management
│   │   │   ├── preset.ts   # Preset CRUD
│   │   │   ├── audio.ts    # Audio management
│   │   │   └── session.ts  # Session logging
│   │   ├── services/
│   │   │   └── state.ts    # State business logic
│   │   ├── claude/
│   │   │   └── interpreter.ts  # Claude integration
│   │   ├── osc/
│   │   │   └── client.ts   # TouchDesigner bridge
│   │   ├── websocket/
│   │   │   └── index.ts    # Real-time communication
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Preset data
│   └── package.json
│
├── frontend/               # React control surface
│   ├── src/
│   │   ├── components/
│   │   │   ├── PreviewMonitor.tsx
│   │   │   ├── PromptInput.tsx
│   │   │   ├── VoiceInput.tsx
│   │   │   ├── PresetGrid.tsx
│   │   │   ├── ParameterSliders.tsx
│   │   │   ├── AudioVisualizer.tsx
│   │   │   ├── AudioSourceSelector.tsx
│   │   │   └── SessionStatus.tsx
│   │   ├── store.ts        # Zustand state
│   │   ├── App.tsx         # Main app
│   │   └── main.tsx        # Entry point
│   └── package.json
│
├── audio-analysis/         # Python audio processing
│   ├── analyzer.py         # Analysis service
│   └── requirements.txt
│
└── README.md
```

---

## Database Schema

### Core Tables

**visual_state** - Current live visual parameters
**presets** - Saved visual configurations
**prompt_mappings** - Natural language to parameter translations
**tracks** - Uploaded audio files with analysis
**sessions** - Recording of live experiences
**session_logs** - Prompt history within sessions
**audio_state** - Real-time audio analysis data
**voice_commands** - Quick trigger phrases

### Key Parameters

| Category | Parameters |
|----------|------------|
| Geometry | mode, complexity, scale, rotation, symmetry |
| Color | palette, saturation, brightness, shift_speed |
| Motion | direction, speed, turbulence |
| Depth | mode, focal_point, parallax |
| Environment | star_density, eclipse_phase, corona_intensity |
| Audio Reactivity | react_geometry, react_color, react_motion |

---

## API Endpoints

### Prompts
- `POST /api/prompt/text` - Submit text prompt
- `POST /api/prompt/voice` - Submit audio for transcription
- `GET /api/prompt/mappings` - Get prompt mappings

### State
- `GET /api/state` - Get current visual state
- `POST /api/state/preset` - Load a preset
- `POST /api/state/parameter` - Update single parameter
- `POST /api/state/hold` - Freeze motion
- `POST /api/state/kill` - Fade to black
- `POST /api/state/reset` - Return to COSMOS

### Presets
- `GET /api/preset` - List all presets
- `GET /api/preset/core` - List core presets only
- `POST /api/preset` - Create new preset
- `POST /api/preset/from-current` - Save current state as preset

### Audio
- `GET /api/audio/tracks` - List uploaded tracks
- `POST /api/audio/upload` - Upload new track
- `POST /api/audio/play` - Play track
- `POST /api/audio/source` - Switch audio source

### Sessions
- `POST /api/session/start` - Start recording session
- `POST /api/session/:id/end` - End session
- `GET /api/session/:id/log` - Get session logs

---

## Core Presets

| Preset | Description | Phase |
|--------|-------------|-------|
| COSMOS | Night sky, stars, peaceful | arrival |
| EMERGENCE | Geometry appears, building | emergence |
| DESCENT | Eclipse approaching, tension | descent |
| TOTALITY | Full darkness, intimate | totality |
| PORTAL | Interdimensional tunnel | descent |
| FRACTAL_BLOOM | Organic complexity explosion | emergence |
| VOID | Near-empty darkness | totality |
| RETURN | Coming back, softening | return |
| CLOSE | Final state, integration | close |

---

## Prompt Examples

```
"ease into it"           → Gentle increase in presence
"they're ready"          → Increase engagement
"go deeper"              → Intensify, increase depth
"open the portal"        → Tunnel geometry, inward motion
"crack it open"          → Dramatic shift, high energy
"hold"                   → Freeze current state
"bring them home"        → Return to COSMOS
"breathe"                → Rhythmic expand/contract
"feel the music"         → High audio reactivity
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Hold (freeze) |
| Escape | Kill (fade to black) |
| R | Reset to COSMOS |
| M | Toggle voice input |
| 1-8 | Load preset by number |

---

## Deployment

### Frontend (Netlify)

```bash
cd frontend
npm run build
netlify deploy --prod
```

Update `netlify.toml` with your backend URL.

### Backend (Railway/Render)

1. Connect GitHub repository
2. Set environment variables:
   - DATABASE_URL
   - ANTHROPIC_API_KEY
   - OPENAI_API_KEY
   - FRONTEND_URL
3. Deploy

### Database (Supabase)

1. Create Supabase project
2. Copy DATABASE_URL
3. Run: `npx prisma migrate deploy`
4. Run: `npm run db:seed`

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PORT=3001
FRONTEND_URL=https://your-frontend.netlify.app
OSC_ENABLED=false
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.railway.app
```

---

## Claude System Prompt

The Claude integration uses a comprehensive system prompt that:
- Defines all visual parameters and their ranges
- Provides vocabulary for geometry modes, color palettes, motion directions
- Includes interpretation guidelines for natural language
- Contains safety rails (max intensity, transition times)
- Gives example prompts with expected outputs

Key principle: Claude translates *intent* to *parameters*, respecting current state and thinking in transitions.

---

## Development Notes

### Adding New Presets
1. Add to `prisma/seed.js`
2. Run `npm run db:seed`
3. Add icon mapping in `PresetGrid.tsx`

### Adding New Prompt Mappings
1. Add to `prisma/seed.js` in `promptMappings` array
2. Run `npm run db:seed`

### Connecting TouchDesigner
1. Set `OSC_ENABLED=true` in .env
2. Configure OSC_HOST and OSC_PORT
3. Import OSC In CHOP in TouchDesigner
4. Map channels to visual parameters

### Testing Without TouchDesigner
The web preview in `PreviewMonitor.tsx` provides a simplified visualization. For full dome testing, use TouchDesigner.

---

## File Checklist

- [ ] backend/package.json
- [ ] backend/tsconfig.json
- [ ] backend/prisma/schema.prisma
- [ ] backend/prisma/seed.js
- [ ] backend/src/index.ts
- [ ] backend/src/api/prompt.ts
- [ ] backend/src/api/state.ts
- [ ] backend/src/api/preset.ts
- [ ] backend/src/api/audio.ts
- [ ] backend/src/api/session.ts
- [ ] backend/src/services/state.ts
- [ ] backend/src/claude/interpreter.ts
- [ ] backend/src/osc/client.ts
- [ ] backend/src/websocket/index.ts
- [ ] backend/.env.example
- [ ] backend/Dockerfile
- [ ] frontend/package.json
- [ ] frontend/tsconfig.json
- [ ] frontend/vite.config.ts
- [ ] frontend/tailwind.config.js
- [ ] frontend/postcss.config.js
- [ ] frontend/index.html
- [ ] frontend/src/main.tsx
- [ ] frontend/src/App.tsx
- [ ] frontend/src/store.ts
- [ ] frontend/src/index.css
- [ ] frontend/src/components/*.tsx (8 files)
- [ ] frontend/.env.example
- [ ] frontend/netlify.toml
- [ ] audio-analysis/requirements.txt
- [ ] audio-analysis/analyzer.py
- [ ] README.md

---

## Support

This system was designed for DARTHANDER: ECLIPSE, a 4-hour immersive dome experience combining live improvised music with AI-controlled generative visuals.

For questions about the creative vision, see the DARTHANDER project documentation.
