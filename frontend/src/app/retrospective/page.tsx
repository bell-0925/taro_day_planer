// frontend/src/app/retrospective/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDailyStore } from "@/store/useDailyStore";
import { fetchRetrospective, saveRecord } from "@/lib/api";

export default function RetrospectivePage() {
  const router = useRouter();
  const store = useDailyStore();
  const { cards, nlpResult, tasks, setRetrospective } = store;

  const [checked, setChecked] = useState<boolean[]>(() => tasks.map(() => false));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cards.length === 0) {
      router.replace("/");
    }
  }, [cards, router]);

  function toggle(i: number) {
    setChecked((prev) => prev.map((v, idx) => idx === i ? !v : v));
  }

  async function handleRetro() {
    if (!nlpResult) return;
    const done = tasks.filter((_, i) => checked[i] ?? false);
    const notDone = tasks.filter((_, i) => !(checked[i] ?? false));
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRetrospective(cards, done, notDone, nlpResult);
      setRetrospective(result.summary, result.retrospective, done, notDone);

      // Supabase 저장
      const s = useDailyStore.getState();
      await saveRecord({
        date: s.date,
        cards: s.cards.map(c => ({ id: c.id, name: c.name, reversed: c.reversed, direction: c.direction })),
        nlp_result: s.nlpResult,
        fortune: s.fortune,
        summary: s.summary,
        condition: s.condition ?? "보통",
        tasks: s.tasks,
        advice: s.advice,
        advice_summary: s.adviceSummary,
        completed_tasks: done,
        incomplete_tasks: notDone,
        retrospective: result.retrospective,
        retro_summary: result.summary,
      });
      setSaved(true);
    } catch {
      setError("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (cards.length === 0) return null;

  const { retrospective, retroSummary } = store;

  return (
    <div className="flex flex-col px-6 pt-6 gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} style={{ color: "var(--tarot-muted)" }}>‹</button>
        <h2 className="text-lg font-bold">오늘의 회고</h2>
      </div>

      <p className="text-sm text-center" style={{ color: "var(--tarot-muted)" }}>
        하루를 마무리하며 돌아보는 시간
      </p>

      {/* 할 일 체크 */}
      <div>
        <div className="flex gap-2 mb-3">
          {["완료(체크)", "별(현재)", "미완(이동)"].map((t, i) => (
            <button key={i} className="px-3 py-1 rounded-full text-xs"
                    style={{ background: i === 1 ? "var(--tarot-surface)" : "transparent",
                             color: "var(--tarot-muted)", border: "1px solid var(--tarot-border)" }}>
              {t}
            </button>
          ))}
        </div>

        <p className="text-xs mb-3" style={{ color: "var(--tarot-muted)" }}>오늘 할 일 체크</p>
        <ul className="flex flex-col gap-2">
          {tasks.map((t, i) => (
            <li key={t + i} onClick={() => toggle(i)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                style={{ background: "var(--tarot-card)" }}>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                   style={{ borderColor: (checked[i] ?? false) ? "var(--tarot-accent)" : "var(--tarot-border)",
                            background: (checked[i] ?? false) ? "var(--tarot-accent)" : "transparent" }}>
                {(checked[i] ?? false) && <span className="text-white text-xs">✓</span>}
              </div>
              <span className="text-sm" style={{ color: (checked[i] ?? false) ? "var(--tarot-muted)" : "var(--tarot-text)",
                                                  textDecoration: (checked[i] ?? false) ? "line-through" : "none" }}>
                {t}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleRetro}
              disabled={loading || saved}
              className="w-full py-4 rounded-full font-bold text-white disabled:opacity-40"
              style={{ background: "var(--tarot-accent)" }}>
        {loading ? "회고 생성 중..." : saved ? "저장 완료 ✓" : "✦ AI 회고 생성하기"}
      </button>

      {error && (
        <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>
      )}

      {retroSummary && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl p-4"
               style={{ background: "var(--tarot-card)", border: "1px solid var(--tarot-gold)" }}>
            <p className="text-sm font-bold" style={{ color: "var(--tarot-gold)" }}>{retroSummary}</p>
          </div>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--tarot-muted)" }}>오늘의 회고</p>
            <p className="text-sm leading-7" style={{ color: "var(--tarot-text)" }}>{retrospective}</p>
          </div>
        </div>
      )}
    </div>
  );
}
