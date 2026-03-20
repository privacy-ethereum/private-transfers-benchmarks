import JSZip from "jszip";

import type { Evaluation } from "../types.js";

interface SaveModalProps {
  evaluations: Evaluation[];
  onClose: () => void;
}

const downloadFile = (evaluation: Evaluation): void => {
  const content = JSON.stringify(evaluation, null, 2) + "\n";
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${evaluation.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadAllAsZip = async (evaluations: Evaluation[]): Promise<void> => {
  const zip = new JSZip();
  evaluations.forEach((ev) => {
    zip.file(`${ev.id}.json`, JSON.stringify(ev, null, 2) + "\n");
  });
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "evaluations.zip";
  a.click();
  URL.revokeObjectURL(url);
};

export default function SaveModal({ evaluations, onClose }: SaveModalProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-4">Save JSON</h2>
        <div className="space-y-1">
          {evaluations.map((ev) => (
            <button
              key={ev.id}
              onClick={() => {
                downloadFile(ev);
                onClose();
              }}
              className="w-full text-left text-sm text-gray-300 hover:bg-gray-800 rounded px-3 py-2 transition-colors"
            >
              {ev.title}
            </button>
          ))}
        </div>
        <div className="border-t border-gray-700 mt-3 pt-3 flex gap-3">
          <button
            onClick={() => {
              downloadAllAsZip(evaluations).catch(() => {
                alert("Failed to create zip.");
              });
              onClose();
            }}
            className="flex-1 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded px-4 py-2 transition-colors"
          >
            Download all (.zip)
          </button>
          <button
            onClick={onClose}
            className="flex-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded px-4 py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
