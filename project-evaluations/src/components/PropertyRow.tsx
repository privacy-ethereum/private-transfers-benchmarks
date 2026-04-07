import { useEffect, useRef, useState } from "react";

import type { Property, PropertyContent } from "../types.js";

interface PropertyRowProps {
  def: PropertyContent;
  prop: Property | undefined;
  onUpdate: (propName: string, field: "value" | "notes" | "url", value: string) => void;
}

export default function PropertyRow({ def, prop, onUpdate }: PropertyRowProps) {
  const [localNotes, setLocalNotes] = useState(prop?.notes ?? "");
  const [localUrl, setLocalUrl] = useState(prop?.url ?? "");
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setLocalNotes(prop?.notes ?? "");
    setLocalUrl(prop?.url ?? "");
  }, [prop]);

  useEffect(() => {
    if (!notesRef.current) return;
    notesRef.current.style.height = "auto";
    notesRef.current.style.height = `${notesRef.current.scrollHeight}px`;
  }, [localNotes]);

  const inputClass =
    "w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100 focus:outline-none focus:border-indigo-500";

  const parseMultiSelectValue = (): string[] => {
    if (!prop?.value) return [];
    try {
      return JSON.parse(prop.value) as string[];
    } catch {
      return [];
    }
  };

  const handleMultiSelectChange = (option: string, checked: boolean): void => {
    const current = parseMultiSelectValue();
    const updated = checked ? [...current, option] : current.filter((v) => v !== option);
    onUpdate(def.name, "value", JSON.stringify(updated));
  };

  const renderValueInput = (): React.ReactNode => {
    if (def.inputType === "multi-select" && def.options) {
      const selected = parseMultiSelectValue();
      return (
        <div className="space-y-2 bg-gray-800 border border-gray-700 rounded p-2">
          {def.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => {
                  handleMultiSelectChange(opt, e.target.checked);
                }}
                className="w-4 h-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    if (def.inputType === "select" && def.options) {
      return (
        <select
          value={prop?.value ?? ""}
          onChange={(e) => {
            onUpdate(def.name, "value", e.target.value);
          }}
          className={inputClass}
        >
          <option value="">— select —</option>
          {def.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={def.inputType === "number" ? "number" : "text"}
        value={prop?.value ?? ""}
        onChange={(e) => {
          onUpdate(def.name, "value", e.target.value);
        }}
        placeholder={def.metric}
        className={inputClass}
      />
    );
  };

  const getDisplayValue = (): string => {
    if (def.inputType === "multi-select") {
      const selected = parseMultiSelectValue();
      return selected.length > 0 ? selected.join(", ") : "— none selected —";
    }
    return prop?.value ?? "";
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-200">
            {def.name}
            {prop?.needsResearchReview && <span className="ml-2 text-amber-400 font-normal">(needs review)</span>}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{def.description}</p>
          {def.inputType === "multi-select" && <p className="text-xs text-indigo-400 mt-1">{getDisplayValue()}</p>}
        </div>
      </div>
      {renderValueInput()}
      <textarea
        ref={notesRef}
        rows={2}
        value={localNotes}
        placeholder="Notes (why this value was selected)"
        className={`${inputClass} resize-y overflow-hidden`}
        onChange={(e) => {
          setLocalNotes(e.target.value);
        }}
        onBlur={() => {
          onUpdate(def.name, "notes", localNotes);
        }}
      />
      <input
        type="url"
        value={localUrl}
        placeholder="Documentation URL"
        className={inputClass}
        onChange={(e) => {
          setLocalUrl(e.target.value);
        }}
        onBlur={() => {
          onUpdate(def.name, "url", localUrl);
        }}
      />
      {prop?.citations && prop.citations.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded p-2 space-y-1">
          <p className="text-xs font-medium text-gray-400">Citations</p>
          {prop.citations.map((c, i) => (
            <p key={i} className="text-xs text-gray-500">
              [{i + 1}] &ldquo;{c.cited_text}&rdquo;{" "}
              <span className="text-gray-600">
                (chars {c.start_char_index}&ndash;{c.end_char_index})
              </span>{" "}
              &mdash;{" "}
              <a
                href={c.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline break-all"
              >
                {c.source}
              </a>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
