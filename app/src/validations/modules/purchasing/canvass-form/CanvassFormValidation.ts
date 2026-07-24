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
	itemCode: requiredText("Enter an item code."),
	prNo: z.string(),
	quantity: z.coerce.number().min(0),
	responsibilityCenter: z.string(),
	selectedSupplier: z.string(),
	supplierCount: z.coerce.number().min(1).max(4),
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
	uom: requiredText("Select a UOM."),
	vatExclusive: z.string(),
	vatInclusive: z.string(),
});

const formSchema = z.object({
	currency: requiredText("Select a currency."),
	documentDate: requiredText("Select a document date."),
	exchangeRate: z.coerce.number().positive("Enter a valid exchange rate."),
	items: z.array(itemSchema).min(1, "Add at least one item."),
	purchaseType: z.string(),
	remarks: z.string(),
	requestedBy: requiredText("Enter requested by."),
	requiredBefore: z.string(),
	responsibilityCenter: z.string(),
	status: z.enum(["Draft", "Open", "Approved", "Closed", "Cancelled"]),
	termsOfPayment: z.string(),
	transNo: requiredText("Enter a transaction number."),
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
