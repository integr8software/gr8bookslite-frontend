export type TermManagementDatemode = "Day" | "Month" | "Year";

export type TermManagementStatus = "Active" | "Inactive";

export type TermManagement = {
	id: string;
	name: string;
	description: string;
	datemode: TermManagementDatemode;
	period: string;
	status: TermManagementStatus;
	createdBy?: string;
	createdAt?: string;
	updatedBy?: string | null;
	updatedAt?: string;
};

export type TermManagementFormValues = {
	name: string;
	description: string;
	datemode: TermManagementDatemode;
	period: string;
	status: TermManagementStatus;
};

export type TermManagementFormErrors = Partial<
	Record<keyof TermManagementFormValues, string>
>;

export type TermManagementActionMode = "add" | "edit" | "view";

export type TermManagementDrawerState =
	| {
			initialValues?: TermManagementFormValues;
			mode: TermManagementActionMode;
			term?: TermManagement;
	  }
	| null;

export type TermManagementTableColumnKey =
	| "name"
	| "description"
	| "datemode"
	| "period"
	| "status"
	| "createdBy"
	| "createdAt"
	| "updatedBy"
	| "updatedAt";

export type TermImportColumnId = "name" | "datemode" | "period";

export type TermImportCellErrors = Partial<
	Record<TermImportColumnId, string[]>
>;

export type TermImportCellWarnings = Partial<
	Record<TermImportColumnId, string[]>
>;

export type TermImportPreviewRow = {
	cellErrors: TermImportCellErrors;
	cellWarnings: TermImportCellWarnings;
	id: string;
	rowErrors: string[];
	rowNumber: number;
	term: Omit<TermManagement, "id">;
};

export type TermImportProgress = {
	imported: number;
	total: number;
};

export type TermImportMode = "all-rows" | "all-valid" | "selected-valid";

export type ImportProgress = TermImportProgress;
