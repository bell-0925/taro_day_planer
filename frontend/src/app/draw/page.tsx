// src/app/draw/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDailyStore } from "@/store/useDailyStore";
import { drawCards, fetchFortune, type DrawnCard } from "@/lib/api";
import TarotCard from "@/components/TarotCard";
import LoadingSpinner from "@/components/LoadingSpinner";

const POSITIONS = ["과거", "현재", "미래"] as const;

export default function DrawPage() {
  const router = useRouter();
  const { setCards, setFortune } = useDailyStore();
  const [deck, setDeck] = useState<DrawnCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  async function handleShuffle() {
    setLoadingMsg("카드를 섞는 중...");
    setLoading(true);
    try {
      const { cards } = await drawCards();
      setDeck(cards);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (deck.length === 0) return;
    setLoadingMsg("운세를 읽는 중...");
    setLoading(true);
    setCards(deck);
    try {
      const result = await fetchFortune(deck);
      setFortune(result.summary, result.fortune, result.nlp_result);
      router.push("/fortune");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner message={loadingMsg} />;

  return (
    <div className="flex flex-col px-6 pt-6 gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg" style={{ color: "var(--tarot-muted)" }}>‹</button>
        <h2 className="text-lg font-bold">오늘의 카드 뽑기</h2>
      </div>

      <p className="text-xs text-center" style={{ color: "var(--tarot-muted)" }}>
        {deck.length === 0 ? "카드를 섞어주세요" : "카드를 확인하세요"}
      </p>

      <p className="text-sm text-center" style={{ color: "var(--tarot-text)" }}>
        마음을 가라앉히고 3장의 카드를<br />직관에 따라 선택하세요
      </p>

      <div className="flex justify-center gap-4 my-4">
        {POSITIONS.map((pos, i) => (
          <TarotCard
            key={pos}
            position={pos}
            card={deck[i]}
            selected={deck.length > 0}
            faceDown={deck.length === 0}
          />
        ))}
      </div>

      <button onClick={handleShuffle}
              className="w-full py-3 rounded-full font-semibold border"
              style={{ borderColor: "var(--tarot-border)", color: "var(--tarot-text)", background: "transparent" }}>
        ✦ 카드 섞기
      </button>

      <button onClick={handleConfirm}
              disabled={deck.length === 0}
              className="w-full py-4 rounded-full font-bold text-white disabled:opacity-40"
              style={{ background: "var(--tarot-accent)" }}>
        이 카드로 오늘을 시작할게요
      </button>

      <p className="text-xs text-center" style={{ color: "var(--tarot-muted)" }}>
        카드를 탭하여 선택하세요
      </p>
    </div>
  );
}
