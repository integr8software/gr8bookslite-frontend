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
	priceBasis: z.enum(["Source", "Target"]).optional(),
	barcode: z.string().trim().optional(),
	isPurchaseDefault: z.boolean().optional(),
	isSalesDefault: z.boolean().optional(),
	isStockDefault: z.boolean().optional(),
});

export const ItemAttributeAssignmentValidationSchema = z.object({
	id: z.string(),
	attributeId: z.string().trim().min(1, "Select an attribute."),
	value: z.string().trim().min(1, "Enter an attribute value."),
});

export const ItemPriceListAssignmentValidationSchema = z.object({
	id: z.string(),
	priceListId: z.string().trim().min(1, "Select a price list."),
	price: z.number().nonnegative("Price must not be negative."),
});

export const ItemSupplierAssignmentValidationSchema = z.object({
	id: z.string(),
	supplier: z.string().trim().min(1, "Select a supplier."),
	supplierItemCode: z.string().trim().optional(),
	leadTime: z.string().trim().optional(),
	lastCost: z.number().nonnegative("Last cost must not be negative."),
	isDefault: z.boolean(),
});

export const ItemFormValidationSchema = z
	.object({
		code: z.string().trim().min(1, "Enter an item code."),
		skuCode: z.string().trim().optional(),
		name: z.string().trim().min(1, "Enter an item name."),
		model: z.string().trim().optional(),
		externalReferenceCode: z.string().trim().optional(),
		brand: z.string().trim().optional(),
		suppliers: z.array(ItemSupplierAssignmentValidationSchema),
		barcode: z.string().trim().optional(),
		primaryCategory: z.string().trim().min(1, "Select a primary category."),
		uom: z.string().trim().min(1, "Enter a UOM."),
		responsibilityCenter: z.string().trim().optional(),
		costPrice: z.number().nonnegative("Cost must not be negative."),
		sellingPrice: z.number().nonnegative("Selling price must not be negative."),
		taxTreatment: z.enum([
			"VAT Exclusive",
			"VAT Inclusive",
			"VAT Exempt",
			"Zero Rated",
			"Non-VAT",
		]),
		status: z.enum(["Active", "Inactive"]),
		defaultWarehouse: z.string().trim().optional(),
		defaultLocation: z.string().trim().optional(),
		defaultZone: z.string().trim().optional(),
		defaultRack: z.string().trim().optional(),
		defaultShelf: z.string().trim().optional(),
		defaultBin: z.string().trim().optional(),
		defaultLotNo: z.string().trim().optional(),
		leadTime: z.string().trim().optional(),
		reorderLevel: z.number().nonnegative("Reorder level must not be negative."),
		minimumStock: z.number().nonnegative("Minimum stock must not be negative."),
		maximumStock: z.number().nonnegative("Maximum stock must not be negative."),
		perishability: z.enum(["Perishable", "Non Perishable"]),
		sellable: z.boolean(),
		purchasable: z.boolean(),
		trackInventory: z.boolean(),
		service: z.boolean(),
		asset: z.boolean(),
		hasVariants: z.boolean(),
		lotTracking: z.boolean(),
		serialTracking: z.boolean(),
		attributeAssignments: z.array(ItemAttributeAssignmentValidationSchema),
		uomConversions: z.array(ItemUomConversionValidationSchema),
		priceListPrices: z.array(ItemPriceListAssignmentValidationSchema),
		description: z
			.string()
			.trim()
			.max(500, "Description must be 500 characters or fewer.")
			.optional(),
		tags: z.array(z.string().trim().min(1)),
	})
	.superRefine((values, context) => {
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
