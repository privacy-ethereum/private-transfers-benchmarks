import { z } from "zod/v4";
import { CATEGORIES, PROPERTY_DEFINITIONS } from "./schema";

const propertyNames = PROPERTY_DEFINITIONS.map((d) => d.name) as [string, ...string[]];
const propertyNameEnum = z.enum(propertyNames);
const categoryEnum = z.enum(CATEGORIES);
const evaluationStatusEnum = z.enum(["complete", "pending"]);

/** Citation accepted on every property. `kind` defaults to "standard" when absent —
 *  only typed citations (explorer, docs, l2beat) need to set it explicitly. */
const baseCitation = z.strictObject({
  kind: z.enum(["docs", "explorer", "l2beat", "standard"]).optional(),
  cited_text: z.string().optional(),
  source: z.string(),
});

/** Implementation maturity citation. */
const maturityCitation = baseCitation.extend({
  contract_address: z.string().optional(),
  date: z.iso.date().optional(),
});

/** Upgradeability citation. */
const upgradeabilityCitation = baseCitation.extend({
  contract_address: z.string().optional(),
  admin_class: z.enum(["Single admin", "Multi-sig", "DAO", "Network upgrade (hard/soft fork)"]).optional(),
});

const baseProperty = z.object({
  name: propertyNameEnum,
  value: z.union([z.string(), z.array(z.string())]),
  notes: z.string().optional(),
  url: z.string().optional(),
  citations: z.array(baseCitation).min(1).optional(),
  needsResearchReview: z.string().min(1).optional(),
});

export const propertySchema = z
  .discriminatedUnion("name", [
    baseProperty.extend({
      name: z.literal("Implementation maturity"),
      citations: z.array(maturityCitation).min(1).optional(),
    }),
    baseProperty.extend({
      name: z.literal("Upgradeability"),
      citations: z.array(upgradeabilityCitation).min(1).optional(),
    }),
    baseProperty.extend({
      name: propertyNameEnum.exclude(["Implementation maturity", "Upgradeability"]),
    }),
  ])
  .superRefine((property, ctx) => {
    const invalid = findInvalidValues(property);
    if (invalid && invalid.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: `"${property.name}" value not in options: ${invalid.join(", ")}`,
      });
    }
  });

/** Returns an array of invalid values.
 * Zod cannot validate `value`s easily in `propertySchema` since property `value`
 * fields are different strings — this refinement is fewer lines of code than one large schema.
 */
const findInvalidValues = (property: z.infer<typeof propertySchema>) => {
  const options = PROPERTY_DEFINITIONS.find((definition) => definition.name === property.name)?.options;
  if (!options) return;

  const values = Array.isArray(property.value) ? property.value : [property.value];
  const invalid = values.filter((value) => value !== "" && value !== "INSUFFICIENT_DATA" && !options.includes(value));
  return invalid;
};

export const evaluationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: evaluationStatusEnum,
  documentation: z.string(),
  categories: z.array(categoryEnum).min(1),
  properties: z.array(propertySchema),
  sourceUrls: z.array(z.string()).optional(),
});
