import type { Evaluation, EvaluationsData } from "./types.js";
import {
  CATEGORIES,
  PROPERTY_DEFINITIONS,
  PROPERTY_GROUPS,
  definitionByName,
  definitionsByGroup,
} from "./schema.js";
import defaultData from "./data/evaluations.json" assert { type: "json" };

// ── State ─────────────────────────────────────────────────────────────────

let data: EvaluationsData = structuredClone(defaultData) as EvaluationsData;
let selectedId: string | null = data.evaluations[0]?.id ?? null;
let showAddModal = false;

// ── Helpers ───────────────────────────────────────────────────────────────

const selected = (): Evaluation | undefined =>
  data.evaluations.find((e) => e.id === selectedId);

const propValue = (evaluation: Evaluation, name: string): string =>
  evaluation.properties.find((p) => p.name === name)?.value ?? "";

const setPropValue = (evaluation: Evaluation, name: string, value: string): void => {
  const existing = evaluation.properties.find((p) => p.name === name);
  if (existing) {
    existing.value = value;
  } else {
    evaluation.properties.push({ name, value });
  }
};

const generateId = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const filledCount = (evaluation: Evaluation): number =>
  evaluation.properties.filter((p) => p.value.trim() !== "").length;

const totalCount = (): number => PROPERTY_DEFINITIONS.length;

// ── Export / Import ───────────────────────────────────────────────────────

const exportJSON = (): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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
      data = parsed;
      selectedId = data.evaluations[0]?.id ?? null;
      render();
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
};

// ── Render helpers ────────────────────────────────────────────────────────

const badge = (text: string): string =>
  `<span class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">${text}</span>`;

const progressBar = (evaluation: Evaluation): string => {
  const filled = filledCount(evaluation);
  const total = totalCount();
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  return `
    <div class="flex items-center gap-2 text-xs text-gray-400">
      <div class="flex-1 bg-gray-700 rounded-full h-1.5">
        <div class="bg-indigo-500 h-1.5 rounded-full transition-all" style="width:${pct}%"></div>
      </div>
      <span>${filled}/${total}</span>
    </div>`;
};

const renderSelectInput = (
  evalId: string,
  propName: string,
  value: string,
  options: readonly string[],
): string => `
  <select
    data-eval="${evalId}"
    data-prop="${propName}"
    class="prop-input w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
  >
    <option value="">— select —</option>
    ${options.map((o) => `<option value="${o}"${value === o ? " selected" : ""}>${o}</option>`).join("")}
  </select>`;

const renderTextInput = (evalId: string, propName: string, value: string, type: "text" | "number"): string => `
  <input
    data-eval="${evalId}"
    data-prop="${propName}"
    type="${type}"
    value="${value.replace(/"/g, "&quot;")}"
    placeholder="${type === "number" ? "0" : "—"}"
    class="prop-input w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
  />`;

const renderPropertyRow = (evaluation: Evaluation, propName: string): string => {
  const def = definitionByName(propName);
  if (!def) return "";
  const value = propValue(evaluation, propName);

  const input =
    def.inputType === "select" && def.options
      ? renderSelectInput(evaluation.id, propName, value, def.options)
      : renderTextInput(evaluation.id, propName, value, def.inputType as "text" | "number");

  return `
    <tr class="border-b border-gray-800 hover:bg-gray-800/40">
      <td class="py-2 pr-4 align-top w-56">
        <div class="text-sm font-medium text-gray-200">${def.name}</div>
        <div class="text-xs text-gray-500 mt-0.5">${def.metric}</div>
      </td>
      <td class="py-2 pr-4 align-top text-xs text-gray-400 w-72 hidden lg:table-cell">${def.description}</td>
      <td class="py-2 align-top">${input}</td>
    </tr>`;
};

