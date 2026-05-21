import { useState } from "react";

import { BENCHMARKED_PROJECT_IDS } from "../data/benchmarked-projects.js";
import { evaluations } from "../data/evaluations/index.js";
import { GROUP_EXPLAINERS } from "../data/explainers.js";
import { PROPERTY_DEFINITIONS, PROPERTY_GROUPS } from "../data/schema.js";
import { readmes } from "../data/readmes.js";
import { isPendingEvaluation, valueFor } from "../utils.js";
import MarkdownView from "./MarkdownView.js";
import Tag from "./Tag.js";
import LinkifiedText from "./LinkifiedText.js";

/** Properties measured only by the on-chain benchmarks, which currently cover Ethereum
 *  protocols. */
const BENCHMARKED_PROPERTIES = new Set([
  "On-chain gas cost: deposit",
  "On-chain gas cost: transfer",
  "On-chain gas cost: withdraw",
  "Anonymity set size",
]);

/** Explanatory note for an empty benchmarked property, shown instead of "No note yet":
 *  pending for benchmarked (Ethereum) projects, out of scope for the rest. Returns
 *  undefined for properties that should keep "No note yet". */
function notMeasuredNoteFor(propertyName: string, protocolId: string): string | undefined {
  if (!BENCHMARKED_PROPERTIES.has(propertyName)) return undefined;
  return BENCHMARKED_PROJECT_IDS.has(protocolId)
    ? "Benchmark pending — not yet measured for this protocol."
    : "Not benchmarked — benchmarks currently cover Ethereum protocols only.";
}

interface ProfileViewProps {
  initialSel: string;
  onSelChange: (id: string) => void;
}

export default function ProfileView({ initialSel, onSelChange }: ProfileViewProps) {
  const firstId = evaluations[0]?.id ?? "";
  const validSel = initialSel !== "" && evaluations.some((p) => p.id === initialSel) ? initialSel : firstId;

  const [sel, setSelRaw] = useState(validSel);
  const [protoSearch, setProtoSearch] = useState("");
  const [hidePending, setHidePending] = useState(false);

  const setSel = (id: string) => {
    setSelRaw(id);
    onSelChange(id);
  };

  const proto = evaluations.find((p) => p.id === sel);
  const q = protoSearch.trim().toLowerCase();
  const filteredProtos = evaluations.filter((p) => {
    if (hidePending && isPendingEvaluation(p)) return false;
    if (q === "") return true;
    return p.title.toLowerCase().includes(q) || p.categories.some((c) => c.toLowerCase().includes(q));
  });
  const subgraphReadmeMarkdown = proto !== undefined ? (readmes[proto.id] ?? "") : "";

  return (
    <div className="direction">
      <div className="direction-intro">
        <div className="big-num">PROFILE</div>
        <div>
          <h2>Protocol profiles</h2>
          <p>
            One protocol at a time. Pick from the list; the main panel shows its description, categories, and every
            evaluated property grouped into sections.
          </p>
        </div>
      </div>

      <div className="profile">
        <aside className="sidebar-list">
          <div className="sidebar-search">
            <input
              className="search"
              type="search"
              placeholder="Search protocols…"
              value={protoSearch}
              onChange={(e) => {
                setProtoSearch(e.target.value);
              }}
              aria-label="Search protocols"
            />
            {protoSearch !== "" && (
              <button
                type="button"
                className="sidebar-search__clear"
                onClick={() => {
                  setProtoSearch("");
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            className={`sidebar-filter${hidePending ? " active" : ""}`}
            onClick={() => {
              setHidePending((v) => !v);
            }}
            aria-pressed={hidePending}
          >
            {hidePending ? "Show all protocols" : "Hide pending analysis"}
          </button>
          {filteredProtos.length === 0 ? (
            <div className="sidebar-empty">No protocol matches &ldquo;{protoSearch}&rdquo;</div>
          ) : (
            filteredProtos.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`proto${p.id === sel ? " active" : ""}`}
                onClick={() => {
                  setSel(p.id);
                }}
              >
                <div>
                  <div className="name">{p.title}</div>
                  <div className="cats">
                    <span className="cats-text">{p.categories.join(", ")}</span>
                    {isPendingEvaluation(p) && (
                      <span className="pending-badge pending-badge--inline">Pending analysis</span>
                    )}
                  </div>
                </div>
                <span className="arrow">→</span>
              </button>
            ))
          )}
        </aside>

        {proto !== undefined && (
          <div className="main">
            <div className="eyebrow">Protocol profile</div>
            <h2>{proto.title}</h2>
            {isPendingEvaluation(proto) && (
              <div className="pending-banner">
                This project is listed as pending analysis. Values below are placeholders until research is completed.
              </div>
            )}
            <p className="desc">{proto.description}</p>
            <div className="profile-tags">
              {proto.categories.map((c) => (
                <Tag key={c} cat={c} />
              ))}
            </div>
            {proto.documentation !== "" && (
              <div className="profile-docs">
                docs →{" "}
                <a href={proto.documentation} target="_blank" rel="noreferrer" className="ext-link">
                  {proto.documentation}
                </a>
              </div>
            )}
            <div className="groups">
              {PROPERTY_GROUPS.map((g) => (
                <details key={g} className="group-card" open>
                  <summary>
                    <span>{g}</span>
                    <span className="g-desc">{GROUP_EXPLAINERS[g]}</span>
                  </summary>
                  <div className="body">
                    {PROPERTY_DEFINITIONS.filter((p) => p.group === g).map((prop) => {
                      const { value, notes, url } = valueFor({ evaluations: proto, propertyName: prop.name });
                      const placeholderNote = value === "—" ? notMeasuredNoteFor(prop.name, proto.id) : undefined;
                      const dimmed = BENCHMARKED_PROPERTIES.has(prop.name) && !BENCHMARKED_PROJECT_IDS.has(proto.id);
                      return (
                        <div key={prop.name} className={`prop-row${dimmed ? " prop-row--dimmed" : ""}`}>
                          <div className="pname">
                            {prop.name}
                            <span className="metric">{prop.metric}</span>
                          </div>
                          <div className="pval">{value}</div>
                          <div className="pnote">
                            {notes !== "" ? (
                              <LinkifiedText text={notes} />
                            ) : (
                              <span className="no-note">{placeholderNote ?? "No note yet"}</span>
                            )}
                            {url !== "" && (
                              <div className="source-link">
                                <a href={url} target="_blank" rel="noreferrer" className="ext-link ext-link--source">
                                  source ↗
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>
              ))}
              {subgraphReadmeMarkdown !== "" && (
                <details className="group-card">
                  <summary>
                    <span>Benchmarks README</span>
                    <span className="g-desc">How are we gathering benchmark data for the protocol</span>
                  </summary>
                  <MarkdownView markdown={subgraphReadmeMarkdown} />
                </details>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
