import { z } from "zod";
import { ItemBehaviorOptions } from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
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
	expenseAccount: z.string().trim().min(1, "Select an expense account."),
});

const ItemCategoryAccountingSetupInputSchema = z.object({
	inventoryAccount: z.string(),
	salesAccount: z.string(),
	costOfSalesAccount: z.string(),
	expenseAccount: z.string(),
});

const ItemCategoryBaseFormValidationSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Enter a category name.")
		.max(120, "Category name must be 120 characters or fewer."),
	parentId: z.string().trim(),
	description: z
		.string()
		.trim()
		.max(500, "Description must be 500 characters or fewer."),
	behaviors: z
		.array(z.enum(ItemBehaviorOptions))
		.min(1, "Select at least one item behavior."),
	accountingSetupMode: z.enum(["inherit", "own"], {
		message: "Choose how accounting accounts are assigned.",
	}),
	accountingSetup: ItemCategoryAccountingSetupInputSchema,
	requiresInventoryAccount: z.boolean(),
	requiresSalesAccount: z.boolean(),
	requiresCostOfSalesAccount: z.boolean(),
	requiresExpenseAccount: z.boolean(),
	allowSubCategory: z.boolean(),
	status: z.enum(["Active", "Inactive"], {
		message: "Select a status.",
	}),
});

export function createItemCategoryFormValidationSchema({
	recordId,
	records,
}: {
	recordId?: string;
	records: ItemSetupRecord[];
}) {
	return ItemCategoryBaseFormValidationSchema.superRefine((values, context) => {
		if (
			!values.requiresInventoryAccount &&
			!values.requiresSalesAccount &&
			!values.requiresCostOfSalesAccount &&
			!values.requiresExpenseAccount
		) {
			context.addIssue({
				code: "custom",
				message: "Select at least one required account.",
				path: ["requiresInventoryAccount"],
			});
		}

		const currentRecord = recordId
			? records.find((record) => record.id === recordId)
			: undefined;
		const isKeepingCurrentParent =
			(currentRecord?.parentIds?.[0] ?? "") === values.parentId;

		if (!values.parentId && values.accountingSetupMode === "inherit") {
			context.addIssue({
				code: "custom",
				message: "Root categories must auto-create item accounts.",
				path: ["accountingSetupMode"],
			});
		}

		if (values.parentId) {
			const parentRecord = records.find(
				(record) => record.id === values.parentId,
			);

			if (recordId === values.parentId) {
				context.addIssue({
					code: "custom",
					message: "A category cannot be its own parent.",
					path: ["parentId"],
				});
			} else if (
				recordId &&
				isCircularParentSelection({
					parentId: values.parentId,
					recordId,
					records,
				})
			) {
				context.addIssue({
					code: "custom",
					message: "Choose a parent outside this category branch.",
					path: ["parentId"],
				});
			} else if (!parentRecord) {
				context.addIssue({
					code: "custom",
					message: "Choose an existing parent category.",
					path: ["parentId"],
				});
			} else if (!isKeepingCurrentParent && parentRecord.status !== "Active") {
				context.addIssue({
					code: "custom",
					message: "Choose an active parent category.",
					path: ["parentId"],
				});
			} else if (
				!isKeepingCurrentParent &&
				parentRecord.allowSubCategory === false
			) {
				context.addIssue({
					code: "custom",
					message: "This parent does not allow subcategories.",
					path: ["parentId"],
				});
			}
		}

		if (
			hasDuplicateCategoryName({
				name: values.name,
				parentId: values.parentId,
				recordId,
				records,
			})
		) {
			context.addIssue({
				code: "custom",
				message: "A category with this name already exists under this parent.",
				path: ["name"],
			});
		}

		if (values.accountingSetupMode !== "own") {
			return;
		}

		const requiredAccounts = [
			[
				values.requiresInventoryAccount,
				"inventoryAccount",
				"Select an inventory account.",
			],
			[values.requiresSalesAccount, "salesAccount", "Select a sales account."],
			[
				values.requiresCostOfSalesAccount,
				"costOfSalesAccount",
				"Select a cost of sales account.",
			],
			[
				values.requiresExpenseAccount,
				"expenseAccount",
				"Select an expense account.",
			],
		] as const;

		requiredAccounts.forEach(([isRequired, field, message]) => {
			if (isRequired && !values.accountingSetup[field].trim()) {
				context.addIssue({ code: "custom", message, path: [field] });
			}
		});
	});
}

export function validateItemCategoryForm(
	values: ItemCategoryFormValues,
	options: {
		recordId?: string;
		records: ItemSetupRecord[];
	} = { records: [] },
) {
	const result =
		createItemCategoryFormValidationSchema(options).safeParse(values);
	const errors: ItemCategoryFormErrors = {};

	if (!result.success) {
		for (const issue of result.error.issues) {
			const field = issue.path[0] as keyof ItemCategoryFormErrors | undefined;

			if (field && !errors[field]) {
				errors[field] = issue.message;
			}
		}
	}

	return errors;
}

function hasDuplicateCategoryName({
	name,
	parentId,
	recordId,
	records,
}: {
	name: string;
	parentId: string;
	recordId?: string;
	records: ItemSetupRecord[];
}) {
	const normalizedName = normalizeComparableValue(name);
	const normalizedParentId = parentId.trim();

	if (!normalizedName) {
		return false;
	}

	return records.some((record) => {
		if (record.id === recordId) {
			return false;
		}

		return (
			normalizeComparableValue(record.name) === normalizedName &&
			(record.parentIds?.[0] ?? "") === normalizedParentId
		);
	});
}

function normalizeComparableValue(value: string) {
	return value.trim().toLowerCase();
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
