import { useCallback, useMemo } from "react";
import {
	calculateGoodsIssueTotals,
	createBlankGoodsIssueLineEntry,
	formatGoodsIssueAmount,
	goodsIssueEntryHasData,
	goodsIssueEntryIsComplete,
} from "@/app/src/data/modules/inventory/goods-issue/GoodsIssueData";
import type { GoodsIssueLineEntry } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { createGoodsIssueLineColumns } from "@/app/src/ui/modules/inventory/goods-issue/entries/GoodsIssueLineColumns";

type GoodsIssueEntrySectionProps = {
	isReadonly: boolean;
	rows: GoodsIssueLineEntry[];
	onRowsChange: (rows: GoodsIssueLineEntry[]) => void;
};

export function GoodsIssueEntrySection({
	isReadonly,
	onRowsChange,
	rows,
}: GoodsIssueEntrySectionProps) {
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<GoodsIssueLineEntry>) => {
			onRowsChange(
				rows.map((row) =>
					row.id === rowId ? recalculateEntry({ ...row, ...updates }) : row,
				),
			);
		},
		[onRowsChange, rows],
	);
	const totals = useMemo(() => calculateGoodsIssueTotals(rows), [rows]);
	const columns = useMemo<ModuleDataEntryColumn<GoodsIssueLineEntry>[]>(
		() => createGoodsIssueLineColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !["itemCode", "description", "issueQuantity"].includes(
					column.id,
				),
				isVisible: true,
				label: column.header,
				width: column.width,
				widthMode: column.widthMode,
			})),
		[columns],
	);

	function addRows(count: number) {
		onRowsChange([
			...rows,
			...Array.from({ length: count }, () => createBlankGoodsIssueLineEntry()),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			onRowsChange([createBlankGoodsIssueLineEntry()]);
			return;
		}

		const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
		onRowsChange(
			nextRows.length > 0 ? nextRows : [createBlankGoodsIssueLineEntry()],
		);
	}

	function duplicateRow(rowId: string) {
		const rowIndex = rows.findIndex((row) => row.id === rowId);
		const row = rows[rowIndex];

		if (!row) return;

		const nextRows = [...rows];
		nextRows.splice(rowIndex + 1, 0, {
			...row,
			id: createBlankGoodsIssueLineEntry().id,
		});
		onRowsChange(nextRows);
	}

	function insertRow(rowId: string, position: "above" | "below") {
		const rowIndex = rows.findIndex((row) => row.id === rowId);

		if (rowIndex < 0) return;

		const nextRows = [...rows];
		nextRows.splice(
			position === "above" ? rowIndex : rowIndex + 1,
			0,
			createBlankGoodsIssueLineEntry(),
		);
		onRowsChange(nextRows);
	}

	function moveRow(fromRowId: string, toRowId: string) {
		const fromIndex = rows.findIndex((row) => row.id === fromRowId);
		const toIndex = rows.findIndex((row) => row.id === toRowId);

		if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

		const nextRows = [...rows];
		const [movedRow] = nextRows.splice(fromIndex, 1);

		if (!movedRow) return;

		nextRows.splice(toIndex, 0, movedRow);
		onRowsChange(nextRows);
	}

	function removeRow(rowId: string) {
		const nextRows = rows.filter((row) => row.id !== rowId);
		onRowsChange(
			nextRows.length > 0 ? nextRows : [createBlankGoodsIssueLineEntry()],
		);
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="goods issue line"
			exportOptions={[
				{ id: "csv", label: "CSV", onSelect: () => undefined },
				{ id: "excel", label: "Excel", onSelect: () => undefined },
				{ id: "pdf", label: "PDF", onSelect: () => undefined },
			]}
			footerDetails={
				<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
					<span>Issue Qty: {formatGoodsIssueAmount(totals.issueQuantity)}</span>
					<span>Amount: {formatGoodsIssueAmount(totals.amount)}</span>
				</div>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={{
				amount: formatGoodsIssueAmount(totals.amount),
				issueQuantity: formatGoodsIssueAmount(totals.issueQuantity),
			}}
			title="Goods Issue Details"
			onAddRows={addRows}
			onAutoColumnWidth={() => undefined}
			onClearRows={clearRows}
			onDuplicateRow={duplicateRow}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={insertRow}
			onMoveRow={moveRow}
			onRemoveRow={removeRow}
			onToggleColumnVisibility={() => undefined}
			onUpdateColumnHeader={() => undefined}
			onUpdateColumnWidth={() => undefined}
		/>
	);
}

function recalculateEntry(entry: GoodsIssueLineEntry): GoodsIssueLineEntry {
	const issueQuantity = parseMoneyNumberInput(entry.issueQuantity);
	const unitCost = parseMoneyNumberInput(entry.unitCost);

	return {
		...entry,
		amount:
			issueQuantity > 0 && unitCost > 0
				? (issueQuantity * unitCost).toFixed(2)
				: entry.amount,
	};
}

function shouldClearEntry(
	entry: GoodsIssueLineEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return goodsIssueEntryHasData(entry);
	}

	if (action === "incomplete") {
		return goodsIssueEntryHasData(entry) && !goodsIssueEntryIsComplete(entry);
	}

	return !goodsIssueEntryHasData(entry);
}
