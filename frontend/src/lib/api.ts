const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type DrawnCard = {
  id: number; name: string; english: string;
  reversed: boolean; direction: string;
  meaning: string; keywords: string[]; energy: string; image_url: string;
};

export type NlpResult = {
  keywords: string[]; sentiment_score: number; sentiment_label: string;
};

export async function drawCards(): Promise<{ cards: DrawnCard[] }> {
  const res = await fetch(`${BASE}/cards/draw`, { method: "POST" });
  if (!res.ok) throw new Error("카드 추첨 실패");
  return res.json();
}

export async function fetchFortune(cards: DrawnCard[]) {
  const res = await fetch(`${BASE}/fortune`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cards }),
    signal: AbortSignal.timeout(120_000), // 2분 — 첫 요청 시 모델 로딩 대기
  });
  if (!res.ok) throw new Error("운세 생성 실패");
  return res.json() as Promise<{ summary: string; fortune: string; nlp_result: NlpResult }>;
}

export async function fetchAdvice(
  cards: DrawnCard[], condition: string, tasks: string[], nlp_result: NlpResult
) {
  const res = await fetch(`${BASE}/advice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cards, condition, tasks, nlp_result }),
  });
  if (!res.ok) throw new Error("조언 생성 실패");
  return res.json() as Promise<{ summary: string; advice: string }>;
}

export async function fetchRetrospective(
  cards: DrawnCard[], completed_tasks: string[], incomplete_tasks: string[], nlp_result: NlpResult
) {
  const res = await fetch(`${BASE}/retrospective`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cards, completed_tasks, incomplete_tasks, nlp_result }),
  });
  if (!res.ok) throw new Error("회고 생성 실패");
  return res.json() as Promise<{ summary: string; retrospective: string }>;
}

export async function saveRecord(record: Record<string, unknown>) {
  const res = await fetch(`${BASE}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error("기록 저장 실패");
  return res.json();
}

export async function getRecords(year: number, month: number) {
  const res = await fetch(`${BASE}/records?year=${year}&month=${month}`);
  if (!res.ok) throw new Error("기록 조회 실패");
  return res.json();
}

export async function getRecordByDate(date: string) {
  const res = await fetch(`${BASE}/records/${date}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("기록 조회 실패");
  return res.json();
}
