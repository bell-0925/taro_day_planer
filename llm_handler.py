# llm_handler.py

from dotenv import load_dotenv
import os
from prompts import (
    SPREAD_POSITIONS,
    FORTUNE_SYSTEM,  FORTUNE_USER,
    ADVICE_SYSTEM,   ADVICE_USER,
    RETROSPECTIVE_SYSTEM, RETROSPECTIVE_USER
)

load_dotenv(".env")

_github_token = os.getenv("GITHUB_TOKEN", "")

try:
    from openai import OpenAI
    _client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=_github_token or "placeholder",
    )
    _github_ready = bool(_github_token)
except Exception as e:
    import warnings
    warnings.warn(f"GitHub Models 클라이언트 초기화 실패: {e}")
    _client = None
    _github_ready = False


def _call_llm(system_prompt, user_prompt, temperature=0.7):
    if not _github_ready or _client is None:
        raise RuntimeError("GitHub Models 클라이언트가 초기화되지 않았습니다. GITHUB_TOKEN을 확인하세요.")
    response = _client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=temperature,
        max_tokens=1024,
    )
    return response.choices[0].message.content


def _cards_to_text(cards):
    """카드 리스트 → 과거-현재-미래 위치 포함 텍스트"""
    lines = []
    for i, card in enumerate(cards):
        position = SPREAD_POSITIONS[i]
        direction = "역방향" if card.get("reversed") else "정방향"
        lines.append(
            f"- {position['name']} 자리 ({position['desc']}): "
            f"{card['name']} ({direction})"
        )
    return "\n".join(lines)


def generate_fortune(cards, nlp_result, temperature=0.7):
    system_prompt = FORTUNE_SYSTEM
    user_prompt = FORTUNE_USER.format(
        cards_text=_cards_to_text(cards),
        keywords=", ".join(nlp_result.get("keywords", [])),
        sentiment_label=nlp_result.get("sentiment_label", ""),
        sentiment_score=nlp_result.get("sentiment_score", "")
    )
    return _call_llm(system_prompt, user_prompt, temperature)


def generate_advice(cards, tasks, condition, nlp_result, temperature=0.7):
    system_prompt = ADVICE_SYSTEM
    user_prompt = ADVICE_USER.format(
        cards_text=_cards_to_text(cards),
        condition=condition,
        tasks=tasks,
        keywords=", ".join(nlp_result.get("keywords", [])),
        sentiment_label=nlp_result.get("sentiment_label", "")
    )
    return _call_llm(system_prompt, user_prompt, temperature)


def generate_retrospective(cards, completed_tasks, incomplete_tasks, nlp_result, temperature=0.7):
    system_prompt = RETROSPECTIVE_SYSTEM
    user_prompt = RETROSPECTIVE_USER.format(
        cards_text=_cards_to_text(cards),
        completed_tasks=completed_tasks if completed_tasks else ["없음"],
        incomplete_tasks=incomplete_tasks if incomplete_tasks else ["없음"],
        keywords=", ".join(nlp_result.get("keywords", []))
    )
    return _call_llm(system_prompt, user_prompt, temperature)
