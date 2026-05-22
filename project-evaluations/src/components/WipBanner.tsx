import GitHubIcon from "./GitHubIcon.js";

/** Notice that the dashboard is still in active development. */
export default function WipBanner() {
  return (
    <aside className="wip-banner" aria-label="Work in progress notice">
      <span className="wip-banner__text">
        ⚠️ Work in progress — we&apos;re actively adding protocols & refining evaluations.
      </span>
      <a
        className="wip-banner__link"
        href="https://github.com/privacy-ethereum/private-transfers-benchmarks/blob/main/CONTRIBUTING.md"
        target="_blank"
        rel="noreferrer"
      >
        Suggest fixes & contribute <GitHubIcon />
      </a>
    </aside>
  );
}
