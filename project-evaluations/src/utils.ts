import type { Evaluation } from "./types.js";

const NUMBER_OF_SECRETS_REGEX = /number of secrets/i;

interface IValueForParams {
  evaluations: Evaluation;
  propertyName: string;
}

interface IValueForResult {
  value: string;
  notes: string;
  url: string;
}

/** Fetches the value, notes and url for a specific property by property name */
export function valueFor({ evaluations, propertyName }: IValueForParams): IValueForResult {
  const property = evaluations.properties.find((_property) => _property.name === propertyName);

  if (!property) {
    return { value: "—", notes: "", url: "" };
  }

  let value = property.value;

  if (value.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(value);

      if (Array.isArray(parsed)) {
        value = (parsed as string[]).join(", ");
      }
    } catch {
      // ignore JSON parse errors for multi-select values
    }
  }

  return { value: value || "—", notes: property.notes ?? "", url: property.url ?? "" };
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
