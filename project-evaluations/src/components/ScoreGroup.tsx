import { useState } from "react";
import { GROUP_EXPLAINERS } from "../data/explainers";
import { type Evaluation } from "../types";
import { PROPERTY_DEFINITIONS } from "../data/schema";
import { cellTone, valueFor } from "../utils";

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
                  const { value } = valueFor({ evaluations: p, propertyName: prop.name });
                  const tone = cellTone({ value, propertyName: prop.name });
                  let cls: string;

                  switch (tone) {
                    case "yes":
                      cls = "tag green";
                      break;
                    case "no":
                      cls = "tag red";
                      break;
                    case "warn":
                      cls = "tag yellow";
                      break;
                    default:
                      cls = "tag";
                  }

                  return (
                    <td key={p.id} className="proto-val">
                      <button
                        type="button"
                        className="btn-reset"
                        onClick={() => {
                          onCellClick(p.id, prop.name);
                        }}
                      >
                        <span className={cls}>{value}</span>
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
