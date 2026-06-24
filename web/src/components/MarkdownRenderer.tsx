/**
 * Markdown → HTML renderer
 * Supports: headings, bold, italic, lists, links, code blocks,
 *           blockquotes, images, inline math ($...$), block math ($$...$$)
 */

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = renderMarkdown(content);

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderMarkdown(md: string): string {
  let html = md;

  // Protect inline math before other processing: $...$ → placeholder
  const mathInline: string[] = [];
  html = html.replace(/\$([^$\n]+?)\$/g, (_m, expr) => {
    mathInline.push(expr.trim());
    return `%%MATH_INLINE_${mathInline.length - 1}%%`;
  });

  // Protect block math: $$...$$ → placeholder
  const mathBlock: string[] = [];
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_m, expr) => {
    mathBlock.push(expr.trim());
    return `%%MATH_BLOCK_${mathBlock.length - 1}%%`;
  });

  // Code blocks (```...```)
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_match, lang, code) => {
      const escaped = escapeHtml(code.trimEnd());
      return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
    }
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Images ![alt](url) — must be before links
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" style="max-width:100%;border-radius:8px;margin:8px 0" />'
  );

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Bold **text** or __text__
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // Italic *text* or _text_ (single, not double)
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>");

  // Headings
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Unordered lists
  html = html.replace(/^[\s]*[-*] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^[\s]*\d+\. (.+)$/gm, "<li>$1</li>");

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, "<blockquote><p>$1</p></blockquote>");
  html = html.replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>");

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr>");

  // Paragraphs: wrap remaining text blocks in <p>
  const blocks = html.split(/\n\n+/);
  html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<img")
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  // Restore inline math placeholders
  html = html.replace(/%%MATH_INLINE_(\d+)%%/g, (_m, idx) => {
    const expr = mathInline[parseInt(idx)] || "";
    return `<span class="math-inline" data-math="${escapeAttr(expr)}">\\(${escapeHtml(expr)}\\)</span>`;
  });

  // Restore block math placeholders
  html = html.replace(/%%MATH_BLOCK_(\d+)%%/g, (_m, idx) => {
    const expr = mathBlock[parseInt(idx)] || "";
    return `<div class="math-block" data-math="${escapeAttr(expr)}">\\[${escapeHtml(expr)}\\]</div>`;
  });

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
