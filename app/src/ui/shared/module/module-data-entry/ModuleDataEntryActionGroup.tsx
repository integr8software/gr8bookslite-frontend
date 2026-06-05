"use client";

import { Download, Upload } from "lucide-react";
import {
	ModuleDataEntryAddButton,
	ModuleDataEntryAddColumnButton,
	ModuleDataEntryClearButton,
	ModuleDataEntryExportButton,
	ModuleDataEntryToolbarButton,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryActions";
import { ModuleDataEntryColumnSettingsButton } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryColumnSettings";
import type {
	ModuleDataEntryAddColumnOption,
	ModuleDataEntryClearAction,
	ModuleDataEntryColumnOption,
	ModuleDataEntryExportOption,
} from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function ModuleDataEntryActionGroup({
	addColumnOptions,
	align = "left",
	canConfigureColumns,
	canEditRows,
	columnOptions,
	exportOptions,
	isAddOpen,
	isClearOpen,
	onAddColumn,
	onAddOpenChange,
	onAddRows,
	onAutoColumnWidth,
	onClearOpenChange,
	onClearRows,
	onExport,
	onImport,
	onMoveColumn,
	onToggleColumnRequired,
	onToggleColumnVisibility,
	onUpdateColumnHeader,
	onUpdateColumnWidth,
}: {
	addColumnOptions: ModuleDataEntryAddColumnOption[];
	align?: "left" | "right";
	canConfigureColumns: boolean;
	canEditRows: boolean;
	columnOptions: ModuleDataEntryColumnOption[];
	exportOptions: ModuleDataEntryExportOption[];
	isAddOpen: boolean;
	isClearOpen: boolean;
	onAddColumn?: (columnId: string) => void;
	onAddOpenChange: (isOpen: boolean) => void;
	onAddRows: (count: number) => void;
	onAutoColumnWidth?: (columnId: string) => void;
	onClearOpenChange: (isOpen: boolean) => void;
	onClearRows?: (action: ModuleDataEntryClearAction) => void;
	onExport?: () => void;
	onImport?: () => void;
	onMoveColumn?: (fromColumnId: string, toColumnId: string) => void;
	onToggleColumnRequired?: (columnId: string, isRequired: boolean) => void;
	onToggleColumnVisibility?: (columnId: string, isVisible: boolean) => void;
	onUpdateColumnHeader?: (columnId: string, header: string) => void;
	onUpdateColumnWidth?: (columnId: string, width: number) => void;
}) {
	return (
		<div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
			{canEditRows && onImport ? (
				<ModuleDataEntryToolbarButton
					icon={Upload}
					label="Import"
					onClick={onImport}
				/>
			) : null}
			{exportOptions.length > 0 ? (
				<ModuleDataEntryExportButton align={align} options={exportOptions} />
			) : onExport ? (
				<ModuleDataEntryToolbarButton
					icon={Download}
					label="Export"
					onClick={onExport}
				/>
			) : null}
			{canConfigureColumns ? (
				<ModuleDataEntryColumnSettingsButton
					align={align}
					columns={columnOptions}
					onAutoColumnWidth={onAutoColumnWidth}
					onMoveColumn={onMoveColumn}
					onToggleColumnRequired={onToggleColumnRequired}
					onToggleColumnVisibility={onToggleColumnVisibility}
					onUpdateColumnHeader={onUpdateColumnHeader}
					onUpdateColumnWidth={onUpdateColumnWidth}
				/>
			) : canEditRows && onAddColumn && addColumnOptions.length > 0 ? (
				<ModuleDataEntryAddColumnButton
					align={align}
					options={addColumnOptions}
					onAddColumn={onAddColumn}
				/>
			) : null}
			{canEditRows && onClearRows ? (
				<ModuleDataEntryClearButton
					align={align}
					isOpen={isClearOpen}
					onClearRows={onClearRows}
					onOpenChange={onClearOpenChange}
				/>
			) : null}
			{canEditRows ? (
				<ModuleDataEntryAddButton
					align={align}
					isOpen={isAddOpen}
					onAddRows={onAddRows}
					onOpenChange={onAddOpenChange}
				/>
			) : null}
		</div>
	);
}
