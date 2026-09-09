import { z } from "zod";
import type {
	CanvassFormErrors,
	CanvassFormValues,
} from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";

const requiredText = (message: string) => z.string().trim().min(1, message);

const itemSchema = z.object({
	barcode: z.string(),
	description: requiredText("Enter a description."),
	id: z.string(),
	itemCode: z.string(),
	minimumOrderQuantity: z.coerce.number().min(0),
	prNo: z.string(),
	quantity: z.coerce.number().min(0),
	responsibilityCenter: z.string(),
	selectedSupplier: z.string(),
	supplierCount: z.coerce.number().min(1).max(4),
	supplierQuotationNo1: z.string(),
	supplierQuotationNo2: z.string(),
	supplierQuotationNo3: z.string(),
	supplierQuotationNo4: z.string(),
	supplierCode1: z.string(),
	supplierCode2: z.string(),
	supplierCode3: z.string(),
	supplierCode4: z.string(),
	supplierName1: z.string(),
	supplierName2: z.string(),
	supplierName3: z.string(),
	supplierName4: z.string(),
	totalCost: z.coerce.number().min(0),
	unitCost1: z.coerce.number().min(0),
	unitCost2: z.coerce.number().min(0),
	unitCost3: z.coerce.number().min(0),
	unitCost4: z.coerce.number().min(0),
	uom: z.string(),
	vatable1: z.string(),
	vatable2: z.string(),
	vatable3: z.string(),
	vatable4: z.string(),
	vatExclusive: z.string(),
	vatExclusive1: z.string(),
	vatExclusive2: z.string(),
	vatExclusive3: z.string(),
	vatExclusive4: z.string(),
	vatInclusive: z.string(),
	vatInclusive1: z.string(),
	vatInclusive2: z.string(),
	vatInclusive3: z.string(),
	vatInclusive4: z.string(),
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

const formSchema = z.object({
	accountingEntries: z.array(accountingEntrySchema),
	currency: requiredText("Select a currency."),
	documentDate: requiredText("Select a document date."),
	exchangeRate: z.coerce.number().positive("Enter a valid exchange rate."),
	items: z.array(itemSchema).min(1, "Add at least one item."),
	prNo: z.string(),
	poNo: z.string(),
	projectCode: z.string(),
	projectName: z.string(),
	purchaseType: z.string(),
	remarks: z.string(),
	requestedBy: requiredText("Enter requested by."),
	requiredBefore: z.string(),
	responsibilityCenter: z.string(),
	status: z.enum(["Draft", "For Approval", "Posted", "Disapproved", "Cancelled"]),
	termsOfPayment: z.string(),
	transNo: requiredText("Enter a transaction number."),
}).superRefine((values, context) => {
	if (!["goods", "assets"].includes(values.purchaseType.toLowerCase())) return;

	values.items.forEach((item, index) => {
		if (!item.itemCode.trim()) {
			context.addIssue({
				code: "custom",
				message: "Enter an item code.",
				path: ["items", index, "itemCode"],
			});
		}

		if (!item.uom.trim()) {
			context.addIssue({
				code: "custom",
				message: "Select a UOM.",
				path: ["items", index, "uom"],
			});
		}
	});
});

export function validateCanvassForm(values: CanvassFormValues): CanvassFormErrors {
	const result = formSchema.safeParse(values);
	if (result.success) return {};

	return result.error.issues.reduce<CanvassFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof CanvassFormErrors | undefined;
		if (field && !errors[field]) errors[field] = issue.message;
		return errors;
	}, {});
}
