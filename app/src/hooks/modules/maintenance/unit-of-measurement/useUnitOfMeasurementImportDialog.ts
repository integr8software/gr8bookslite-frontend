"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
	UnitOfMeasurementImportBatchSize,
	UnitOfMeasurementImportDefaultColumnWidths,
	UnitOfMeasurementImportFieldOrder,
	UnitOfMeasurementImportPreviewPageSize,
	UnitOfMeasurementImportSelectionColumnWidth,
} from "@/app/src/constants/modules/maintenance/unit-of-measurement/UnitOfMeasurementConstants";
import {
	createBlankUnitOfMeasurementImportRow,
	createExistingUnitOfMeasurementMaps,
	getNextUnitOfMeasurementImportRowNumber,
	normalizeImportedUnitOfMeasurementCellValue,
	normalizeUnitOfMeasurementName,
	normalizeUnitOfMeasurementSymbol,
	parseUnitOfMeasurementImportTabularRows,
	parseUnitOfMeasurementImportText,
	readUnitOfMeasurementImportFileText,
	removeDuplicateUnitOfMeasurementImportRows,
	renumberUnitOfMeasurementImportRows,
	unitOfMeasurementImportRowHasErrors,
	validateUnitOfMeasurementImportFileSize,
	validateUnitOfMeasurementImportRows,
	waitForNextUnitOfMeasurementImportBatch,
} from "@/app/src/data/modules/maintenance/unit-of-measurement/UnitOfMeasurementData";
import type {
	UnitOfMeasurementImportColumnId,
	UnitOfMeasurementImportColumnWidths,
	UnitOfMeasurementImportDialogProps,
	UnitOfMeasurementImportMode,
	UnitOfMeasurementImportPreviewRow,
	UnitOfMeasurementImportProgress,
} from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";
import { reorderModuleImportRows } from "@/app/src/utils/module-import.util";

