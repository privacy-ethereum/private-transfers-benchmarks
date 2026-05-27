import { PROPERTY_DEFINITIONS, PROPERTY_GROUPS } from "../src/data/schema.js";
import type { Evaluation, PropertyGroup } from "../src/types.js";
import { cellTone, valueFor } from "../src/utils.js";

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function renderGroupTable(group: PropertyGroup, evaluations: Evaluation[]): string {
  const properties = PROPERTY_DEFINITIONS.filter((p) => p.group === group && p.name !== "Anonymity set size");
  const header = `<tr><th>Protocol</th>${properties.map((p) => `<th>${escapeHtml(p.name)}</th>`).join("")}</tr>`;
  const rows = evaluations
    .map((e) => {
      const cells = properties
        .map((p) => {
          const { value } = valueFor({ evaluations: e, propertyName: p.name });
          const tone = cellTone({ value, propertyName: p.name });
          return `<td class="${tone ? `cell--${tone}` : ""}">${escapeHtml(value)}</td>`;
        })
        .join("");
      return `<tr><th class="proto">${escapeHtml(e.title)}</th>${cells}</tr>`;
    })
    .join("\n");
  return `<table class="compare-table">\n${header}\n${rows}\n</table>`;
}

/** One heading + HTML table per property group, with protocols as rows. */
export function buildComparisonTable(evaluations: Evaluation[]): string {
  const sorted = [...evaluations].sort((a, b) => a.title.localeCompare(b.title));
  return PROPERTY_GROUPS.filter((group) => group !== "Cost and Performance")
    .map((group) => `### ${group}\n\n${renderGroupTable(group, sorted)}`)
    .join("\n\n");
}
