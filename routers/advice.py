# routers/advice.py
from fastapi import APIRouter
from pydantic import BaseModel
from llm_handler import generate_advice

router = APIRouter()


class CardInput(BaseModel):
    name: str
    english: str
    reversed: bool
    direction: str
    meaning: str
    keywords: list
    energy: str


class NlpResult(BaseModel):
    keywords: list[str]
    sentiment_score: float
    sentiment_label: str


class AdviceRequest(BaseModel):
    cards: list[CardInput]
    condition: str
    tasks: list[str]
    nlp_result: NlpResult


class AdviceResponse(BaseModel):
    summary: str
    advice: str


def _parse_llm(text: str) -> tuple[str, str]:
    """LLM 응답에서 한 줄 요약과 조언 본문을 파싱한다."""
    summary, body = "", ""
    for line in text.splitlines():
        if line.startswith("한 줄 요약:"):
            summary = line.replace("한 줄 요약:", "").strip()
        elif line.startswith("오늘의 조언:"):
            body = text[text.find("오늘의 조언:") + len("오늘의 조언:"):].strip()
    return summary, body


@router.post("/advice", response_model=AdviceResponse)
def advice(req: AdviceRequest):
    cards_dict = [c.model_dump() for c in req.cards]
    nlp_dict = req.nlp_result.model_dump()
    llm_text = generate_advice(cards_dict, req.tasks, req.condition, nlp_dict)
    summary, body = _parse_llm(llm_text)
    return AdviceResponse(summary=summary, advice=body)
