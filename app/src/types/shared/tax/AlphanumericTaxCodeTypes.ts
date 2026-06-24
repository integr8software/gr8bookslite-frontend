export type AlphanumericTaxCode = {
	id: string;
	sourceKey: string;
	transactionType: string;
	taxType: string;
	taxCode: string;
	taxDescription: string;
	taxRate: string;
	taxAlias: string | null;
	atc: string | null;
	officialAtcCode: string | null;
	natureOfIncome: string | null;
};

export type AlphanumericTaxCodeListQuery = {
	limit?: number;
	officialAtcCode?: string;
	query?: string;
	taxCode?: string;
	taxType?: string;
	transactionType?: string;
};
