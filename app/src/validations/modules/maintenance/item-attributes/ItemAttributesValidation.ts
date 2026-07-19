import { z } from "zod";
import type {
  ItemAttributeFormErrors,
  ItemAttributeFormValues,
  ItemAttributeRecord,
} from "@/app/src/types/modules/maintenance/item-attributes/ItemAttributesTypes";

export const ItemAttributesFormValidationSchema = z.object({
  name: z.string().trim().min(1, "Enter an attribute name.").max(100, "Attribute name must be 100 characters or fewer."),
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
          message: "Enter at least one attribute value.",
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
          message: "Attribute values must be unique.",
        });
      }
    }),
  status: z.enum(["Active", "Inactive"], {
    message: "Select a status.",
  }),
});

export function validateItemAttributesForm(
  values: ItemAttributeFormValues,
  options: {
    currentRecordId?: string;
    records?: ItemAttributeRecord[];
  } = {},
): ItemAttributeFormErrors {
  const result = ItemAttributesFormValidationSchema.safeParse(values);
  const errors = result.success ? {} : mapItemAttributesIssues(result.error.issues);
  const normalizedName = values.name.trim().toLowerCase();

  if (normalizedName && options.records?.some((record) => record.id !== options.currentRecordId && record.name.trim().toLowerCase() === normalizedName)) {
    errors.name = errors.name ?? "Attribute name must be unique.";
  }

  return errors;
}

function mapItemAttributesIssues(issues: z.ZodIssue[]) {
  return issues.reduce<ItemAttributeFormErrors>((errors, issue) => {
    const field = issue.path[0] as keyof ItemAttributeFormValues | undefined;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}
