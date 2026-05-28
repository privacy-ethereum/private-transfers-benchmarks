const FETCH_TIMEOUT_MS = 15_000;
const JINA_TIMEOUT_MS = 30_000;
const SPA_FALLBACK_MIN_CHARS = 500;
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
 * Client-rendered SPAs (Next.js, etc.) whose plain HTML strips to <500 chars are retried
 * via the r.jina.ai reader proxy, which runs a headless browser server-side. The citation
 * `source` field stays the canonical URL — only the cached content comes from Jina.
 */
export async function fetchTextFromUrl(url: string): Promise<FetchedSource | null> {
  if (url.endsWith(".pdf")) return fetchTextFromUrl(url.replace(/\.pdf$/, ".html"));

  // Repo root → try README on main, then master.
  if (GITHUB_ROOT_URL.test(url)) {
    const base = url.replace("github.com", "raw.githubusercontent.com").replace(/\/$/, "");
    for (const branch of ["main", "master"]) {
      const rawUrl = `${base}/${branch}/README.md`;
      const rawResponse = await fetch(rawUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).catch(() => null);
      if (rawResponse?.ok) return { text: stripHtml(await rawResponse.text()), sourceUrl: rawUrl };
    }
    return null;
  }

  // Blob URL → rewrite to raw, keep the blob URL as the citation source.
  const blob = GITHUB_BLOB_URL.exec(url);
  if (blob) {
    const rawUrl = `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}`;
    const rawResponse = await fetch(rawUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).catch(() => null);
    return rawResponse?.ok ? { text: (await rawResponse.text()).trim(), sourceUrl: url } : null;
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).catch(() => null);
  const stripped = response?.ok ? stripHtml(await response.text()) : "";
  // A failed request or a near-empty body — a client-rendered SPA shell, or a blocked page —
  // means the direct fetch did not return the real content. Retry once via the Jina reader
  // (which renders the page server-side), falling back to whatever the direct fetch yielded.
  if (stripped.length < SPA_FALLBACK_MIN_CHARS) {
    return (await fetchViaJina(url)) ?? (stripped ? { text: stripped, sourceUrl: url } : null);
  }
  return { text: stripped, sourceUrl: url };
}

/**
 * Fetch via r.jina.ai reader proxy. Used as a fallback when the direct fetch returns
 * a near-empty SPA shell or fails. The proxy returns markdown — we strip it the same way
 * so the cached text and any cited spans round-trip through the same normalisation.
 */
async function fetchViaJina(url: string): Promise<FetchedSource | null> {
  const proxyUrl = `https://r.jina.ai/${url}`;
  const jinaResponse = await fetch(proxyUrl, { signal: AbortSignal.timeout(JINA_TIMEOUT_MS) }).catch(() => null);
  if (!jinaResponse?.ok) return null;
  const text = (await jinaResponse.text()).trim();
  return text.length >= SPA_FALLBACK_MIN_CHARS ? { text, sourceUrl: url } : null;
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
