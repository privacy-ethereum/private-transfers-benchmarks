import { z } from "zod/v4";
import { CATEGORIES, PROPERTY_DEFINITIONS } from "./schema";

const propertyNames = PROPERTY_DEFINITIONS.map((d) => d.name) as [string, ...string[]];
const propertyNameEnum = z.enum(propertyNames);
const categoryEnum = z.enum(CATEGORIES);

const propertySchema = z.object({
  name: propertyNameEnum,
  value: z.string(),
  notes: z.string().optional(),
  url: z.string().optional(),
});

export const evaluationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  documentation: z.string(),
  categories: z.array(categoryEnum).min(1),
  properties: z.array(propertySchema),
});

export type EvaluationInput = z.infer<typeof evaluationSchema>;
