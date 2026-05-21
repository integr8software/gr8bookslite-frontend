import { z } from "zod";
import type {
	PurchaseRequestFormErrors,
	PurchaseRequestFormValues,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const PurchaseRequestItemValidationSchema = z.object({
	barcode: z.string(),
	cost: z.coerce.number().min(0),
	description: z.string(),
	expiryDate: z.string(),
	id: z.string(),
	itemCode: z.string(),
	lotNo: z.string(),
	quantity: z.coerce.number(),
	responsibilityCenter: z.string(),
	uom: z.string(),
});

export const PurchaseRequestFormValidationSchema = z
	.object({
		approvedBy: z.string(),
		bomNo: z.string(),
		companyAddress: z.string(),
		companyName: z.string(),
		currency: requiredText("Select a currency."),
		exchangeRate: z.coerce
			.number()
			.finite()
			.positive("Enter a valid exchange rate."),
		forDepartment: z.string(),
		items: z.array(PurchaseRequestItemValidationSchema),
		logoText: z.string(),
		prDate: requiredText("Select a PR date."),
		preparedBy: z.string(),
		projectCode: z.string(),
		projectName: z.string(),
		purchaseType: requiredText("Select a purchase type."),
		remarks: z.string(),
		status: z.enum(["Draft", "Open", "Closed", "Cancelled"]),
		telephoneNo: z.string(),
		transNo: requiredText("Enter a transaction number."),
		vatRegTin: z.string(),
		vceCode: requiredText("Enter a VCE code."),
		vceName: requiredText("Enter a VCE name."),
		vendorAddress: z.string(),
	})
	.superRefine((values, context) => {
		const hasValidItem = values.items.some(
			(item) =>
				item.itemCode.trim() &&
				item.description.trim() &&
				Number(item.quantity) > 0 &&
				Number(item.cost) >= 0,
		);

		if (!hasValidItem) {
			context.addIssue({
				code: "custom",
				message:
					"Add at least one item with item code, description, quantity, and cost.",
				path: ["items"],
			});
		}
	});

export function validatePurchaseRequestForm(
	values: PurchaseRequestFormValues,
): PurchaseRequestFormErrors {
	const result = PurchaseRequestFormValidationSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<PurchaseRequestFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof PurchaseRequestFormErrors | undefined;

		if (field && !errors[field]) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}
