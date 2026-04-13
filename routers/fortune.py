# routers/fortune.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from llm_handler import generate_fortune

router = APIRouter()


class CardInput(BaseModel):
    name: str
    english: str
    reversed: bool
    direction: str
    meaning: str
    keywords: list
    energy: str


class FortuneRequest(BaseModel):
    cards: list[CardInput]


class NlpResult(BaseModel):
    keywords: list[str]
    sentiment_score: float
    sentiment_label: str


class FortuneResponse(BaseModel):
    summary: str
    fortune: str
    nlp_result: NlpResult


def _parse_llm(text: str) -> tuple[str, str]:
    """LLM 응답에서 한 줄 요약과 운세 본문을 파싱한다."""
    summary, body = "", ""
    for line in text.splitlines():
        if line.startswith("한 줄 요약:"):
            summary = line.replace("한 줄 요약:", "").strip()
        elif line.startswith("오늘의 운세:"):
            body = text[text.find("오늘의 운세:") + len("오늘의 운세:"):].strip()
    return summary, body


@router.post("/fortune", response_model=FortuneResponse)
def fortune(req: FortuneRequest):
    if len(req.cards) < 3:
        raise HTTPException(400, "카드 3장이 필요합니다")
    cards_dict = [c.model_dump() for c in req.cards]
    nlp = {"keywords": [], "sentiment_score": 0.5, "sentiment_label": "neutral"}
    try:
        llm_text = generate_fortune(cards_dict, nlp)
        summary, body = _parse_llm(llm_text)
    except Exception as e:
        # LLM 호출 실패 시 카드 이름 기반 폴백
        card_names = ", ".join(c["name"] for c in cards_dict)
        summary = f"{card_names} 카드의 하루"
        body = f"오늘의 카드는 {card_names}입니다. 카드의 에너지를 따라 하루를 보내세요. (LLM 오류: {e})"
    return FortuneResponse(
        summary=summary,
        fortune=body,
        nlp_result=NlpResult(**nlp),
    )
