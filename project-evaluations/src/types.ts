import { type z } from "zod/v4";
import { type CATEGORIES, type PROPERTY_GROUPS } from "./data/schema";
import { type evaluationSchema, type propertySchema } from "./data/evaluation-schema";

export type Category = (typeof CATEGORIES)[number];

export type PropertyGroup = (typeof PROPERTY_GROUPS)[number];

export type PropertyInputType = "text" | "number" | "select" | "multi-select";

/** Metadata that drives UI rendering for each property */
export interface PropertyContent {
  name: string;
  group: PropertyGroup;
  description: string;
  metric: string;
  inputType: PropertyInputType;
  options?: readonly string[];
}

export type Evaluation = z.infer<typeof evaluationSchema>;
export type Property = z.infer<typeof propertySchema>;

export interface EvaluationsData {
  evaluations: Evaluation[];
}
