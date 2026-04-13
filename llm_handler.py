# llm_handler.py

from dotenv import load_dotenv
import os
from prompts import (
    SPREAD_POSITIONS,
    FORTUNE_SYSTEM,  FORTUNE_USER,
    ADVICE_SYSTEM,   ADVICE_USER,
    RETROSPECTIVE_SYSTEM, RETROSPECTIVE_USER
)

load_dotenv("GEMINI_API_KEY.env")

_gemini_key = os.getenv("GEMINI_API_KEY", "")

try:
    import google.generativeai as genai
    genai.configure(api_key=_gemini_key or "placeholder")
    _model = genai.GenerativeModel("gemini-2.0-flash-lite")
    _gemini_ready = bool(_gemini_key)
except Exception as e:
    import warnings
    warnings.warn(f"Gemini 클라이언트 초기화 실패: {e}")
    _model = None
    _gemini_ready = False


def _call_llm(system_prompt, user_prompt, temperature=0.7):
    if not _gemini_ready or _model is None:
        raise RuntimeError("Gemini 클라이언트가 초기화되지 않았습니다. GEMINI_API_KEY를 확인하세요.")
    prompt = f"{system_prompt}\n\n{user_prompt}"
    response = _model.generate_content(
        prompt,
        generation_config={"temperature": temperature, "max_output_tokens": 1024},
    )
    return response.text


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
