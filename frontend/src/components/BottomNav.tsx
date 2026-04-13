"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutList, Moon, BookOpen } from "lucide-react";

const NAV = [
  { href: "/",              icon: Home,       label: "홈" },
  { href: "/plan",          icon: LayoutList, label: "계획" },
  { href: "/retrospective", icon: Moon,       label: "회고" },
  { href: "/history",       icon: BookOpen,   label: "기록" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px]
                    flex justify-around items-center h-16 px-4 border-t"
         style={{ background: "var(--tarot-surface)", borderColor: "var(--tarot-border)" }}>
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = path === href;
        return (
          <Link key={href} href={href}
                className="flex flex-col items-center gap-0.5 text-xs"
                style={{ color: active ? "var(--tarot-accent)" : "var(--tarot-muted)" }}>
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
