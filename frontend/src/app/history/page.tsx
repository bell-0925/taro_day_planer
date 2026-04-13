// frontend/src/app/history/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getRecords } from "@/lib/api";
import SentimentBadge from "@/components/SentimentBadge";
import LoadingSpinner from "@/components/LoadingSpinner";

type DailyRecord = {
  date: string; summary: string; retro_summary: string;
  cards: { name: string }[];
  nlp_result: { sentiment_label: string };
};

const FILTERS = ["전체", "운세", "계획", "회고"] as const;

export default function HistoryPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getRecords(year, month)
      .then((data: DailyRecord[]) => setRecords(data))
      .catch(() => setError("기록을 불러오는 중 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  }, [year, month]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  const displayed = filter === "전체" ? records
    : filter === "운세" ? records.filter(r => !!r.summary)
    : filter === "계획" ? records.filter(r => !!r.summary && !r.retro_summary)
    : records.filter(r => !!r.retro_summary); // 회고

  const displayedPositive = displayed.filter(r => r.nlp_result?.sentiment_label === "positive").length;
  const displayedRate = displayed.length > 0 ? Math.round((displayedPositive / displayed.length) * 100) : 0;

  return (
    <div className="flex flex-col px-6 pt-6 gap-5">
      <h2 className="text-lg font-bold">나의 타로 기록</h2>

      {/* 월 선택 */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={prevMonth} style={{ color: "var(--tarot-muted)" }}>‹</button>
        <span className="font-semibold">{year}년 {month}월</span>
        <button onClick={nextMonth} style={{ color: "var(--tarot-muted)" }}>›</button>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: filter === f ? "var(--tarot-accent)" : "var(--tarot-card)",
                    color: filter === f ? "white" : "var(--tarot-muted)",
                  }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : error ? (
        <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>
      ) : (
        <>
          {/* 기록 목록 */}
          <ul className="flex flex-col gap-3">
            {displayed.map((rec) => (
              <li key={rec.date} className="rounded-xl p-4"
                  style={{ background: "var(--tarot-card)" }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs" style={{ color: "var(--tarot-muted)" }}>
                    {new Date(rec.date).toLocaleDateString("ko-KR", { month:"long", day:"numeric", weekday:"short" })}
                  </span>
                  {rec.nlp_result && <SentimentBadge label={rec.nlp_result.sentiment_label} />}
                </div>
                <p className="text-xs mb-1" style={{ color: "var(--tarot-muted)" }}>
                  {rec.cards?.map(c => c.name).join(" · ")}
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--tarot-text)" }}>
                  {rec.summary}
                </p>
                {rec.retro_summary && (
                  <p className="text-xs mt-1" style={{ color: "var(--tarot-muted)" }}>회고: {rec.retro_summary}</p>
                )}
              </li>
            ))}
          </ul>

          {/* 월간 통계 */}
          {displayed.length > 0 && (
            <div className="rounded-xl p-4 flex justify-around"
                 style={{ background: "var(--tarot-card)" }}>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: "var(--tarot-accent)" }}>{displayed.length}</p>
                <p className="text-xs" style={{ color: "var(--tarot-muted)" }}>기록일</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: "var(--tarot-gold)" }}>{displayedRate}%</p>
                <p className="text-xs" style={{ color: "var(--tarot-muted)" }}>긍정 에너지</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
