# routers/cards.py
import json
import random
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

BASE = Path(__file__).parent.parent
_original = json.loads((BASE / "cards_original.json").read_text(encoding="utf-8"))
_reversed = json.loads((BASE / "cards_reversed.json").read_text(encoding="utf-8"))

_reversed_map = {c["id"]: c for c in _reversed["cards_reversed"]}

# 실제 파일명과 JSON 카드명이 다른 경우를 명시적으로 매핑
_IMAGE_FILENAMES = {
    0:  "0. 바보 카드.jpg",
    1:  "1. 마법사 카드.jpg",
    2:  "2. 여사제 카드.jpg",      # JSON: 여교황
    3:  "3. 여황제 카드.jpg",
    4:  "4. 황제 카드.jpg",
    5:  "5. 교황 카드.jpg",
    6:  "6. 연인 카드.jpg",
    7:  "7. 전차 카드.jpg",
    8:  "8. 힘 카드.jpg",
    9:  "9. 은둔자 카드.jpg",
    10: "10. 운명의 수레바퀴.jpg",  # 파일명에 '카드' 없음
    11: "11. 정의 카드.jpg",
    12: "12. 행맨 카드.jpg",        # JSON: 매달린 사람
    13: "13. 죽음 카드.jpg",
    14: "14. 절제 카드.jpg",
    15: "15. 악마 카드.jpg",
    16: "16. 타워 카드.jpg",        # JSON: 탑
    17: "17. 별 카드.jpg",
    18: "18. 달 카드.jpg",
    19: "19. 태양 카드.jpg",
    20: "20. 심판 카드.jpg",
    21: "21. 세계 카드.jpg",
}


class DrawnCard(BaseModel):
    id: int
    name: str
    english: str
    reversed: bool
    direction: str
    meaning: str
    keywords: list
    energy: str
    image_url: str


class DrawResponse(BaseModel):
    cards: list[DrawnCard]


@router.post("/draw", response_model=DrawResponse)
def draw_cards():
    chosen = random.sample(_original["cards"], 3)
    result = []
    for card in chosen:
        cid = card["id"]
        is_reversed = random.random() < 0.3
        if is_reversed and cid in _reversed_map:
            rv = _reversed_map[cid]
            meaning = rv.get("meaning", card["meaning"])
            energy = rv.get("energy", card["energy"])
            direction = "역방향"
        else:
            meaning = card["meaning"]
            energy = card["energy"]
            direction = "정방향"
            is_reversed = False

        filename = _IMAGE_FILENAMES.get(cid, f"{cid}. {card['name']} 카드.jpg")
        image_url = f"/card_img/{filename}"

        result.append(DrawnCard(
            id=cid,
            name=card["name"],
            english=card["english"],
            reversed=is_reversed,
            direction=direction,
            meaning=meaning,
            keywords=card["keywords"],
            energy=energy,
            image_url=image_url,
        ))
    return DrawResponse(cards=result)
