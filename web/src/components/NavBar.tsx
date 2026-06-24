"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "路线图", href: "/roadmap", icon: "🗺️" },
  { label: "卡片学习", href: "/cards", icon: "🃏" },
  { label: "笔记", href: "/notes", icon: "📝" },
  { label: "进度", href: "/topics", icon: "📊" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    fetch("/api/ping").then(r => r.ok && setIsDev(true)).catch(() => {});
  }, []);

  const items = isDev
    ? [...navItems, { label: "管理", href: "/admin", icon: "⚙" }]
    : navItems;

  return (
    <>
      {/* Desktop: Fixed left sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-56 md:border-r md:border-border md:bg-surface md:z-30">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <span className="text-xl">📚</span>
          <span className="font-semibold text-base">复习手册</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 py-3 flex-1">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-card-hover"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs text-muted">具身智能 · 100天</p>
        </div>
      </aside>

      {/* Mobile: Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-border safe-bottom">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 ${
                  isActive ? "text-primary" : "text-muted"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
