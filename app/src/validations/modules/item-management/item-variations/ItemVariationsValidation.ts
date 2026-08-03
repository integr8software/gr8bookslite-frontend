import { z } from "zod";
import type {
  ItemVariationFormErrors,
  ItemVariationFormValues,
  ItemVariationRecord,
} from "@/app/src/types/modules/item-management/item-variations/ItemVariationsTypes";

export const ItemVariationsFormValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a variation name.")
    .max(100, "Variation name must be 100 characters or fewer."),
  values: z
    .array(
      z.object({
        id: z.string().trim().min(1, "Value id is required."),
        label: z.string().trim().max(100, "Each value must be 100 characters or fewer."),
        isUsed: z.boolean(),
        status: z.enum(["Active", "Inactive"], {
          message: "Select a value status.",
        }),
      }),
    )
    .superRefine((values, context) => {
      const normalizedValues = values.map((value) => value.label.trim()).filter(Boolean);

      if (normalizedValues.length === 0) {
        context.addIssue({
          code: "custom",
          message: "Enter at least one variation value.",
        });
        return;
      }

      const seenValues = new Set<string>();
      const hasDuplicateValue = normalizedValues.some((value) => {
        const normalizedValue = value.toLowerCase();

        if (seenValues.has(normalizedValue)) {
          return true;
        }

        seenValues.add(normalizedValue);
        return false;
      });

      if (hasDuplicateValue) {
        context.addIssue({
          code: "custom",
          message: "Variation values must be unique.",
        });
      }
    }),
  status: z.enum(["Active", "Inactive"], {
    message: "Select a status.",
  }),
});

export function validateItemVariationsForm(
  values: ItemVariationFormValues,
  options: {
    currentRecordId?: string;
    records?: ItemVariationRecord[];
  } = {},
): ItemVariationFormErrors {
  const result = ItemVariationsFormValidationSchema.safeParse(values);
  const errors = result.success ? {} : mapItemVariationsIssues(result.error.issues);
  const normalizedName = values.name.trim().toLowerCase();

  if (
    normalizedName &&
    options.records?.some(
      (record) =>
        record.id !== options.currentRecordId &&
        record.name.trim().toLowerCase() === normalizedName,
    )
  ) {
    errors.name = errors.name ?? "Variation name must be unique.";
  }

  return errors;
}

function mapItemVariationsIssues(issues: z.ZodIssue[]) {
  return issues.reduce<ItemVariationFormErrors>((errors, issue) => {
    const field = issue.path[0] as keyof ItemVariationFormValues | undefined;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}
