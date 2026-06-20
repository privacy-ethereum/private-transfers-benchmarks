import { config } from "../config.js";

export interface FetchResult {
  status: number;
  body: string;
  etag: string | null;
  lastModified: string | null;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Polite fetch: custom UA, timeout, exponential backoff on 429/5xx/network
 * errors, and conditional-GET support. A 304 returns an empty body with the
 * caller's validators echoed back.
 */
export const fetchPage = async (
  url: string,
  conditional?: { etag: string | null; lastModified: string | null },
): Promise<FetchResult> => {
  const headers: Record<string, string> = {
    "User-Agent": config.userAgent,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-CR,es;q=0.9",
  };
  if (conditional?.etag) headers["If-None-Match"] = conditional.etag;
  if (conditional?.lastModified) headers["If-Modified-Since"] = conditional.lastModified;

  let attempt = 0;
  for (;;) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timer);

      if (res.status === 304) {
        return { status: 304, body: "", etag: conditional?.etag ?? null, lastModified: conditional?.lastModified ?? null };
      }
      if ((res.status === 429 || res.status >= 500) && attempt < config.maxRetries) {
        await sleep(2 ** attempt * 1000);
        attempt += 1;
        continue;
      }
      const body = res.ok ? await res.text() : "";
      return {
        status: res.status,
        body,
        etag: res.headers.get("etag"),
        lastModified: res.headers.get("last-modified"),
      };
    } catch (err) {
      clearTimeout(timer);
      if (attempt >= config.maxRetries) throw err;
      await sleep(2 ** attempt * 1000);
      attempt += 1;
    }
  }
};
