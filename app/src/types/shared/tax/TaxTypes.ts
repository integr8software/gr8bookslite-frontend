export type Tax = {
	id: string;
	sourceKey: string;
	transactionType: string;
	taxType: string;
	taxCode: string;
	taxDescription: string;
	taxExempt: boolean;
	taxRate: string;
	taxAlias: string | null;
	atc: string | null;
	officialAtcCode: string | null;
	natureOfIncome: string | null;
	sortOrder: number;
	status?: "ACTIVE" | "INACTIVE";
};

export type TaxListQuery = {
	limit?: number;
	officialAtcCode?: string;
	query?: string;
	status?: "ACTIVE" | "INACTIVE" | "ALL";
	taxCode?: string;
	taxExempt?: boolean;
	taxType?: string;
	transactionType?: string;
};

export type PartyTaxDefaultClassificationKey =
	| "defaultPurchaseInputVatTaxSourceKey"
	| "defaultPurchaseEwtTaxSourceKey"
	| "defaultPurchaseFwtTaxSourceKey"
	| "defaultPurchaseWvatTaxSourceKey"
	| "defaultSalesOutputVatTaxSourceKey"
	| "defaultSalesCwtTaxSourceKey"
	| "defaultSalesWvatTaxSourceKey";

export type TaxDefaultClassification<TKey extends string = string> = {
	key: TKey;
	label: string;
	officialAtcCodePrefix?: string;
	taxTypes: string[];
	transactionType: string;
};

export type PartyTaxDefaultClassification =
	TaxDefaultClassification<PartyTaxDefaultClassificationKey>;

export type TaxDefaultOption = {
	code: string;
	description: string;
	disabled?: boolean;
	label: string;
	name: string;
	selectedDetails: string;
	value: string;
};

export type PartyTaxDefaultOption = TaxDefaultOption;

export type PartyTaxDefaultOptions = Record<
	PartyTaxDefaultClassificationKey,
	PartyTaxDefaultOption[]
>;
