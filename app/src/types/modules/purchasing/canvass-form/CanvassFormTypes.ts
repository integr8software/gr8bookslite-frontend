import type { PurchasingAccountingEntry } from "@/app/src/types/modules/purchasing/PurchasingAccountingTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";

export type CanvassFormFieldUpdater<TValues> = <Key extends keyof TValues>(
	key: Key,
	value: TValues[Key],
) => void;

export type CanvassFormStatus =
	| "Draft"
	| "For Approval"
	| "Posted"
	| "Disapproved"
	| "Cancelled";

export type CanvassFormItem = {
	id: string;
	prNo: string;
	itemCode: string;
	barcode: string;
	description: string;
	uom: string;
	quantity: number;
	minimumOrderQuantity: number;
	responsibilityCenter: string;
	supplierCount: number;
	vatExclusive: string;
	vatInclusive: string;
	vatExclusive1: string;
	vatInclusive1: string;
	supplierCode1: string;
	supplierName1: string;
	unitCost1: number;
	vatExclusive2: string;
	vatInclusive2: string;
	supplierCode2: string;
	supplierName2: string;
	unitCost2: number;
	vatExclusive3: string;
	vatInclusive3: string;
	supplierCode3: string;
	supplierName3: string;
	unitCost3: number;
	vatExclusive4: string;
	vatInclusive4: string;
	supplierCode4: string;
	supplierName4: string;
	unitCost4: number;
	selectedSupplier: string;
	totalCost: number;
};

export type CanvassFormRecord = {
	id: string;
	currency: string;
	exchangeRate: number;
	prNo: string;
	purchaseType: string;
	requestedBy: string;
	responsibilityCenter: string;
	requiredBefore: string;
	remarks: string;
	termsOfPayment: string;
	transNo: string;
	documentDate: string;
	status: CanvassFormStatus;
	accountingEntries: CanvassFormAccountingEntry[];
	items: CanvassFormItem[];
};

export type CanvassFormValues = Omit<CanvassFormRecord, "id">;
export type CanvassFormAccountingEntry = PurchasingAccountingEntry;
export type CanvassFormMode = "add" | "edit" | "view";
export type CanvassFormErrors = Partial<
	Record<keyof Omit<CanvassFormValues, "items"> | "items", string>
>;

export type CanvassFormFormHeaderProps = {
	copyFromRecords: AppCopyFromRecord[];
	isSubmitting?: boolean;
	mode: CanvassFormMode;
	recordId?: string;
	values: CanvassFormValues;
	onCopyFromPurchaseRequest: (recordIds: string[]) => void;
	onPreview: () => void;
	onSubmit: () => void;
};
