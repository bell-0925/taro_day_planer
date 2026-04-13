// src/app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDailyStore } from "@/store/useDailyStore";
import { getRecordByDate } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

const today = () => new Date().toISOString().slice(0, 10);

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${["일","월","화","수","목","금","토"][d.getDay()]}요일`;
}

export default function HomePage() {
  const router = useRouter();
  const { cards } = useDailyStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getRecordByDate(today()).then((rec) => {
      if (rec?.fortune) {
        router.replace("/fortune");
      }
      setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);

  if (checking) return <LoadingSpinner message="오늘의 기록 확인 중..." />;

  return (
    <div className="flex flex-col items-center px-6 pt-8 gap-6 min-h-screen"
         style={{ background: "var(--tarot-bg)" }}>
      <div className="w-full flex justify-between items-center">
        <p className="text-sm" style={{ color: "var(--tarot-muted)" }}>{formatDate(today())}</p>
      </div>

      <div className="relative flex items-center justify-center w-48 h-48 my-4">
        <div className="w-40 h-40 rounded-full"
             style={{ background: "radial-gradient(circle at 35% 35%, #6d28d9, #1a0b33)" }} />
        <div className="absolute top-4 left-8 w-3 h-3 rounded-full"
             style={{ background: "#c4b5fd", opacity: 0.6 }} />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--tarot-text)" }}>
          타로 데이플래너
        </h1>
        <p className="text-sm" style={{ color: "var(--tarot-muted)" }}>
          타로카드로 오늘 하루를 계획하고 회고하세요
        </p>
      </div>

      {cards.length > 0 && (
        <button onClick={() => router.push("/fortune")}
                className="w-full py-4 rounded-full text-white font-semibold"
                style={{ background: "var(--tarot-surface)", border: "1px solid var(--tarot-border)" }}>
          오늘의 운세 보기
        </button>
      )}

      <button onClick={() => router.push("/draw")}
              className="w-full py-4 rounded-full text-white font-bold text-lg"
              style={{ background: "var(--tarot-accent)" }}>
        ✦ 오늘의 카드 뽑기
      </button>

      <p className="text-xs text-center" style={{ color: "var(--tarot-muted)" }}>
        매일 아침 3장의 카드로 과거 현재 미래를 읽어보세요
      </p>
    </div>
  );
}
