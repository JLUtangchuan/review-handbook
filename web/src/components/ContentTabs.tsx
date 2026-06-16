"use client";

import { useState } from "react";

export type TabKey = "foundations" | "interview_qa" | "advanced" | "coding" | "papers";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "foundations", label: "基础知识", icon: "📖" },
  { key: "interview_qa", label: "面试问答", icon: "💬" },
  { key: "advanced", label: "进阶知识", icon: "🚀" },
  { key: "coding", label: "Coding", icon: "💻" },
  { key: "papers", label: "推荐论文", icon: "📄" },
];

interface ContentTabsProps {
  defaultTab?: TabKey;
  counts: Record<TabKey, number>;
  children: (activeTab: TabKey) => React.ReactNode;
}

export default function ContentTabs({
  defaultTab = "foundations",
  counts,
  children,
}: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  return (
    <div>
      {/* Tab bar — scrollable on mobile */}
      <div className="flex border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10 overflow-x-auto -mx-4 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center gap-1 py-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden text-[10px]">{tab.label.slice(0, 2)}</span>
            {counts[tab.key] > 0 && (
              <span
                className={`text-[10px] px-1 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-primary/10"
                    : "bg-card text-muted"
                }`}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-3">{children(activeTab)}</div>
    </div>
  );
}
