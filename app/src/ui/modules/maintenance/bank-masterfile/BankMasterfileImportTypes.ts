import type { BankMasterfileFormValues } from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";

export type BankImportColumnId = keyof BankMasterfileFormValues;
export type BankImportCellErrors = Partial<
	Record<BankImportColumnId, string[]>
>;

export type BankImportPreviewRow = {
	cellErrors: BankImportCellErrors;
	id: string;
	rowErrors: string[];
	rowNumber: number;
	values: BankMasterfileFormValues;
};

export type ImportProgress = {
	imported: number;
	total: number;
};

export type ImportMode = "all-valid" | "selected-valid";
