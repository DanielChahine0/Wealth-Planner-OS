"""
AI advisor routes.

Exposes two endpoints:

- POST /advisor/recommend — sends the full simulation + risk context to Claude
  (claude-sonnet-4-6) and returns a ranked list of personalized strategy
  recommendations with projected impact and an AI disclaimer.

- POST /advisor/chat — opens a Server-Sent Events (SSE) stream so the browser
  can receive a context-aware, token-by-token response from Claude.  The system
  prompt is built from the user's profile and simulation results so every chat
  reply is grounded in their actual financial plan.
"""
from __future__ import annotations
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.schemas.advisor import RecommendRequest, AdvisorResponse, ChatRequest
from app.core.advisor.claude_client import ClaudeClient
from app.core.advisor.prompt_builder import build_recommend_prompt, build_chat_system_prompt
from app.core.advisor.strategy import parse_strategy_response
from app.config import settings

router = APIRouter(prefix="/advisor")
client = ClaudeClient()


@router.post("/recommend", response_model=AdvisorResponse)
async def recommend(request: RecommendRequest) -> AdvisorResponse:
    """
    Generate ranked strategy recommendations from Claude.

    Builds a structured prompt from the user's financial profile, Monte Carlo
    simulation result, and risk report, then calls the Claude API (non-streaming)
    and parses the JSON strategy response into a validated AdvisorResponse.
    On any Claude API error the endpoint returns a degraded response with
    error="advisor_unavailable" rather than raising an HTTP exception, so the
    dashboard can still render partial results.
    """
    prompt = build_recommend_prompt(
        request.profile, request.simulation_result, request.risk_report
    )
    try:
        response_text = await client.complete(prompt)
        return parse_strategy_response(response_text)
    except Exception as e:
        return {"error": "advisor_unavailable", "detail": str(e)}


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Stream a context-aware AI chat response via Server-Sent Events (SSE).

    Builds a system prompt that embeds the user's profile and simulation
    context, then opens an async token stream from Claude.  Each token is
    forwarded to the client as an SSE data frame (``data: {"token": "..."}``).
    The stream terminates with ``data: [DONE]`` on success or
    ``data: {"error": "stream_failed"}`` on failure.  Chat history is capped
    at ``settings.max_chat_history`` turns to bound token usage.

    Returns a ``text/event-stream`` StreamingResponse with caching and
    proxy-buffering disabled so tokens reach the browser in real time.
    """
    system_prompt = build_chat_system_prompt(
        request.profile, request.simulation_result, request.risk_report
    )
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    messages = messages[-settings.max_chat_history:]

    async def event_stream():
        try:
            async for token in client.stream(system_prompt, messages):
                data = json.dumps({"token": token})
                yield f"data: {data}\n\n"
            yield "data: [DONE]\n\n"
        except Exception:
            yield 'data: {"error": "stream_failed"}\n\n'
            return

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
