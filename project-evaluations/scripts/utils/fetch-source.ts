const FETCH_TIMEOUT_MS = 15_000;
const GITHUB_ROOT_URL = /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/;
const GITHUB_BLOB_URL = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/;

export interface FetchedSource {
  text: string;
  sourceUrl: string;
}

/**
 * Fetch a URL and strip to plain text. Returns null on failure.
 * PDFs → swapped for `.html`. github.com pages → rewritten to raw.githubusercontent.com
 * (the github HTML viewer serves chrome instead of file content). github.com blob URLs are
 * kept as the citation source so humans land on the readable viewer.
 */
export async function fetchTextFromUrl(url: string): Promise<FetchedSource | null> {
  if (url.endsWith(".pdf")) return fetchTextFromUrl(url.replace(/\.pdf$/, ".html"));

  // Repo root → try README on main, then master.
  if (GITHUB_ROOT_URL.test(url)) {
    const base = url.replace("github.com", "raw.githubusercontent.com").replace(/\/$/, "");
    for (const branch of ["main", "master"]) {
      const rawUrl = `${base}/${branch}/README.md`;
      const r = await fetch(rawUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).catch(() => null);
      if (r?.ok) return { text: stripHtml(await r.text()), sourceUrl: rawUrl };
    }
    return null;
  }

  // Blob URL → rewrite to raw, keep the blob URL as the citation source.
  const blob = GITHUB_BLOB_URL.exec(url);
  if (blob) {
    const rawUrl = `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}`;
    const r = await fetch(rawUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).catch(() => null);
    return r?.ok ? { text: (await r.text()).trim(), sourceUrl: url } : null;
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).catch(() => null);
  return response?.ok ? { text: stripHtml(await response.text()), sourceUrl: url } : null;
}

/**
 * Strip HTML tags + decode entities, then remove docs-site chrome (gitbook anchors, hackmd
 * sign-in widgets, "Last updated …", "Was this helpful?", "Copy page", etc.) that bleeds into
 * citation cited_text without adding substantive content. Normalise whitespace at the end.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<(nav|aside)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?(h[1-6]|p|div|li|tr|br|hr|section|article|header|footer|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\bhashtag(?=\s*\n)/g, "")
    .replace(/\barrow-up-right\b/g, "")
    .replace(/\bchevron-right\b|\bchevron-up\b|\bChevron Down\b/g, "")
    .replace(/\bLast updated \d+ (?:second|minute|hour|day|week|month|year)s? ago\b/gi, "")
    .replace(/\bWas this helpful\?\b/gi, "")
    .replace(/\bCopy page\b/g, "")
    .replace(/\bSkip to main content\b/gi, "")
    .replace(/Sign in[\s\S]{0,400}?Continue with a different method/gi, "")
    .replace(/Sign in via (?:Google|Facebook|X\(Twitter\)|GitHub|Dropbox|Wallet)/g, "")
    .replace(/\bForgot password\b/gi, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n /g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
