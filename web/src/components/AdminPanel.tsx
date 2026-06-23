"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ProgressState {
  current_week: number;
  current_day: number;
  completed_days: number[];
  total_days: number;
  streak: { current: number; longest: number };
}

export default function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(false);
  const [checked, setChecked] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const router = useRouter();

  // Detect dev mode at runtime — ping the API
  useEffect(() => {
    let cancelled = false;
    fetch("/api/ping")
      .then((r) => {
        if (!cancelled && r.ok) setAvailable(true);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => { cancelled = true; };
  }, []);

  const loadProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/progress");
      if (res.ok) setProgress(await res.json());
    } catch {
      // ignore
    }
  }, []);

  // Load progress when panel opens
  useEffect(() => {
    if (open) loadProgress();
  }, [open, loadProgress]);

  const flash = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 2000);
  };

  const handleCheckIn = useCallback(async () => {
    try {
      const res = await fetch("/api/progress/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await loadProgress();
        router.refresh();
        flash("✓ 打卡成功！");
      }
    } catch {
      flash("✗ 失败");
    }
  }, [loadProgress, router]);

  const handleAdvanceDay = useCallback(async () => {
    if (!progress) return;
    try {
      const res = await fetch("/api/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_day: progress.current_day + 1 }),
      });
      if (res.ok) {
        await loadProgress();
        router.refresh();
        flash("→ 前进一天");
      }
    } catch {
      flash("✗ 失败");
    }
  }, [progress, loadProgress, router]);

  // Don't render anything until we've checked dev mode
  if (!checked) return null;
  // Hide in static/production mode
  if (!available) return null;

  return (
    <>
      {/* Floating gear button */}
      <button
        onClick={() => setOpen(!open)}
        title="管理面板"
        style={{
          position: "fixed",
          bottom: "5rem",
          right: "1rem",
          zIndex: 50,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          fontSize: "1.2em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        {open ? "✕" : "⚙"}
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "8.5rem",
            right: "1rem",
            zIndex: 50,
            width: "280px",
            borderRadius: "16px",
            border: "1px solid #262626",
            background: "#171717",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            padding: "16px",
            fontSize: "13px",
            color: "#a3a3a3",
          }}
        >
          <h3
            style={{
              fontWeight: 600,
              color: "#ededed",
              marginBottom: "12px",
              fontSize: "14px",
            }}
          >
            ⚙ 管理面板
          </h3>

          {progress && (
            <div style={{ marginBottom: "12px" }}>
              <div style={{ marginBottom: "4px" }}>
                Week{" "}
                <strong style={{ color: "#ededed" }}>
                  {progress.current_week}
                </strong>{" "}
                · Day{" "}
                <strong style={{ color: "#ededed" }}>
                  {progress.current_day}
                </strong>
              </div>
              <div style={{ marginBottom: "4px" }}>
                已完成{" "}
                <strong style={{ color: "#22c55e" }}>
                  {progress.completed_days.length}
                </strong>
                /{progress.total_days} 天
              </div>
              <div>
                连续打卡{" "}
                <strong style={{ color: "#3b82f6" }}>
                  {progress.streak.current}
                </strong>{" "}
                天 · 最长 {progress.streak.longest} 天
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={handleCheckIn}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid rgba(34,197,94,0.3)",
                background: "rgba(34,197,94,0.1)",
                color: "#22c55e",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              ✅ 今日打卡 (Day {progress?.current_day ?? "?"})
            </button>
            <button
              onClick={handleAdvanceDay}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #262626",
                background: "#0d0d0d",
                color: "#a3a3a3",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              → 前进到 Day {(progress?.current_day ?? 0) + 1}
            </button>
            <button
              onClick={() => { setOpen(false); router.push("/admin"); }}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid rgba(168,85,247,0.3)",
                background: "rgba(168,85,247,0.1)",
                color: "#a78bfa",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              📚 主题管理
            </button>
          </div>

          {statusMsg && (
            <div
              style={{
                marginTop: "10px",
                textAlign: "center",
                fontSize: "12px",
                color: "#60a5fa",
              }}
            >
              {statusMsg}
            </div>
          )}

          <p
            style={{
              marginTop: "10px",
              fontSize: "10px",
              color: "#525252",
              textAlign: "center",
            }}
          >
            修改保存到 data/*.yaml
          </p>
        </div>
      )}
    </>
  );
}
