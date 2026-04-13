// src/components/TarotCard.tsx
"use client";
import Image from "next/image";
import type { DrawnCard } from "@/lib/api";

interface TarotCardProps {
  card?: DrawnCard;
  position: "과거" | "현재" | "미래";
  selected?: boolean;
  faceDown?: boolean;
  onClick?: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function TarotCard({ card, position, selected, faceDown, onClick }: TarotCardProps) {
  return (
    <div onClick={onClick}
         className="flex flex-col items-center gap-2 cursor-pointer">
      <div className="w-24 h-36 rounded-xl overflow-hidden border-2 transition-all"
           style={{
             borderColor: selected ? "var(--tarot-gold)" : "var(--tarot-border)",
             background: "var(--tarot-card)",
             boxShadow: selected ? "0 0 16px var(--tarot-gold)" : undefined,
           }}>
        {!faceDown && card ? (
          <Image
            src={`${API}${encodeURI(card.image_url)}`}
            alt={card.name}
            width={96} height={144}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
               style={{ background: "var(--tarot-card)" }}>
            <span className="text-3xl">✦</span>
          </div>
        )}
      </div>
      <span className="text-xs font-medium"
            style={{ color: selected ? "var(--tarot-gold)" : "var(--tarot-muted)" }}>
        {position}
      </span>
    </div>
  );
}
