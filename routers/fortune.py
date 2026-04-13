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
    # Railway 메모리 제한으로 ML 모델 대신 LLM 직접 호출
    nlp = {"keywords": [], "sentiment_score": 0.5, "sentiment_label": "neutral"}
    llm_text = generate_fortune(cards_dict, nlp)
    summary, body = _parse_llm(llm_text)
    return FortuneResponse(
        summary=summary,
        fortune=body,
        nlp_result=NlpResult(**nlp),
    )
