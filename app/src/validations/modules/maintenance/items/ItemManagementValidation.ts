import { z } from "zod";
import {
	ItemBehaviorOptions,
	ItemPerishabilityOptions,
	ItemStatusOptions,
	ItemTaxTreatmentOptions,
} from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import type {
	ItemFormErrors,
	ItemFormValues,
} from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";

export const ItemBundleComponentValidationSchema = z.object({
	id: z.string(),
	itemId: z.string().trim().min(1, "Select a component item."),
	itemCode: z.string().trim().min(1, "Enter an item code."),
	itemName: z.string().trim().min(1, "Enter an item name."),
	quantity: z.number().positive("Quantity must be greater than zero."),
	uom: z.string().trim().min(1, "Enter a UOM."),
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
		taxTreatment: z.enum(ItemTaxTreatmentOptions),
		status: z.enum(ItemStatusOptions),
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
		perishability: z.enum(ItemPerishabilityOptions),
		behavior: z.enum(ItemBehaviorOptions),
		behaviors: z.array(z.enum(ItemBehaviorOptions)).min(1, "Select at least one item behavior."),
		sellable: z.boolean(),
		purchasable: z.boolean(),
		trackInventory: z.boolean(),
		service: z.boolean(),
		asset: z.boolean(),
		hasVariants: z.boolean(),
		lotTracking: z.boolean(),
		serialTracking: z.boolean(),
		attributeAssignments: z.array(ItemAttributeAssignmentValidationSchema),
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
