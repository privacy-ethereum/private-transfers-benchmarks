import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import type { Evaluation } from "../types.js";
import { PROPERTY_GROUPS, definitionsByGroup } from "../schema.js";
import PropertyRow from "./PropertyRow.js";
import ProtocolCategories from "./ProtocolCategories.js";

interface ProtocolDetailProps {
  evaluations: Evaluation[];
  selectedId: string | null;
  setEvaluations: Dispatch<SetStateAction<Evaluation[]>>;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
}

export default function ProtocolDetail({
  evaluations,
  selectedId,
  setEvaluations,
  setSelectedId,
}: ProtocolDetailProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ title: string; description: string; documentation: string }>({
    title: "",
    description: "",
    documentation: "",
  });
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editingField !== "description" || !descriptionRef.current) return;
    descriptionRef.current.style.height = "auto";
    descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
  }, [editingField, editValues.description]);

  const evaluation = evaluations.find((entry) => entry.id === selectedId) ?? null;

  if (!evaluation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Select a protocol to view its evaluation.
      </div>
    );
  }

  const startEdit = (field: "title" | "description" | "documentation"): void => {
    if (field === "title") {
      setEditValues((prev) => ({ ...prev, title: evaluation.title }));
    } else if (field === "description") {
      setEditValues((prev) => ({ ...prev, description: evaluation.description }));
    } else {
      setEditValues((prev) => ({ ...prev, documentation: evaluation.documentation }));
    }
    setEditingField(field);
  };

  const saveEdit = (): void => {
    if (!editingField) return;
    setEvaluations((previous) =>
      previous.map((entry) => {
        if (entry.id !== selectedId) return entry;
        if (editingField === "title") return { ...entry, title: editValues.title };
        if (editingField === "description") return { ...entry, description: editValues.description };
        if (editingField === "documentation") return { ...entry, documentation: editValues.documentation };
        return entry;
      }),
    );
    setEditingField(null);
  };

  const cancelEdit = (): void => {
    setEditingField(null);
  };

  const updateProperty = (propName: string, field: "value" | "notes" | "url", rawValue: string): void => {
    setEvaluations((previous) =>
      previous.map((entry) => {
        if (entry.id !== selectedId) return entry;

        const existing = entry.properties.find((prop) => prop.name === propName);
        const patch = { [field]: field === "value" ? rawValue : rawValue.trim() || undefined };
        const updated = existing ? { ...existing, ...patch } : { name: propName, value: "", ...patch };

        return {
          ...entry,
          properties: existing
            ? entry.properties.map((prop) => (prop.name === propName ? updated : prop))
            : [...entry.properties, updated],
        };
      }),
    );
  };

  const handleDelete = (): void => {
    if (!confirm(`Delete "${evaluation.title}"?`)) return;
    setEvaluations((previous) => {
      const remaining = previous.filter((entry) => entry.id !== selectedId);
      setSelectedId(remaining[0]?.id ?? null);
      return remaining;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div
            className="group cursor-pointer mb-2"
            onDoubleClick={() => {
              startEdit("title");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") startEdit("title");
            }}
            role="button"
            tabIndex={0}
          >
            {editingField === "title" ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editValues.title}
                  onChange={(e) => {
                    setEditValues({ ...editValues, title: e.target.value });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                  className="text-xl font-semibold text-white bg-gray-800 border border-indigo-500 rounded px-2 py-1 flex-1"
                />
                <button
                  onClick={saveEdit}
                  className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h1 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {evaluation.title}
              </h1>
            )}
          </div>

          <div
            className="group cursor-pointer mt-1"
            onDoubleClick={() => {
              startEdit("description");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") startEdit("description");
            }}
            role="button"
            tabIndex={0}
          >
            {editingField === "description" ? (
              <div className="flex gap-2">
                <textarea
                  ref={descriptionRef}
                  value={editValues.description}
                  onChange={(e) => {
                    setEditValues({ ...editValues, description: e.target.value });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                  className="text-sm text-gray-300 bg-gray-800 border border-indigo-500 rounded px-2 py-1 flex-1 resize-y overflow-hidden"
                  rows={2}
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={saveEdit}
                    className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 whitespace-nowrap"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                {evaluation.description}
              </p>
            )}
          </div>

          <div
            className="group cursor-pointer mt-3"
            onDoubleClick={() => {
              startEdit("documentation");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") startEdit("documentation");
            }}
            role="button"
            tabIndex={0}
          >
            {editingField === "documentation" ? (
              <div className="flex gap-2">
                <textarea
                  value={editValues.documentation}
                  onChange={(e) => {
                    setEditValues({ ...editValues, documentation: e.target.value });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                  className="text-sm text-gray-300 bg-gray-800 border border-indigo-500 rounded px-2 py-1 flex-1 resize-none"
                  rows={2}
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={saveEdit}
                    className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 whitespace-nowrap"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Documentation</label>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {evaluation.documentation || "Double-click to add documentation"}
                </p>
              </div>
            )}
          </div>

          <ProtocolCategories
            categories={evaluation.categories}
            onUpdate={(categories) => {
              setEvaluations((previous) =>
                previous.map((entry) => (entry.id === selectedId ? { ...entry, categories } : entry)),
              );
            }}
          />
        </div>

        <button
          onClick={handleDelete}
          className="text-xs text-red-500 hover:text-red-400 transition-colors ml-4 shrink-0"
        >
          Delete
        </button>
      </div>

      <div className="space-y-8">
        {PROPERTY_GROUPS.map((group) => (
          <section key={group}>
            <h2 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">{group}</h2>
            <div className="space-y-4">
              {definitionsByGroup(group).map((def) => {
                const prop = evaluation.properties.find((p) => p.name === def.name);
                return (
                  <PropertyRow key={`${evaluation.id}-${def.name}`} def={def} prop={prop} onUpdate={updateProperty} />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
