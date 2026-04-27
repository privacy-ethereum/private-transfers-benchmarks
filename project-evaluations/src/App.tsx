import { useEffect, useState } from "react";

import CategoryBrowser from "./components/CategoryBrowser.js";
import ProfileView from "./components/ProfileView.js";
import ScorecardView from "./components/ScorecardView.js";
import TopBar from "./components/TopBar.js";
import { evaluations } from "./data/evaluations/index.js";

type ViewDirection = "score" | "category" | "profile";

const DIRECTIONS: { id: ViewDirection; label: string }[] = [
  { id: "score", label: "Scorecard & compare" },
  { id: "category", label: "Category browser" },
  { id: "profile", label: "Protocol profiles" },
];

function getStorageItemSafely(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function getSavedDir(): ViewDirection {
  const saved = getStorageItemSafely("ptb_dir");

  if (saved === "score" || saved === "category" || saved === "profile") {
    return saved;
  }

  return "score";
}

function getSavedDark(): boolean {
  const saved = getStorageItemSafely("ptb_dark");

  if (saved === "true") {
    return true;
  }

  if (saved === "false") {
    return false;
  }

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export default function App() {
  const [dir, setDir] = useState<ViewDirection>(getSavedDir);
  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("ptb_pinned");

      if (raw === null) {
        return [];
      }

      const parsed: unknown = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      const validIds = new Set(evaluations.map((p) => p.id));
      return (parsed as string[]).filter((id) => validIds.has(id));
    } catch {
      // ignore
    }
    return [];
  });
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [dark, setDark] = useState<boolean>(getSavedDark);
  const [profileSel, setProfileSel] = useState<string>(() => getStorageItemSafely("ptb_profile_sel") ?? "");

  useEffect(() => {
    localStorage.setItem("ptb_dir", dir);
    localStorage.setItem("ptb_pinned", JSON.stringify(pinned));
    localStorage.setItem("ptb_dark", dark ? "true" : "false");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dir, pinned, dark]);

  const goToProfile = (id: string) => {
    setProfileSel(id);
    localStorage.setItem("ptb_profile_sel", id);
    setDir("profile");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <>
      <TopBar
        dark={dark}
        onToggleDark={() => {
          setDark(!dark);
        }}
      />

      <nav className="tabs" role="tablist" aria-label="Benchmark views">
        {DIRECTIONS.map((d, i) => (
          <button
            key={d.id}
            role="tab"
            aria-selected={dir === d.id}
            onClick={() => {
              setDir(d.id);
            }}
          >
            <span className="num" aria-hidden="true">
              0{i + 1}
            </span>{" "}
            {d.label}
          </button>
        ))}
      </nav>

      {dir === "score" && (
        <ScorecardView
          pinned={pinned}
          setPinned={setPinned}
          category={category}
          setCategory={setCategory}
          search={search}
          setSearch={setSearch}
        />
      )}
      {dir === "category" && <CategoryBrowser onGoToProfile={goToProfile} />}
      {dir === "profile" && (
        <ProfileView
          initialSel={profileSel}
          onSelChange={(id) => {
            setProfileSel(id);
            localStorage.setItem("ptb_profile_sel", id);
          }}
        />
      )}
    </>
  );
}
