# routers/retrospective.py
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


class RetrospectiveRequest(BaseModel):
    cards: list[CardInput]
    completed_tasks: list[str]
    incomplete_tasks: list[str]
    nlp_result: NlpResult


class RetrospectiveResponse(BaseModel):
    summary: str
    retrospective: str


_RETROSPECTIVES = [
    {
        "summary": "오늘 하루, 당신은 충분히 잘 해냈습니다",
        "retrospective": (
            "하루를 마무리하며 카드들이 오늘의 여정을 돌아봅니다.\n\n"
            "**완료한 일들에 대해**: 계획했던 일들을 실행에 옮긴 당신의 행동력을 칭찬합니다. "
            "결과에 상관없이, 시작하고 완수하는 것 자체가 값진 성취입니다. "
            "오늘의 노력은 내일의 토대가 됩니다.\n\n"
            "**미완료된 일들에 대해**: 다 하지 못한 것들을 자책하지 마세요. "
            "사람의 에너지에는 한계가 있고, 때로는 멈추는 것도 지혜입니다. "
            "내일 더 새로운 마음으로 시작할 수 있는 기회가 남아있습니다.\n\n"
            "**카드가 전하는 오늘의 의미**: 오늘 하루는 성공도 실패도 아닌, "
            "당신이 성장하는 과정의 소중한 한 페이지입니다. "
            "작은 것에 감사하는 마음으로 하루를 닫으세요.\n\n"
            "내일도 카드가 당신의 하루를 함께할 것입니다. 편안한 밤 되세요."
        ),
    },
    {
        "summary": "도전의 하루, 그 용기를 기억하세요",
        "retrospective": (
            "오늘 카드들은 당신이 얼마나 용감하게 하루를 살았는지를 비추어 줍니다.\n\n"
            "**완료한 일들에 대해**: 해냈습니다! 오늘 완수한 모든 것들은 당신의 의지와 집중력의 증거입니다. "
            "스스로를 충분히 격려해주세요. 이 성취감을 내일의 에너지원으로 삼으세요.\n\n"
            "**미완료된 일들에 대해**: 다 끝내지 못한 것들이 있더라도 괜찮습니다. "
            "무엇이 방해가 되었는지, 어떻게 하면 내일 더 잘 할 수 있을지를 짧게 메모해두면 충분합니다. "
            "미완성은 실패가 아니라 계속되는 이야기입니다.\n\n"
            "**오늘을 통해 배운 것**: 완벽한 하루보다 진실된 하루가 더 값집니다. "
            "오늘 당신은 진실되게 살았습니다.\n\n"
            "따뜻한 휴식을 취하세요. 내일의 당신은 오늘보다 더 강해져 있을 것입니다."
        ),
    },
    {
        "summary": "균형 잡힌 하루, 내면의 성장이 느껴집니다",
        "retrospective": (
            "오늘 하루를 마무리하는 카드 배열에서 성숙과 균형의 에너지가 느껴집니다.\n\n"
            "**완료한 일들에 대해**: 계획한 것을 실행하는 능력은 가장 중요한 역량 중 하나입니다. "
            "오늘 그 능력을 발휘했습니다. 작은 체크 표시 하나하나가 모여 큰 성취가 됩니다.\n\n"
            "**미완료된 일들에 대해**: 남겨진 과제들을 내일의 선물이라고 생각해보세요. "
            "오늘 다 소진하지 않고 남겨둔 것은, 내일 새로운 활력으로 시작할 수 있다는 뜻이기도 합니다.\n\n"
            "**카드가 건네는 마지막 메시지**: 오늘 하루 동안 당신 안에서 조용하지만 분명한 성장이 일어났습니다. "
            "눈에 보이지 않는 성장이 결국 가장 큰 변화를 만들어냅니다.\n\n"
            "오늘 수고 많았습니다. 내일도 함께하겠습니다."
        ),
    },
]


@router.post("/retrospective", response_model=RetrospectiveResponse)
def retrospective(req: RetrospectiveRequest):
    preset = random.choice(_RETROSPECTIVES)
    return RetrospectiveResponse(
        summary=preset["summary"],
        retrospective=preset["retrospective"],
    )
