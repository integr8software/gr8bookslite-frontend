import { z } from "zod";
import type {
	ItemCategoryClassificationFormErrors,
	ItemCategoryClassificationFormValues,
	ItemFormErrors,
	ItemFormValues,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

export const ItemBundleComponentValidationSchema = z.object({
	id: z.string(),
	itemId: z.string().trim().min(1, "Select a component item."),
	itemCode: z.string().trim().min(1, "Enter an item code."),
	itemName: z.string().trim().min(1, "Enter an item name."),
	quantity: z.number().positive("Quantity must be greater than zero."),
	uom: z.string().trim().min(1, "Enter a UOM."),
});

export const ItemUomConversionValidationSchema = z.object({
	id: z.string(),
	fromUom: z.string().trim().min(1, "Select the source UOM."),
	quantity: z.number().positive("Conversion quantity must be greater than zero."),
	toUom: z.string().trim().min(1, "Select the target UOM."),
});

export const ItemSupplierAssignmentValidationSchema = z.object({
	id: z.string(),
	supplier: z.string().trim().min(1, "Select a supplier."),
	isDefault: z.boolean(),
});

export const ItemFormValidationSchema = z
	.object({
		code: z.string().trim().min(1, "Enter an item code."),
		skuCode: z.string().trim().optional(),
		name: z.string().trim().min(1, "Enter an item name."),
		thirdPartyCode: z.string().trim().optional(),
		brand: z.string().trim().optional(),
		suppliers: z.array(ItemSupplierAssignmentValidationSchema),
		barcode: z.string().trim().optional(),
		category: z.string().trim().min(1, "Enter a category."),
		subcategory: z.string().trim().min(1, "Enter a sub category."),
		type: z.string().trim().min(1, "Enter an item type."),
		subtype: z.string().trim().min(1, "Enter an item subtype."),
		uom: z.string().trim().min(1, "Enter a UOM."),
		costPrice: z.number().nonnegative("Cost must not be negative."),
		sellingPrice: z.number().nonnegative("Selling price must not be negative."),
		isVatable: z.boolean(),
		isVatIncluded: z.boolean(),
		status: z.enum(["Active", "Inactive"]),
		defaultWarehouse: z.string().trim().optional(),
		supportsBundle: z.boolean(),
		description: z.string().trim().optional(),
		tags: z.array(z.string().trim().min(1)),
		uomConversions: z.array(ItemUomConversionValidationSchema),
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

		if (
			values.suppliers.length > 0 &&
			values.suppliers.filter((supplier) => supplier.isDefault).length !== 1
		) {
			context.addIssue({
				code: "custom",
				message: "Choose one default supplier.",
				path: ["suppliers"],
			});
		}

		const supplierNames = new Set<string>();

		values.suppliers.forEach((supplier) => {
			const normalizedSupplier = supplier.supplier.trim().toLowerCase();

			if (!normalizedSupplier) {
				return;
			}

			if (supplierNames.has(normalizedSupplier)) {
				context.addIssue({
					code: "custom",
					message: "Remove duplicate suppliers.",
					path: ["suppliers"],
				});
				return;
			}

			supplierNames.add(normalizedSupplier);
		});
	});

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

export const ItemCategoryClassificationFormValidationSchema = z
	.object({
		name: z.string().trim().min(1, "Enter a category name."),
		parentId: z.string(),
		description: z.string().trim().optional(),
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

export function validateItemCategoryClassificationForm(
	values: ItemCategoryClassificationFormValues,
	options: {
		recordId?: string;
		records: ItemSetupRecord[];
	} = { records: [] },
) {
	const result = ItemCategoryClassificationFormValidationSchema.safeParse(values);
	const errors: ItemCategoryClassificationFormErrors = {};

	if (!result.success) {
		result.error.issues.forEach((issue) => {
			const field = issue.path[0] as
				| keyof ItemCategoryClassificationFormErrors
				| undefined;

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
