# routers/advice.py
import random
from fastapi import APIRouter
from pydantic import BaseModel

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


_ADVICES = [
    {
        "summary": "우선순위를 명확히 하고 한 가지에 집중하세요",
        "advice": (
            "오늘 카드들이 보내는 메시지는 '선택과 집중'입니다.\n\n"
            "계획한 일들 중에서 가장 중요한 것 하나를 골라 거기에 에너지를 쏟아보세요. "
            "모든 것을 한꺼번에 해결하려는 욕심을 내려놓으면, 오히려 더 많은 것을 이룰 수 있습니다.\n\n"
            "**오전**: 오늘 가장 중요한 태스크를 먼저 처리하세요. 두뇌가 가장 맑은 시간을 활용하세요.\n\n"
            "**오후**: 집중력이 흐트러질 때는 5분간 휴식 후 재시작하는 방식으로 리듬을 유지하세요.\n\n"
            "**저녁**: 완료한 일을 체크하며 작은 성취를 스스로 인정해주세요. "
            "자기 자신에게 친절한 하루가 내일의 동력이 됩니다.\n\n"
            "카드의 에너지가 오늘 당신의 집중력을 응원하고 있습니다."
        ),
    },
    {
        "summary": "유연하게 흐름을 타면서 변화를 받아들이세요",
        "advice": (
            "오늘의 카드는 계획에 너무 얽매이지 말고 상황에 유연하게 대응하라고 말합니다.\n\n"
            "예상치 못한 변화가 생기더라도 당황하지 마세요. "
            "때로는 계획이 바뀌는 것이 더 좋은 결과로 이어지는 법입니다.\n\n"
            "**오전**: 오늘의 할 일 목록을 가볍게 검토하고, 반드시 해야 할 것과 미뤄도 되는 것을 구분하세요.\n\n"
            "**오후**: 협력이 필요한 일이 있다면 망설이지 말고 도움을 요청하세요. "
            "혼자 해결하려고 힘 빼지 않아도 됩니다.\n\n"
            "**저녁**: 오늘 하루 어떤 감정을 느꼈는지 잠깐 돌아보세요. "
            "감정을 인식하는 것만으로도 내일이 더 가벼워집니다.\n\n"
            "오늘 당신의 적응력과 지혜가 빛날 것입니다."
        ),
    },
    {
        "summary": "꾸준함이 답입니다. 오늘도 한 걸음씩 나아가세요",
        "advice": (
            "오늘의 카드는 작은 것들이 모여 큰 변화를 만든다는 진리를 상기시켜줍니다.\n\n"
            "거창한 목표보다는 오늘 할 수 있는 작은 행동에 집중하세요. "
            "매일 1%씩 성장하면 1년 후에는 완전히 다른 사람이 되어 있을 것입니다.\n\n"
            "**오전**: 가장 하기 싫었던 일부터 시작해보세요. 완료하면 나머지가 훨씬 수월해집니다.\n\n"
            "**오후**: 중간에 멈추고 싶은 마음이 들어도 딱 10분만 더 해보세요. "
            "그 10분이 오늘의 가장 값진 시간이 될 수 있습니다.\n\n"
            "**저녁**: 완벽하지 않아도 괜찮습니다. 오늘 시도했다는 것 자체가 성공입니다.\n\n"
            "카드가 당신의 꾸준한 노력을 축복합니다."
        ),
    },
]


@router.post("/advice", response_model=AdviceResponse)
def advice(req: AdviceRequest):
    preset = random.choice(_ADVICES)
    return AdviceResponse(
        summary=preset["summary"],
        advice=preset["advice"],
    )
