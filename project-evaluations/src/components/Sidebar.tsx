import type { Dispatch, SetStateAction } from "react";

import type { Evaluation } from "../types.js";
import { PROPERTY_DEFINITIONS } from "../schema.js";
import JSONButton from "./JSONButton.js";

const TOTAL = PROPERTY_DEFINITIONS.length;

interface SidebarProps {
  evaluations: Evaluation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  setEvaluations: Dispatch<SetStateAction<Evaluation[]>>;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
}

export default function Sidebar({
  evaluations,
  selectedId,
  onSelect,
  onAdd,
  setEvaluations,
  setSelectedId: setSidebarSelectedId,
}: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-gray-800 bg-gray-900">
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {evaluations.map((ev) => {
          const filled = ev.properties.filter((p) => p.value !== "").length;
          const pct = TOTAL > 0 ? Math.round((filled / TOTAL) * 100) : 0;
          const isSelected = ev.id === selectedId;

          return (
            <button
              key={ev.id}
              onClick={() => {
                onSelect(ev.id);
              }}
              className={`w-full text-left rounded px-3 py-2 transition-colors ${
                isSelected ? "bg-indigo-600 text-white" : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <div className="text-sm font-medium truncate">{ev.title}</div>
              <div className={`text-xs mt-0.5 ${isSelected ? "text-indigo-200" : "text-gray-500"}`}>
                {pct}% complete
              </div>
            </button>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-gray-800 p-3 space-y-2">
        <button
          onClick={onAdd}
          className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded px-3 py-1.5 transition-colors"
        >
          + Add protocol
        </button>
        <JSONButton evaluations={evaluations} setEvaluations={setEvaluations} setSelectedId={setSidebarSelectedId} />
      </div>
    </aside>
  );
}
