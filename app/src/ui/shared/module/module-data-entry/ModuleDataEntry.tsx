"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ModuleDataEntryActionGroup } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryActionGroup";
import { ModuleDataEntryError } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryError";
import { ModuleDataEntryFooter } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryFooter";
import { ModuleDataEntryHeader } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryHeader";
import { ModuleDataEntryTable } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTable";
import { formatEntryCountLabel } from "@/app/src/ui/shared/module/module-data-entry/utils";
import type { ModuleDataEntryProps } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export type {
	ModuleDataEntryAddColumnOption,
	ModuleDataEntryCellContext,
	ModuleDataEntryCellTarget,
	ModuleDataEntryClearAction,
	ModuleDataEntryColumn,
	ModuleDataEntryColumnOption,
	ModuleDataEntryExportOption,
} from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function ModuleDataEntry<TRow extends { id: string }>({
	addColumnOptions = [],
	columnOptions = [],
	columns,
	description,
	emptyRowLabel = "line",
	error,
	exportOptions = [],
	footerDetails,
	summaryCells,
	summaryRowHeader,
	toolbarActions = [],
	isDraggable = false,
	isReadonly,
	isRowNumberColumnFixed = false,
	rows,
	title,
	onAddColumn,
	onAddRows,
	onAutoColumnWidth,
	onClearCell,
	onClearRows,
	onClearRow,
	onDuplicateRow,
	onExport,
	onFitColumnWidth,
	getCellValue,
	onImport,
	onInsertRow,
	onMoveColumn,
	onMoveRow,
	onRemoveColumn,
	onRemoveRow,
	onPasteCells,
	onToggleColumnRequired,
	onToggleColumnVisibility,
	onUpdateColumnHeader,
	onUpdateColumnWidth,
}: ModuleDataEntryProps<TRow>) {
	const [openAddMenu, setOpenAddMenu] = useState<"footer" | "header" | null>(
		null,
	);
	const [openClearMenu, setOpenClearMenu] = useState<
		"footer" | "header" | null
	>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const shouldScrollToBottomAfterAddRef = useRef(false);
	const canEditRows = !isReadonly;
	const canConfigureColumns =
		canEditRows &&
		columnOptions.length > 0 &&
		Boolean(
			onMoveColumn ||
				onToggleColumnRequired ||
				onToggleColumnVisibility ||
				onUpdateColumnHeader ||
				onUpdateColumnWidth ||
				onAutoColumnWidth,
		);
	const hasHeaderActions = canEditRows || Boolean(onExport);
	const hasExportActions = Boolean(onExport) || exportOptions.length > 0;
	const shouldShowActions = hasHeaderActions || hasExportActions;
	const entryCountLabel = formatEntryCountLabel(rows.length, emptyRowLabel);

	function isNearScrollBottom() {
		const scrollContainer = scrollContainerRef.current;

		if (!scrollContainer) {
			return false;
		}

		const bottomDistance =
			scrollContainer.scrollHeight -
			scrollContainer.scrollTop -
			scrollContainer.clientHeight;

		return bottomDistance <= 64;
	}

	function handleAddRows(count: number) {
		shouldScrollToBottomAfterAddRef.current = isNearScrollBottom();
		onAddRows(count);
	}

	function renderActions(placement: "footer" | "header") {
		if (!shouldShowActions) {
			return undefined;
		}

		return (
			<ModuleDataEntryActionGroup
				addColumnOptions={addColumnOptions}
				align={placement === "footer" ? "right" : "left"}
				canConfigureColumns={canConfigureColumns}
				canEditRows={canEditRows}
				columnOptions={columnOptions}
				exportOptions={exportOptions}
				toolbarActions={toolbarActions}
				isAddOpen={openAddMenu === placement}
				isClearOpen={openClearMenu === placement}
				onAddColumn={onAddColumn}
				onAddRows={handleAddRows}
				onAutoColumnWidth={onAutoColumnWidth}
				onClearRows={onClearRows}
				onExport={onExport}
				onImport={onImport}
				onMoveColumn={onMoveColumn}
				onToggleColumnRequired={onToggleColumnRequired}
				onToggleColumnVisibility={onToggleColumnVisibility}
				onUpdateColumnHeader={onUpdateColumnHeader}
				onUpdateColumnWidth={onUpdateColumnWidth}
				onAddOpenChange={(isOpen) => {
					setOpenAddMenu(isOpen ? placement : null);
					if (isOpen) {
						setOpenClearMenu(null);
					}
				}}
				onClearOpenChange={(isOpen) => {
					setOpenClearMenu(isOpen ? placement : null);
					if (isOpen) {
						setOpenAddMenu(null);
					}
				}}
			/>
		);
	}

	useLayoutEffect(() => {
		if (!shouldScrollToBottomAfterAddRef.current) {
			return;
		}

		const scrollContainer = scrollContainerRef.current;

		if (!scrollContainer) {
			shouldScrollToBottomAfterAddRef.current = false;
			return;
		}

		scrollContainer.scrollTop = scrollContainer.scrollHeight;
		shouldScrollToBottomAfterAddRef.current = false;
	}, [rows.length]);

	return (
		<section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<ModuleDataEntryHeader
				actions={renderActions("header")}
				description={description}
				entryCountLabel={entryCountLabel}
				title={title}
			/>
			<ModuleDataEntryTable
				columns={columns}
				emptyRowLabel={emptyRowLabel}
				getCellValue={getCellValue}
				isDraggable={isDraggable}
				isReadonly={isReadonly}
				isRowNumberColumnFixed={isRowNumberColumnFixed}
				rows={rows}
				scrollContainerRef={scrollContainerRef}
				summaryCells={summaryCells}
				summaryRowHeader={summaryRowHeader}
				onAddRows={handleAddRows}
				onAutoColumnWidth={onAutoColumnWidth}
				onClearCell={onClearCell}
				onClearRow={onClearRow}
				onDuplicateRow={onDuplicateRow}
				onFitColumnWidth={onFitColumnWidth}
				onInsertRow={onInsertRow}
				onMoveColumn={onMoveColumn}
				onMoveRow={onMoveRow}
				onPasteCells={onPasteCells}
				onRemoveColumn={onRemoveColumn}
				onRemoveRow={onRemoveRow}
				onUpdateColumnHeader={onUpdateColumnHeader}
				onUpdateColumnWidth={onUpdateColumnWidth}
			/>
			<ModuleDataEntryFooter
				actions={renderActions("footer")}
				details={footerDetails}
				entryCountLabel={entryCountLabel}
			/>
			{error ? <ModuleDataEntryError error={error} /> : null}
		</section>
	);
}