export function useUnitOfMeasurementImportDialog({
	existingRecords,
	onClose,
	onImportRecords,
}: Pick<
	UnitOfMeasurementImportDialogProps,
	"existingRecords" | "onClose" | "onImportRecords"
>) {
	const [importError, setImportError] = useState<string | null>(null);
	const [isParsing, setIsParsing] = useState(false);
	const [previewRows, setPreviewRows] = useState<
		UnitOfMeasurementImportPreviewRow[]
	>([]);
	const [previewPage, setPreviewPage] = useState(1);
	const [progress, setProgress] =
		useState<UnitOfMeasurementImportProgress | null>(null);
	const [pristineManualRowIds, setPristineManualRowIds] = useState<Set<string>>(
		() => new Set(),
	);
	const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
	const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
	const [importMode, setImportMode] =
		useState<UnitOfMeasurementImportMode>("all-rows");
	const [columnWidths, setColumnWidths] =
		useState<UnitOfMeasurementImportColumnWidths>(
			UnitOfMeasurementImportDefaultColumnWidths,
		);
	const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(
		() => new Set(),
	);
	const existingRecordMaps = useMemo(
		() => createExistingUnitOfMeasurementMaps(existingRecords),
		[existingRecords],
	);
	const validatedRows = useMemo(
		() => validateUnitOfMeasurementImportRows(previewRows, existingRecordMaps),
		[existingRecordMaps, previewRows],
	);
	const displayedRows = useMemo(
		() =>
			validatedRows.map((row) =>
				pristineManualRowIds.has(row.id)
					? { ...row, cellErrors: {}, cellWarnings: {}, rowErrors: [] }
					: row,
			),
		[pristineManualRowIds, validatedRows],
	);
	const invalidRows = displayedRows.filter(unitOfMeasurementImportRowHasErrors);
	const actualInvalidRows = validatedRows.filter(
		unitOfMeasurementImportRowHasErrors,
	);
	const validRows = validatedRows.filter(
		(row) => !unitOfMeasurementImportRowHasErrors(row),
	);
	const validSelectedRows = validRows.filter((row) =>
		selectedRowIds.has(row.id),
	);
	const importableRows =
		importMode === "selected-valid"
			? validSelectedRows
			: importMode === "all-valid"
				? validRows
				: validatedRows;
	const canImport = importableRows.length > 0 && !progress;
	const canImportAllRows = validatedRows.length > 0 && !progress;
	const canImportAllValid = validRows.length > 0 && !progress;
	const canImportSelectedValid = validSelectedRows.length > 0 && !progress;
	const totalPages = Math.max(
		1,
		Math.ceil(displayedRows.length / UnitOfMeasurementImportPreviewPageSize),
	);
	const safePreviewPage = Math.min(previewPage, totalPages);
	const visibleRows = displayedRows.slice(
		(safePreviewPage - 1) * UnitOfMeasurementImportPreviewPageSize,
		safePreviewPage * UnitOfMeasurementImportPreviewPageSize,
	);
	const importTableWidth =
		UnitOfMeasurementImportSelectionColumnWidth +
		UnitOfMeasurementImportFieldOrder.reduce(
			(total, field) => total + columnWidths[field],
			0,
		);

	function updateColumnWidth(
		field: UnitOfMeasurementImportColumnId,
		width: number,
	) {
		setColumnWidths((current) => ({
			...current,
			[field]: width,
		}));
	}

	function resetImportState() {
		if (progress) {
			return;
		}

		setImportError(null);
		setPreviewRows([]);
		setPreviewPage(1);
		setPristineManualRowIds(new Set());
		setSelectedRowIds(new Set());
		setImportMode("all-rows");
		setIsSelectionMenuOpen(false);
		setIsImportMenuOpen(false);
	}

	function previewImportText(text: string, append = false) {
		try {
			let skippedCount = 0;
			let nextRowCount = 0;

			if (append) {
				const parsedRows = parseUnitOfMeasurementImportText(
					text,
					getNextUnitOfMeasurementImportRowNumber(previewRows),
				);
				const filteredRows = removeDuplicateUnitOfMeasurementImportRows(
					parsedRows,
					previewRows,
				);
				const uniqueRows = filteredRows.rows;
				const nextRows = renumberUnitOfMeasurementImportRows([
					...previewRows,
					...uniqueRows,
				]);

				skippedCount = filteredRows.skippedCount;
				nextRowCount = nextRows.length;
				setPreviewRows(nextRows);
				setPristineManualRowIds((current) => {
					const next = new Set(current);

					uniqueRows.forEach((row) => next.delete(row.id));

					return next;
				});
				setSelectedRowIds(new Set());
				setPreviewPage(
					Math.max(
						1,
						Math.ceil(
							nextRows.length / UnitOfMeasurementImportPreviewPageSize,
						),
					),
				);
			} else {
				const parsedRows = parseUnitOfMeasurementImportText(text);
				const filteredRows = removeDuplicateUnitOfMeasurementImportRows(
					parsedRows,
					[],
				);
				const uniqueRows = filteredRows.rows;

				skippedCount = filteredRows.skippedCount;
				const nextRows = renumberUnitOfMeasurementImportRows(uniqueRows);

				nextRowCount = nextRows.length;
				setPreviewRows(nextRows);
				setPristineManualRowIds(new Set());
				setPreviewPage(1);
				setSelectedRowIds(new Set());
			}

			setImportError(
				skippedCount > 0 && nextRowCount > 0
					? `${skippedCount} duplicate ${skippedCount === 1 ? "row was" : "rows were"} skipped.`
					: null,
			);
		} catch (error) {
			setImportError(
				error instanceof Error
					? error.message
					: "Could not read the imported units of measurement.",
			);
		}
	}

	function addBlankRow() {
		const blankRow = createBlankUnitOfMeasurementImportRow(
			getNextUnitOfMeasurementImportRowNumber(previewRows),
		);

		setPreviewRows([...previewRows, blankRow]);
		setPristineManualRowIds((current) => new Set(current).add(blankRow.id));
		setSelectedRowIds(new Set());
		setImportError(null);
	}

	function removeSelectedRows() {
		if (selectedRowIds.size === 0 || progress) {
			return;
		}

		const nextRows = renumberUnitOfMeasurementImportRows(
			previewRows.filter((row) => !selectedRowIds.has(row.id)),
		);

		setImportError(null);
		setPreviewRows(nextRows);
		setPristineManualRowIds((current) => {
			const next = new Set(current);

			selectedRowIds.forEach((rowId) => next.delete(rowId));

			return next;
		});
		setSelectedRowIds(new Set());
		setPreviewPage((page) =>
			Math.max(
				1,
				Math.min(
					page,
					Math.ceil(nextRows.length / UnitOfMeasurementImportPreviewPageSize),
				),
			),
		);
	}

	function movePreviewRow(sourceRowId: string, targetRowId: string, position: "before" | "after") {
		setPreviewRows((rows) => renumberUnitOfMeasurementImportRows(reorderModuleImportRows(rows, sourceRowId, targetRowId, position)));
	}

	function toggleRowSelection(rowId: string, isSelected: boolean) {
		setSelectedRowIds((current) => {
			const nextSelected = new Set(current);

			if (isSelected) {
				nextSelected.add(rowId);
			} else {
				nextSelected.delete(rowId);
			}

			return nextSelected;
		});
	}

	function selectRows(scope: "page" | "all") {
		const rowIds = (scope === "all" ? validatedRows : visibleRows).map(
			(row) => row.id,
		);

		setSelectedRowIds((current) => {
			const nextSelected = new Set(current);

			rowIds.forEach((rowId) => nextSelected.add(rowId));

			return nextSelected;
		});
		setIsSelectionMenuOpen(false);
	}

	function clearRowSelection() {
		setSelectedRowIds(new Set());
		setIsSelectionMenuOpen(false);
	}

	function updatePreviewCell(
		rowId: string,
		field: UnitOfMeasurementImportColumnId,
		value: string,
	) {
		setPristineManualRowIds((current) => {
			if (!current.has(rowId)) {
				return current;
			}

			const next = new Set(current);

			next.delete(rowId);
			return next;
		});

		const normalizedValue = normalizeImportedUnitOfMeasurementCellValue(
			field,
			value,
		);

		if (field === "name") {
			const normalizedName = normalizeUnitOfMeasurementName(value);
			const hasDuplicateName =
				Boolean(normalizedName) &&
				previewRows.some(
					(row) =>
						row.id !== rowId &&
						normalizeUnitOfMeasurementName(row.record.name) === normalizedName,
				);

			if (hasDuplicateName) {
				setImportError("Duplicate units are not accepted.");
				return;
			}
		}

		if (field === "symbol") {
			const normalizedSymbol = normalizeUnitOfMeasurementSymbol(value);
			const hasDuplicateSymbol =
				Boolean(normalizedSymbol) &&
				previewRows.some(
					(row) =>
						row.id !== rowId &&
						normalizeUnitOfMeasurementSymbol(row.record.symbol) ===
							normalizedSymbol,
				);

			if (hasDuplicateSymbol) {
				setImportError("Duplicate symbols are not accepted.");
				return;
			}
		}

		setPreviewRows((rows) =>
			rows.map((row) =>
				row.id === rowId
					? {
							...row,
							record: {
								...row.record,
								[field]: normalizedValue as never,
							},
						}
					: row,
			),
		);
		setImportError(null);
	}

	async function handleFileUpload(file: File | undefined) {
		if (!file || progress) {
			return;
		}

		const sizeError = validateUnitOfMeasurementImportFileSize(file);

		if (sizeError) {
			setImportError(sizeError);
			return;
		}

		setIsParsing(true);

		try {
			const text = await readUnitOfMeasurementImportFileText(file);

			previewImportText(text, true);
		} catch (error) {
			setImportError(
				error instanceof Error
					? error.message
					: "Could not read the imported units of measurement.",
			);
		} finally {
			setIsParsing(false);
		}
	}

	function pasteIntoPreviewCell(
		rowId: string,
		field: UnitOfMeasurementImportColumnId,
		text: string,
	) {
		const pastedRows = parseUnitOfMeasurementImportTabularRows(text).filter(
			(row) => row.some((cell) => cell.trim() !== ""),
		);

		if (pastedRows.length === 0) {
			return;
		}

		setPristineManualRowIds((current) => {
			if (!current.has(rowId)) {
				return current;
			}

			const next = new Set(current);

			next.delete(rowId);
			return next;
		});

		const startColumnIndex =
			UnitOfMeasurementImportFieldOrder.indexOf(field);
		const isSingleCellPaste =
			pastedRows.length === 1 && pastedRows[0]?.length === 1;

		if (isSingleCellPaste) {
			updatePreviewCell(rowId, field, pastedRows[0]?.[0] ?? "");
			return;
		}

		setImportError(null);
		setPreviewRows((rows) => {
			const startRowIndex = rows.findIndex((row) => row.id === rowId);

			if (startRowIndex < 0) {
				return rows;
			}

			const nextRows = [...rows];
			const seenNames = new Set(
				rows
					.map((row) => normalizeUnitOfMeasurementName(row.record.name))
					.filter(Boolean),
			);
			const seenSymbols = new Set(
				rows
					.map((row) => normalizeUnitOfMeasurementSymbol(row.record.symbol))
					.filter(Boolean),
			);
			let skippedCount = 0;

			pastedRows.forEach((pastedRow, pastedRowIndex) => {
				const targetIndex = startRowIndex + pastedRowIndex;
				const targetRow =
					nextRows[targetIndex] ??
					createBlankUnitOfMeasurementImportRow(
						getNextUnitOfMeasurementImportRowNumber(nextRows),
					);
				const nextRecord = { ...targetRow.record };

				pastedRow.forEach((cellValue, cellIndex) => {
					const targetField =
						UnitOfMeasurementImportFieldOrder[startColumnIndex + cellIndex];

					if (!targetField) {
						return;
					}

					nextRecord[targetField] =
						normalizeImportedUnitOfMeasurementCellValue(
							targetField,
							cellValue,
						) as never;
				});

				const normalizedName = normalizeUnitOfMeasurementName(nextRecord.name);
				const normalizedSymbol = normalizeUnitOfMeasurementSymbol(
					nextRecord.symbol,
				);
				const originalName = normalizeUnitOfMeasurementName(
					targetRow.record.name,
				);
				const originalSymbol = normalizeUnitOfMeasurementSymbol(
					targetRow.record.symbol,
				);
				const isExistingTargetRow = targetIndex < rows.length;
				const hasDuplicateName =
					Boolean(normalizedName) &&
					seenNames.has(normalizedName) &&
					(!isExistingTargetRow || normalizedName !== originalName);
				const hasDuplicateSymbol =
					Boolean(normalizedSymbol) &&
					seenSymbols.has(normalizedSymbol) &&
					(!isExistingTargetRow || normalizedSymbol !== originalSymbol);

				if (hasDuplicateName || hasDuplicateSymbol) {
					skippedCount += 1;
					return;
				}

				if (originalName) {
					seenNames.delete(originalName);
				}
				if (originalSymbol) {
					seenSymbols.delete(originalSymbol);
				}
				if (normalizedName) {
					seenNames.add(normalizedName);
				}
				if (normalizedSymbol) {
					seenSymbols.add(normalizedSymbol);
				}

				nextRows[targetIndex] = {
					...targetRow,
					record: nextRecord,
				};
			});

			if (skippedCount > 0) {
				setImportError(
					`${skippedCount} duplicate ${skippedCount === 1 ? "row was" : "rows were"} skipped.`,
				);
			}

			return nextRows;
		});
	}

	function pasteIntoPreviewGrid(text: string) {
		if (!text.trim() || progress) {
			return;
		}

		previewImportText(text, true);
	}

	function setImportSelection(mode: UnitOfMeasurementImportMode) {
		setImportMode(mode);
		setIsImportMenuOpen(false);
	}

	async function handleImport(mode = importMode) {
		const rowsToImport =
			mode === "selected-valid"
				? validSelectedRows
				: mode === "all-valid"
					? validRows
					: validatedRows;

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
			setImportError("Selected rows have errors. Fix them or choose valid rows.");
			return;
		}

		if (!canImport) {
			return;
		}

		const importedRowIds = new Set(rowsToImport.map((row) => row.id));
		const recordsToImport = rowsToImport.map((row, index) => ({
			...row.record,
			id: `uom-import-${Date.now()}-${index}`,
			symbol: row.record.symbol.toUpperCase(),
		}));

		setProgress({ imported: 0, total: recordsToImport.length });

		for (
			let index = 0;
			index < recordsToImport.length;
			index += UnitOfMeasurementImportBatchSize
		) {
			const batch = recordsToImport.slice(
				index,
				index + UnitOfMeasurementImportBatchSize,
			);

			try {
				await onImportRecords(batch);
			} catch {
				setProgress(null);
				return;
			}
			setProgress({
				imported: Math.min(index + batch.length, recordsToImport.length),
				total: recordsToImport.length,
			});
			await waitForNextUnitOfMeasurementImportBatch();
		}

		setProgress(null);
		toast.success(
			`${recordsToImport.length} unit ${recordsToImport.length === 1 ? "record" : "records"} imported.`,
		);
		const nextRows = renumberUnitOfMeasurementImportRows(
			previewRows.filter((row) => !importedRowIds.has(row.id)),
		);

		setPreviewRows(nextRows);
		setPristineManualRowIds((current) => {
			const nextSelected = new Set(current);

			importedRowIds.forEach((rowId) => nextSelected.delete(rowId));

			return nextSelected;
		});
		setSelectedRowIds((current) => {
			const nextSelected = new Set(current);

			importedRowIds.forEach((rowId) => nextSelected.delete(rowId));

			return nextSelected;
		});
		setImportMode("all-rows");
		setPreviewPage((page) =>
			Math.max(
				1,
				Math.min(
					page,
					Math.ceil(nextRows.length / UnitOfMeasurementImportPreviewPageSize),
				),
			),
		);
		setImportError(null);

		if (nextRows.length === 0) {
			resetImportState();
			onClose();
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
		pasteIntoPreviewGrid,
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
		toggleRowSelection,
		totalPages,
		updateColumnWidth,
		updatePreviewCell,
		validRows,
		validSelectedRows,
		validatedRows,
		visibleRows,
	};
}
