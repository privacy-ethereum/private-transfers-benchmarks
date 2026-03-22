import JSZip from "jszip";
import { format } from "prettier/standalone";
import estreePlugin from "prettier/plugins/estree";
import babelPlugin from "prettier/plugins/babel";

import type { Evaluation } from "../types.js";
import type { Options } from "prettier";

import rawConfig from "../../../.prettierrc.json";

const prettierConfig: Partial<Options> = {
  arrowParens: rawConfig.arrowParens as "always" | "avoid",
  bracketSpacing: rawConfig.bracketSpacing,
  endOfLine: rawConfig.endOfLine as "lf" | "crlf" | "cr" | "auto",
  printWidth: rawConfig.printWidth,
  singleQuote: rawConfig.singleQuote,
  semi: rawConfig.semi,
  tabWidth: rawConfig.tabWidth,
  useTabs: rawConfig.useTabs,
  trailingComma: rawConfig.trailingComma as "all" | "none" | "es5",
};

interface SaveModalProps {
  evaluations: Evaluation[];
  onClose: () => void;
}

const formatEvaluationJson = async (evaluation: Evaluation): Promise<string> => {
  const content = JSON.stringify(evaluation);

  try {
    return await format(content, {
      parser: "json",
      plugins: [babelPlugin, estreePlugin],
      ...prettierConfig,
    });
  } catch {
    return `${JSON.stringify(evaluation, null, 2)}\n`;
  }
};

const downloadFile = async (evaluation: Evaluation): Promise<void> => {
  const content = await formatEvaluationJson(evaluation);
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
  await Promise.all(
    evaluations.map(async (ev) => {
      const content = await formatEvaluationJson(ev);
      zip.file(`${ev.id}.json`, content);
    }),
  );
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
                downloadFile(ev).catch(() => {
                  alert("Failed to save file.");
                });
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
