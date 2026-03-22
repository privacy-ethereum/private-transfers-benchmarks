import { type CATEGORIES, type PROPERTY_GROUPS } from "./data/schema";

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

/** One property value stored on an evaluation */
export interface Property {
  name: string;
  value: string;
  notes?: string;
  url?: string;
}

export interface Evaluation {
  id: string;
  title: string;
  description: string;
  documentation: string;
  categories: Category[];
  properties: Property[];
}

export interface EvaluationsData {
  evaluations: Evaluation[];
}
