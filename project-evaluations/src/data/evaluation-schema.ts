import { z } from "zod/v4";
import { CATEGORIES, PROPERTY_DEFINITIONS } from "./schema";

const propertyNames = PROPERTY_DEFINITIONS.map((d) => d.name) as [string, ...string[]];
const propertyNameEnum = z.enum(propertyNames);
const categoryEnum = z.enum(CATEGORIES);

export const propertySchema = z.object({
  name: propertyNameEnum,
  value: z.string(),
  notes: z.string().optional(),
  url: z.string().optional(),
  citations: z
    .array(
      z.object({
        cited_text: z.string(),
        source: z.string(),
        start_char_index: z.number(),
        end_char_index: z.number(),
      }),
    )
    .optional(),
  needsResearchReview: z.boolean().optional(),
});

export const evaluationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  documentation: z.string(),
  categories: z.array(categoryEnum).min(1),
  properties: z.array(propertySchema),
  sourceUrls: z.array(z.string()).optional(),
});
