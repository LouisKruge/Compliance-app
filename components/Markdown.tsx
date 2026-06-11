/**
 * Minimal markdown renderer for AI-generated documents.
 * Supports headings, bold, lists, blockquotes, tables and horizontal rules —
 * everything our safety-file engine emits — without pulling in a dependency.
 */

function inline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p
  );
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) { i++; continue; }

    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^[-: ]+$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      blocks.push(
        <div key={key++} className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>{head?.map((c, j) => <th key={j} className="border border-ink-200 bg-ink-50 px-3 py-2 text-left font-semibold">{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>{r.map((c, j) => <td key={j} className="border border-ink-200 px-3 py-2">{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)/);
    if (heading) {
      const level = heading[1].length;
      const cls = ["text-2xl font-extrabold mt-6", "text-xl font-bold mt-6", "text-lg font-bold mt-4", "font-bold mt-4"][level - 1];
      blocks.push(<div key={key++} className={cls}>{inline(heading[2])}</div>);
      i++;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="my-4 border-l-4 border-brand-400 bg-brand-50 px-4 py-2 text-sm text-ink-700">
          {inline(quote.join(" "))}
        </blockquote>
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-3 list-disc space-y-1 pl-6 text-sm">
          {items.map((it, j) => <li key={j}>{inline(it)}</li>)}
        </ul>
      );
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="my-6 border-ink-200" />);
      i++;
      continue;
    }

    blocks.push(<p key={key++} className="my-2 text-sm leading-relaxed">{inline(line)}</p>);
    i++;
  }

  return <div>{blocks}</div>;
}
