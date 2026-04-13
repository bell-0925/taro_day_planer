# routers/records.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import supabase

router = APIRouter()

# Supabase 연결 실패 시 사용하는 인메모리 저장소 (발표용 폴백)
_memory_store: dict[str, dict] = {}


class RecordIn(BaseModel):
    date: str
    cards: list
    nlp_result: dict | None = None
    fortune: str | None = None
    summary: str | None = None
    condition: str | None = None
    tasks: list[str] | None = None
    advice: str | None = None
    advice_summary: str | None = None
    completed_tasks: list[str] | None = None
    incomplete_tasks: list[str] | None = None
    retrospective: str | None = None
    retro_summary: str | None = None


def _use_db() -> bool:
    return supabase is not None


@router.post("", response_model=dict)
def save_record(record: RecordIn):
    data = record.model_dump()

    if _use_db():
        try:
            result = supabase.table("daily_records").upsert(data, on_conflict="date").execute()
            row = result.data[0]
            return {"id": row.get("id"), "date": row.get("date")}
        except Exception:
            pass  # DB 실패 시 인메모리로 폴백

    _memory_store[data["date"]] = data
    return {"id": None, "date": data["date"]}


@router.get("", response_model=list)
def get_records(year: int, month: int):
    if _use_db():
        try:
            start = f"{year:04d}-{month:02d}-01"
            end = f"{year:04d}-{month + 1:02d}-01" if month < 12 else f"{year + 1:04d}-01-01"
            result = (
                supabase.table("daily_records")
                .select("date,summary,cards,nlp_result,retro_summary")
                .gte("date", start)
                .lt("date", end)
                .order("date", desc=True)
                .execute()
            )
            return result.data
        except Exception:
            pass  # DB 실패 시 인메모리로 폴백

    prefix = f"{year:04d}-{month:02d}-"
    rows = [v for k, v in _memory_store.items() if k.startswith(prefix)]
    rows.sort(key=lambda x: x["date"], reverse=True)
    return rows


@router.get("/{date}", response_model=dict)
def get_record(date: str):
    if _use_db():
        try:
            result = (
                supabase.table("daily_records")
                .select("*")
                .eq("date", date)
                .single()
                .execute()
            )
            if result.data:
                return result.data
        except Exception:
            pass  # DB 실패 시 인메모리로 폴백

    row = _memory_store.get(date)
    if not row:
        raise HTTPException(404, f"{date} 기록 없음")
    return row
