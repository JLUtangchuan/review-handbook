/**
 * Proxy to papers.cool/arxiv/kimi for Chinese paper interpretations.
 * GET /api/papers/interpretation?arxiv_id=2307.15818
 */

const cache = new Map<string, { html: string; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const arxivId = searchParams.get("arxiv_id");

  if (!arxivId) {
    return Response.json({ error: "arxiv_id is required" }, { status: 400 });
  }

  // Check cache
  const cached = cache.get(arxivId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return new Response(cached.html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "X-Cache": "HIT" },
    });
  }

  try {
    const url = `https://papers.cool/arxiv/kimi?paper=${encodeURIComponent(arxivId)}`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; review-handbook/1.0)",
      },
    });

    if (!resp.ok) {
      return Response.json(
        { error: `papers.cool returned ${resp.status}` },
        { status: 502 }
      );
    }

    let html = await resp.text();

    // Clean up HTML: remove scripts, fix relative URLs
    html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
    html = html.replace(/<link[^>]*>/gi, "");
    html = html.replace(/src="\//g, 'src="https://papers.cool/');
    html = html.replace(/href="\//g, 'href="https://papers.cool/');

    // Cache
    cache.set(arxivId, { html, ts: Date.now() });
    // Limit cache size
    if (cache.size > 50) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
      if (oldest) cache.delete(oldest[0]);
    }

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "X-Cache": "MISS" },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
