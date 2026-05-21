import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import { type Evaluation } from "../types";
import { CATEGORY_EXPLAINERS } from "../data/explainers";
import { LONG_TITLE_LEN } from "../constants";
import { evaluations } from "../data/evaluations";
import { isPendingEvaluation } from "../utils";

interface CompareBarProps {
  pinned: string[];
  setPinned: Dispatch<SetStateAction<string[]>>;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  protosByCategory: Record<string, Evaluation[]>;
  selectAllInCat: (cat: string) => void;
}

export default function CompareBar({
  pinned,
  setPinned,
  category,
  setCategory,
  search,
  setSearch,
  protosByCategory,
  selectAllInCat,
}: CompareBarProps) {
  const analyzedEvaluations = evaluations.filter((p) => !isPendingEvaluation(p));
  const [collapsed, setCollapsed] = useState(pinned.length > 0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pinned.length === 0) {
      setCollapsed(false);
    }
  }, [pinned.length]);

  const isCollapsed = collapsed && pinned.length > 0;

  return (
    <div className="compare-bar" ref={barRef}>
      <div className="compare-bar__top">
        <div>
          <span className="eyebrow">Compare</span>
          <div className="label">{pinned.length === 0 ? "Pin protocols to compare" : `${pinned.length} pinned`}</div>
        </div>
        <div className="compare-bar__tools">
          <input
            className="search"
            placeholder="Search protocol…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            aria-label="Search protocols"
          />
          <button
            className="chip"
            onClick={() => {
              setPinned([]);
            }}
            disabled={pinned.length === 0}
          >
            Clear
          </button>
          <button
            className="chip on"
            onClick={() => {
              setPinned(analyzedEvaluations.map((p) => p.id));
            }}
          >
            Pin all ({analyzedEvaluations.length})
          </button>
          {isCollapsed && (
            <button
              className="chip"
              onClick={() => {
                setCollapsed(false);
              }}
            >
              Edit pins
            </button>
          )}
          {pinned.length > 0 && (
            <button
              className="chip on"
              onClick={() => {
                setCollapsed(true);
                requestAnimationFrame(() => {
                  barRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
              }}
            >
              View comparison ↓
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="cat-groups">
          {Object.entries(protosByCategory).map(([cat, protos]) => {
            const ids = protos.map((p) => p.id);
            const allIn = ids.length > 0 && ids.every((id) => pinned.includes(id));
            const desc = CATEGORY_EXPLAINERS[cat];
            return (
              <div key={cat} className={`cat-group${category === cat ? " focused" : ""}`}>
                <div className="cat-group__head">
                  <button
                    className="cat-name pop-trigger"
                    onClick={() => {
                      setCategory(category === cat ? "" : cat);
                    }}
                  >
                    {cat} <span className="count">({protos.length})</span>
                    {desc !== undefined && <span className="pop">{desc}</span>}
                  </button>
                  <button
                    className={`mini-chip${allIn ? " on" : ""}`}
                    onClick={() => {
                      selectAllInCat(cat);
                    }}
                  >
                    {allIn ? "✓ All pinned" : "+ Pin all"}
                  </button>
                </div>
                <div className="cat-group__protos">
                  {protos.map((p) => (
                    <button
                      key={p.id}
                      className={`chip${pinned.includes(p.id) ? " on" : ""}${p.title.length > LONG_TITLE_LEN ? " long" : ""}`}
                      onClick={() => {
                        setPinned(pinned.includes(p.id) ? pinned.filter((id) => id !== p.id) : [...pinned, p.id]);
                      }}
                    >
                      {pinned.includes(p.id) ? "✓ " : "+ "}
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
