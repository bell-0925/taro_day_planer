// src/components/SentimentBadge.tsx
const CONFIG = {
  positive: { label: "✦ positive", bg: "#10b98133", color: "#10b981" },
  negative: { label: "✦ negative", bg: "#ef444433", color: "#ef4444" },
  neutral:  { label: "✦ neutral",  bg: "#6b728033", color: "#9ca3af" },
};

export default function SentimentBadge({ label }: { label: string }) {
  const cfg = CONFIG[label as keyof typeof CONFIG] ?? CONFIG.neutral;
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}
