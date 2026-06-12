/** Project IDs whose on-chain activity is benchmarked (Ethereum protocols). Single source
 *  of truth — imported by the dashboard (ProfileView) and the report generator
 *  (report/1_generate-markdown-report.ts). */
export const BENCHMARKED_PROJECT_IDS = new Set([
  "blanksquare",
  "curvy",
  "fluidkey",
  "hinkal",
  "houdiniswap",
  "intmax",
  "monero",
  "privacy-pools",
  "railgun",
  "redact",
  "tornado-cash",
  "veil-cash",
  "worm",
  "zerc20",
]);
