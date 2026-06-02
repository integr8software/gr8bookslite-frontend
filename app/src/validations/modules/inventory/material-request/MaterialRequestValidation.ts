import { z } from "zod";
import type {
	MaterialRequestFormErrors,
	MaterialRequestFormValues,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const MaterialRequestItemValidationSchema = z.object({
	barcode: z.string(),
	category: requiredText("Enter an item category."),
	id: z.string(),
	itemCode: requiredText("Enter an item code."),
	itemName: requiredText("Enter an item name."),
	lotNo: z.string(),
	requestQuantity: z.coerce.number().positive("Enter a valid request quantity."),
	remarks: z.string(),
	stockQuantity: z.coerce.number().min(0, "Enter a valid stock quantity."),
	uom: requiredText("Select a UOM."),
});

export const MaterialRequestFormValidationSchema = z
	.object({
		department: requiredText("Enter a department."),
		documentDate: requiredText("Select a document date."),
		fromWarehouse: requiredText("Select a source warehouse."),
		items: z.array(MaterialRequestItemValidationSchema),
		projectName: z.string(),
		projectRef: z.string(),
		purpose: requiredText("Enter the request purpose."),
		referenceNo: z.string(),
		remarks: z.string(),
		requestNo: requiredText("Enter a request number."),
		requestedBy: requiredText("Enter the requester."),
		requiredDate: requiredText("Select a required date."),
		status: z.enum(["Pending", "Approved", "Rejected", "Completed"]),
		toWarehouse: requiredText("Select a destination warehouse."),
		vceCode: requiredText("Enter a VCE code."),
		vceName: requiredText("Enter a VCE name."),
	})
	.superRefine((values, context) => {
		if (values.fromWarehouse === values.toWarehouse) {
			context.addIssue({
				code: "custom",
				message: "Select a different destination warehouse.",
				path: ["toWarehouse"],
			});
		}

		const hasValidItem = values.items.some(
			(item) =>
				item.itemCode.trim() &&
				item.itemName.trim() &&
				Number(item.requestQuantity) > 0,
		);

		if (!hasValidItem) {
			context.addIssue({
				code: "custom",
				message: "Add at least one material with item code, item name, and request quantity.",
				path: ["items"],
			});
		}
	});

export function validateMaterialRequestForm(
	values: MaterialRequestFormValues,
): MaterialRequestFormErrors {
	const result = MaterialRequestFormValidationSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<MaterialRequestFormErrors>(
		(errors, issue) => {
			const field =
				issue.path[0] as keyof MaterialRequestFormErrors | undefined;

			if (field && !errors[field]) {
				errors[field] = issue.message;
			}

			return errors;
		},
		{},
	);
}
