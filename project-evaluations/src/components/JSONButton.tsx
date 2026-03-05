import type { Dispatch, SetStateAction } from "react";

import type { Evaluation, EvaluationsData } from "../types.js";

interface JSONButtonProps {
  evaluations: Evaluation[];
  setEvaluations: Dispatch<SetStateAction<Evaluation[]>>;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
}

export default function JSONButton({ evaluations, setEvaluations, setSelectedId }: JSONButtonProps) {
  const saveJSON = (): void => {
    const content = JSON.stringify({ evaluations }, null, 2) + "\n";
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evaluations.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file: File): void => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as EvaluationsData;
        setEvaluations(parsed.evaluations);
        setSelectedId(parsed.evaluations[0]?.id ?? null);
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => {
          saveJSON();
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
  );
}
