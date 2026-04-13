// src/components/LoadingSpinner.tsx
export default function LoadingSpinner({ message = "로딩 중..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="w-10 h-10 rounded-full border-4 animate-spin"
           style={{ borderColor: "var(--tarot-accent)", borderTopColor: "transparent" }} />
      <p className="text-sm" style={{ color: "var(--tarot-muted)" }}>{message}</p>
    </div>
  );
}
