import { z } from "zod";
import {
	AppMaxFileUploadSizeBytes,
	AppMaxFileUploadSizeLabel,
} from "@/app/src/constants/shared/app/AppConstants";
import type {
	PurchaseRequestFormErrors,
	PurchaseRequestFormValues,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const PurchaseRequestItemValidationSchema = z.object({
	barcode: requiredText("Enter a barcode."),
	cost: z.coerce.number().min(0),
	description: requiredText("Enter an item name."),
	expiryDate: z.string(),
	id: z.string(),
	itemCode: requiredText("Enter an item code."),
	lotNo: z.string(),
	quantity: z.coerce.number().positive("Enter a valid quantity."),
	responsibilityCenter: z.string(),
	uom: requiredText("Select a UOM."),
});

const accountingEntrySchema = z.object({
	accountCode: z.string(),
	accountTitle: z.string(),
	atcCode: z.string(),
	credit: z.coerce.number().min(0),
	debit: z.coerce.number().min(0),
	id: z.string(),
	partyCode: z.string(),
	partyName: z.string(),
	particulars: z.string(),
	refNo: z.string(),
	responsibilityCenter: z.string(),
	vatType: z.string(),
});

export const PurchaseRequestFormValidationSchema = z
	.object({
		approvedBy: z.string(),
		approvedByLabel: z.string(),
		accountingEntries: z.array(accountingEntrySchema),
		bomNo: z.string(),
		companyAddress: requiredText("Enter the company address."),
		companyName: requiredText("Enter the company name."),
		currency: requiredText("Select a currency."),
		exchangeRate: z.coerce
			.number()
			.finite()
			.positive("Enter a valid exchange rate."),
		forDepartment: z.string(),
		items: z.array(PurchaseRequestItemValidationSchema),
		logoFileName: z.string(),
		logoImageUrl: z.string(),
		prDate: requiredText("Select a PR date."),
		preparedBy: z.string(),
		preparedByLabel: z.string(),
		preparedBySignatureFileName: z.string(),
		preparedBySignatureImageUrl: z.string(),
		projectCode: z.string(),
		projectName: z.string(),
		purchaseType: requiredText("Select a purchase type."),
		remarks: z.string(),
		status: z.enum(["Draft", "For Approval", "Posted", "Disapproved", "Cancelled"]),
		telephoneNo: requiredText("Enter the telephone number."),
		transNo: requiredText("Enter a transaction number."),
		vatRegTin: requiredText("Enter the VAT Reg TIN."),
		vceCode: requiredText("Enter a VCE code."),
		vceName: requiredText("Enter a VCE name."),
		vendorAddress: z.string(),
		approvedBySignatureFileName: z.string(),
		approvedBySignatureImageUrl: z.string(),
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

function getDataUrlSizeInBytes(value: string) {
	const base64 = value.split(",")[1] ?? "";

	if (!base64) {
		return 0;
	}

	return Math.floor((base64.length * 3) / 4);
}
