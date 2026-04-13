// frontend/src/app/plan/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDailyStore, type Condition } from "@/store/useDailyStore";
import { fetchAdvice } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

const CONDITIONS: Condition[] = ["최고", "좋음", "보통", "나쁨"];

export default function PlanPage() {
  const router = useRouter();
  const { cards, nlpResult, condition, tasks, advice, adviceSummary,
          setCondition, setTasks, setAdvice } = useDailyStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cards.length === 0) router.replace("/");
  }, [cards, router]);

  function addTask() {
    const t = input.trim();
    if (!t) return;
    setTasks([...tasks, t]);
    setInput("");
  }

  function removeTask(i: number) {
    setTasks(tasks.filter((_, idx) => idx !== i));
  }

  async function handleAdvice() {
    if (!condition || !nlpResult) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdvice(cards, condition, tasks, nlpResult);
      setAdvice(result.summary, result.advice);
    } catch {
      setError("조언을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col px-6 pt-6 gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} style={{ color: "var(--tarot-muted)" }}>‹</button>
        <h2 className="text-lg font-bold">오늘의 할 일 & 조언</h2>
      </div>

      {/* 컨디션 */}
      <div>
        <p className="text-xs mb-2" style={{ color: "var(--tarot-muted)" }}>오늘 컨디션</p>
        <div className="flex gap-2">
          {CONDITIONS.map((c) => (
            <button key={c} onClick={() => setCondition(c)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: condition === c ? "var(--tarot-accent)" : "var(--tarot-card)",
                      color: condition === c ? "white" : "var(--tarot-muted)",
                      border: `1px solid ${condition === c ? "var(--tarot-accent)" : "var(--tarot-border)"}`,
                    }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 할 일 입력 */}
      <div>
        <p className="text-xs mb-2" style={{ color: "var(--tarot-muted)" }}>오늘 할 일</p>
        <div className="flex gap-2 mb-3">
          <input value={input} onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && addTask()}
                 placeholder="할 일 추가..."
                 className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                 style={{ background: "var(--tarot-card)", color: "var(--tarot-text)",
                          border: "1px solid var(--tarot-border)" }} />
          <button onClick={addTask} className="px-4 py-3 rounded-xl text-sm font-bold"
                  style={{ background: "var(--tarot-accent)", color: "white" }}>+</button>
        </div>
        <ul className="flex flex-col gap-2">
          {tasks.map((t, i) => (
            <li key={t + i} className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
                style={{ background: "var(--tarot-card)" }}>
              <span style={{ color: "var(--tarot-text)" }}>· {t}</span>
              <button onClick={() => removeTask(i)} style={{ color: "var(--tarot-muted)" }}>✕</button>
            </li>
          ))}
        </ul>
      </div>

      {/* 조언 버튼 */}
      <button onClick={handleAdvice}
              disabled={!condition || loading}
              className="w-full py-4 rounded-full font-bold text-white disabled:opacity-40"
              style={{ background: "var(--tarot-accent)" }}>
        {loading ? "조언 생성 중..." : "✦ 카드 기반 조언 받기"}
      </button>

      {error && (
        <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>
      )}

      {/* 조언 결과 */}
      {advice && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl p-4"
               style={{ background: "var(--tarot-card)", border: "1px solid var(--tarot-gold)" }}>
            <p className="text-sm font-bold" style={{ color: "var(--tarot-gold)" }}>{adviceSummary}</p>
          </div>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--tarot-muted)" }}>오늘의 조언</p>
            <p className="text-sm leading-7" style={{ color: "var(--tarot-text)" }}>{advice}</p>
          </div>
        </div>
      )}
    </div>
  );
}
