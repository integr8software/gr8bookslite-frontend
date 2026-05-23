import { z } from "zod";
import type {
	ItemFormErrors,
	ItemFormValues,
	ItemSetupFormErrors,
	ItemSetupFormValues,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

export const ItemBundleComponentValidationSchema = z.object({
	id: z.string(),
	itemCode: z.string().trim().min(1, "Enter an item code."),
	itemName: z.string().trim().min(1, "Enter an item name."),
	quantity: z.number().positive("Quantity must be greater than zero."),
	uom: z.string().trim().min(1, "Enter a UOM."),
});

export const ItemFormValidationSchema = z
	.object({
		code: z.string().trim().min(1, "Enter an item code."),
		name: z.string().trim().min(1, "Enter an item name."),
		category: z.string().trim().min(1, "Enter a category."),
		subcategory: z.string().trim().min(1, "Enter a sub category."),
		type: z.string().trim().min(1, "Enter an item type."),
		subtype: z.string().trim().min(1, "Enter a sub item type."),
		trackingType: z.enum(["Inventory", "Non-Inventory", "Service"]),
		uom: z.string().trim().min(1, "Enter a UOM."),
		status: z.enum(["Active", "Inactive"]),
		supportsBundle: z.boolean(),
		description: z.string().trim().optional(),
		bundleComponents: z.array(ItemBundleComponentValidationSchema),
	})
	.superRefine((values, context) => {
		if (values.supportsBundle && values.bundleComponents.length === 0) {
			context.addIssue({
				code: "custom",
				message: "Add at least one bundle component.",
				path: ["bundleComponents"],
			});
		}
	});

export const ItemSetupFormValidationSchema = z.object({
	code: z.string().trim().min(1, "Enter a code."),
	name: z.string().trim().min(1, "Enter a name."),
	description: z.string().trim().optional(),
	status: z.enum(["Active", "Inactive"]),
});

export function validateItemForm(values: ItemFormValues) {
	const result = ItemFormValidationSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<ItemFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof ItemFormErrors | undefined;

		if (field) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}

export function validateItemSetupForm(values: ItemSetupFormValues) {
	const result = ItemSetupFormValidationSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<ItemSetupFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof ItemSetupFormErrors | undefined;

		if (field) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}

