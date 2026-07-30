export type CanvassFormStatus = "Draft" | "Open" | "Approved" | "Closed" | "Cancelled";

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
	supplierCode1: string;
	supplierName1: string;
	unitCost1: number;
	supplierCode2: string;
	supplierName2: string;
	unitCost2: number;
	supplierCode3: string;
	supplierName3: string;
	unitCost3: number;
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
	items: CanvassFormItem[];
};

export type CanvassFormValues = Omit<CanvassFormRecord, "id">;
export type CanvassFormMode = "add" | "edit" | "view";
export type CanvassFormErrors = Partial<
	Record<keyof Omit<CanvassFormValues, "items"> | "items", string>
>;
