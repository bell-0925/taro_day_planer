// src/app/fortune/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDailyStore } from "@/store/useDailyStore";
import TarotCard from "@/components/TarotCard";
import SentimentBadge from "@/components/SentimentBadge";

const POSITIONS = ["과거", "현재", "미래"] as const;

export default function FortunePage() {
  const router = useRouter();
  const { cards, fortune, summary, nlpResult } = useDailyStore();

  useEffect(() => {
    if (cards.length === 0) router.replace("/");
  }, [cards, router]);

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col px-6 pt-6 gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} style={{ color: "var(--tarot-muted)" }}>‹</button>
        <h2 className="text-lg font-bold">오늘의 운세</h2>
      </div>

      <p className="text-xs text-center" style={{ color: "var(--tarot-muted)" }}>
        {new Date().toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric", weekday:"long" })}
      </p>

      <div className="flex justify-center gap-3">
        {cards.map((card, i) => (
          <TarotCard key={i} card={card} position={POSITIONS[i]} selected />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--tarot-muted)" }}>오늘의 에너지</span>
        {nlpResult && <SentimentBadge label={nlpResult.sentiment_label} />}
      </div>

      <div className="rounded-xl p-4" style={{ background: "var(--tarot-card)", border: "1px solid var(--tarot-gold)" }}>
        <p className="text-sm font-bold" style={{ color: "var(--tarot-gold)" }}>{summary}</p>
      </div>

      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--tarot-muted)" }}>오늘의 운세</p>
        <p className="text-sm leading-7" style={{ color: "var(--tarot-text)" }}>{fortune}</p>
      </div>

      <button onClick={() => router.push("/plan")}
              className="w-full py-4 rounded-full font-bold text-white mt-2"
              style={{ background: "var(--tarot-accent)" }}>
        오늘의 할 일 계획하기 →
      </button>
    </div>
  );
}
