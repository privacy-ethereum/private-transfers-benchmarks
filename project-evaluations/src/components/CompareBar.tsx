import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import { type Evaluation } from "../types";
import { CATEGORY_EXPLAINERS, CATEGORY_TYPES } from "../data/explainers";
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
  hidePending: boolean;
  setHidePending: Dispatch<SetStateAction<boolean>>;
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
  hidePending,
  setHidePending,
}: CompareBarProps) {
  const analyzedEvaluations = evaluations.filter((protocol) => !isPendingEvaluation(protocol));
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
        <div className="compare-bar__label">
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
              setPinned(analyzedEvaluations.map((protocol) => protocol.id));
            }}
          >
            Pin all ({analyzedEvaluations.length})
          </button>
          <button
            type="button"
            className={`chip${hidePending ? " on" : ""}`}
            onClick={() => {
              setHidePending((v) => !v);
            }}
            aria-pressed={hidePending}
          >
            {hidePending ? "Show all protocols" : "Hide pending analysis"}
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

      {!hidePending && (
        <p className="compare-bar__note">
          <em>Protocols pending analysis show in the pin list with a badge, but aren&apos;t shown as columns yet.</em>
        </p>
      )}

      {!isCollapsed && (
        <div className="cat-groups">
          {Object.entries(protosByCategory).map(([cat, protos]) => {
            const pinnableIds = protos
              .filter((protocol) => !isPendingEvaluation(protocol))
              .map((protocol) => protocol.id);
            const allIn = pinnableIds.length > 0 && pinnableIds.every((id) => pinned.includes(id));
            const desc = CATEGORY_EXPLAINERS[cat];
            const type = CATEGORY_TYPES[cat];
            return (
              <div key={cat} className={`cat-group${category === cat ? " focused" : ""}`}>
                <div className="eyebrow cat-group__type">{type}</div>
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
                    disabled={pinnableIds.length === 0}
                  >
                    {allIn ? "✓ All pinned" : "+ Pin all"}
                  </button>
                </div>
                <div className="cat-group__protos">
                  {protos.map((protocol) => {
                    const otherCats = protocol.categories.filter((other) => other !== cat);
                    const longCls = protocol.title.length > LONG_TITLE_LEN ? " long" : "";
                    const alsoIn = otherCats.length > 0 ? `Also in: ${otherCats.join(", ")}` : "";

                    if (isPendingEvaluation(protocol)) {
                      return (
                        <span
                          key={protocol.id}
                          className={`chip chip--pending pop-trigger${longCls}`}
                          aria-label={`${protocol.title} (pending analysis)`}
                          aria-disabled="true"
                          tabIndex={0}
                        >
                          {protocol.title}
                          <span className="pending-badge pending-badge--inline">Pending</span>
                          <span className="pop">Pending analysis.{alsoIn !== "" ? ` ${alsoIn}.` : ""}</span>
                        </span>
                      );
                    }

                    const isPinned = pinned.includes(protocol.id);
                    return (
                      <button
                        key={protocol.id}
                        className={`chip${isPinned ? " on" : ""}${longCls}${alsoIn !== "" ? " pop-trigger" : ""}`}
                        onClick={() => {
                          setPinned(isPinned ? pinned.filter((id) => id !== protocol.id) : [...pinned, protocol.id]);
                        }}
                      >
                        {isPinned ? "✓ " : "+ "}
                        {protocol.title}
                        {alsoIn !== "" && <span className="pop">{alsoIn}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
