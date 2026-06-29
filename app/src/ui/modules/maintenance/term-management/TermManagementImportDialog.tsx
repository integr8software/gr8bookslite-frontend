"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	AlertCircle,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Download,
	LoaderCircle,
	Plus,
	Trash2,
	Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { AppMaxFileUploadSizeLabel } from "@/app/src/constants/shared/app/AppConstants";
import type { TermManagement } from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import { ClickOrDragDropFile } from "@/app/src/ui/shared/module/ClickOrDragDropFile";
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";
import {
	ModuleImportResizableColumnHeader,
	clampImportColumnWidth,
} from "@/app/src/ui/shared/module/ModuleImportResizableColumnHeader";

import {
	ImportBatchSize,
	ImportFieldOrder,
	MaxImportFileSizeBytes,
	MinImportFileSizeBytes,
	PreviewPageSize,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type {
	ImportProgress,
	TermImportColumnId,
	TermImportMode,
	TermImportPreviewRow,
} from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import { TermImportPreviewTableRow } from "@/app/src/ui/modules/maintenance/term-management/TermManagementImportPreviewTableRow";
import {
	createBlankImportRow,
	downloadTermImportTemplate,
	formatFileSize,
	getNextImportRowNumber,
	normalizeImportedCellValue,
	normalizeImportedDatemode,
	normalizeTermName,
	parseTermImportTabularRows,
	parseTermImportText,
	readTermImportFileText,
	removeDuplicateImportRows,
	renumberImportRows,
	rowHasErrors,
	validateImportFileSize,
	validateTermImportRows,
	waitForNextImportBatch,
} from "@/app/src/data/modules/maintenance/financial-management/term-management/TermManagementData";

export function TermManagementImportDialog({
	existingTerms,
	isOpen,
	onClose,
	onImportTerms,
}: {
	existingTerms: TermManagement[];
	isOpen: boolean;
	onClose: () => void;
	onImportTerms: (terms: TermManagement[]) => Promise<TermManagement[]>;
}) {
	const [importError, setImportError] = useState<string | null>(null);
	const [isParsing, setIsParsing] = useState(false);
	const [previewRows, setPreviewRows] = useState<TermImportPreviewRow[]>([]);
	const [previewPage, setPreviewPage] = useState(1);
	const [progress, setProgress] = useState<ImportProgress | null>(null);
	const [pristineManualRowIds, setPristineManualRowIds] = useState<Set<string>>(
		() => new Set(),
	);
	const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
	const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
	const [importMode, setImportMode] = useState<TermImportMode>("all-rows");
	const [columnWidths, setColumnWidths] = useState<
		Record<TermImportColumnId, number>
	>({
		name: 224,
		datemode: 160,
		period: 128,
	});
	const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(
		() => new Set(),
	);
	const selectionMenuRef = useRef<HTMLTableCellElement>(null);
	const importMenuRef = useRef<HTMLDivElement>(null);
	const existingTermNames = useMemo(
		() =>
			new Map(
				existingTerms.map((term) => [normalizeTermName(term.name), term.name]),
			),
		[existingTerms],
	);
	const validatedRows = useMemo(
		() => validateTermImportRows(previewRows, existingTermNames),
		[existingTermNames, previewRows],
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
	const invalidRows = displayedRows.filter((row) => rowHasErrors(row));
	const actualInvalidRows = validatedRows.filter((row) => rowHasErrors(row));
	const validRows = validatedRows.filter((row) => !rowHasErrors(row));
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
		Math.ceil(displayedRows.length / PreviewPageSize),
	);
	const safePreviewPage = Math.min(previewPage, totalPages);
	const visibleRows = displayedRows.slice(
		(safePreviewPage - 1) * PreviewPageSize,
		safePreviewPage * PreviewPageSize,
	);
	const progressPercent =
		progress && progress.total > 0
			? Math.round((progress.imported / progress.total) * 100)
			: 0;
	const importTableWidth =
		64 + ImportFieldOrder.reduce((total, field) => total + columnWidths[field], 0);

	function updateColumnWidth(field: TermImportColumnId, width: number) {
		setColumnWidths((current) => ({
			...current,
			[field]: clampImportColumnWidth(width),
		}));
	}

	useEffect(() => {
		if (!isSelectionMenuOpen) {
			return;
		}

		function closeSelectionMenu(event: PointerEvent) {
			if (
				event.target instanceof Node &&
				!selectionMenuRef.current?.contains(event.target)
			) {
				setIsSelectionMenuOpen(false);
			}
		}

		function closeSelectionMenuOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsSelectionMenuOpen(false);
			}
		}

		document.addEventListener("pointerdown", closeSelectionMenu);
		document.addEventListener("keydown", closeSelectionMenuOnEscape);

		return () => {
			document.removeEventListener("pointerdown", closeSelectionMenu);
			document.removeEventListener("keydown", closeSelectionMenuOnEscape);
		};
	}, [isSelectionMenuOpen]);

	useEffect(() => {
		if (!isImportMenuOpen) {
			return;
		}

		function closeImportMenu(event: PointerEvent) {
			if (
				event.target instanceof Node &&
				!importMenuRef.current?.contains(event.target)
			) {
				setIsImportMenuOpen(false);
			}
		}

		function closeImportMenuOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsImportMenuOpen(false);
			}
		}

		document.addEventListener("pointerdown", closeImportMenu);
		document.addEventListener("keydown", closeImportMenuOnEscape);

		return () => {
			document.removeEventListener("pointerdown", closeImportMenu);
			document.removeEventListener("keydown", closeImportMenuOnEscape);
		};
	}, [isImportMenuOpen]);

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
				const parsedRows = parseTermImportText(
					text,
					getNextImportRowNumber(previewRows),
				);
				const filteredRows = removeDuplicateImportRows(parsedRows, previewRows);
				const uniqueRows = filteredRows.rows;
				const nextRows = renumberImportRows([...previewRows, ...uniqueRows]);

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
				const parsedRows = parseTermImportText(text);
				const filteredRows = removeDuplicateImportRows(parsedRows, []);
				const uniqueRows = filteredRows.rows;

				skippedCount = filteredRows.skippedCount;
				const nextRows = renumberImportRows(uniqueRows);

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
					: "Could not read the imported terms.",
			);
		}
	}

	function addBlankRow() {
		const blankRow = createBlankImportRow(getNextImportRowNumber(previewRows));

		setPreviewRows([...previewRows, blankRow]);
		setPristineManualRowIds((current) => new Set(current).add(blankRow.id));
		setSelectedRowIds(new Set());
		setImportError(null);
	}

	function removeSelectedRows() {
		if (selectedRowIds.size === 0 || progress) {
			return;
		}

		const nextRows = renumberImportRows(
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
		field: TermImportColumnId,
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

		if (field === "period" && value.trim() && Number(value) < 0) {
			return;
		}

		if (field === "name") {
			const normalizedName = normalizeTermName(value);
			const hasDuplicateName =
				Boolean(normalizedName) &&
				previewRows.some(
					(row) =>
						row.id !== rowId &&
						normalizeTermName(row.term.name) === normalizedName,
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
						term: {
							...row.term,
							[field]:
								field === "datemode"
									? normalizeImportedDatemode(value)
									: value,
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

		const sizeError = validateImportFileSize(file);

		if (sizeError) {
			setImportError(sizeError);
			return;
		}

		setIsParsing(true);

		try {
			const text = await readTermImportFileText(file);

			previewImportText(text, true);
		} catch (error) {
			setImportError(
				error instanceof Error
					? error.message
					: "Could not read the imported terms.",
			);
		} finally {
			setIsParsing(false);
		}
	}

	function pasteIntoPreviewCell(
		rowId: string,
		field: TermImportColumnId,
		text: string,
	) {
		const pastedRows = parseTermImportTabularRows(text).filter((row) =>
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
				rows.map((row) => normalizeTermName(row.term.name)).filter(Boolean),
			);
			let skippedCount = 0;

			pastedRows.forEach((pastedRow, pastedRowIndex) => {
				const targetIndex = startRowIndex + pastedRowIndex;
				const targetRow =
					nextRows[targetIndex] ??
					createBlankImportRow(getNextImportRowNumber(nextRows));

				const nextTerm = { ...targetRow.term };

				pastedRow.forEach((cellValue, cellIndex) => {
					const targetField = ImportFieldOrder[startColumnIndex + cellIndex];

					if (!targetField) {
						return;
					}

					nextTerm[targetField] = normalizeImportedCellValue(
						targetField,
						cellValue,
					) as never;
				});

				const normalizedName = normalizeTermName(nextTerm.name);
				const originalName = normalizeTermName(targetRow.term.name);
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
					term: nextTerm,
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

	function setImportSelection(mode: TermImportMode) {
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

		if (!canImport) {
			return;
		}

		const importedRowIds = new Set(rowsToImport.map((row) => row.id));
		const termsToImport = rowsToImport.map((row, index) => ({
			...row.term,
			id: `term-import-${Date.now()}-${index}`,
		}));

		setProgress({ imported: 0, total: termsToImport.length });

		for (
			let index = 0;
			index < termsToImport.length;
			index += ImportBatchSize
		) {
			const batch = termsToImport.slice(index, index + ImportBatchSize);

			try {
				await onImportTerms(batch);
			} catch {
				setProgress(null);
				return;
			}
			setProgress({
				imported: Math.min(index + batch.length, termsToImport.length),
				total: termsToImport.length,
			});
			await waitForNextImportBatch();
		}

		setProgress(null);
		toast.success(
			`${termsToImport.length} term ${termsToImport.length === 1 ? "definition" : "definitions"} imported.`,
		);
		const nextRows = renumberImportRows(
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

	return (
		<ModuleImportDialog
			isOpen={isOpen}
			isBusy={Boolean(progress)}
			title="Import Data"
			titleId="term-management-import-title"
			description="Upload, validate, edit, and import data in queued batches."
			onClose={onClose}
			actions={
				<div className="grid gap-3 lg:grid-cols-[minmax(18rem,1fr)_auto]">
					<ClickOrDragDropFile
						accept=".xlsx,.csv,.tsv,.txt"
						acceptedFileLabel=".xlsx, .csv, .tsv, .txt"
						className="inline-flex min-h-20 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-skyblue/35 bg-skyblue/8 px-4 py-3 text-center text-sm font-semibold text-skyblue transition hover:bg-skyblue/12"
						disabled={Boolean(progress)}
						isBusy={isParsing}
						label="Upload or Drag and Drop Files"
						size="medium"
						stackable
						onFileSelect={(file) => void handleFileUpload(file)}
					/>
					<div className="grid grid-cols-2 gap-2 lg:flex lg:items-start lg:justify-end">
						<button
							type="button"
							onClick={() => void downloadTermImportTemplate()}
							disabled={Boolean(progress)}
							className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-darknavy/12 bg-white px-3 text-sm font-semibold text-darknavy transition hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-55 lg:w-auto lg:px-4"
						>
							<Download className="h-4 w-4" aria-hidden="true" />
							Template
						</button>
						<button
							type="button"
							onClick={addBlankRow}
							disabled={Boolean(progress)}
							className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-darknavy/12 bg-white px-3 text-sm font-semibold text-darknavy transition hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-55 lg:w-auto lg:px-4"
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Row
						</button>
					</div>
					<div className="grid gap-2 text-xs font-medium text-darknavy/45 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
						<p className="sm:hidden">
							Accepted: .xlsx, .csv, .tsv, .txt. Maximum size:{" "}
							{AppMaxFileUploadSizeLabel}.
						</p>
						<p className="hidden sm:block">
							Accepted: .xlsx, .csv, .tsv, .txt. Size:{" "}
							{formatFileSize(MinImportFileSizeBytes)} to{" "}
							{formatFileSize(MaxImportFileSizeBytes)}. Upload one file at a
							time; each upload or grid paste adds rows. Duplicate names are not
							accepted.
						</p>
						<div className="flex flex-wrap gap-2 font-semibold text-darknavy/60">
							<span>Rows: {validatedRows.length}</span>
							<span>Valid: {validRows.length}</span>
							<span>Incorrect: {invalidRows.length}</span>
						</div>
					</div>
				</div>
			}
			progress={
				progress ? (
					<div className="rounded-lg border border-skyblue/20 bg-skyblue/8 p-3">
						<div className="flex items-center justify-between gap-3 text-sm font-semibold text-darknavy">
							<span>Importing queued data</span>
							<span>{progressPercent}%</span>
						</div>
						<div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
							<div
								className="h-full rounded-full bg-skyblue transition-all"
								style={{ width: `${progressPercent}%` }}
							/>
						</div>
						<p className="mt-2 text-xs font-medium text-darknavy/55">
							{progress.imported} of {progress.total} rows imported
						</p>
					</div>
				) : null
			}
			footer={
				<div className="grid grid-cols-2 gap-2 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto] lg:items-center">
					<button
						type="button"
						onClick={resetImportState}
						disabled={Boolean(progress)}
						className="order-2 inline-flex h-10 w-full items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-55 lg:order-none lg:w-auto"
					>
						Reset
					</button>
					<div className="hidden lg:block" aria-hidden="true" />
					<button
						type="button"
						onClick={onClose}
						disabled={Boolean(progress)}
						className="order-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-55 lg:order-none lg:w-auto"
					>
						Cancel
					</button>
					<div
						ref={importMenuRef}
						className="order-1 col-span-2 relative flex w-full lg:order-none lg:col-span-1 lg:w-auto"
					>
						<button
							type="button"
							onClick={() => void handleImport(importMode)}
							disabled={!canImport}
							className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-l-md bg-skyblue px-4 text-sm font-semibold text-white transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-55 lg:h-10 lg:w-auto"
						>
							{progress ? (
								<LoaderCircle
									className="h-4 w-4 animate-spin"
									aria-hidden="true"
								/>
							) : (
								<Upload className="h-4 w-4" aria-hidden="true" />
							)}
							{importMode === "selected-valid"
								? "Import Selected"
								: importMode === "all-valid"
									? "Import Valid"
									: "Import Data"}
						</button>
						<button
							type="button"
							onClick={() => setIsImportMenuOpen((isOpen) => !isOpen)}
							disabled={!canImportAllRows && !canImportSelectedValid}
							className="inline-flex h-11 w-11 items-center justify-center rounded-r-md border-l border-white/25 bg-skyblue text-white transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-55 lg:h-10"
							aria-label="Choose import type"
							aria-expanded={isImportMenuOpen}
						>
							<ChevronDown className="h-4 w-4" aria-hidden="true" />
						</button>
						{isImportMenuOpen ? (
							<div
								role="menu"
								className="absolute bottom-full right-0 z-50 mb-1 w-64 overflow-hidden rounded-md border border-darknavy/10 bg-white py-1 text-left text-xs font-semibold text-darknavy shadow-lg"
							>
								<button
									type="button"
									role="menuitem"
									onClick={() => setImportSelection("all-rows")}
									disabled={!canImportAllRows}
									className="block w-full px-3 py-2 text-left hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-45"
								>
									Import all rows ({validatedRows.length})
								</button>
								<button
									type="button"
									role="menuitem"
									onClick={() => setImportSelection("all-valid")}
									disabled={!canImportAllValid}
									className="block w-full border-t border-darknavy/8 px-3 py-2 text-left hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-45"
								>
									Import all valid rows ({validRows.length})
								</button>
								<button
									type="button"
									role="menuitem"
									onClick={() => setImportSelection("selected-valid")}
									disabled={!canImportSelectedValid}
									className="block w-full border-t border-darknavy/8 px-3 py-2 text-left hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-45"
								>
									Import selected valid rows ({validSelectedRows.length})
								</button>
							</div>
						) : null}
					</div>
				</div>
			}
		>
			<div className="flex h-full min-h-0 flex-col gap-3">
				{importError ? (
					<div className="flex gap-2 rounded-md border border-coralpink/25 bg-coralpink/8 px-3 py-2 text-sm font-medium text-coralpink">
						<AlertCircle
							className="mt-0.5 h-4 w-4 shrink-0"
							aria-hidden="true"
						/>
						<span>{importError}</span>
					</div>
				) : null}

				<div
					tabIndex={0}
					onPaste={(event) => {
						const target = event.target;

						if (
							target instanceof HTMLInputElement ||
							target instanceof HTMLSelectElement ||
							target instanceof HTMLTextAreaElement
						) {
							return;
						}

						const text = event.clipboardData.getData("text");

						if (text.trim()) {
							event.preventDefault();
							pasteIntoPreviewGrid(text);
						}
					}}
					className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-darknavy/10 outline-none focus:ring-2 focus:ring-skyblue/15"
					aria-label="Import preview grid. Paste copied Excel rows here."
				>
					<div className="min-h-36 flex-1 overflow-auto">
						<table
							className="table-fixed text-left text-sm text-darknavy"
							style={{ width: `max(100%, ${importTableWidth}px)` }}
						>
							<colgroup>
								<col style={{ width: 64 }} />
								{ImportFieldOrder.map((field) => (
									<col key={field} style={{ width: columnWidths[field] }} />
								))}
							</colgroup>
							<thead className="text-xs uppercase text-darknavy/55">
								<tr>
									<th
										ref={selectionMenuRef}
										className="module-import-preview-header sticky left-0 top-0 z-40 w-16 px-2 py-2"
									>
										<input
											type="checkbox"
											checked={selectedRowIds.size > 0}
											readOnly
											disabled={visibleRows.length === 0 || Boolean(progress)}
											onClick={(event) => {
												event.preventDefault();
												setIsSelectionMenuOpen((isOpen) => !isOpen);
											}}
											aria-label="Choose rows to select"
											title="Choose rows to select"
											className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20 disabled:opacity-45"
										/>
										{isSelectionMenuOpen ? (
											<div
												role="menu"
												className="absolute left-2 top-full z-50 mt-1 w-48 overflow-hidden rounded-md border border-darknavy/10 bg-white py-1 text-left text-xs font-semibold normal-case text-darknavy shadow-lg"
											>
												<button
													type="button"
													role="menuitem"
													onClick={() => selectRows("page")}
													className="block w-full px-3 py-2 text-left hover:bg-skyblue/8"
												>
													Select current page
												</button>
												<button
													type="button"
													role="menuitem"
													onClick={() => selectRows("all")}
													className="block w-full px-3 py-2 text-left hover:bg-skyblue/8"
												>
													Select all records
												</button>
												{selectedRowIds.size > 0 ? (
													<button
														type="button"
														role="menuitem"
														onClick={clearRowSelection}
														className="block w-full border-t border-darknavy/8 px-3 py-2 text-left text-coralpink hover:bg-coralpink/8"
													>
														Clear selection
													</button>
												) : null}
											</div>
										) : null}
									</th>
									<ModuleImportResizableColumnHeader
										className="z-40 px-3"
										left={64}
										width={columnWidths.name}
										onResize={(width) => updateColumnWidth("name", width)}
									>
										Name
									</ModuleImportResizableColumnHeader>
									<ModuleImportResizableColumnHeader
										className="px-3"
										width={columnWidths.datemode}
										onResize={(width) => updateColumnWidth("datemode", width)}
									>
										Datemode
									</ModuleImportResizableColumnHeader>
									<ModuleImportResizableColumnHeader
										className="px-3"
										width={columnWidths.period}
										onResize={(width) => updateColumnWidth("period", width)}
									>
										Period
									</ModuleImportResizableColumnHeader>
								</tr>
							</thead>
							<tbody className="divide-y divide-darknavy/8 bg-white">
								{visibleRows.length > 0 ? (
									visibleRows.map((row) => (
										<TermImportPreviewTableRow
											key={row.id}
											row={row}
											isSelected={selectedRowIds.has(row.id)}
											onUpdateCell={updatePreviewCell}
											onPasteCell={pasteIntoPreviewCell}
											onToggleSelected={toggleRowSelection}
										/>
									))
								) : (
									<tr>
										<td
											colSpan={4}
											className="px-3 py-10 text-center text-sm font-medium text-darknavy/45"
										>
											Upload a file, or focus here and paste copied Excel rows.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
					<div className="grid grid-cols-2 items-center gap-2 border-t border-darknavy/10 px-3 py-2 sm:grid-cols-[1fr_auto_1fr]">
						<span className="text-xs font-semibold text-darknavy/55">
							Page {safePreviewPage} of {totalPages}
						</span>
						{selectedRowIds.size > 0 ? (
							<span className="col-span-2 row-start-2 justify-self-center text-xs font-semibold text-skyblue sm:col-span-1 sm:row-auto">
								{selectedRowIds.size} of {validatedRows.length} selected
							</span>
						) : (
							<span className="hidden sm:block" />
						)}
						<div className="flex flex-wrap justify-self-end gap-2">
							<button
								type="button"
								disabled={selectedRowIds.size === 0 || Boolean(progress)}
								onClick={removeSelectedRows}
								className="inline-flex h-8 items-center gap-1 rounded-md border border-coralpink/25 px-2 text-xs font-semibold text-coralpink transition hover:bg-coralpink/8 disabled:cursor-not-allowed disabled:opacity-45"
							>
								<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
								{selectedRowIds.size > 0
									? `Remove ${selectedRowIds.size} ${selectedRowIds.size === 1 ? "Row" : "Rows"}`
									: "Remove Row"}
							</button>
							<button
								type="button"
								disabled={safePreviewPage <= 1}
								onClick={() => setPreviewPage((page) => Math.max(1, page - 1))}
								className="inline-flex h-8 items-center gap-1 rounded-md border border-darknavy/10 px-2 text-xs font-semibold text-darknavy disabled:cursor-not-allowed disabled:opacity-45"
							>
								<ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
								Prev
							</button>
							<button
								type="button"
								disabled={safePreviewPage >= totalPages}
								onClick={() =>
									setPreviewPage((page) => Math.min(totalPages, page + 1))
								}
								className="inline-flex h-8 items-center gap-1 rounded-md border border-darknavy/10 px-2 text-xs font-semibold text-darknavy disabled:cursor-not-allowed disabled:opacity-45"
							>
								Next
								<ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</ModuleImportDialog>
	);
}
