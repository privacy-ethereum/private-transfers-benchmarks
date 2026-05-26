import { useState } from "react";
import { GROUP_EXPLAINERS } from "../data/explainers";
import { type Evaluation } from "../types";
import { PROPERTY_DEFINITIONS } from "../data/schema";
import { cellTone, valueFor } from "../utils";

const TONE_CLASS = { "yes": "tag green", "no": "tag red", "warn": "tag yellow", "": "tag" } as const;

interface ScoreGroupProps {
  group: string;
  protos: Evaluation[];
  onCellClick: (protoId: string, propName: string) => void;
}

export default function ScoreGroup({ group, protos, onCellClick }: ScoreGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const props = PROPERTY_DEFINITIONS.filter((p) => p.group === group);

  return (
    <div className="group-block">
      <h3>
        <button
          type="button"
          className="group-toggle"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          aria-expanded={isOpen}
        >
          <span>
            {isOpen ? "▾" : "▸"} {group}
          </span>
          <span className="g-desc">{GROUP_EXPLAINERS[group]}</span>
        </button>
      </h3>
      {isOpen && (
        <table>
          <thead>
            <tr>
              <th className="prop">Property</th>
              {protos.map((p) => (
                <th key={p.id}>{p.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.map((prop) => (
              <tr key={prop.name}>
                <td className="prop">
                  <div>{prop.name}</div>
                  <div>{prop.description}</div>
                  <div>{prop.metric}</div>
                </td>
                {protos.map((p) => {
                  const { value, needsResearchReview } = valueFor({ evaluations: p, propertyName: prop.name });
                  const cls = TONE_CLASS[cellTone({ value, propertyName: prop.name })];

                  return (
                    <td key={p.id} className="proto-val">
                      <button
                        type="button"
                        className="btn-reset cell-expand-btn"
                        onClick={() => {
                          onCellClick(p.id, prop.name);
                        }}
                        aria-label={`Open note for ${prop.name}`}
                      >
                        <span className={cls}>{value}</span>
                        <span className="cell-expand" aria-hidden="true">
                          ↗
                        </span>
                        {needsResearchReview !== "" && (
                          <span
                            className="review-warning pop-trigger"
                            aria-label={`Needs additional review: ${needsResearchReview}`}
                          >
                            ⚠<span className="pop">{needsResearchReview}</span>
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
