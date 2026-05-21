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
  initialSelected: string;
  onSelectedChange: (id: string) => void;
}

export default function ProfileView({ initialSelected, onSelectedChange }: ProfileViewProps) {
  const firstId = evaluations[0]?.id ?? "";
  const validSelected =
    initialSelected !== "" && evaluations.some((p) => p.id === initialSelected) ? initialSelected : firstId;

  const [selectedId, setSelectedId] = useState(validSelected);
  const [searchQuery, setSearchQuery] = useState("");
  const [hidePending, setHidePending] = useState(false);

  const setSelected = (id: string) => {
    setSelectedId(id);
    onSelectedChange(id);
  };

  const protocol = evaluations.find((project) => project.id === selectedId);
  const searchQuote = searchQuery.trim().toLowerCase();
  const filteredProtos = evaluations.filter((project) => {
    if (hidePending && isPendingEvaluation(project)) return false;
    if (searchQuote === "") return true;
    return (
      project.title.toLowerCase().includes(searchQuote) ||
      project.categories.some((category) => category.toLowerCase().includes(searchQuote))
    );
  });
  const subgraphReadmeMarkdown = protocol !== undefined ? (readmes[protocol.id] ?? "") : "";

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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              aria-label="Search protocols"
            />
            {searchQuery !== "" && (
              <button
                type="button"
                className="sidebar-search__clear"
                onClick={() => {
                  setSearchQuery("");
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
            <div className="sidebar-empty">No protocol matches &ldquo;{searchQuery}&rdquo;</div>
          ) : (
            filteredProtos.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`protocol${p.id === selectedId ? " active" : ""}`}
                onClick={() => {
                  setSelected(p.id);
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

        {protocol !== undefined && (
          <div className="main">
            <div className="eyebrow">Protocol profile</div>
            <h2>{protocol.title}</h2>
            {isPendingEvaluation(protocol) && (
              <div className="pending-banner">
                This project is listed as pending analysis. Values below are placeholders until research is completed.
              </div>
            )}
            <p className="desc">{protocol.description}</p>
            <div className="profile-tags">
              {protocol.categories.map((c) => (
                <Tag key={c} cat={c} />
              ))}
            </div>
            {protocol.documentation !== "" && (
              <div className="profile-docs">
                docs →{" "}
                <a href={protocol.documentation} target="_blank" rel="noreferrer" className="ext-link">
                  {protocol.documentation}
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
                      const { value, notes, url } = valueFor({ evaluations: protocol, propertyName: prop.name });
                      const placeholderNote = value === "—" ? notMeasuredNoteFor(prop.name, protocol.id) : undefined;
                      const dimmed = BENCHMARKED_PROPERTIES.has(prop.name) && !BENCHMARKED_PROJECT_IDS.has(protocol.id);
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