const renderGroupSection = (evaluation: Evaluation, group: string): string => {
  const defs = definitionsByGroup(group as never);
  const rows = defs.map((d) => renderPropertyRow(evaluation, d.name)).join("");
  return `
    <div class="mb-6">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3 pb-1 border-b border-gray-800">${group}</h3>
      <table class="w-full">
        <tbody>${rows}</tbody>
      </table>
    </div>`;
};

const renderDetail = (): string => {
  const evaluation = selected();
  if (!evaluation) {
    return `<div class="flex-1 flex items-center justify-center text-gray-500">Select a protocol to evaluate</div>`;
  }

  const groups = PROPERTY_GROUPS.map((g) => renderGroupSection(evaluation, g)).join("");

  return `
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-6 py-4 border-b border-gray-800 flex items-start gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-1">
            <h2 class="text-xl font-semibold text-white truncate">${evaluation.title}</h2>
            ${badge(evaluation.category)}
          </div>
          <p class="text-sm text-gray-400 mb-3">${evaluation.description}</p>
          ${progressBar(evaluation)}
        </div>
        <button
          id="delete-btn"
          class="shrink-0 text-xs text-red-400 hover:text-red-300 border border-red-800/50 hover:border-red-600 px-2 py-1 rounded transition-colors"
        >Delete</button>
      </div>
      <div class="flex-1 overflow-y-auto px-6 py-4">
        ${groups}
      </div>
    </div>`;
};

const renderSidebar = (): string => {
  const items = data.evaluations
    .map((e) => {
      const isActive = e.id === selectedId;
      const filled = filledCount(e);
      const total = totalCount();
      const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
      return `
        <button
          data-select="${e.id}"
          class="w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
            isActive
              ? "bg-indigo-600/30 border border-indigo-600/50 text-white"
              : "hover:bg-gray-800 text-gray-300 border border-transparent"
          }"
        >
          <div class="text-sm font-medium truncate">${e.title}</div>
          <div class="flex items-center gap-2 mt-1">
            <div class="flex-1 bg-gray-700 rounded-full h-1">
              <div class="bg-indigo-500 h-1 rounded-full" style="width:${pct}%"></div>
            </div>
            <span class="text-xs text-gray-500">${pct}%</span>
          </div>
          <div class="text-xs text-gray-500 mt-0.5">${e.category}</div>
        </button>`;
    })
    .join("");

  return `
    <aside class="w-64 shrink-0 flex flex-col border-r border-gray-800 bg-gray-900">
      <div class="px-4 py-4 border-b border-gray-800">
        <h1 class="text-sm font-bold text-white tracking-wide">Private Transfers</h1>
        <p class="text-xs text-gray-500 mt-0.5">Protocol Evaluations</p>
      </div>
      <div class="flex-1 overflow-y-auto p-2 space-y-1">${items}</div>
      <div class="p-3 border-t border-gray-800 space-y-2">
        <button id="add-btn" class="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded px-3 py-1.5 transition-colors">
          + Add protocol
        </button>
        <div class="flex gap-2">
          <button id="export-btn" class="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded px-2 py-1.5 transition-colors">
            Export JSON
          </button>
          <label class="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded px-2 py-1.5 transition-colors cursor-pointer text-center">
            Import JSON
            <input id="import-input" type="file" accept=".json" class="hidden" />
          </label>
        </div>
      </div>
    </aside>`;
};

const renderAddModal = (): string => {
  if (!showAddModal) return "";
  const categoryOptions = CATEGORIES.map(
    (c) => `<option value="${c}">${c}</option>`,
  ).join("");
  return `
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" id="modal-backdrop">
      <div class="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 class="text-lg font-semibold text-white mb-4">Add protocol</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Title</label>
            <input id="new-title" type="text" placeholder="Protocol name"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Description</label>
            <textarea id="new-desc" rows="3" placeholder="Brief description"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 resize-none"></textarea>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Category</label>
            <select id="new-category"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500">
              ${categoryOptions}
            </select>
          </div>
        </div>
        <div class="flex gap-3 mt-5">
          <button id="modal-cancel" class="flex-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded px-4 py-2 transition-colors">Cancel</button>
          <button id="modal-confirm" class="flex-1 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded px-4 py-2 transition-colors">Add</button>
        </div>
      </div>
    </div>`;
};

