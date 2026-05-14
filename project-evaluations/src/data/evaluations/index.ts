import type { Evaluation } from "../../types.js";
import { evaluationSchema } from "../evaluation-schema.js";

const files = import.meta.glob("./*.json", { eager: true, import: "default" });
const rawEvaluations = Object.values(files);

export const evaluations: Evaluation[] = rawEvaluations
  .map((raw) => evaluationSchema.parse(raw))
  .slice()
  .sort((a, b) => a.title.localeCompare(b.title));
