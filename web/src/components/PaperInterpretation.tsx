"use client";

import { useState } from "react";

interface PaperInterpretationProps {
  arxivId: string;
  title?: string;
}

export default function PaperInterpretation({ arxivId, title }: PaperInterpretationProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInterpretation = async () => {
    if (html) { setOpen(!open); return; }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/papers/interpretation?arxiv_id=${encodeURIComponent(arxivId)}`);
      if (!resp.ok) {
        const err = await resp.json();
        setError(err.error || "Failed to load");
      } else {
        setHtml(await resp.text());
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
    setOpen(true);
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <button
        onClick={fetchInterpretation}
        disabled={loading}
        style={{
          padding: "6px 14px",
          borderRadius: "8px",
          border: "1px solid rgba(168,85,247,0.3)",
          background: loading ? "rgba(168,85,247,0.05)" : "rgba(168,85,247,0.1)",
          color: "#a78bfa",
          fontSize: "12px",
          cursor: loading ? "wait" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {loading ? "⏳ 加载中..." : open ? "📄 收起解读" : "📄 Cool Papers (Kimi) 中文解读"}
      </button>

      {/* External links */}
      <span style={{ marginLeft: "8px" }}>
        <a
          href={`https://papers.cool/arxiv/kimi?paper=${arxivId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "11px",
            color: "#60a5fa",
            textDecoration: "none",
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          🌐 原站
        </a>
        <a
          href={`https://arxiv.org/abs/${arxivId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "11px",
            color: "#737373",
            textDecoration: "none",
            marginLeft: "6px",
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid #262626",
          }}
        >
          arXiv
        </a>
      </span>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px" }}>{error}</p>
      )}

      {open && html && (
        <div
          style={{
            marginTop: "12px",
            padding: "20px",
            borderRadius: "14px",
            background: "#0d0d0d",
            border: "1px solid #262626",
            maxHeight: "600px",
            overflowY: "auto",
            fontSize: "14px",
            color: "#d4d4d4",
            lineHeight: 1.8,
          }}
        >
          <style>{`
            .paper-interpretation h1, .paper-interpretation h2, .paper-interpretation h3 { color: #ededed; margin-top: 1em; }
            .paper-interpretation p { margin: 0.5em 0; }
            .paper-interpretation img { max-width: 100%; border-radius: 8px; }
            .paper-interpretation a { color: #60a5fa; }
            .paper-interpretation code { background: #1a1a1a; padding: 1px 4px; border-radius: 3px; font-size: 0.9em; }
            .paper-interpretation pre { background: #1a1a1a; padding: 12px; border-radius: 8px; overflow-x: auto; }
            .paper-interpretation .katex { font-size: 1.05em; }
            .paper-interpretation table { border-collapse: collapse; width: 100%; }
            .paper-interpretation td, .paper-interpretation th { border: 1px solid #262626; padding: 8px; }
          `}</style>
          <div
            className="paper-interpretation"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
}
