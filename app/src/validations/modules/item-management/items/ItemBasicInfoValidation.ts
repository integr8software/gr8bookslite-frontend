import { z } from "zod";
import { ItemStatusOptions } from "@/app/src/constants/modules/item-management/items/ItemManagementConstants";
import type { ItemFormErrors, ItemFormValues } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";

const referenceId = z.string().regex(/^[1-9][0-9]*$/, "Select a valid record.");
export const ItemBasicInfoValidationSchema = z.object({
  code: z.string().trim().min(1, "Enter an item code.").max(50),
  skuCode: z.string().trim().max(100),
  name: z.string().trim().min(1, "Enter an item name.").max(150),
  barcode: z.string().trim().max(100),
  primaryCategory: referenceId,
  uom: referenceId,
  responsibilityCenter: z.union([z.literal(""), referenceId]),
  brand: z.string().trim().max(150),
  model: z.string().trim().max(150),
  externalReferenceCode: z.string().trim().max(100),
  description: z.string().trim().max(500),
  tags: z.array(z.string().trim().min(1).max(50)).max(50).refine(
    (tags) => new Set(tags.map((tag) => tag.toLowerCase())).size === tags.length,
    "Remove duplicate tags.",
  ),
  status: z.enum(ItemStatusOptions),
  costPrice: z.number().nonnegative("Cost must not be negative.").optional(),
  sellingPrice: z.number().nonnegative("Selling price must not be negative.").optional(),
  taxTreatment: z.string().trim().max(100).optional(),
});

export function validateItemBasicInfo(values: ItemFormValues): ItemFormErrors {
  const result = ItemBasicInfoValidationSchema.safeParse(values);
  if (result.success) return {};
  return result.error.issues.reduce<ItemFormErrors>((errors, issue) => {
    const field = issue.path[0] as keyof ItemFormErrors;
    errors[field] ??= issue.message;
    return errors;
  }, {});
}
