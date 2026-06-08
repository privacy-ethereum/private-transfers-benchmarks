import type { Evaluation } from "./types.js";

const NUMBER_OF_SECRETS_REGEX = /number of secrets/i;
const PROJECT_README_PATH_REGEX = /subgraph\/src\/([^/]+)\/README\.md$/;

/** Formats seconds, or a "min-max" range, into readable parts, e.g. "9000" → "2 hours, 30 minutes", "15-30" → "15 seconds - 30 seconds". */
function formatDuration(secondsValue: string): string {
  const seconds = secondsValue.split("-").map(Number);
  if (seconds.some(Number.isNaN)) return secondsValue;
  return seconds.map(formatSeconds).join(" - ");
}

/** Formats a whole number of seconds into its non-zero parts, e.g. 9000 → "2 hours, 30 minutes". */
function formatSeconds(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  if (seconds > 0) parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);

  return parts.join(", ") || "0 seconds";
}

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

  let value = Array.isArray(property.value) ? property.value.join(", ") : property.value;

  const nonDurationValues = new Set(["", "N/A", "Underlying chain"]);
  const timeProperties = new Set(["Time-to-finality", "Deposit time", "Withdraw time"]);

  const timeRequiresFormat = timeProperties.has(propertyName) && !nonDurationValues.has(value);
  if (timeRequiresFormat) {
    value = formatDuration(value);
  }

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
  const neutralToneProperties = new Set(["Plausible deniability"]);
  if (neutralToneProperties.has(propertyName)) {
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
