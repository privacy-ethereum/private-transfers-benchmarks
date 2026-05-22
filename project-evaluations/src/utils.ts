import type { Evaluation } from "./types.js";

const NUMBER_OF_SECRETS_REGEX = /number of secrets/i;
const PROJECT_README_PATH_REGEX = /subgraph\/src\/([^/]+)\/README\.md$/;

/** Properties shown without a yes/no colour — the answer is contextual, not better or worse. */
const NEUTRAL_TONE_PROPERTIES = new Set(["Plausible deniability"]);

interface IValueForParams {
  evaluations: Evaluation;
  propertyName: string;
}

interface IValueForResult {
  value: string;
  notes: string;
  url: string;
  needsResearchReview: string;
}

/** Fetches the value, notes, url and any open research-review flag for a property by name */
export function valueFor({ evaluations, propertyName }: IValueForParams): IValueForResult {
  const property = evaluations.properties.find((_property) => _property.name === propertyName);

  if (!property) {
    return { value: "—", notes: "", url: "", needsResearchReview: "" };
  }

  const value = Array.isArray(property.value) ? property.value.join(", ") : property.value;

  return {
    value: value || "—",
    notes: property.notes ?? "",
    url: property.url ?? "",
    needsResearchReview: property.needsResearchReview ?? "",
  };
}

interface ICellToneParams {
  value: string;
  propertyName: string;
}

type CellTone = "yes" | "no" | "warn" | "";

/**
 * Determines the tone of a cell (yes = green, yes = no, warm = yellow) based on its property name and value
 * @dev it is currently used to mark as yellow if number of secrets is 2 or greater
 */
export function cellTone({ value, propertyName }: ICellToneParams): CellTone {
  if (NEUTRAL_TONE_PROPERTIES.has(propertyName)) {
    return "";
  }

  const secretValue = value.toLowerCase().trim();

  if (NUMBER_OF_SECRETS_REGEX.test(propertyName)) {
    const numberOfSecrets = parseInt(secretValue, 10);

    if (!isNaN(numberOfSecrets)) {
      if (numberOfSecrets <= 1) {
        return "yes";
      }

      if (numberOfSecrets === 2) {
        return "warn";
      }

      return "no";
    }

    return "";
  }

  if (secretValue === "yes") {
    return "yes";
  }

  if (secretValue === "no") {
    return "no";
  }

  return "";
}

/** Identifies evaluations that are placeholders waiting for full analysis */
export function isPendingEvaluation(evaluation: Evaluation): boolean {
  return evaluation.status === "pending";
}

/**
 *  Gets the project ID from the path of the README file
 * @param path of the README file
 * @returns the project ID or an empty string if it cannot be determined
 */
export function convertPathToProjectId(path: string): string | null {
  const match = PROJECT_README_PATH_REGEX.exec(path);

  if (!match) {
    return null;
  }

  const projectId = match[1];

  if (projectId === "") {
    return null;
  }

  return projectId;
}
