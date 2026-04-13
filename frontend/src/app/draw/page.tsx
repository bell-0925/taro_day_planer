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
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleShuffle() {
    setLoadingMsg("카드를 섞는 중...");
    setLoading(true);
    setError(null);
    try {
      const { cards } = await drawCards();
      setDeck(cards);
      setRevealed([false, false, false]); // 섞으면 다시 뒤집힌 상태로
    } catch (e) {
      setError(`카드 섞기 실패: ${e instanceof Error ? e.message : "서버 연결 오류"}`);
    } finally {
      setLoading(false);
    }
  }

  function handleFlip(i: number) {
    if (deck.length === 0) return; // 아직 섞기 전이면 무시
    setRevealed((prev) => prev.map((v, idx) => (idx === i ? true : v)));
  }

  async function handleConfirm() {
    if (!allRevealed) return;
    setLoadingMsg("운세를 읽는 중... (처음엔 30초 정도 걸릴 수 있어요)");
    setLoading(true);
    setError(null);
    setCards(deck);
    try {
      const result = await fetchFortune(deck);
      setFortune(result.summary, result.fortune, result.nlp_result);
      router.push("/fortune");
    } catch (e) {
      setError(`운세 생성 실패: ${e instanceof Error ? e.message : "서버 오류"}`);
    } finally {
      setLoading(false);
    }
  }

  const allRevealed = deck.length > 0 && revealed.every(Boolean);

  if (loading) return <LoadingSpinner message={loadingMsg} />;

  return (
    <div className="flex flex-col px-6 pt-6 gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg" style={{ color: "var(--tarot-muted)" }}>‹</button>
        <h2 className="text-lg font-bold">오늘의 카드 뽑기</h2>
      </div>

      <p className="text-sm text-center" style={{ color: "var(--tarot-text)" }}>
        마음을 가라앉히고 3장의 카드를<br />직관에 따라 선택하세요
      </p>

      <p className="text-xs text-center" style={{ color: "var(--tarot-muted)" }}>
        {deck.length === 0
          ? "먼저 카드를 섞어주세요"
          : allRevealed
            ? "카드가 모두 공개됐습니다"
            : "카드를 탭하여 한 장씩 공개하세요"}
      </p>

      {error && (
        <p className="text-sm text-center rounded-xl px-4 py-3"
           style={{ color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)" }}>
          {error}
        </p>
      )}

      {/* 카드 3장 */}
      <div className="flex justify-center gap-4 my-4">
        {POSITIONS.map((pos, i) => (
          <TarotCard
            key={pos}
            position={pos}
            card={deck[i]}
            selected={revealed[i]}
            faceDown={!revealed[i]}
            onClick={() => handleFlip(i)}
          />
        ))}
      </div>

      <button onClick={handleShuffle}
              className="w-full py-3 rounded-full font-semibold border"
              style={{ borderColor: "var(--tarot-border)", color: "var(--tarot-text)", background: "transparent" }}>
        ✦ 카드 섞기
      </button>

      <button onClick={handleConfirm}
              disabled={!allRevealed}
              className="w-full py-4 rounded-full font-bold text-white disabled:opacity-40"
              style={{ background: "var(--tarot-accent)" }}>
        이 카드로 오늘을 시작할게요
      </button>
    </div>
  );
}
