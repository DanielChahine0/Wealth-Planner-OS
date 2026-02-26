# Wealth Planner OS

> Wealth Planner OS is an AI-powered wealth planning engine: users input a financial profile, 10,000 Monte Carlo simulations run in under 100ms via vectorized NumPy, a risk fragility score surfaces portfolio vulnerabilities, and Claude generates ranked, personalized strategy recommendations — all delivered through a streaming chat interface and interactive dashboard.

## Live Demo

[Placeholder — add Railway + Vercel URLs after deployment]

## Features

- Monte Carlo simulation: 10,000 probabilistic wealth paths in <100ms (vectorized NumPy)
- Risk fragility score (0–100): composite of VaR, CVaR, drawdown, and goal misalignment
- Claude AI strategy recommendations: ranked, personalized, with projected impact
- Streaming chat advisor: context-aware SSE streaming with full simulation context
- Asset allocation editor: 5-asset-class slider with auto-rebalancing and lock controls
- State persistence: simulation results survive page refresh via localStorage

## Architecture

```
Browser (Next.js/Vercel)
    │
    ├─ /onboarding  (4-step wizard: Profile → Goals → Allocation → Life Events)
    ├─ /dashboard   (fan chart + success gauge + risk panel + strategy cards)
    └─ /advisor     (SSE streaming chat with plan context)
         │
         ▼ HTTPS REST + SSE
FastAPI (Railway)
    ├─ POST /simulate       → NumPy Monte Carlo (10k paths, <100ms)
    ├─ POST /risk/analyze   → VaR, CVaR, fragility score
    ├─ POST /advisor/recommend → Claude claude-sonnet-4-6
    └─ POST /advisor/chat   → SSE streaming via AsyncAnthropic
```

## Quick Start (5 minutes)

### Prerequisites

- Python 3.12+
- Node.js 20+
- Anthropic API key

### Steps

1. Clone the repo
2. Run: `make install`
3. Add your API key: edit `backend/.env` and set `ANTHROPIC_API_KEY=sk-ant-...`
4. Run: `make dev`
5. Open http://localhost:3000

## Development

### Backend

```bash
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend && npm run dev
```

### Running Tests

```bash
make test           # backend pytest (10+ tests)
make coverage       # pytest with coverage report
```

### Code Quality

```bash
make lint           # ruff + eslint
make type-check     # mypy + tsc
make fmt            # ruff format + prettier
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| ANTHROPIC_API_KEY | (required) | Anthropic API key |
| ENVIRONMENT | development | Environment name |
| CORS_ORIGINS | http://localhost:3000 | Comma-separated allowed origins |
| N_SIMULATIONS | 10000 | Default simulation count |
| MAX_SIMULATIONS | 50000 | Hard cap (returns 422 if exceeded) |
| CLAUDE_TIMEOUT | 45.0 | Claude API timeout in seconds |
| LOG_LEVEL | INFO | Python logging level |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_API_URL | Backend URL (default: http://localhost:8000) |

## Deployment

### Railway (Backend)

1. Connect your repo to Railway
2. Set root directory to `backend/`
3. Set env vars: `ANTHROPIC_API_KEY`, `CORS_ORIGINS` (your Vercel URL)
4. Railway auto-detects the Dockerfile

### Vercel (Frontend)

1. Connect your repo to Vercel
2. Set root directory to `frontend/`
3. Set env var: `NEXT_PUBLIC_API_URL` (your Railway URL)
4. Update `frontend/vercel.json` rewrite destination to your Railway URL

## Contributing

- Backend code: Python 3.12, FastAPI, type-annotated with `from __future__ import annotations`
- Frontend code: TypeScript strict mode, Tailwind CSS
- Tests required for new backend logic (`make test` must pass)
- CI runs on every PR: lint + type-check + test + build

## License

MIT
