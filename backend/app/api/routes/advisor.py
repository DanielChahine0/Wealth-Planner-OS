from __future__ import annotations
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.schemas.advisor import RecommendRequest, AdvisorResponse, ChatRequest
from app.core.advisor.claude_client import ClaudeClient
from app.core.advisor.prompt_builder import build_recommend_prompt, build_chat_system_prompt
from app.core.advisor.strategy import parse_strategy_response

router = APIRouter(prefix="/advisor")
client = ClaudeClient()


@router.post("/recommend", response_model=AdvisorResponse)
async def recommend(request: RecommendRequest) -> AdvisorResponse:
    prompt = build_recommend_prompt(
        request.profile, request.simulation_result, request.risk_report
    )
    response_text = await client.complete(prompt)
    return parse_strategy_response(response_text)


@router.post("/chat")
async def chat(request: ChatRequest):
    system_prompt = build_chat_system_prompt(
        request.profile, request.simulation_result, request.risk_report
    )
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    async def event_stream():
        async for token in client.stream(system_prompt, messages):
            data = json.dumps({"token": token})
            yield f"data: {data}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
