import { z } from "zod";
import {
	AppMaxFileUploadSizeBytes,
	AppMaxFileUploadSizeLabel,
} from "@/app/src/constants/shared/app/AppConstants";
import type {
	SalesQuotationFormErrors,
	SalesQuotationFormValues,
} from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const SalesQuotationItemValidationSchema = z.object({
	barcode: requiredText("Enter a barcode."),
	discountAmount: z.coerce.number().finite().min(0),
	ewtAmount: z.coerce.number().finite().min(0),
	itemPrice: z.coerce.number().min(0),
	itemCategory: z.string(),
	itemName: requiredText("Enter an item name."),
	id: z.string(),
	itemCode: requiredText("Enter an item code."),
	quantity: z.coerce.number().positive("Enter a valid quantity."),
	responsibilityCenter: z.string(),
	uom: requiredText("Select a UOM."),
	vatAmount: z.coerce.number().finite().min(0),
	vatable: z.enum(["True", "False"]),
	vatInclusive: z.enum(["True", "False"]),
	vatType: z.string(),
});

export const SalesQuotationFormValidationSchema = z
	.object({
		approvedBy: z.string(),
		approvedByLabel: z.string(),
		bomNo: z.string(),
		companyAddress: requiredText("Enter the company address."),
		companyName: requiredText("Enter the company name."),
		currency: requiredText("Select a currency."),
		exchangeRate: z.coerce
			.number()
			.finite()
			.positive("Enter a valid exchange rate."),
		forDepartment: z.string(),
		items: z.array(SalesQuotationItemValidationSchema),
		logoFileName: z.string(),
		logoImageUrl: z.string(),
		prDate: requiredText("Select a PR date."),
		preparedBy: z.string(),
		preparedByLabel: z.string(),
		preparedBySignatureFileName: z.string(),
		preparedBySignatureImageUrl: z.string(),
		projectCode: z.string(),
		projectName: z.string(),
		remarks: z.string(),
		status: z.enum(["Draft", "Open", "Approved", "Closed", "Cancelled"]),
		telephoneNo: requiredText("Enter the telephone number."),
		transNo: requiredText("Enter a transaction number."),
		vatRegTin: requiredText("Enter the VAT Reg TIN."),
		partyCode: requiredText("Enter a party code."),
		partyName: requiredText("Enter a party name."),
		partyAddress: z.string(),
		approvedBySignatureFileName: z.string(),
		approvedBySignatureImageUrl: z.string(),
	})
	.superRefine((values, context) => {
		const hasValidItem = values.items.some(
			(item) =>
				item.itemCode.trim() &&
				item.itemName.trim() &&
				Number(item.quantity) > 0 &&
				Number(item.itemPrice) >= 0,
		);

		if (!hasValidItem) {
			context.addIssue({
				code: "custom",
				message:
					"Add at least one item with item code, item name, quantity, and item price.",
				path: ["items"],
			});
		}

		if (getDataUrlSizeInBytes(values.logoImageUrl) > AppMaxFileUploadSizeBytes) {
			context.addIssue({
				code: "custom",
				message: `Logo image must be ${AppMaxFileUploadSizeLabel} or smaller.`,
				path: ["logoImageUrl"],
			});
		}

		if (
			getDataUrlSizeInBytes(values.preparedBySignatureImageUrl) >
			AppMaxFileUploadSizeBytes
		) {
			context.addIssue({
				code: "custom",
				message: `Prepared by signature must be ${AppMaxFileUploadSizeLabel} or smaller.`,
				path: ["preparedBySignatureImageUrl"],
			});
		}

		if (
			getDataUrlSizeInBytes(values.approvedBySignatureImageUrl) >
			AppMaxFileUploadSizeBytes
		) {
			context.addIssue({
				code: "custom",
				message: `Approved by signature must be ${AppMaxFileUploadSizeLabel} or smaller.`,
				path: ["approvedBySignatureImageUrl"],
			});
		}
	});

export function validateSalesQuotationForm(
	values: SalesQuotationFormValues,
): SalesQuotationFormErrors {
	const result = SalesQuotationFormValidationSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<SalesQuotationFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof SalesQuotationFormErrors | undefined;

		if (field && !errors[field]) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}

function getDataUrlSizeInBytes(value: string) {
	const base64 = value.split(",")[1] ?? "";

	if (!base64) {
		return 0;
	}

	return Math.floor((base64.length * 3) / 4);
}
