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
MAX_RETRIES = 3
RETRY_BASE_DELAY = 1.0


class ClaudeClient:
    def __init__(self):
        self._client = anthropic.AsyncAnthropic(
            api_key=settings.anthropic_api_key
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

        for attempt in range(MAX_RETRIES):
            try:
                response = await self._client.messages.create(**kwargs)
                return response.content[0].text
            except anthropic.RateLimitError:
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_BASE_DELAY * (2 ** attempt))
                else:
                    raise
            except anthropic.APIStatusError as e:
                if e.status_code >= 500 and attempt < MAX_RETRIES - 1:
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
        async with self._client.messages.stream(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text
