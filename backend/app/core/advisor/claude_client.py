"""
Anthropic SDK wrapper with retry/backoff for the Wealth Planner OS advisor.
Supports single-turn completion and SSE streaming.
"""
from __future__ import annotations
import asyncio
from typing import AsyncIterator, Optional
import anthropic
from app.config import settings

MODEL = "claude-sonnet-4-6"
MAX_TOKENS = 2048
RETRY_BASE_DELAY = 1.0


class ClaudeClient:
    def __init__(self):
        if not settings.anthropic_api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY is not set. Please configure it in backend/.env"
            )
        self._client = anthropic.AsyncAnthropic(
            api_key=settings.anthropic_api_key,
            timeout=settings.claude_timeout,
        )

    async def complete(self, user_prompt: str, system: Optional[str] = None) -> str:
        """Single-turn completion with retry."""
        messages = [{"role": "user", "content": user_prompt}]
        kwargs: dict = {
            "model": MODEL,
            "max_tokens": MAX_TOKENS,
            "messages": messages,
        }
        if system:
            kwargs["system"] = system

        max_retries = settings.claude_max_retries
        for attempt in range(max_retries):
            try:
                response = await self._client.messages.create(**kwargs)
                return response.content[0].text
            except (anthropic.RateLimitError, asyncio.TimeoutError):
                if attempt < max_retries - 1:
                    await asyncio.sleep(RETRY_BASE_DELAY * (2 ** attempt))
                else:
                    raise
            except anthropic.APIStatusError as e:
                if e.status_code >= 500 and attempt < max_retries - 1:
                    await asyncio.sleep(RETRY_BASE_DELAY * (2 ** attempt))
                else:
                    raise

        raise RuntimeError("Max retries exceeded")

    async def stream(
        self,
        system_prompt: str,
        messages: list[dict],
    ) -> AsyncIterator[str]:
        """Streaming completion — yields text tokens as they arrive."""
        messages = messages[-settings.max_chat_history:]
        async with self._client.messages.stream(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text
