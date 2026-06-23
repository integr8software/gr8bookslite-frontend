import type { TermManagement } from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";

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

export type ImportProgress = {
	imported: number;
	total: number;
};

export type TermImportMode = "all-valid" | "selected-valid";
