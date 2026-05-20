interface TopBarProps {
  dark: boolean;
  onToggleDark: () => void;
}

export default function TopBar({ dark, onToggleDark }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true" />
        <h1>Private Transfers Analysis</h1>
      </div>
      <div className="meta">
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
