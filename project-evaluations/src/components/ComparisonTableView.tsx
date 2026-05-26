import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";

import { evaluations } from "../data/evaluations/index.js";
import { CATEGORIES, PROPERTY_GROUPS } from "../data/schema.js";
import type { Evaluation } from "../types.js";
import { isPendingEvaluation } from "../utils.js";
import NoteDrawer from "./NoteDrawer.js";
import CompareBar from "./CompareBar.js";
import ScoreGroup from "./ScoreGroup.js";

interface DrawerState {
  protoId: string;
  propName: string;
}

interface ComparisonTableViewProps {
  pinned: string[];
  setPinned: Dispatch<SetStateAction<string[]>>;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

export default function ComparisonTableView({
  pinned,
  setPinned,
  category,
  setCategory,
  search,
  setSearch,
}: ComparisonTableViewProps) {
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [hidePending, setHidePending] = useState(false);

  const analyzedEvaluations = useMemo(() => evaluations.filter((protocol) => !isPendingEvaluation(protocol)), []);

  const analyzedProtocolIds = useMemo(
    () => new Set(analyzedEvaluations.map((protocol) => protocol.id)),
    [analyzedEvaluations],
  );

  const effectivePinned = useMemo(
    () => pinned.filter((id) => analyzedProtocolIds.has(id)),
    [pinned, analyzedProtocolIds],
  );

  useEffect(() => {
    if (effectivePinned.length !== pinned.length) {
      setPinned(effectivePinned);
    }
  }, [effectivePinned, pinned.length, setPinned]);

  const protosByCategory = useMemo<Record<string, Evaluation[]>>(() => {
    const source = hidePending ? analyzedEvaluations : evaluations;
    return Object.fromEntries(
      CATEGORIES.map((cat) => [cat, source.filter((protocol) => protocol.categories.includes(cat))]),
    );
  }, [hidePending, analyzedEvaluations]);

  const activeProtos = useMemo(() => {
    if (effectivePinned.length === 0) return [];
    const query = search.toLowerCase();
    return analyzedEvaluations.filter(
      (protocol) =>
        effectivePinned.includes(protocol.id) &&
        (category === "" || protocol.categories.some((other) => other === category)) &&
        (query === "" || protocol.title.toLowerCase().includes(query)),
    );
  }, [effectivePinned, category, search, analyzedEvaluations]);

  const selectAllInCat = (cat: string) => {
    const ids = (protosByCategory[cat] ?? [])
      .filter((protocol) => !isPendingEvaluation(protocol))
      .map((protocol) => protocol.id);
    const idSet = new Set(ids);
    const allIn = ids.every((id) => effectivePinned.includes(id));
    setPinned(allIn ? effectivePinned.filter((id) => !idSet.has(id)) : [...new Set([...effectivePinned, ...ids])]);
  };

  return (
    <div className="direction">
      <div className="direction-intro">
        <div className="direction-intro__header">
          <div className="big-num">COMPARISON</div>
          <h2>Comparison Table</h2>
        </div>
        <p>
          Compare protocols side-by-side across every property. <strong>Pin protocols</strong> to add them as columns.{" "}
          <strong>Click any value</strong> to read the note and source.
        </p>
      </div>

      <CompareBar
        pinned={effectivePinned}
        setPinned={setPinned}
        category={category}
        setCategory={setCategory}
        search={search}
        setSearch={setSearch}
        protosByCategory={protosByCategory}
        selectAllInCat={selectAllInCat}
        hidePending={hidePending}
        setHidePending={setHidePending}
      />

      {activeProtos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No protocols pinned yet</div>
          <div className="empty-state__sub">
            Pick protocols from the category groups above to start comparing. Or <em>pin all</em> on a category.
          </div>
        </div>
      ) : (
        <div className="comparison-table">
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
