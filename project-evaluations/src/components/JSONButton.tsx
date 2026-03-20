import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { Evaluation } from "../types.js";
import { evaluationSchema } from "../data/evaluation-schema.js";
import SaveModal from "./SaveModal.js";

interface JSONButtonProps {
  evaluations: Evaluation[];
  setEvaluations: Dispatch<SetStateAction<Evaluation[]>>;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
}

export default function JSONButton({ evaluations, setEvaluations, setSelectedId }: JSONButtonProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);

  const importJSON = (file: File): void => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed: unknown = JSON.parse(e.target?.result as string);
        const result = evaluationSchema.safeParse(parsed);
        if (!result.success) {
          alert("Invalid evaluation JSON:\n" + result.error.issues.map((i) => i.message).join("\n"));
          return;
        }
        const imported = result.data as Evaluation;

        setEvaluations((prev) => {
          const existing = prev.find((ev) => ev.id === imported.id);
          if (existing) {
            return prev.map((ev) => (ev.id === imported.id ? imported : ev));
          }
          return [...prev, imported];
        });
        setSelectedId(imported.id);
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setShowSaveModal(true);
          }}
          className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded px-2 py-1.5 transition-colors"
        >
          Save JSON
        </button>
        <label className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded px-2 py-1.5 transition-colors text-center cursor-pointer">
          Import
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importJSON(file);
            }}
          />
        </label>
      </div>

      {showSaveModal && (
        <SaveModal
          evaluations={evaluations}
          onClose={() => {
            setShowSaveModal(false);
          }}
        />
      )}
    </>
  );
}
