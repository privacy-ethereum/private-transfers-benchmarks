import { useState } from "react";

import { LONG_TITLE_LEN } from "../constants.js";
import { evaluations } from "../data/evaluations/index.js";
import { CATEGORY_EXPLAINERS, CATEGORY_TYPES } from "../data/explainers.js";
import { CATEGORIES } from "../data/schema.js";
import { isPendingEvaluation } from "../utils.js";

interface CategoryBrowserProps {
  onGoToProfile: (id: string) => void;
}

export default function CategoryBrowser({ onGoToProfile }: CategoryBrowserProps) {
  const [hidePending, setHidePending] = useState(false);

  return (
    <div className="direction">
      <div className="direction-intro">
        <div className="direction-intro__header">
          <div className="big-num">CATEGORIES</div>
          <h2>Category browser</h2>
        </div>
        <p>
          Categories mix <em>technologies</em> (ZKPs, FHE, MPC) with <em>architectures</em> (Stealth Addresses, Shielded
          Pool, Private L2). Protocols often span several.
        </p>
      </div>

      <div className="page-controls">
        <button
          type="button"
          className={`pending-toggle${hidePending ? " active" : ""}`}
          onClick={() => {
            setHidePending((v) => !v);
          }}
          aria-pressed={hidePending}
        >
          {hidePending ? "Show all protocols" : "Hide pending analysis"}
        </button>
      </div>

      <div className="cat-grid">
        {CATEGORIES.map((cat) => {
          const protos = evaluations.filter(
            (protocol) => protocol.categories.includes(cat) && (!hidePending || !isPendingEvaluation(protocol)),
          );
          const desc = CATEGORY_EXPLAINERS[cat];
          const type = CATEGORY_TYPES[cat];
          return (
            <div key={cat} className={`cat-card${protos.length === 0 ? " empty" : ""}`}>
              <div className="eyebrow cat-card__type">{type}</div>
              <h3>{cat}</h3>
              {desc !== undefined && (
                <div className="desc">
                  {desc} <span className="cat-card__count">({protos.length})</span>
                </div>
              )}
              <div className="protos">
                {protos.length === 0 ? (
                  <span className="protos__empty">No evaluations yet</span>
                ) : (
                  protos.map((protocol) => {
                    const otherCats = protocol.categories.filter((other) => other !== cat);
                    const hasOthers = otherCats.length > 0;
                    return (
                      <button
                        key={protocol.id}
                        type="button"
                        className={`proto-link${protocol.title.length > LONG_TITLE_LEN ? " long" : ""}${hasOthers ? " pop-trigger" : ""}`}
                        onClick={() => {
                          onGoToProfile(protocol.id);
                        }}
                        title={`Open ${protocol.title} profile →`}
                      >
                        {protocol.title}
                        {isPendingEvaluation(protocol) && <span className="pending-badge">Pending</span>}
                        <span className="proto-link__arrow" aria-hidden="true">
                          ↗
                        </span>
                        {hasOthers && <span className="pop">Also in: {otherCats.join(", ")}</span>}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