// ── Render ────────────────────────────────────────────────────────────────

const render = (): void => {
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <header class="shrink-0 border-b border-gray-800 px-6 py-3 flex items-center justify-between bg-gray-950">
      <div class="text-xs text-gray-500">
        Evaluating <span class="text-gray-300 font-medium">${data.evaluations.length}</span> protocol${data.evaluations.length !== 1 ? "s" : ""}
      </div>
    </header>
    <div class="flex flex-1 min-h-0">
      ${renderSidebar()}
      <main class="flex-1 flex flex-col min-h-0 bg-gray-950">
        ${renderDetail()}
      </main>
    </div>
    ${renderAddModal()}`;

  bindEvents();
};

// ── Events ────────────────────────────────────────────────────────────────

const bindEvents = (): void => {
  // Sidebar item selection
  document.querySelectorAll<HTMLButtonElement>("[data-select]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedId = btn.dataset.select!;
      render();
    });
  });

  // Property inputs
  document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(".prop-input").forEach((input) => {
    input.addEventListener("change", () => {
      const evalId = input.dataset.eval!;
      const propName = input.dataset.prop!;
      const evaluation = data.evaluations.find((e) => e.id === evalId);
      if (evaluation) {
        setPropValue(evaluation, propName, input.value);
        // Re-render sidebar progress only (avoid losing focus in detail)
        const sidebar = document.querySelector("aside");
        if (sidebar) {
          const temp = document.createElement("div");
          temp.innerHTML = renderSidebar();
          sidebar.replaceWith(temp.firstElementChild!);
          // Re-bind sidebar events
          document.querySelectorAll<HTMLButtonElement>("[data-select]").forEach((btn) => {
            btn.addEventListener("click", () => {
              selectedId = btn.dataset.select!;
              render();
            });
          });
          bindSidebarButtons();
        }
        // Update progress bar in detail header
        const pbEl = document.querySelector<HTMLElement>("#progress-bar");
        if (pbEl) {
          pbEl.outerHTML = progressBar(evaluation);
        }
      }
    });
  });

  // Delete
  document.getElementById("delete-btn")?.addEventListener("click", () => {
    const evaluation = selected();
    if (!evaluation) return;
    if (!confirm(`Delete "${evaluation.title}"?`)) return;
    data.evaluations = data.evaluations.filter((e) => e.id !== selectedId);
    selectedId = data.evaluations[0]?.id ?? null;
    render();
  });

  bindSidebarButtons();

  // Add modal
  document.getElementById("add-btn")?.addEventListener("click", () => {
    showAddModal = true;
    render();
  });
  document.getElementById("modal-cancel")?.addEventListener("click", () => {
    showAddModal = false;
    render();
  });
  document.getElementById("modal-backdrop")?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "modal-backdrop") {
      showAddModal = false;
      render();
    }
  });
  document.getElementById("modal-confirm")?.addEventListener("click", () => {
    const title = (document.getElementById("new-title") as HTMLInputElement).value.trim();
    const desc = (document.getElementById("new-desc") as HTMLTextAreaElement).value.trim();
    const category = (document.getElementById("new-category") as HTMLSelectElement).value;
    if (!title) {
      alert("Please enter a title.");
      return;
    }
    const newEval: Evaluation = {
      id: generateId(title),
      title,
      description: desc,
      category: category as Evaluation["category"],
      properties: [],
    };
    data.evaluations.push(newEval);
    selectedId = newEval.id;
    showAddModal = false;
    render();
  });
};

const bindSidebarButtons = (): void => {
  document.getElementById("export-btn")?.addEventListener("click", exportJSON);
  document.getElementById("import-input")?.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) importJSON(file);
  });
};

// ── Boot ──────────────────────────────────────────────────────────────────

render();
