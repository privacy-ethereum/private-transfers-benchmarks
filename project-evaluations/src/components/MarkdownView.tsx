import type { ReactNode } from "react";

const MARKDOWN_LINK_REGEX = /^\[([^\]]+)\]\(([^)]+)\)$/;
const MARKDOWN_PARTS_REGEX = /(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
const MARKDOWN_HEADING_REGEX = /^(#{1,6})\s+(.*)$/;
const MARKDOWN_HORIZONTAL_RULE_REGEX = /^(-{3,}|\*{3,}|_{3,})$/;
const MARKDOWN_UNORDERED_LIST_REGEX = /^[-*]\s+/;
const MARKDOWN_ORDERED_LIST_REGEX = /^\d+\.\s+/;

interface MarkdownViewProps {
  markdown: string;
}

function renderMarkdownInline(text: string): ReactNode[] {
  const parts = text.split(MARKDOWN_PARTS_REGEX).filter((part) => part !== "");

  return parts.map((part, i) => {
    const isCode = part.startsWith("`") && part.endsWith("`");

    if (isCode) {
      return <code key={`i-${i}`}>{part.slice(1, -1)}</code>;
    }

    const linkMatch = MARKDOWN_LINK_REGEX.exec(part);
    const isLink = linkMatch !== null;

    if (isLink) {
      const label = linkMatch[1];
      const href = linkMatch[2];

      return (
        <a key={`i-${i}`} href={href} target="_blank" rel="noreferrer" className="ext-link">
          {label}
        </a>
      );
    }

    const isBold = part.startsWith("**") && part.endsWith("**");

    if (isBold) {
      return <strong key={`i-${i}`}>{part.slice(2, -2)}</strong>;
    }

    const isItalic = part.startsWith("*") && part.endsWith("*");

    if (isItalic) {
      return <em key={`i-${i}`}>{part.slice(1, -1)}</em>;
    }

    // normal text
    return <span key={`i-${i}`}>{part}</span>;
  });
}

export default function MarkdownView({ markdown }: MarkdownViewProps) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    // blank line, skip
    if (trimmed === "") {
      i += 1;
      continue;
    }

    // code block
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;

      while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
        codeLines.push(lines[i] ?? "");
        i += 1;
      }

      if (i < lines.length) {
        i += 1;
      }

      blocks.push(
        <pre key={`code-${blocks.length}`} className="md-code">
          {language !== "" && <div className="md-code__lang">{language}</div>}
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // heading
    const headingMatch = MARKDOWN_HEADING_REGEX.exec(trimmed);

    if (headingMatch !== null) {
      const depth = headingMatch[1].length > 0 ? headingMatch[1].length : 1;
      const content = headingMatch[2];

      if (depth === 1) {
        blocks.push(
          <h1 key={`h-${blocks.length}`} className="md-h1">
            {renderMarkdownInline(content)}
          </h1>,
        );
      } else if (depth === 2) {
        blocks.push(
          <h2 key={`h-${blocks.length}`} className="md-h2">
            {renderMarkdownInline(content)}
          </h2>,
        );
      } else {
        blocks.push(
          <h3 key={`h-${blocks.length}`} className="md-h3">
            {renderMarkdownInline(content)}
          </h3>,
        );
      }

      i += 1;
      continue;
    }

    // horizontal rule
    if (MARKDOWN_HORIZONTAL_RULE_REGEX.test(trimmed)) {
      blocks.push(<hr key={`hr-${blocks.length}`} className="md-hr" />);
      i += 1;
      continue;
    }

    // unordered list
    if (MARKDOWN_UNORDERED_LIST_REGEX.test(trimmed)) {
      const items: string[] = [];

      while (i < lines.length && MARKDOWN_UNORDERED_LIST_REGEX.test((lines[i] ?? "").trim())) {
        items.push((lines[i] ?? "").trim().replace(MARKDOWN_UNORDERED_LIST_REGEX, ""));
        i += 1;
      }

      blocks.push(
        <ul key={`ul-${blocks.length}`} className="md-ul">
          {items.map((item, itemIndex) => (
            <li key={`li-${itemIndex}`}>{renderMarkdownInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // ordered list
    if (MARKDOWN_ORDERED_LIST_REGEX.test(trimmed)) {
      const items: string[] = [];

      while (i < lines.length && MARKDOWN_ORDERED_LIST_REGEX.test((lines[i] ?? "").trim())) {
        items.push((lines[i] ?? "").trim().replace(MARKDOWN_ORDERED_LIST_REGEX, ""));
        i += 1;
      }

      blocks.push(
        <ol key={`ol-${blocks.length}`} className="md-ol">
          {items.map((item, itemIndex) => (
            <li key={`li-${itemIndex}`}>{renderMarkdownInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];

      while (i < lines.length && (lines[i] ?? "").trim().startsWith(">")) {
        quoteLines.push((lines[i] ?? "").trim().replace(/^>\s?/, ""));
        i += 1;
      }

      blocks.push(
        <blockquote key={`q-${blocks.length}`} className="md-quote">
          {renderMarkdownInline(quoteLines.join(" "))}
        </blockquote>,
      );
      continue;
    }

    // paragraph
    const paragraphLines: string[] = [];

    while (
      i < lines.length &&
      (lines[i] ?? "").trim() !== "" &&
      !MARKDOWN_HEADING_REGEX.test((lines[i] ?? "").trim()) &&
      !MARKDOWN_UNORDERED_LIST_REGEX.test((lines[i] ?? "").trim()) &&
      !MARKDOWN_ORDERED_LIST_REGEX.test((lines[i] ?? "").trim()) &&
      !(lines[i] ?? "").trim().startsWith("```") &&
      !(lines[i] ?? "").trim().startsWith(">") &&
      !MARKDOWN_HORIZONTAL_RULE_REGEX.test((lines[i] ?? "").trim())
    ) {
      paragraphLines.push((lines[i] ?? "").trim());
      i += 1;
    }

    blocks.push(
      <p key={`p-${blocks.length}`} className="md-p">
        {renderMarkdownInline(paragraphLines.join(" "))}
      </p>,
    );
  }

  return <div className="md-view">{blocks}</div>;
}
