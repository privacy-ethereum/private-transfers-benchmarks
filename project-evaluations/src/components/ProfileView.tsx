import { useState } from "react";

import { evaluations } from "../data/evaluations/index.js";
import { GROUP_EXPLAINERS } from "../data/explainers.js";
import { PROPERTY_DEFINITIONS, PROPERTY_GROUPS } from "../data/schema.js";
import { valueFor } from "../utils.js";
import Tag from "./Tag.js";
import LinkifiedText from "./LinkifiedText.js";

interface ProfileViewProps {
  initialSel: string;
  onSelChange: (id: string) => void;
}

export default function ProfileView({ initialSel, onSelChange }: ProfileViewProps) {
  const firstId = evaluations[0]?.id ?? "";
  const validSel = initialSel !== "" && evaluations.some((p) => p.id === initialSel) ? initialSel : firstId;

  const [sel, setSelRaw] = useState(validSel);
  const [protoSearch, setProtoSearch] = useState("");

  const setSel = (id: string) => {
    setSelRaw(id);
    onSelChange(id);
  };

  const proto = evaluations.find((p) => p.id === sel);
  const q = protoSearch.trim().toLowerCase();
  const filteredProtos =
    q !== ""
      ? evaluations.filter(
          (p) => p.title.toLowerCase().includes(q) || p.categories.some((c) => c.toLowerCase().includes(q)),
        )
      : evaluations;

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
                  <div className="cats">{p.categories.join(", ")}</div>
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
                      return (
                        <div key={prop.name} className="prop-row">
                          <div className="pname">
                            {prop.name}
                            <span className="metric">{prop.metric}</span>
                          </div>
                          <div className="pval">{value}</div>
                          <div className="pnote">
                            {notes !== "" ? (
                              <LinkifiedText text={notes} />
                            ) : (
                              <span className="no-note">No note yet</span>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
