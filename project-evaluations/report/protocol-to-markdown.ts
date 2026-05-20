import { PROPERTY_DEFINITIONS } from "../src/data/schema.js";
import type { Evaluation, Property } from "../src/types.js";

/** Render a property value: a multi-select array becomes a comma-separated string. */
function formatValue(value: string | string[]): string {
  return Array.isArray(value) ? value.join(", ") : value;
}

/**
 * One property line in the report. Skips properties with empty values (out of scope).
 *
 * Format: **<name>** — <value>. <notes>
 */
function renderProperty(property: Property): string | null {
  const value = formatValue(property.value);
  if (value === "") return null;
  return `**${property.name}** — ${value}. ${property.notes?.trim()}`;
}

/** Order properties by their position in PROPERTY_DEFINITIONS. */
function orderProperties(properties: Property[]): Property[] {
  const orderByName = new Map(PROPERTY_DEFINITIONS.map((definition, index) => [definition.name, index]));
  return [...properties].sort(
    (firstProperty, secondProperty) =>
      (orderByName.get(firstProperty.name) ?? 0) - (orderByName.get(secondProperty.name) ?? 0),
  );
}

/**
 * Convert one evaluation to its markdown section.
 *
 * Format:
 *   **<title>**
 *
 *   <description>
 *
 *   **Categories**: <comma-separated categories>
 *
 *   **Documentation**: <documentation URL>
 *
 *   **<property name>** — <value>. <notes>
 *   ...
 */
export function protocolToMarkdown(evaluation: Evaluation): string {
  const lines: string[] = [
    `**${evaluation.title}**`,
    evaluation.description,
    `**Categories**: ${evaluation.categories.join(", ")}`,
    `**Documentation**: ${evaluation.documentation}`,
  ];

  const propertyLines = orderProperties(evaluation.properties)
    .map(renderProperty)
    .filter((line): line is string => line !== null);

  return [...lines, ...propertyLines].join("\n\n");
}
