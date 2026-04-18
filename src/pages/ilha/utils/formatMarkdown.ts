const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inlineFmt(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

export function formatMarkdown(raw: string): string {
  const escaped = escapeHtml(raw);
  const lines = escaped.split(/\r?\n/);

  const out: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const line of lines) {
    const listMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (listMatch) {
      if (!inList) {
        out.push('<ul class="md-list">');
        inList = true;
      }
      out.push(`<li>${inlineFmt(listMatch[1])}</li>`);
      continue;
    }
    closeList();
    if (line.trim() === "") {
      out.push("<br />");
    } else {
      out.push(inlineFmt(line));
    }
  }
  closeList();
  return out.join("\n");
}
