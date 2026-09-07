import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";

export const ModuleImportSelectionColumnWidth = 44;
export const ModuleImportRowNumberColumnWidth = 52;
export const ModuleImportFixedColumnsWidth = ModuleImportSelectionColumnWidth + ModuleImportRowNumberColumnWidth;

export function getModuleImportDataColumnWidth(width: number, totalWidth: number) {
	const fraction = totalWidth > 0 ? width / totalWidth : 0;
	return `calc(${fraction * 100}% - ${fraction * ModuleImportFixedColumnsWidth}px)`;
}

export const ModuleImportDefaultWorksheetBorderColorArgb = "FFE5E7EB";

export const ModuleImportDefaultPreviewPageSize = 20;
export const ModuleImportDefaultBatchSize = 25;
export const ModuleImportDefaultMinFileSizeBytes = 1;
export const ModuleImportDefaultMaxFileSizeBytes = AppMaxFileUploadSizeBytes;
export const ModuleImportDefaultPreviewGridLabel = "Import preview grid. Paste copied Excel rows here.";
export const ModuleImportDefaultPreviewEmptyMessage = "Upload a file, or focus here and paste copied Excel rows.";
export const ModuleImportDefaultAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";
export const ModuleImportDefaultAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";
