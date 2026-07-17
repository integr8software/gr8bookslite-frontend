import { z } from "zod";
import type {
	ItemCategoryFormErrors,
	ItemCategoryFormValues,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-category/ItemCategoryTypes";

export const ItemCategoryAccountingSetupValidationSchema = z.object({
	inventoryAccount: z.string().trim().min(1, "Select an inventory account."),
	salesAccount: z.string().trim().min(1, "Select a sales account."),
	costOfSalesAccount: z
		.string()
		.trim()
		.min(1, "Select a cost of sales account."),
	discountAccount: z
		.string()
		.trim()
		.min(1, "Select a discount account."),
	purchaseAccount: z.string().trim().min(1, "Select a purchase account."),
	expenseAccount: z.string().trim().min(1, "Select an expense account."),
});

export const ItemCategoryFormValidationSchema = z
	.object({
		name: z.string().trim().min(1, "Enter a category name."),
		parentId: z.string(),
		description: z
			.string()
			.trim()
			.max(500, "Description must be 500 characters or fewer.")
			.optional(),
		accountingSetupMode: z.enum(["inherit", "notSet", "own"]),
		accountingSetup: ItemCategoryAccountingSetupValidationSchema,
		allowSubCategory: z.boolean(),
		status: z.enum(["Active", "Inactive"], {
			message: "Select a status.",
		}),
	})
	.superRefine((values, context) => {
		if (values.accountingSetupMode !== "own") {
			return;
		}

		const result = ItemCategoryAccountingSetupValidationSchema.safeParse(
			values.accountingSetup,
		);

		if (result.success) {
			return;
		}

		result.error.issues.forEach((issue) => {
			context.addIssue({
				code: "custom",
				message: issue.message,
				path: issue.path,
			});
		});
	});

export function validateItemCategoryForm(
	values: ItemCategoryFormValues,
	options: {
		recordId?: string;
		records: ItemSetupRecord[];
	} = { records: [] },
) {
	const result = ItemCategoryFormValidationSchema.safeParse(values);
	const errors: ItemCategoryFormErrors = {};

	if (!result.success) {
		result.error.issues.forEach((issue) => {
			const field = issue.path[0] as keyof ItemCategoryFormErrors | undefined;

			if (field) {
				errors[field] = issue.message;
			}
		});
	}

	if (values.parentId && options.recordId === values.parentId) {
		errors.parentId = "A category cannot be its own parent.";
	}

	if (
		values.parentId &&
		options.recordId &&
		isCircularParentSelection({
			parentId: values.parentId,
			recordId: options.recordId,
			records: options.records,
		})
	) {
		errors.parentId = "Choose a parent outside this category branch.";
	}

	return errors;
}

function isCircularParentSelection({
	parentId,
	recordId,
	records,
}: {
	parentId: string;
	recordId: string;
	records: ItemSetupRecord[];
}) {
	const childrenByParentId = new Map<string, string[]>();

	records.forEach((record) => {
		(record.parentIds ?? []).forEach((currentParentId) => {
			const children = childrenByParentId.get(currentParentId) ?? [];

			children.push(record.id);
			childrenByParentId.set(currentParentId, children);
		});
	});

	const pending = [...(childrenByParentId.get(recordId) ?? [])];
	const visited = new Set<string>();

	while (pending.length > 0) {
		const currentId = pending.pop();

		if (!currentId || visited.has(currentId)) {
			continue;
		}

		if (currentId === parentId) {
			return true;
		}

		visited.add(currentId);
		pending.push(...(childrenByParentId.get(currentId) ?? []));
	}

	return false;
}
