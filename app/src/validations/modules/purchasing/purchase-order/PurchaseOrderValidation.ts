import { z } from "zod";
import type {
	PurchaseOrderFormErrors,
	PurchaseOrderFormValues,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";

const requiredText = (message: string) => z.string().trim().min(1, message);

const PurchaseOrderItemSchema = z.object({
	barcode: z.string(),
	brand: z.string(),
	budgetCode: z.string(),
	canvassNo: z.string(),
	color: z.string(),
	cost: z.coerce.number().min(0),
	discountAmount: z.coerce.number().min(0),
	ewt: z.string(),
	expiryDate: z.string(),
	freightCost: z.coerce.number().min(0),
	id: z.string(),
	itemCategory: z.string(),
	itemCode: requiredText("Enter an item code."),
	itemName: requiredText("Enter an item name."),
	linePrNo: z.string(),
	model: z.string(),
	prQuantity: z.coerce.number().min(0),
	quantity: z.coerce.number().min(0),
	rateDelivery: z.coerce.number().min(0),
	responsibilityCenter: z.string(),
	size: z.string(),
	uom: requiredText("Select a UOM."),
	vatAmount: z.coerce.number().min(0),
	vatInclusive: z.string(),
	vatType: z.string(),
	vatable: z.string(),
});

const AccountingEntrySchema = z.object({
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

const PurchaseOrderFormSchema = z.object({
	accountingEntries: z.array(AccountingEntrySchema),
	address: z.string(),
	contactNo: z.string(),
	currency: requiredText("Select a currency."),
	deliveryDate: z.string(),
	discountAmount: z.coerce.number().min(0),
	documentDate: requiredText("Select a document date."),
	emailAddress: z.string(),
	exchangeRate: z.coerce.number().positive("Enter a valid exchange rate."),
	importationNo: z.string(),
	items: z.array(PurchaseOrderItemSchema).min(1, "Add at least one entry."),
	partialPayment: z.boolean(),
	prNo: z.string(),
	projectName: z.string(),
	projectRef: z.string(),
	purchaseType: requiredText("Select a purchase type."),
	remarks: z.string(),
	status: z.enum(["Draft", "For Approval", "Posted", "Disapproved", "Cancelled"]),
	termsOfPayment: z.string(),
	transNo: requiredText("Enter a transaction number."),
	vatAmount: z.coerce.number().min(0),
	vceCode: z.string(),
	vceName: requiredText("Enter a Party name."),
});

export function validatePurchaseOrderForm(
	values: PurchaseOrderFormValues,
): PurchaseOrderFormErrors {
	const result = PurchaseOrderFormSchema.safeParse(values);

	if (result.success) return {};

	return result.error.issues.reduce<PurchaseOrderFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof PurchaseOrderFormErrors | undefined;

		if (field && !errors[field]) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}
