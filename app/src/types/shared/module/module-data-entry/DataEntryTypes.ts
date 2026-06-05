import type { ReactNode } from "react";

export type ModuleDataEntryColumn<TRow> = {
	header: string;
	id: string;
	isRemovable?: boolean;
	width?: number;
	widthClassName: string;
	widthMode?: "auto" | "fixed";
	renderCell: (
		row: TRow,
		index: number,
		context: ModuleDataEntryCellContext,
	) => ReactNode;
};

export type ModuleDataEntryCellContext = {
	focusableTabIndex: number;
};

export type ModuleDataEntryColumnOption = {
	id: string;
	isHideable?: boolean;
	isRequired?: boolean;
	isRequirementConfigurable?: boolean;
	isVisible: boolean;
	label: string;
	width?: number;
	widthMode?: "auto" | "fixed";
};

export type ModuleDataEntryAddColumnOption = {
	id: string;
	label: string;
};

export type ModuleDataEntryExportOption = {
	id: string;
	label: string;
	onSelect: () => void;
};

export type ModuleDataEntryClearAction =
	| "all"
	| "with-data"
	| "incomplete"
	| "no-data";

export type ModuleDataEntryCellTarget = {
	columnId: string;
	columnIndex: number;
	rowId: string;
	rowIndex: number;
};

export type ModuleDataEntrySelection =
	| { type: "all" }
	| { type: "cell"; columnId: string; rowId: string }
	| { type: "column"; columnId: string }
	| { type: "row"; rowId: string };

export type ModuleDataEntryProps<TRow extends { id: string }> = {
	columns: ModuleDataEntryColumn<TRow>[];
	description: string;
	emptyRowLabel?: string;
	error?: string;
	exportOptions?: ModuleDataEntryExportOption[];
	isDraggable?: boolean;
	isReadonly: boolean;
	isRowNumberColumnFixed?: boolean;
	rows: TRow[];
	title: string;
	addColumnOptions?: ModuleDataEntryAddColumnOption[];
	columnOptions?: ModuleDataEntryColumnOption[];
	getCellValue?: (row: TRow, columnId: string) => string;
	onAddColumn?: (columnId: string) => void;
	onAddRows: (count: number) => void;
	onAutoColumnWidth?: (columnId: string) => void;
	onClearCell?: (rowId: string, columnId: string) => void;
	onClearRows?: (action: ModuleDataEntryClearAction) => void;
	onClearRow?: (rowId: string) => void;
	onDuplicateRow: (rowId: string) => void;
	onExport?: () => void;
	onFitColumnWidth?: (columnId: string) => void;
	onImport?: () => void;
	onInsertRow: (rowId: string, position: "above" | "below") => void;
	onMoveColumn?: (fromColumnId: string, toColumnId: string) => void;
	onMoveRow: (fromRowId: string, toRowId: string) => void;
	onRemoveColumn?: (columnId: string) => void;
	onRemoveRow: (rowId: string) => void;
	onPasteCells?: (
		target: ModuleDataEntryCellTarget,
		rows: string[][],
	) => void;
	onToggleColumnRequired?: (columnId: string, isRequired: boolean) => void;
	onToggleColumnVisibility?: (columnId: string, isVisible: boolean) => void;
	onUpdateColumnHeader?: (columnId: string, header: string) => void;
	onUpdateColumnWidth?: (columnId: string, width: number) => void;
};

export type ModuleDataEntryAddButtonProps = {
	align?: "left" | "right";
	isOpen: boolean;
	label?: string;
	onAddRows: (count: number) => void;
	onOpenChange: (isOpen: boolean) => void;
};

export type ModuleDataEntryClearButtonProps = {
	align?: "left" | "right";
	isOpen: boolean;
	onClearRows: (action: ModuleDataEntryClearAction) => void;
	onOpenChange: (isOpen: boolean) => void;
};

export type ModuleDataEntryAddColumnButtonProps = {
	align?: "left" | "right";
	options: ModuleDataEntryAddColumnOption[];
	onAddColumn: (columnId: string) => void;
};

export type ModuleDataEntryColumnSettingsButtonProps = {
	align?: "left" | "right";
	columns: ModuleDataEntryColumnOption[];
	onMoveColumn?: (fromColumnId: string, toColumnId: string) => void;
	onAutoColumnWidth?: (columnId: string) => void;
	onToggleColumnRequired?: (columnId: string, isRequired: boolean) => void;
	onToggleColumnVisibility?: (columnId: string, isVisible: boolean) => void;
	onUpdateColumnHeader?: (columnId: string, header: string) => void;
	onUpdateColumnWidth?: (columnId: string, width: number) => void;
};

export type ModuleDataEntryExportButtonProps = {
	align?: "left" | "right";
	options: ModuleDataEntryExportOption[];
};
