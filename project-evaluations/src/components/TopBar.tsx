import { evaluations } from "../data/evaluations/index.js";
import { PROPERTY_DEFINITIONS } from "../data/schema.js";

interface TopBarProps {
  dark: boolean;
  onToggleDark: () => void;
}

export default function TopBar({ dark, onToggleDark }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true" />
        <h1>Private Transfers Benchmarks</h1>
      </div>
      <div className="meta">
        <span>{__APP_VERSION__}</span>
        <span>
          {evaluations.length} protocols · {PROPERTY_DEFINITIONS.length} properties
        </span>
        <button
          className="theme-toggle"
          onClick={onToggleDark}
          aria-pressed={dark}
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
        >
          <span aria-hidden="true">{dark ? "☾" : "☀"}</span>
          {dark ? "Dark" : "Light"}
        </button>
      </div>
    </header>
  );
}
