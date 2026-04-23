import { type Dispatch, type SetStateAction, useMemo, useState } from "react";

import { evaluations } from "../data/evaluations/index.js";
import { CATEGORIES, PROPERTY_GROUPS } from "../data/schema.js";
import type { Evaluation } from "../types.js";
import NoteDrawer from "./NoteDrawer.js";
import CompareBar from "./CompareBar.js";
import ScoreGroup from "./ScoreGroup.js";

interface DrawerState {
  protoId: string;
  propName: string;
}

interface ScorecardViewProps {
  pinned: string[];
  setPinned: Dispatch<SetStateAction<string[]>>;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

export default function ScorecardView({
  pinned,
  setPinned,
  category,
  setCategory,
  search,
  setSearch,
}: ScorecardViewProps) {
  const [drawer, setDrawer] = useState<DrawerState | null>(null);

  const protosByCategory = useMemo<Record<string, Evaluation[]>>(() => {
    const out: Record<string, Evaluation[]> = {};
    for (const cat of CATEGORIES) {
      const list = evaluations.filter((p) => p.categories.includes(cat));

      if (list.length > 0) {
        out[cat] = list;
      }
    }
    return out;
  }, []);

  const activeProtos = useMemo(() => {
    if (pinned.length === 0) {
      return [];
    }

    let list = evaluations.filter((p) => pinned.includes(p.id));

    if (category !== "") {
      list = list.filter((p) => p.categories.some((c) => c === category));
    }

    if (search !== "") {
      list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    }

    return list;
  }, [pinned, category, search]);

  const selectAllInCat = (cat: string) => {
    const catProtos = protosByCategory[cat] ?? [];
    const ids = catProtos.map((p) => p.id);
    const allIn = ids.every((id) => pinned.includes(id));
    setPinned(allIn ? pinned.filter((id) => !ids.includes(id)) : Array.from(new Set([...pinned, ...ids])));
  };

  return (
    <div className="direction">
      <div className="direction-intro">
        <div className="big-num">SCORECARD</div>
        <div>
          <h2>Compare Protocols</h2>
          <p>
            Compare projects across properties (Privacy, Cost, UX etc.) and categories (Stealth addresses, Shielded
            pools etc.). Pin the protocols you want to compare — only pinned protocols show up as columns. Click any
            value to read the note and source for that protocol × property pair.
          </p>
        </div>
      </div>

      <CompareBar
        pinned={pinned}
        setPinned={setPinned}
        category={category}
        setCategory={setCategory}
        search={search}
        setSearch={setSearch}
        protosByCategory={protosByCategory}
        selectAllInCat={selectAllInCat}
      />

      {activeProtos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No protocols pinned yet</div>
          <div className="empty-state__sub">
            Pick protocols from the category groups above to start comparing. Or <em>pin all</em> on a category.
          </div>
        </div>
      ) : (
        <div className="scorecard">
          {PROPERTY_GROUPS.map((g) => (
            <ScoreGroup
              key={g}
              group={g}
              protos={activeProtos}
              onCellClick={(protoId, propName) => {
                setDrawer({ protoId, propName });
              }}
            />
          ))}
        </div>
      )}

      {drawer !== null && (
        <NoteDrawer
          protocolId={drawer.protoId}
          propertyName={drawer.propName}
          onClose={() => {
            setDrawer(null);
          }}
        />
      )}
    </div>
  );
}
