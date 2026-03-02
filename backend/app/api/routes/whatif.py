from __future__ import annotations
"""
What-If scenario parsing route.

POST /whatif/parse — takes a natural language question and the user's current
profile, asks Claude to interpret the question and return a modified UserProfile
along with a human-readable explanation of what changed.
"""
from fastapi import APIRouter
from app.schemas.whatif import WhatIfRequest, WhatIfResponse
from app.core.advisor.claude_client import ClaudeClient
from app.core.advisor.whatif_parser import WhatIfParser

router = APIRouter(prefix="/whatif")
_client: ClaudeClient | None = None
_parser: WhatIfParser | None = None


def get_parser() -> WhatIfParser:
    global _client, _parser
    if _client is None:
        _client = ClaudeClient()
    if _parser is None:
        _parser = WhatIfParser(_client)
    return _parser


@router.post("/parse", response_model=WhatIfResponse)
async def parse_whatif(request: WhatIfRequest) -> WhatIfResponse:
    """
    Parse a natural language what-if scenario into a modified UserProfile.

    Claude interprets the question (e.g. "What if I retire at 60?") and returns
    a complete modified profile plus a plain-English explanation of every change.
    The caller is expected to re-run /simulate and /risk/analyze with the returned
    modified_profile to produce comparison results.
    """
    return await get_parser().parse(request)
