import { z } from "zod";
import type {
	MaterialRequestFormErrors,
	MaterialRequestFormValues,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";

const requiredText = (message: string) => z.string().trim().min(1, message);

const requiredNumber = ({
	invalidMessage,
	isValid,
	requiredMessage,
}: {
	invalidMessage: string;
	isValid: (value: number) => boolean;
	requiredMessage: string;
}) =>
	z
		.any()
		.superRefine((value, context) => {
			if (value === "" || value == null) {
				context.addIssue({
					code: "custom",
					message: requiredMessage,
				});
				return;
			}

			const numberValue = Number(value);

			if (!Number.isFinite(numberValue) || !isValid(numberValue)) {
				context.addIssue({
					code: "custom",
					message: invalidMessage,
				});
			}
		})
		.transform((value) => Number(value));

export const MaterialRequestItemValidationSchema = z.object({
	barcode: z.string(),
	category: z.string(),
	id: z.string(),
	itemCode: requiredText("Enter an item code."),
	itemName: requiredText("Enter an item name."),
	lotNo: z.string(),
	requestQuantity: requiredNumber({
		invalidMessage: "Enter a valid request quantity.",
		isValid: (value) => value > 0,
		requiredMessage: "Enter a request quantity.",
	}),
	remarks: z.string(),
	stockQuantity: requiredNumber({
		invalidMessage: "Enter a valid stock quantity.",
		isValid: (value) => value >= 0,
		requiredMessage: "Enter a stock quantity.",
	}),
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
		purpose: z.string(),
		referenceModule: z.string(),
		referenceNo: z.string(),
		remarks: z.string().max(500, "Remarks must be 500 characters or fewer."),
		requiresApproval: z.boolean(),
		requestNo: requiredText("Enter a Material Request No."),
		requiredDate: requiredText("Select a required date."),
		status: z.enum([
			"Draft",
			"Active",
			"Pending",
			"Approved",
			"Disapproved",
			"Closed",
			"Cancelled",
		]),
		toWarehouse: requiredText("Select To Warehouse."),
		vceCode: requiredText("Select a Party Member."),
		vceName: z.string(),
	})
	.superRefine((values, context) => {
		if (
			values.fromWarehouse &&
			values.toWarehouse &&
			values.fromWarehouse === values.toWarehouse
		) {
			context.addIssue({
				code: "custom",
				message: "Select a different To Warehouse.",
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
