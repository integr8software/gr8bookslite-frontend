"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
	DefaultColumnWidths,
	ImportBatchSize,
	ImportFieldOrder,
	PreviewPageSize,
	SelectionColumnWidth,
} from "@/app/src/constants/modules/maintenance/payment-type/PaymentTypeConstants";
import {
	createBlankPaymentTypeImportRow,
	createExistingPaymentTypeNameMap,
	getNextPaymentTypeImportRowNumber,
	normalizeImportedPaymentTypeCellValue,
	normalizePaymentTypeName,
	parsePaymentTypeImportTabularRows,
	parsePaymentTypeImportText,
	paymentTypeImportRowHasErrors,
	readPaymentTypeImportFileText,
	removeDuplicatePaymentTypeImportRows,
	renumberPaymentTypeImportRows,
	validatePaymentTypeImportFileSize,
	validatePaymentTypeImportRows,
	waitForNextPaymentTypeImportBatch,
} from "@/app/src/data/modules/maintenance/payment-type/PaymentTypeData";
import type {
	PaymentTypeImportDialogProps,
	PaymentTypeImportColumnId,
	PaymentTypeImportColumnWidths,
	PaymentTypeImportMode,
	PaymentTypeImportPreviewRow,
	PaymentTypeImportProgress,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

export function usePaymentTypeImportDialog({
	existingPaymentTypes,
	onClose,
	onImportPaymentTypes,
}: Pick<
	PaymentTypeImportDialogProps,
	"existingPaymentTypes" | "onClose" | "onImportPaymentTypes"
>) {
	const [importError, setImportError] = useState<string | null>(null);
	const [isParsing, setIsParsing] = useState(false);
	const [previewRows, setPreviewRows] = useState<PaymentTypeImportPreviewRow[]>(
		[],
	);
	const [previewPage, setPreviewPage] = useState(1);
	const [progress, setProgress] = useState<PaymentTypeImportProgress | null>(
		null,
	);
	const [pristineManualRowIds, setPristineManualRowIds] = useState<Set<string>>(
		() => new Set(),
	);
	const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
	const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
	const [importMode, setImportMode] =
		useState<PaymentTypeImportMode>("all-rows");
	const [columnWidths, setColumnWidths] =
		useState<PaymentTypeImportColumnWidths>(DefaultColumnWidths);
	const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(
		() => new Set(),
	);
	const existingPaymentTypeNames = useMemo(
		() => createExistingPaymentTypeNameMap(existingPaymentTypes),
		[existingPaymentTypes],
	);
	const validatedRows = useMemo(
		() => validatePaymentTypeImportRows(previewRows, existingPaymentTypeNames),
		[existingPaymentTypeNames, previewRows],
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
	const invalidRows = displayedRows.filter(paymentTypeImportRowHasErrors);
	const actualInvalidRows = validatedRows.filter(paymentTypeImportRowHasErrors);
	const validRows = validatedRows.filter(
		(row) => !paymentTypeImportRowHasErrors(row),
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
	const totalPages = Math.max(1, Math.ceil(displayedRows.length / PreviewPageSize));
	const safePreviewPage = Math.min(previewPage, totalPages);
	const visibleRows = displayedRows.slice(
		(safePreviewPage - 1) * PreviewPageSize,
		safePreviewPage * PreviewPageSize,
	);
	const importTableWidth =
		SelectionColumnWidth +
		ImportFieldOrder.reduce((total, field) => total + columnWidths[field], 0);

	function updateColumnWidth(field: PaymentTypeImportColumnId, width: number) {
		setColumnWidths((current) => ({
			...current,
			[field]: width,
		}));
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

	function previewImportText(text: string, append = false) {
		try {
			let skippedCount = 0;
			let nextRowCount = 0;

			if (append) {
				const parsedRows = parsePaymentTypeImportText(
					text,
					getNextPaymentTypeImportRowNumber(previewRows),
				);
				const filteredRows = removeDuplicatePaymentTypeImportRows(
					parsedRows,
					previewRows,
				);
				const uniqueRows = filteredRows.rows;
				const nextRows = renumberPaymentTypeImportRows([
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
					Math.max(1, Math.ceil(nextRows.length / PreviewPageSize)),
				);
			} else {
				const parsedRows = parsePaymentTypeImportText(text);
				const filteredRows = removeDuplicatePaymentTypeImportRows(
					parsedRows,
					[],
				);
				const uniqueRows = filteredRows.rows;
				const nextRows = renumberPaymentTypeImportRows(uniqueRows);

				skippedCount = filteredRows.skippedCount;
				nextRowCount = nextRows.length;
				setPreviewRows(nextRows);
				setPristineManualRowIds(new Set());
				setSelectedRowIds(new Set());
				setPreviewPage(1);
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
					: "Could not read the imported payment types.",
			);
		}
	}

	function addBlankRow() {
		if (progress) {
			return;
		}

		const blankRow = createBlankPaymentTypeImportRow(
			getNextPaymentTypeImportRowNumber(previewRows),
		);
		const nextRows = [...previewRows, blankRow];

		setPreviewRows(nextRows);
		setPristineManualRowIds((current) => new Set(current).add(blankRow.id));
		setPreviewPage(Math.max(1, Math.ceil(nextRows.length / PreviewPageSize)));
		setSelectedRowIds(new Set());
		setImportError(null);
	}

	function removeSelectedRows() {
		if (selectedRowIds.size === 0 || progress) {
			return;
		}

		const nextRows = renumberPaymentTypeImportRows(
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
			Math.max(1, Math.min(page, Math.ceil(nextRows.length / PreviewPageSize))),
		);
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
		field: PaymentTypeImportColumnId,
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

		if (field === "paymentType") {
			const normalizedName = normalizePaymentTypeName(value);
			const hasDuplicateName =
				Boolean(normalizedName) &&
				previewRows.some(
					(row) =>
						row.id !== rowId &&
						normalizePaymentTypeName(row.paymentType.paymentType) ===
							normalizedName,
				);

			if (hasDuplicateName) {
				setImportError("Duplicate names are not accepted.");
				return;
			}
		}

		setPreviewRows((rows) =>
			rows.map((row) =>
				row.id === rowId
					? {
							...row,
							paymentType: {
								...row.paymentType,
								[field]: normalizeImportedPaymentTypeCellValue(
									field,
									value,
								) as never,
							},
						}
					: row,
			),
		);
		setImportError(null);
	}

	async function handleFileUpload(file: File | undefined) {
		if (!file || progress) return;

		const sizeError = validatePaymentTypeImportFileSize(file);

		if (sizeError) {
			setImportError(sizeError);
			return;
		}

		setIsParsing(true);

		try {
			const text = await readPaymentTypeImportFileText(file);

			previewImportText(text, true);
		} catch (error) {
			setImportError(
				error instanceof Error
					? error.message
					: "Could not read the imported payment types.",
			);
		} finally {
			setIsParsing(false);
		}
	}

	function pasteIntoPreviewCell(
		rowId: string,
		field: PaymentTypeImportColumnId,
		text: string,
	) {
		const pastedRows = parsePaymentTypeImportTabularRows(text).filter((row) =>
			row.some((cell) => cell.trim() !== ""),
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

		const startColumnIndex = ImportFieldOrder.indexOf(field);
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
					.map((row) => normalizePaymentTypeName(row.paymentType.paymentType))
					.filter(Boolean),
			);
			let skippedCount = 0;

			pastedRows.forEach((pastedRow, pastedRowIndex) => {
				const targetIndex = startRowIndex + pastedRowIndex;
				const targetRow =
					nextRows[targetIndex] ??
					createBlankPaymentTypeImportRow(
						getNextPaymentTypeImportRowNumber(nextRows),
					);

				const nextPaymentType = { ...targetRow.paymentType };

				pastedRow.forEach((cellValue, cellIndex) => {
					const targetField = ImportFieldOrder[startColumnIndex + cellIndex];

					if (!targetField) {
						return;
					}

					nextPaymentType[targetField] = normalizeImportedPaymentTypeCellValue(
						targetField,
						cellValue,
					) as never;
				});

				const normalizedName = normalizePaymentTypeName(
					nextPaymentType.paymentType,
				);
				const originalName = normalizePaymentTypeName(
					targetRow.paymentType.paymentType,
				);
				const isExistingTargetRow = targetIndex < rows.length;

				if (
					normalizedName &&
					seenNames.has(normalizedName) &&
					(!isExistingTargetRow || normalizedName !== originalName)
				) {
					skippedCount += 1;
					return;
				}

				if (originalName) {
					seenNames.delete(originalName);
				}
				if (normalizedName) {
					seenNames.add(normalizedName);
				}

				nextRows[targetIndex] = {
					...targetRow,
					paymentType: nextPaymentType,
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

	function setImportSelection(mode: PaymentTypeImportMode) {
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
			setImportError(
				"Selected rows have errors. Fix them or choose valid rows.",
			);
			return;
		}

		if (!canImport) return;

		const importedRowIds = new Set(rowsToImport.map((row) => row.id));
		const paymentTypesToImport = rowsToImport.map((row, index) => ({
			...row.paymentType,
			id: `payment-type-import-${Date.now()}-${index}`,
		}));

		setProgress({ imported: 0, total: paymentTypesToImport.length });

		for (
			let index = 0;
			index < paymentTypesToImport.length;
			index += ImportBatchSize
		) {
			const batch = paymentTypesToImport.slice(index, index + ImportBatchSize);

			try {
				await onImportPaymentTypes(batch);
			} catch {
				setProgress(null);
				return;
			}
			setProgress({
				imported: Math.min(index + batch.length, paymentTypesToImport.length),
				total: paymentTypesToImport.length,
			});
			await waitForNextPaymentTypeImportBatch();
		}

		setProgress(null);
		toast.success(
			`${paymentTypesToImport.length} payment ${paymentTypesToImport.length === 1 ? "type" : "types"} imported.`,
		);
		const nextRows = renumberPaymentTypeImportRows(
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
			Math.max(1, Math.min(page, Math.ceil(nextRows.length / PreviewPageSize))),
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


