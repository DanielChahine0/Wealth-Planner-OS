# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wealth-Planner-OS is an AI-powered wealth planning engine. Users input a financial profile, 10,000 Monte Carlo simulations run in <1s, risk analysis detects fragility/misalignment, and Claude generates ranked strategy recommendations. The frontend provides a dashboard and streaming AI chat interface.

## Tech Stack

- **Backend**: Python 3.12 / FastAPI / NumPy / Anthropic SDK — hosted on Railway
- **Frontend**: Next.js 16 / TypeScript / Tailwind / Recharts / Zustand — hosted on Vercel
- **AI Model**: `claude-sonnet-4-6` (recommendations + SSE streaming chat)

## Dev Commands

```bash
# First-time setup (creates .venv, installs deps)
make install

# Run both servers in parallel (backend :8000, frontend :3000)
make dev

# Backend only
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend only
cd frontend && npm run dev

# Tests
make test
# or: cd backend && pytest tests/ -v
```

## Architecture

### Backend (`backend/app/`)
```
main.py              # FastAPI app, CORS, router registration
config.py            # Pydantic Settings (env vars)
api/routes/
  simulation.py      # POST /simulate
  risk.py            # POST /risk/analyze
  advisor.py         # POST /advisor/recommend, POST /advisor/chat (SSE)
core/
  simulation/
    engine.py        # Monte Carlo orchestrator — vectorized NumPy paths (n_sims, n_years)
    models.py        # Capital market assumptions (returns, volatility, correlation)
    scenarios.py     # Stochastic life event injection (job loss, medical, windfall)
    tax.py           # Federal bracket model, after-tax withdrawal
  risk/
    analyzer.py      # VaR, CVaR, fragility score (0–100)
    alignment.py     # Goal-to-risk misalignment flags
  advisor/
    claude_client.py # Anthropic SDK wrapper + retry/backoff
    prompt_builder.py# Builds structured prompt from simulation+risk context
    strategy.py      # Parses/validates Claude's JSON strategy response
schemas/             # Pydantic models: profile, simulation, risk, advisor
```

### Frontend (`frontend/`)
```
app/
  page.tsx           # Landing page → CTA to /onboarding
  onboarding/page.tsx# 4-step wizard (Profile → Goals → Allocation → Life Events)
  dashboard/page.tsx # Results: fan chart, success gauge, risk panel, strategy cards
  advisor/page.tsx   # SSE streaming AI chat
components/
  onboarding/        # ProfileForm, GoalsForm, AssetAllocationForm, LifeEventsForm, StepIndicator
  dashboard/         # SimulationChart (fan chart), SuccessRateGauge, RiskPanel, StrategyCards
  advisor/           # ChatInterface, MessageBubble
  shared/            # Button, Card, LoadingSpinner
lib/
  types.ts           # TypeScript interfaces mirroring Pydantic schemas
  api.ts             # Typed fetch wrappers for all endpoints
  store.ts           # Zustand global state: { profile, simulationResult, riskReport, advisorResponse }
  formatters.ts      # Currency, %, color helpers
hooks/
  useSimulation.ts   # Orchestrates 3-stage pipeline: simulate → risk → recommend
  useAdvisorStream.ts# SSE streaming hook for chat
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| POST | `/simulate` | Run Monte Carlo simulation |
| POST | `/risk/analyze` | Compute fragility score + misalignment flags |
| POST | `/advisor/recommend` | Get ranked strategy actions from Claude |
| POST | `/advisor/chat` | Streaming SSE chat (context-aware) |

## Environment Variables

### Backend (`backend/.env`)
```
ANTHROPIC_API_KEY=sk-ant-...
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
N_SIMULATIONS=10000
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Deployment
- Railway: set `ANTHROPIC_API_KEY`, `CORS_ORIGINS` in environment variables
- Vercel: set `NEXT_PUBLIC_API_URL=https://your-app.railway.app`; update `vercel.json` rewrite destination

## Architecture Decisions

- **Stateless (no DB in MVP)**: Session state lives in Zustand (browser). Refresh loses results. V2 adds Supabase.
- **10,000 simulations synchronously**: NumPy vectorized ops finish <1s on a single core. Reduce `N_SIMULATIONS` to 5000 if Railway times out.
- **SSE not WebSockets**: `FastAPI StreamingResponse` — chat is server→client only, SSE is the right fit.
- **3 progressive API calls**: Simulation chart renders first (~1s), risk panel second, AI cards last (~3-5s). Better perceived performance.
- **Claude model**: `claude-sonnet-4-6` — best capability/cost tradeoff for financial reasoning.

## Domain Context

- **Monte Carlo simulation**: GBM with drift and lognormal returns per asset class; 10k paths matrix (n_sims × n_years); 10k sims in ~15ms on M2 MacBook, ~80ms on Railway free tier (single core)
- **Capital Market Assumptions**: US equity 9.5%, Intl 8%, Bonds 4%, REITs 7%, Cash 4.5%; full correlation matrix
- **Fragility Score**: composite of (1−success_rate), median max drawdown, dispersion, CVaR severity; 0–100
- **Goal misalignment**: compares p10 and p50 projections at goal target year against required amount
- **Tax model**: 2024 federal brackets + state flat rates; applied to income before computing contributions

## AI Disclaimer

All Claude-generated strategy recommendations include the disclaimer: _"This analysis is generated by an AI and is for informational purposes only. It does not constitute financial advice. Consult a licensed financial advisor before making investment decisions."_

## Troubleshooting

### Railway cold start timeout
If Railway's health check fails on first deploy, increase `healthcheckTimeout` in `railway.toml` to 30.
The `python:3.12-slim` image takes ~20s to start on Railway's free tier.

### Vercel env var not found
Make sure `NEXT_PUBLIC_API_URL` is set in Vercel project settings (not just in `.env.local`).
The Vercel UI: Project → Settings → Environment Variables.

### Claude API key error on startup
The backend now validates `ANTHROPIC_API_KEY` at startup. If you see `ValueError: ANTHROPIC_API_KEY is not set`,
add it to `backend/.env` or Railway environment variables.

### Asset allocation validation error
The backend requires allocation weights to sum to exactly 1.0 (±0.01 tolerance).
The `AssetAllocationForm` enforces this in the UI — if you're calling the API directly, ensure weights sum to 1.0.

### `from __future__ import annotations` requirement
All backend Python files must include this import at the top to support Python 3.9+ type hint syntax.
(The project runs on 3.12 in production but the annotation style must be compatible.)
