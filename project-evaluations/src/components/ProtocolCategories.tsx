import { useState } from "react";

import type { Category } from "../types.js";
import { CATEGORIES } from "../data/schema.js";

interface ProtocolCategoriesProps {
  categories: Category[];
  onUpdate: (categories: Category[]) => void;
}

export default function ProtocolCategories({ categories, onUpdate }: ProtocolCategoriesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<Category[]>([]);

  const startEdit = (): void => {
    setEditValue(categories);
    setIsEditing(true);
  };

  const saveEdit = (): void => {
    onUpdate(editValue);
    setIsEditing(false);
  };

  const cancelEdit = (): void => {
    setIsEditing(false);
  };

  const toggleCategory = (category: Category, checked: boolean): void => {
    const updated = checked ? [...editValue, category] : editValue.filter((c) => c !== category);
    setEditValue(updated);
  };

  return (
    <div
      className="group cursor-pointer mt-3"
      onDoubleClick={startEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter") startEdit();
      }}
      role="button"
      tabIndex={0}
    >
      {isEditing ? (
        <div className="flex gap-2">
          <div className="space-y-2 bg-gray-800 border border-indigo-500 rounded p-2 flex-1">
            {CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editValue.includes(category)}
                  onChange={(e) => {
                    toggleCategory(category, e.target.checked);
                  }}
                  className="w-4 h-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-gray-300">{category}</span>
              </label>
            ))}
          </div>
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
          <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <span
                  key={category}
                  className="inline-block text-xs bg-gray-800 text-gray-300 rounded px-2 py-0.5 group-hover:bg-gray-700 transition-colors"
                >
                  {category}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">— no categories selected —</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
