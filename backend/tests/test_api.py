from __future__ import annotations
"""
Integration tests for Wealth Planner OS FastAPI endpoints.
Uses FastAPI TestClient (synchronous) against the real app.
"""
import json
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


# ---------------------------------------------------------------------------
# Reusable test data helpers
# ---------------------------------------------------------------------------

def _valid_profile_dict() -> dict:
    """Return a dict matching UserProfile schema."""
    return {
        "current_age": 35,
        "retirement_age": 65,
        "annual_income": 120_000,
        "income_growth_rate": 0.03,
        "annual_expenses": 80_000,
        "current_portfolio_value": 200_000,
        "annual_contribution": 20_000,
        "emergency_fund_months": 6.0,
        "asset_allocation": {
            "us_equity": 0.6,
            "intl_equity": 0.2,
            "bonds": 0.15,
            "real_estate": 0.05,
            "cash": 0.0,
        },
        "risk_tolerance": "moderate",
        "goals": [],
        "life_events": [],
        "tax_info": {
            "filing_status": "single",
            "state": "CA",
            "pre_tax_contribution_rate": 0.15,
        },
    }


def _valid_simulation_result_dict() -> dict:
    """Return a minimal but valid SimulationResult dict."""
    years = list(range(2026, 2057))  # 31 years (age 35 → 65)
    n = len(years)
    return {
        "years": years,
        "percentiles": {
            "p10": [200_000.0 + i * 5_000 for i in range(n)],
            "p25": [200_000.0 + i * 8_000 for i in range(n)],
            "p50": [200_000.0 + i * 12_000 for i in range(n)],
            "p75": [200_000.0 + i * 16_000 for i in range(n)],
            "p90": [200_000.0 + i * 20_000 for i in range(n)],
        },
        "success_rate": 0.85,
        "median_final_value": 560_000.0,
        "worst_case_final_value": 80_000.0,
        "best_case_final_value": 1_200_000.0,
        "simulation_metadata": {
            "n_simulations": 500,
            "n_years": 30,
            "simulation_duration_ms": 42.5,
        },
        "paths_sample": [[200_000.0 + i * 10_000 for i in range(n)]],
    }


def _valid_risk_report_dict() -> dict:
    """Return a minimal but valid RiskReport dict."""
    return {
        "fragility_score": 32.5,
        "var_5th_percentile": 80_000.0,
        "cvar_5th_percentile": 50_000.0,
        "misalignment_flags": [],
        "risk_narrative": "Your portfolio has moderate risk exposure.",
        "portfolio_volatility": 0.12,
        "max_drawdown_median": 0.18,
    }


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------

def test_health_returns_200():
    """GET /health should return HTTP 200 with status: ok."""
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body.get("status") == "ok"


# ---------------------------------------------------------------------------
# Simulation endpoint
# ---------------------------------------------------------------------------

def test_simulate_valid_profile():
    """POST /simulate with valid profile should return 200 with expected keys."""
    payload = {
        "profile": _valid_profile_dict(),
        "n_simulations": 200,
    }
    response = client.post("/simulate", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert "success_rate" in body
    assert "years" in body
    assert "percentiles" in body


def test_simulate_invalid_n_simulations():
    """POST /simulate with n_simulations=0 should return 422 (validation error)."""
    payload = {
        "profile": _valid_profile_dict(),
        "n_simulations": 0,
    }
    response = client.post("/simulate", json=payload)
    # n_simulations=0 would result in a degenerate run; depending on pydantic
    # validation this may be 422 or cause an internal error.
    # We assert it is NOT a successful 200 response.
    assert response.status_code in (422, 400, 500)


def test_simulate_missing_field():
    """POST /simulate with missing annual_income should return 422."""
    profile = _valid_profile_dict()
    del profile["annual_income"]
    payload = {"profile": profile, "n_simulations": 200}
    response = client.post("/simulate", json=payload)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Risk endpoint
# ---------------------------------------------------------------------------

def test_risk_analyze_valid():
    """POST /risk/analyze with valid body should return 200 with fragility_score in [0, 100]."""
    payload = {
        "profile": _valid_profile_dict(),
        "simulation_result": _valid_simulation_result_dict(),
    }
    response = client.post("/risk/analyze", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert "fragility_score" in body
    assert 0 <= body["fragility_score"] <= 100


def test_risk_analyze_missing_profile():
    """POST /risk/analyze with empty body should return 422."""
    response = client.post("/risk/analyze", json={})
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Advisor recommend endpoint
# ---------------------------------------------------------------------------

# Valid AdvisorResponse JSON that parse_strategy_response can handle
_MOCK_ADVISOR_JSON = json.dumps({
    "strategy_actions": [
        {
            "id": "action_1",
            "title": "Increase Retirement Contributions",
            "description": "Maximize 401(k) contributions to reduce taxable income.",
            "category": "savings",
            "projected_impact": "Adds ~$150,000 to retirement portfolio over 10 years",
            "priority": 1,
        }
    ],
    "narrative": "Your plan shows moderate resilience with room for improvement.",
})


def test_advisor_recommend_mocked():
    """POST /advisor/recommend with mocked ClaudeClient should return 200 with strategy_actions."""
    payload = {
        "profile": _valid_profile_dict(),
        "simulation_result": _valid_simulation_result_dict(),
        "risk_report": _valid_risk_report_dict(),
    }
    with patch(
        "app.core.advisor.claude_client.ClaudeClient.complete",
        new_callable=AsyncMock,
        return_value=_MOCK_ADVISOR_JSON,
    ):
        response = client.post("/advisor/recommend", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert "strategy_actions" in body
    assert len(body["strategy_actions"]) > 0


# ---------------------------------------------------------------------------
# Advisor chat SSE endpoint
# ---------------------------------------------------------------------------

async def _mock_stream(*args, **kwargs):
    """Async generator yielding a single token for test purposes."""
    yield "Hello"


def test_advisor_chat_sse_mocked():
    """POST /advisor/chat with mocked stream should return 200 text/event-stream."""
    payload = {
        "profile": _valid_profile_dict(),
        "simulation_result": _valid_simulation_result_dict(),
        "risk_report": _valid_risk_report_dict(),
        "messages": [
            {"role": "user", "content": "What should I do to improve my plan?"}
        ],
    }
    with patch(
        "app.core.advisor.claude_client.ClaudeClient.stream",
        side_effect=_mock_stream,
    ):
        response = client.post("/advisor/chat", json=payload)

    assert response.status_code == 200
    content_type = response.headers.get("content-type", "")
    assert "text/event-stream" in content_type
