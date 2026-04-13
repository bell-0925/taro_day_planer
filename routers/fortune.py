# routers/fortune.py
import random
from fastapi import APIRouter, HTTPException
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


_FORTUNES = [
    {
        "summary": "새로운 시작과 풍요로운 에너지가 당신을 감쌉니다",
        "fortune": (
            "오늘 뽑힌 카드들은 당신에게 강렬한 변화와 성장의 메시지를 전하고 있습니다.\n\n"
            "과거 자리의 카드는 지금까지 쌓아온 경험과 노력이 결코 헛되지 않았음을 알려줍니다. "
            "때로는 힘들고 지칠 때도 있었지만, 그 모든 순간이 오늘의 당신을 만들어 왔습니다.\n\n"
            "현재 자리의 카드는 지금 이 순간 당신 안에 잠든 잠재력이 깨어나고 있음을 보여줍니다. "
            "자신을 믿고 한 걸음씩 나아가세요. 작은 행동 하나가 큰 변화를 만들어냅니다.\n\n"
            "미래 자리의 카드는 머지않아 노력의 결실을 맺는 시기가 찾아올 것임을 예고합니다. "
            "오늘 하루 긍정적인 마음으로 임한다면, 그 에너지가 좋은 결과로 돌아올 것입니다.\n\n"
            "오늘의 한마디: 당신은 이미 충분히 준비되어 있습니다. 자신을 믿으세요."
        ),
    },
    {
        "summary": "직관을 따르면 원하는 답을 찾을 수 있는 하루",
        "fortune": (
            "오늘의 카드 배열은 내면의 목소리에 귀 기울이라는 메시지를 전하고 있습니다.\n\n"
            "과거 자리의 카드는 당신이 걸어온 길에서 얻은 지혜가 지금도 살아 숨쉬고 있음을 상기시킵니다. "
            "과거의 경험은 현재의 나침반이 됩니다.\n\n"
            "현재 자리의 카드는 선택의 기로에 서 있는 당신에게 두려움 없이 앞으로 나아갈 것을 권합니다. "
            "완벽한 타이밍을 기다리기보다, 지금 이 순간이 바로 시작할 때입니다.\n\n"
            "미래 자리의 카드는 균형과 조화의 에너지를 담고 있습니다. "
            "서두르지 않고 자신의 페이스를 유지한다면 원하는 목표에 자연스럽게 도달할 수 있을 것입니다.\n\n"
            "오늘의 한마디: 답은 이미 당신 안에 있습니다. 고요히 내면의 소리를 들어보세요."
        ),
    },
    {
        "summary": "도전과 용기로 새로운 가능성을 열어가는 날",
        "fortune": (
            "오늘 뽑힌 세 장의 카드는 강한 의지와 행동력을 요구하는 에너지를 담고 있습니다.\n\n"
            "과거 자리의 카드는 지금까지의 시도와 실험들이 당신을 더 단단하게 만들었음을 보여줍니다. "
            "실패처럼 보였던 순간들조차 모두 값진 배움이었습니다.\n\n"
            "현재 자리의 카드는 창의적인 에너지가 넘치는 시기임을 알려줍니다. "
            "새로운 아이디어나 방법을 시도해보기에 최적의 순간입니다. 틀을 깨는 것을 두려워하지 마세요.\n\n"
            "미래 자리의 카드는 노력한 만큼 성취가 뒤따를 것임을 보장합니다. "
            "오늘의 용기 있는 선택이 내일의 성공을 만들어냅니다.\n\n"
            "오늘의 한마디: 완벽함보다 실행이 중요합니다. 오늘 한 가지라도 시작해보세요."
        ),
    },
]


@router.post("/fortune", response_model=FortuneResponse)
def fortune(req: FortuneRequest):
    if len(req.cards) < 3:
        raise HTTPException(400, "카드 3장이 필요합니다")

    preset = random.choice(_FORTUNES)
    nlp = NlpResult(
        keywords=["성장", "변화", "균형"],
        sentiment_score=0.82,
        sentiment_label="positive",
    )
    return FortuneResponse(
        summary=preset["summary"],
        fortune=preset["fortune"],
        nlp_result=nlp,
    )
