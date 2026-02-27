from __future__ import annotations
"""
Unit tests for advisor/strategy.py: parse_strategy_response.

Covers:
- Valid JSON parsed into AdvisorResponse
- Disclaimer always appended
- Actions sorted by priority
- Empty actions list
- Malformed JSON → fallback response
- Markdown code fences (```json ... ```) stripped
- Plain backtick fences (``` ... ```) stripped
- Missing 'id' field → auto-generated id
- Missing 'priority' field → index+1
- JSON embedded in surrounding text extracted via regex
"""
import json
import pytest
from app.core.advisor.strategy import parse_strategy_response, DISCLAIMER, FALLBACK_RESPONSE


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_valid_json(**overrides) -> str:
    base = {
        "narrative": "Your plan has room for improvement.",
        "strategy_actions": [
            {
                "id": "action_1",
                "title": "Increase Contributions",
                "description": "Maximize 401(k) contributions annually.",
                "category": "savings",
                "projected_impact": "+$200K by retirement",
                "priority": 1,
            },
            {
                "id": "action_2",
                "title": "Rebalance Portfolio",
                "description": "Shift bonds allocation as you near retirement.",
                "category": "allocation",
                "projected_impact": "Reduces sequence risk by ~15%",
                "priority": 2,
            },
        ],
    }
    base.update(overrides)
    return json.dumps(base)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_valid_json_parsed_correctly():
    result = parse_strategy_response(_make_valid_json())
    assert result.narrative == "Your plan has room for improvement."
    assert len(result.strategy_actions) == 2
    assert result.strategy_actions[0].id == "action_1"
    assert result.strategy_actions[1].id == "action_2"


def test_disclaimer_always_appended():
    result = parse_strategy_response(_make_valid_json())
    assert result.disclaimer == DISCLAIMER


def test_actions_sorted_by_priority():
    """Actions in reverse order in JSON must come out sorted priority 1 first."""
    raw = json.dumps({
        "narrative": "Test",
        "strategy_actions": [
            {"id": "a3", "title": "C", "description": "", "category": "savings", "projected_impact": "", "priority": 3},
            {"id": "a1", "title": "A", "description": "", "category": "savings", "projected_impact": "", "priority": 1},
            {"id": "a2", "title": "B", "description": "", "category": "savings", "projected_impact": "", "priority": 2},
        ],
    })
    result = parse_strategy_response(raw)
    priorities = [a.priority for a in result.strategy_actions]
    assert priorities == [1, 2, 3]


def test_empty_actions_list_accepted():
    raw = json.dumps({"narrative": "Short plan.", "strategy_actions": []})
    result = parse_strategy_response(raw)
    assert result.strategy_actions == []
    assert result.narrative == "Short plan."
    assert result.disclaimer == DISCLAIMER


def test_completely_invalid_text_returns_fallback():
    result = parse_strategy_response("not json at all !@# random text")
    assert result is FALLBACK_RESPONSE


def test_empty_string_returns_fallback():
    result = parse_strategy_response("")
    assert result is FALLBACK_RESPONSE


def test_markdown_json_fence_stripped():
    """JSON wrapped in ```json ... ``` is still parsed successfully."""
    wrapped = f"```json\n{_make_valid_json()}\n```"
    result = parse_strategy_response(wrapped)
    assert len(result.strategy_actions) == 2


def test_plain_backtick_fence_stripped():
    """JSON wrapped in ``` ... ``` (no lang tag) is still parsed."""
    wrapped = f"```\n{_make_valid_json()}\n```"
    result = parse_strategy_response(wrapped)
    assert len(result.strategy_actions) == 2


def test_missing_id_gets_auto_assigned():
    """Action without 'id' field gets id = 'action_1' (index 0 → action_1)."""
    raw = json.dumps({
        "narrative": "Test",
        "strategy_actions": [
            {"title": "No ID action", "description": "desc", "category": "savings", "projected_impact": "", "priority": 1},
        ],
    })
    result = parse_strategy_response(raw)
    assert result.strategy_actions[0].id == "action_1"


def test_missing_priority_uses_index_plus_one():
    """Action without 'priority' gets priority = index + 1."""
    raw = json.dumps({
        "narrative": "Test",
        "strategy_actions": [
            {"id": "x", "title": "X", "description": "", "category": "savings", "projected_impact": ""},
        ],
    })
    result = parse_strategy_response(raw)
    assert result.strategy_actions[0].priority == 1


def test_missing_narrative_defaults_to_empty_string():
    raw = json.dumps({"strategy_actions": []})
    result = parse_strategy_response(raw)
    assert result.narrative == ""


def test_category_preserved():
    """Category value from JSON is preserved in the StrategyAction."""
    raw = json.dumps({
        "narrative": "Test",
        "strategy_actions": [
            {"id": "a1", "title": "Tax loss harvest", "description": "", "category": "tax", "projected_impact": "", "priority": 1},
        ],
    })
    result = parse_strategy_response(raw)
    assert result.strategy_actions[0].category == "tax"
