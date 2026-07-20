"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
	ImportBatchSize,
	ImportFieldOrder,
	PreviewPageSize,
	TemplateHeaders,
} from "@/app/src/constants/modules/maintenance/bank-masterfile/BankMasterfileConstants";
import {
	cleanBankValues,
	createBlankRow,
	getNextRowNumber,
	getPreviewRowContentKey,
	normalizeCellValue,
	parseBankImportRows,
	parseTabularText,
	readBankImportFile,
	renumberRows,
	validateImportFileSize,
	waitForNextBatch,
} from "@/app/src/data/modules/maintenance/bank-masterfile/BankMasterfileData";
import type {
	BankImportColumnId,
	BankImportMode,
	BankImportPreviewRow,
	ImportProgress,
	BankMasterfileImportDialogProps,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import {
	isBlankBankImportRow,
	rowHasBankImportErrors,
	validateBankImportRows,
} from "@/app/src/validations/modules/maintenance/bank-masterfile/BankMasterfileValidation";
import { clampImportColumnWidth } from "@/app/src/ui/shared/module/ModuleImportResizableColumnHeader";
import { reorderModuleImportRows } from "@/app/src/utils/module-import.util";

export function useBankMasterfileImportDialog({
	existingBanks,
	onClose,
	onImportBanks,
}: Pick<
	BankMasterfileImportDialogProps,
	"existingBanks" | "onClose" | "onImportBanks"
>) {
	const [importError, setImportError] = useState<string | null>(null);
	const [isParsing, setIsParsing] = useState(false);
	const [previewRows, setPreviewRows] = useState<BankImportPreviewRow[]>([]);
	const [previewPage, setPreviewPage] = useState(1);
	const [progress, setProgress] = useState<ImportProgress | null>(null);
	const [pristineManualRowIds, setPristineManualRowIds] = useState<Set<string>>(
		() => new Set(),
	);
	const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
	const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
	const [columnWidths, setColumnWidths] = useState(() =>
		TemplateHeaders.map(() => 160),
	);
	const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(
		() => new Set(),
	);
	const [importMode, setImportMode] = useState<BankImportMode>("all-rows");
	const validatedRows = useMemo(
		() => validateBankImportRows(previewRows, existingBanks),
		[existingBanks, previewRows],
	);
	const displayedRows = useMemo(
		() =>
			validatedRows.map((row) =>
				pristineManualRowIds.has(row.id)
					? { ...row, cellErrors: {}, rowErrors: [] }
					: row,
			),
		[pristineManualRowIds, validatedRows],
	);
	const invalidRows = displayedRows.filter(rowHasBankImportErrors);
	const nonBlankRows = validatedRows.filter((row) => !isBlankBankImportRow(row));
	const actualInvalidRows = nonBlankRows.filter(rowHasBankImportErrors);
	const validRows = nonBlankRows.filter((row) => !rowHasBankImportErrors(row));
	const validSelectedRows = validRows.filter((row) =>
		selectedRowIds.has(row.id),
	);
	const importableRows =
		importMode === "selected-valid"
			? validSelectedRows
			: importMode === "all-valid"
				? validRows
				: nonBlankRows;
	const totalPages = Math.max(
		1,
		Math.ceil(displayedRows.length / PreviewPageSize),
	);
	const safePreviewPage = Math.min(previewPage, totalPages);
	const visibleRows = displayedRows.slice(
		(safePreviewPage - 1) * PreviewPageSize,
		safePreviewPage * PreviewPageSize,
	);
	const isBusy = Boolean(progress) || isParsing;
	const canImport = importableRows.length > 0 && !isBusy;
	const canImportAllRows = validatedRows.length > 0 && !isBusy;
	const canImportAllValid = validRows.length > 0 && !isBusy;
	const canImportSelectedValid = validSelectedRows.length > 0 && !isBusy;
	const importTableWidth =
		64 + columnWidths.reduce((total, width) => total + width, 0);

	function updateColumnWidth(index: number, width: number) {
		setColumnWidths((current) =>
			current.map((currentWidth, currentIndex) =>
				currentIndex === index ? clampImportColumnWidth(width) : currentWidth,
			),
		);
	}

	function resetImportState() {
		if (progress) return;

		setImportError(null);
		setPreviewRows([]);
		setPreviewPage(1);
		setPristineManualRowIds(new Set());
		setSelectedRowIds(new Set());
		setImportMode("all-rows");
		setIsSelectionMenuOpen(false);
		setIsImportMenuOpen(false);
	}

	function appendRows(rows: BankImportPreviewRow[]) {
		const existingKeys = new Set(previewRows.map(getPreviewRowContentKey));
		const uniqueRows = rows.filter((row) => {
			const key = getPreviewRowContentKey(row);

			if (existingKeys.has(key)) return false;
			existingKeys.add(key);
			return true;
		});
		const nextRows = renumberRows([...previewRows, ...uniqueRows]);

		setPreviewRows(nextRows);
		setPristineManualRowIds((current) => {
			const next = new Set(current);

			uniqueRows.forEach((row) => next.delete(row.id));

			return next;
		});
		setSelectedRowIds(new Set());
		setPreviewPage(Math.max(1, Math.ceil(nextRows.length / PreviewPageSize)));
		setImportError(null);

		if (rows.length > uniqueRows.length) {
			toast.success(
				`${rows.length - uniqueRows.length} duplicate ${rows.length - uniqueRows.length === 1 ? "row was" : "rows were"} skipped.`,
			);
		}
	}

	async function handleFileUpload(file?: File) {
		if (!file || progress) return;

		const sizeError = validateImportFileSize(file);

		if (sizeError) {
			setImportError(sizeError);
			return;
		}

		setIsParsing(true);
		setImportError(null);

		try {
			const tabularRows = await readBankImportFile(file);
			const parsedRows = parseBankImportRows(
				tabularRows,
				getNextRowNumber(previewRows),
			);

			if (parsedRows.length === 0) {
				throw new Error("No bank account rows were found in the file.");
			}

			appendRows(parsedRows);
		} catch (error) {
			setImportError(
				error instanceof Error
					? error.message
					: "The selected file could not be read.",
			);
		} finally {
			setIsParsing(false);
		}
	}

	function pasteRows(text: string) {
		const rows = parseBankImportRows(
			parseTabularText(text),
			getNextRowNumber(previewRows),
		);

		if (rows.length > 0) appendRows(rows);
	}

	function pasteIntoPreviewCell(
		rowId: string,
		field: BankImportColumnId,
		text: string,
	) {
		const pastedRows = parseTabularText(text).filter((row) =>
			row.some((cell) => cell.trim() !== ""),
		);

		if (pastedRows.length === 0) {
			return;
		}

		const startColumnIndex = ImportFieldOrder.indexOf(field);
		const isSingleCellPaste =
			pastedRows.length === 1 && pastedRows[0]?.length === 1;

		if (isSingleCellPaste) {
			updateCell(rowId, field, pastedRows[0]?.[0] ?? "");
			return;
		}

		setImportError(null);
		setPreviewRows((rows) => {
			const startRowIndex = rows.findIndex((row) => row.id === rowId);

			if (startRowIndex < 0) {
				return rows;
			}

			const nextRows = [...rows];
			const touchedRowIds = new Set<string>();

			pastedRows.forEach((pastedRow, pastedRowIndex) => {
				const targetIndex = startRowIndex + pastedRowIndex;
				const targetRow =
					nextRows[targetIndex] ?? createBlankRow(getNextRowNumber(nextRows));
				const nextValues = { ...targetRow.values };

				pastedRow.forEach((cellValue, cellIndex) => {
					const targetField = ImportFieldOrder[startColumnIndex + cellIndex];

					if (!targetField) {
						return;
					}

					nextValues[targetField] = normalizeCellValue(
						targetField,
						cellValue,
					);
				});

				touchedRowIds.add(targetRow.id);
				nextRows[targetIndex] = {
					...targetRow,
					values: nextValues,
				};
			});

			setPristineManualRowIds((current) => {
				const next = new Set(current);

				touchedRowIds.forEach((touchedRowId) => next.delete(touchedRowId));

				return next;
			});

			return renumberRows(nextRows);
		});
	}

	function addBlankRow() {
		const blankRow = createBlankRow(getNextRowNumber(previewRows));
		const nextRows = [...previewRows, blankRow];

		setPreviewRows(nextRows);
		setPristineManualRowIds((current) => new Set(current).add(blankRow.id));
		setPreviewPage(Math.ceil(nextRows.length / PreviewPageSize));
		setImportError(null);
	}

	function updateCell(
		rowId: string,
		field: BankImportColumnId,
		value: string | boolean,
	) {
		setPristineManualRowIds((current) => {
			if (!current.has(rowId)) return current;

			const next = new Set(current);

			next.delete(rowId);
			return next;
		});
		setPreviewRows((rows) =>
			rows.map((row) =>
				row.id === rowId
					? {
							...row,
							values: {
								...row.values,
								[field]: normalizeCellValue(field, value),
							},
						}
					: row,
			),
		);
	}

	function toggleRow(rowId: string, selected: boolean) {
		setSelectedRowIds((current) => {
			const next = new Set(current);

			if (selected) {
				next.add(rowId);
			} else {
				next.delete(rowId);
			}

			return next;
		});
	}

	function selectRows(scope: "page" | "all") {
		const rowIds = (scope === "all" ? validatedRows : visibleRows).map(
			(row) => row.id,
		);

		setSelectedRowIds((current) => {
			const next = new Set(current);
			rowIds.forEach((rowId) => next.add(rowId));
			return next;
		});
		setIsSelectionMenuOpen(false);
	}

	function clearRowSelection() {
		setSelectedRowIds(new Set());
		setIsSelectionMenuOpen(false);
	}

	function setImportSelection(mode: BankImportMode) {
		setImportMode(mode);
		setIsImportMenuOpen(false);
	}

	function removeSelectedRows() {
		const nextRows = renumberRows(
			previewRows.filter((row) => !selectedRowIds.has(row.id)),
		);

		setPreviewRows(nextRows);
		setPristineManualRowIds((current) => {
			const next = new Set(current);

			selectedRowIds.forEach((rowId) => next.delete(rowId));

			return next;
		});
		setSelectedRowIds(new Set());
		setPreviewPage((page) =>
			Math.max(1, Math.min(page, Math.ceil(nextRows.length / PreviewPageSize))),
		);
	}

	function movePreviewRow(sourceRowId: string, targetRowId: string, position: "before" | "after") {
		setPreviewRows((rows) => renumberRows(reorderModuleImportRows(rows, sourceRowId, targetRowId, position)));
	}

	async function handleImport(mode = importMode) {
		const rowsToImport =
			mode === "selected-valid"
				? validSelectedRows
				: mode === "all-valid"
					? validRows
					: nonBlankRows;

		if (mode === "selected-valid" && selectedRowIds.size === 0) {
			setImportError("Select at least one valid row to import.");
			return;
		}

		if (mode === "all-rows" && actualInvalidRows.length > 0) {
			setPristineManualRowIds(new Set());
			setImportError(
				`Fix or remove ${actualInvalidRows.length} incorrect ${actualInvalidRows.length === 1 ? "row" : "rows"} before importing. No rows were imported.`,
			);
			return;
		}

		if (mode === "selected-valid" && rowsToImport.length === 0) {
			setImportError(
				"Selected rows have errors. Fix them or choose valid rows.",
			);
			return;
		}

		if (rowsToImport.length === 0 || isBusy) return;

		const importedIds = new Set(rowsToImport.map((row) => row.id));
		setProgress({ imported: 0, total: rowsToImport.length });
		setImportError(null);

		try {
			for (
				let index = 0;
				index < rowsToImport.length;
				index += ImportBatchSize
			) {
				const batch = rowsToImport.slice(index, index + ImportBatchSize);
				await onImportBanks(batch.map((row) => cleanBankValues(row.values)));
				setProgress({
					imported: Math.min(index + batch.length, rowsToImport.length),
					total: rowsToImport.length,
				});
				await waitForNextBatch();
			}

			toast.success(
				`${rowsToImport.length} bank ${rowsToImport.length === 1 ? "account" : "accounts"} imported.`,
			);
			const nextRows = renumberRows(
				previewRows.filter((row) => !importedIds.has(row.id)),
			);
			setPreviewRows(nextRows);
			setPristineManualRowIds((current) => {
				const next = new Set(current);

				importedIds.forEach((rowId) => next.delete(rowId));

				return next;
			});
			setSelectedRowIds(new Set());
			setPreviewPage(1);
			setImportMode("all-rows");

			if (nextRows.length === 0) onClose();
		} catch (error) {
			setImportError(
				error instanceof Error
					? error.message
					: "Bank accounts could not be imported.",
			);
		} finally {
			setProgress(null);
		}
	}

	return {
		addBlankRow,
		canImport,
		canImportAllRows,
		canImportAllValid,
		canImportSelectedValid,
		clearRowSelection,
		columnWidths,
		handleFileUpload,
		handleImport,
		importError,
		importMode,
		importTableWidth,
		invalidRows,
		isImportMenuOpen,
		isParsing,
		isSelectionMenuOpen,
		movePreviewRow,
		pasteIntoPreviewCell,
		pasteRows,
		progress,
		removeSelectedRows,
		resetImportState,
		safePreviewPage,
		selectRows,
		selectedRowIds,
		setImportSelection,
		setIsImportMenuOpen,
		setIsSelectionMenuOpen,
		setPreviewPage,
		toggleRow,
		totalPages,
		updateCell,
		updateColumnWidth,
		validRows,
		validSelectedRows,
		validatedRows,
		visibleRows,
	};
}


