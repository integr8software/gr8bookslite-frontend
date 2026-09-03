export const ModuleImportSelectionColumnWidth = 44;
export const ModuleImportRowNumberColumnWidth = 52;
export const ModuleImportFixedColumnsWidth = ModuleImportSelectionColumnWidth + ModuleImportRowNumberColumnWidth;

export function getModuleImportDataColumnWidth(width: number, totalWidth: number) {
	const fraction = totalWidth > 0 ? width / totalWidth : 0;
	return `calc(${fraction * 100}% - ${fraction * ModuleImportFixedColumnsWidth}px)`;
}

export const ModuleImportDefaultWorksheetBorderColorArgb = "FFE5E7EB";
