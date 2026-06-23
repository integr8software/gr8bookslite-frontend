import type { TermImportColumnId } from "@/app/src/ui/modules/maintenance/term-management/TermManagementImportTypes";

export const TemplateHeaders = ["Name", "Datemode", "Period"];
export const DefaultColumnIndexes: Record<TermImportColumnId, number> = {
	name: 0,
	datemode: 1,
	period: 2,
};
export const ImportFieldOrder: TermImportColumnId[] = [
	"name",
	"datemode",
	"period",
];
export const PreviewPageSize = 10;
export const ImportBatchSize = 25;
export const MinImportFileSizeBytes = 1;
export const MaxImportFileSizeBytes = 2 * 1024 * 1024;
