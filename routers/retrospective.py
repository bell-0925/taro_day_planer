# routers/retrospective.py
from fastapi import APIRouter
from pydantic import BaseModel
from llm_handler import generate_retrospective

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


class RetrospectiveRequest(BaseModel):
    cards: list[CardInput]
    completed_tasks: list[str]
    incomplete_tasks: list[str]
    nlp_result: NlpResult


class RetrospectiveResponse(BaseModel):
    summary: str
    retrospective: str


def _parse_llm(text: str) -> tuple[str, str]:
    """LLM 응답에서 한 줄 요약과 회고 본문을 파싱한다."""
    summary, body = "", ""
    for line in text.splitlines():
        if line.startswith("한 줄 요약:"):
            summary = line.replace("한 줄 요약:", "").strip()
        elif line.startswith("오늘의 회고:"):
            body = text[text.find("오늘의 회고:") + len("오늘의 회고:"):].strip()
    return summary, body


@router.post("/retrospective", response_model=RetrospectiveResponse)
def retrospective(req: RetrospectiveRequest):
    cards_dict = [c.model_dump() for c in req.cards]
    nlp_dict = req.nlp_result.model_dump()
    llm_text = generate_retrospective(cards_dict, req.completed_tasks, req.incomplete_tasks, nlp_dict)
    summary, body = _parse_llm(llm_text)
    return RetrospectiveResponse(summary=summary, retrospective=body)
