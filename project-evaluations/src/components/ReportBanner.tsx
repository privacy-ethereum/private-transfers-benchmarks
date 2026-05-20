/**
 * Banner advertising the published State of Private Transfers report.
 *
 * Hidden by default. Set `VITE_REPORT_PUBLISHED=true` in `.env.local`
 * (or the deployment environment) to enable.
 */
export default function ReportBanner() {
  if (import.meta.env.VITE_REPORT_PUBLISHED !== "true") return null;

  return (
    <aside className="report-banner" aria-label="State of Private Transfers report">
      <span className="report-banner__text">The State of Private Transfers report is now available.</span>
      <a className="report-banner__link" href="/report.pdf" target="_blank" rel="noreferrer">
        Read the report →
      </a>
    </aside>
  );
}
