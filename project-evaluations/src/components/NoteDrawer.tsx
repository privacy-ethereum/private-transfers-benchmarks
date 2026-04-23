import { useEffect } from "react";

import { evaluations } from "../data/evaluations/index.js";
import { PROPERTY_DEFINITIONS } from "../data/schema.js";
import { valueFor } from "../utils.js";
import LinkifiedText from "./LinkifiedText.js";
import Tag from "./Tag.js";

interface NoteDrawerProps {
  protocolId: string;
  propertyName: string;
  onClose: () => void;
}

export default function NoteDrawer({ protocolId, propertyName, onClose }: NoteDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  const propertyEvaluations = evaluations.find((p) => p.id === protocolId);
  const prop = PROPERTY_DEFINITIONS.find((p) => p.name === propertyName);

  if (propertyEvaluations === undefined) {
    return null;
  }

  const { value, notes, url } = valueFor({ evaluations: propertyEvaluations, propertyName });
  const isNumeric = value !== "" && value !== "—" && !isNaN(parseFloat(value.replace(/,/g, "")));

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="note-drawer">
        <header>
          <div className="eyebrow">{prop?.group !== undefined ? `${prop.group} · NOTE` : "NOTE"}</div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="drawer-body">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <h3>{propertyEvaluations.title}</h3>
            <span className="prop-label">{propertyName}</span>
          </div>
          {prop?.description !== undefined && (
            <div style={{ fontSize: 13, color: "var(--body-medium)", lineHeight: 1.5 }}>{prop.description}</div>
          )}

          {isNumeric ? (
            <div className="drawer-value drawer-value--num">
              <span className="drawer-value__n">{value}</span>
              {prop?.metric !== undefined && <span className="drawer-value__m">{prop.metric}</span>}
            </div>
          ) : (
            <>
              {prop?.metric !== undefined && <div className="drawer-metric">{prop.metric}</div>}
              <div className="drawer-value">{value}</div>
            </>
          )}

          <div className="drawer-notes">
            {notes !== "" ? (
              <LinkifiedText text={notes} />
            ) : (
              <em style={{ color: "var(--body-medium)" }}>No notes recorded yet for this property.</em>
            )}
          </div>

          {url !== "" && (
            <a className="drawer-source" href={url} target="_blank" rel="noreferrer">
              source ↗<span>{url}</span>
            </a>
          )}

          <div className="drawer-foot">
            <div className="eyebrow">Categories</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              {propertyEvaluations.categories.map((c) => (
                <Tag key={c} cat={c} />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
