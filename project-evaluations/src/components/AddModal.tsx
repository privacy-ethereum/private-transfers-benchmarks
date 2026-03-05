import { useState } from "react";

import type { Category } from "../types.js";
import { CATEGORIES } from "../schema.js";

interface AddModalProps {
  onClose: () => void;
  addEvaluation: (title: string, description: string, documentation: string, categories: Category[]) => void;
}

export default function AddModal({ onClose, addEvaluation }: AddModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const fieldClass =
    "w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500";

  const handleConfirm = (): void => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert("Please enter a title.");
      return;
    }

    if (selectedCategories.length === 0) {
      alert("Please select at least one category.");
      return;
    }

    const trimmedDescription = description.trim();
    const trimmedDocumentation = documentation.trim();

    addEvaluation(trimmedTitle, trimmedDescription, trimmedDocumentation, selectedCategories);

    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-4">Add protocol</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Title</label>
            <input
              type="text"
              placeholder="Protocol name"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Brief description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              className={`${fieldClass} resize-none`}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Documentation</label>
            <textarea
              rows={2}
              placeholder="Documentation URL or link"
              value={documentation}
              onChange={(e) => {
                setDocumentation(e.target.value);
              }}
              className={`${fieldClass} resize-none`}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Categories</label>
            <div className="space-y-2 bg-gray-800 border border-gray-700 rounded p-3">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...selectedCategories, cat]
                        : selectedCategories.filter((c) => c !== cat);
                      setSelectedCategories(updated);
                    }}
                    className="w-4 h-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-gray-300">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded px-4 py-2 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
