"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	AlertCircle,
	AlertTriangle,
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
import {
	TermManagementDatemodeOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type {
	TermManagement,
	TermManagementDatemode,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import { ClickOrDragDropFile } from "@/app/src/ui/shared/module/ClickOrDragDropFile";
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type TermImportColumnId = "name" | "datemode" | "period";
type TermImportCellErrors = Partial<Record<TermImportColumnId, string[]>>;
type TermImportCellWarnings = Partial<Record<TermImportColumnId, string[]>>;

type TermImportPreviewRow = {
	cellErrors: TermImportCellErrors;
	cellWarnings: TermImportCellWarnings;
	id: string;
	rowErrors: string[];
	rowNumber: number;
	term: Omit<TermManagement, "id">;
};

type ImportProgress = {
	imported: number;
	total: number;
};
type TermImportMode = "all-valid" | "selected-valid";

const TemplateHeaders = ["Name", "Datemode", "Period"];
const DefaultColumnIndexes: Record<TermImportColumnId, number> = {
	name: 0,
	datemode: 1,
	period: 2,
};
const ImportFieldOrder: TermImportColumnId[] = ["name", "datemode", "period"];
const PreviewPageSize = 10;
const ImportBatchSize = 25;
const MinImportFileSizeBytes = 1;
const MaxImportFileSizeBytes = 2 * 1024 * 1024;

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
	const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
	const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
	const [importMode, setImportMode] = useState<TermImportMode>("all-valid");
	const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(
		() => new Set(),
	);
	const selectionMenuRef = useRef<HTMLTableCellElement>(null);
	const importMenuRef = useRef<HTMLDivElement>(null);
	const existingTermNames = useMemo(
		() => new Map(
			existingTerms.map((term) => [normalizeTermName(term.name), term.name]),
		),
		[existingTerms],
	);
	const validatedRows = useMemo(
		() => validateTermImportRows(previewRows, existingTermNames),
		[existingTermNames, previewRows],
	);
	const invalidRows = validatedRows.filter((row) => rowHasErrors(row));
	const validRows = validatedRows.filter((row) => !rowHasErrors(row));
	const validSelectedRows = validRows.filter((row) => selectedRowIds.has(row.id));
	const importableRows =
		importMode === "selected-valid" ? validSelectedRows : validRows;
	const canImport = importableRows.length > 0 && !progress;
	const canImportAllValid = validRows.length > 0 && !progress;
	const canImportSelectedValid = validSelectedRows.length > 0 && !progress;
	const totalPages = Math.max(1, Math.ceil(validatedRows.length / PreviewPageSize));
	const safePreviewPage = Math.min(previewPage, totalPages);
	const visibleRows = validatedRows.slice(
		(safePreviewPage - 1) * PreviewPageSize,
		safePreviewPage * PreviewPageSize,
	);
	const progressPercent =
		progress && progress.total > 0
			? Math.round((progress.imported / progress.total) * 100)
			: 0;

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
		setSelectedRowIds(new Set());
		setIsSelectionMenuOpen(false);
		setIsImportMenuOpen(false);
	}

	function previewImportText(text: string, append = false) {
		try {
			let skippedCount = 0;

			if (append) {
				const parsedRows = parseTermImportText(
					text,
					getNextImportRowNumber(previewRows),
				);
				const filteredRows = removeDuplicateImportRows(
					parsedRows,
					previewRows,
				);
				const uniqueRows = filteredRows.rows;
				const nextRows = renumberImportRows([...previewRows, ...uniqueRows]);

				skippedCount = filteredRows.skippedCount;
				setPreviewRows(nextRows);
				setSelectedRowIds(new Set());
				setPreviewPage(
					Math.max(1, Math.ceil(nextRows.length / PreviewPageSize)),
				);
			} else {
				const parsedRows = parseTermImportText(text);
				const filteredRows = removeDuplicateImportRows(
					parsedRows,
					[],
				);
				const uniqueRows = filteredRows.rows;

				skippedCount = filteredRows.skippedCount;
				setPreviewRows(renumberImportRows(uniqueRows));
				setPreviewPage(1);
				setSelectedRowIds(new Set());
			}

			setImportError(
				skippedCount > 0
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
		setPreviewRows((rows) => [
			...rows,
			createBlankImportRow(getNextImportRowNumber(rows)),
		]);
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

		setPreviewRows(nextRows);
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
		const rowsToImport = mode === "selected-valid" ? validSelectedRows : validRows;

		if (mode === "selected-valid" && selectedRowIds.size === 0) {
			setImportError("Select at least one valid row to import.");
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
		const termsToImport = rowsToImport.map((row, index) => ({
			...row.term,
			id: `term-import-${Date.now()}-${index}`,
		}));

		setProgress({ imported: 0, total: termsToImport.length });

		for (let index = 0; index < termsToImport.length; index += ImportBatchSize) {
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
		setSelectedRowIds((current) => {
			const nextSelected = new Set(current);

			importedRowIds.forEach((rowId) => nextSelected.delete(rowId));

			return nextSelected;
		});
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
							Accepted: .xlsx, .csv, .tsv, .txt. Maximum size: 2 MB.
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
							<span>Valid: {validatedRows.length - invalidRows.length}</span>
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
								<LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
							) : (
								<Upload className="h-4 w-4" aria-hidden="true" />
							)}
							{importMode === "selected-valid"
								? "Import Selected"
								: "Import Data"}
						</button>
						<button
							type="button"
							onClick={() => setIsImportMenuOpen((isOpen) => !isOpen)}
							disabled={!canImportAllValid && !canImportSelectedValid}
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
									onClick={() => setImportSelection("all-valid")}
									disabled={!canImportAllValid}
									className="block w-full px-3 py-2 text-left hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-45"
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
						<table className="w-full min-w-[44rem] text-left text-sm text-darknavy">
							<thead className="text-xs uppercase text-darknavy/55">
								<tr>
									<th ref={selectionMenuRef} className="sticky left-0 top-0 z-40 w-16 bg-slate-50 px-2 py-2">
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
												<button type="button" role="menuitem" onClick={() => selectRows("page")} className="block w-full px-3 py-2 text-left hover:bg-skyblue/8">
													Select current page
												</button>
												<button type="button" role="menuitem" onClick={() => selectRows("all")} className="block w-full px-3 py-2 text-left hover:bg-skyblue/8">
													Select all records
												</button>
												{selectedRowIds.size > 0 ? (
													<button type="button" role="menuitem" onClick={clearRowSelection} className="block w-full border-t border-darknavy/8 px-3 py-2 text-left text-coralpink hover:bg-coralpink/8">
														Clear selection
													</button>
												) : null}
											</div>
										) : null}
									</th>
									<th className="sticky left-16 top-0 z-40 min-w-56 bg-slate-50 px-3 py-2">Name</th>
									<th className="sticky top-0 z-30 w-40 bg-slate-50 px-3 py-2">Datemode</th>
									<th className="sticky top-0 z-30 w-32 bg-slate-50 px-3 py-2">Period</th>
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

function TermImportPreviewTableRow({
	row,
	isSelected,
	onUpdateCell,
	onPasteCell,
	onToggleSelected,
}: {
	row: TermImportPreviewRow;
	isSelected: boolean;
	onUpdateCell: (
		rowId: string,
		field: TermImportColumnId,
		value: string,
	) => void;
	onPasteCell: (
		rowId: string,
		field: TermImportColumnId,
		text: string,
	) => void;
	onToggleSelected: (rowId: string, isSelected: boolean) => void;
}) {
	const stickyCellBackground = isSelected
		? "bg-skyblue/10"
		: rowHasErrors(row)
		? "bg-coralpink/[0.025]"
		: "bg-white";

	return (
		<>
			<tr
				className={
					isSelected
						? "bg-skyblue/10"
						: rowHasErrors(row)
							? "bg-coralpink/[0.025]"
							: undefined
				}
			>
				<td
					className={joinClasses(
						"sticky left-0 z-10 w-16 px-2 py-2 align-top font-semibold",
						stickyCellBackground,
					)}
				>
					<div className="flex items-center gap-2">
						<input
						type="checkbox"
						checked={isSelected}
						onClick={(event) => event.stopPropagation()}
						onChange={(event) =>
							onToggleSelected(row.id, event.target.checked)
						}
						aria-label={`Select row ${row.rowNumber}`}
						className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
						/>
						<button
							type="button"
							onClick={() => onToggleSelected(row.id, !isSelected)}
							className="rounded px-0.5 text-left hover:text-skyblue focus:outline-none focus:ring-2 focus:ring-skyblue/20"
							aria-label={`${isSelected ? "Deselect" : "Select"} row ${row.rowNumber}`}
						>
							{row.rowNumber}
						</button>
					</div>
				</td>
				<td
					className={joinClasses(
						"sticky left-16 z-10 min-w-56 px-3 py-2 align-top",
						stickyCellBackground,
					)}
				>
					<EditableImportCell
						value={row.term.name}
						errors={row.cellErrors.name}
						warnings={row.cellWarnings.name}
						onChange={(value) => onUpdateCell(row.id, "name", value)}
						onPaste={(text) => onPasteCell(row.id, "name", text)}
					/>
				</td>
				<td className="px-3 py-2 align-top">
					<EditableImportSelect
						value={row.term.datemode}
						errors={row.cellErrors.datemode}
						warnings={row.cellWarnings.datemode}
						options={TermManagementDatemodeOptions}
						onChange={(value) => onUpdateCell(row.id, "datemode", value)}
						onPaste={(text) => onPasteCell(row.id, "datemode", text)}
					/>
				</td>
				<td className="px-3 py-2 align-top">
					<EditableImportCell
						type="number"
						value={row.term.period}
						errors={row.cellErrors.period}
						warnings={row.cellWarnings.period}
						onChange={(value) => onUpdateCell(row.id, "period", value)}
						onPaste={(text) => onPasteCell(row.id, "period", text)}
					/>
				</td>
			</tr>
			{row.rowErrors.length > 0 ? (
				<tr className={isSelected ? "bg-skyblue/10" : "bg-coralpink/[0.025]"}>
					<td />
					<td colSpan={3} className="px-3 pb-3 text-xs font-semibold text-coralpink">
						{row.rowErrors.join(" ")}
					</td>
				</tr>
			) : null}
		</>
	);
}

function EditableImportCell({
	errors,
	warnings,
	type = "text",
	value,
	onChange,
	onPaste,
}: {
	errors?: string[];
	warnings?: string[];
	type?: "number" | "text";
	value: string;
	onChange: (value: string) => void;
	onPaste: (text: string) => void;
}) {
	const messages = [...(errors ?? []), ...(warnings ?? [])];

	return (
		<label className="relative block">
			<input
				type={type}
				min={type === "number" ? 0 : undefined}
				value={value}
				onChange={(event) => {
					const nextValue = event.target.value;

					if (type === "number" && nextValue.trim() && Number(nextValue) < 0) {
						return;
					}

					onChange(nextValue);
				}}
				onKeyDown={(event) => {
					if (
						type === "number" &&
						["-", "+", ".", "e", "E"].includes(event.key)
					) {
						event.preventDefault();
					}
				}}
				onPaste={(event) => {
					const text = event.clipboardData.getData("text");

					if (
						type === "number" &&
						!isTabularPaste(text) &&
						!/^\d+$/.test(text.trim())
					) {
						event.preventDefault();
						return;
					}

					if (isTabularPaste(text)) {
						event.preventDefault();
						onPaste(text);
					}
				}}
				onWheel={(event) => {
					if (type === "number") {
						event.currentTarget.blur();
					}
				}}
				title={messages.join(" ")}
				className={joinClasses(
					"h-10 w-full rounded-md border bg-white px-2 text-sm font-medium text-darknavy outline-none transition focus:ring-2",
					messages.length ? "pr-9" : "",
					errors?.length
						? "border-coralpink/45 focus:border-coralpink focus:ring-coralpink/15"
						: warnings?.length
							? "border-amber-400/70 focus:border-amber-500 focus:ring-amber-500/15"
						: "border-darknavy/12 focus:border-skyblue focus:ring-skyblue/15",
				)}
			/>
			<CellIssueIcon errors={errors} warnings={warnings} />
		</label>
	);
}

function EditableImportSelect<TOption extends string>({
	errors,
	warnings,
	options,
	value,
	onChange,
	onPaste,
}: {
	errors?: string[];
	warnings?: string[];
	options: readonly TOption[];
	value: string;
	onChange: (value: string) => void;
	onPaste: (text: string) => void;
}) {
	const messages = [...(errors ?? []), ...(warnings ?? [])];

	return (
		<label className="relative block">
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onPaste={(event) => {
					const text = event.clipboardData.getData("text");

					if (text.trim()) {
						event.preventDefault();
						onPaste(text);
					}
				}}
				title={messages.join(" ")}
				className={joinClasses(
					"h-10 w-full rounded-md border bg-white px-2 text-sm font-medium text-darknavy outline-none transition focus:ring-2",
					messages.length ? "pr-9" : "",
					errors?.length
						? "border-coralpink/45 focus:border-coralpink focus:ring-coralpink/15"
						: warnings?.length
							? "border-amber-400/70 focus:border-amber-500 focus:ring-amber-500/15"
							: "border-darknavy/12 focus:border-skyblue focus:ring-skyblue/15",
				)}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			<CellIssueIcon errors={errors} warnings={warnings} />
		</label>
	);
}

function CellIssueIcon({
	errors,
	warnings,
}: {
	errors?: string[];
	warnings?: string[];
}) {
	const messages = [...(errors ?? []), ...(warnings ?? [])];

	if (messages.length === 0) {
		return null;
	}

	const hasErrors = Boolean(errors?.length);

	return (
		<span
			className={joinClasses(
				"absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border bg-white",
				hasErrors
					? "border-coralpink/45 text-coralpink"
					: "border-amber-400/70 text-amber-600",
			)}
			title={messages.join(" ")}
			aria-label={messages.join(" ")}
		>
			<AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
		</span>
	);
}

function createBlankImportRow(rowNumber: number): TermImportPreviewRow {
	return {
		cellErrors: {},
		cellWarnings: {},
		id: `term-import-preview-${rowNumber}-${Date.now()}`,
		rowErrors: [],
		rowNumber,
		term: {
			name: "",
			description: "",
			datemode: "Month",
			period: "",
			status: "Active",
		},
	};
}

function renumberImportRows(rows: TermImportPreviewRow[]) {
	return rows.map((row, index) => ({
		...row,
		rowNumber: index + 1,
	}));
}

function removeDuplicateImportRows(
	rows: TermImportPreviewRow[],
	baseRows: TermImportPreviewRow[],
) {
	const seenNames = new Set(
		baseRows.map((row) => normalizeTermName(row.term.name)).filter(Boolean),
	);
	const uniqueRows: TermImportPreviewRow[] = [];
	let skippedCount = 0;

	rows.forEach((row) => {
		const normalizedName = normalizeTermName(row.term.name);

		if (normalizedName && seenNames.has(normalizedName)) {
			skippedCount += 1;
			return;
		}

		if (normalizedName) {
			seenNames.add(normalizedName);
		}
		uniqueRows.push(row);
	});

	return {
		rows: uniqueRows,
		skippedCount,
	};
}

function getNextImportRowNumber(rows: TermImportPreviewRow[]) {
	return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

function normalizeImportedCellValue(field: TermImportColumnId, value: string) {
	if (field === "datemode") {
		return normalizeImportedDatemode(value);
	}

	return value;
}

function isTabularPaste(text: string) {
	return text.includes("\t") || text.includes("\n") || text.includes("\r");
}

async function downloadTermImportTemplate() {
	try {
		const ExcelJS = await import("exceljs");
		const workbook = new ExcelJS.default.Workbook();
		const worksheet = workbook.addWorksheet("Terms");

		worksheet.addRow(TemplateHeaders);
		for (let rowNumber = 2; rowNumber <= 101; rowNumber += 1) {
			worksheet.getCell(`B${rowNumber}`).dataValidation = {
				allowBlank: false,
				formulae: [`"${TermManagementDatemodeOptions.join(",")}"`],
				showErrorMessage: true,
				type: "list",
			};
		}
		worksheet.columns = [
			{ width: 28 },
			{ width: 14 },
			{ width: 12 },
		];

		const buffer = await workbook.xlsx.writeBuffer();

		downloadBlob(
			new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			}),
			"term-management-import-template.xlsx",
		);
	} catch {
		downloadBlob(
			new Blob([createTermImportTemplateCsv()], {
				type: "text/csv;charset=utf-8",
			}),
			"term-management-import-template.csv",
		);
	}
}

function createTermImportTemplateCsv() {
	return [TemplateHeaders]
		.map((row) =>
			row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
		)
		.join("\n");
}

async function readTermImportFileText(file: File) {
	const fileName = file.name.toLowerCase();

	if (fileName.endsWith(".xlsx")) {
		const rows = await readTermImportXlsxRows(await file.arrayBuffer());

		return formatTermImportRowsAsText(rows);
	}

	if (
		fileName.endsWith(".csv") ||
		fileName.endsWith(".tsv") ||
		fileName.endsWith(".txt")
	) {
		return (await file.text()).trim();
	}

	throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

async function readTermImportXlsxRows(buffer: ArrayBuffer) {
	const ExcelJS = await import("exceljs");
	const workbook = new ExcelJS.default.Workbook();

	await workbook.xlsx.load(buffer);

	const worksheet = workbook.worksheets[0];

	if (!worksheet) {
		throw new Error("No worksheet was found in the Excel file.");
	}

	const rows: string[][] = [];

	worksheet.eachRow({ includeEmpty: false }, (row) => {
		const cells: string[] = [];

		row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
			cells[columnNumber - 1] = formatTermImportExcelCellValue(
				cell.value,
				cell.text,
			);
		});
		rows.push(cells);
	});

	return rows;
}

function parseTermImportText(
	text: string,
	startRowNumber = 1,
): TermImportPreviewRow[] {
	const rows = parseTermImportTabularRows(text).filter((row) =>
		row.some((cell) => cell.trim() !== ""),
	);

	if (rows.length === 0) {
		return [];
	}

	const headerIndexes = getTermImportHeaderIndexes(rows[0]);
	const indexes = headerIndexes ?? DefaultColumnIndexes;
	const dataRows = headerIndexes ? rows.slice(1) : rows;
	const importBatchId = Date.now();

	return dataRows
		.filter((row) => row.some((cell) => cell.trim() !== ""))
		.map((row, index) => {
			const rowNumber = startRowNumber + index;
			const term = {
				name: getImportedTermValue(row, indexes.name),
				description: "",
				datemode: normalizeImportedDatemode(
					getImportedTermValue(row, indexes.datemode),
				),
				period: getImportedTermValue(row, indexes.period),
				status: "Active" as const,
			};

			return {
				cellErrors: {},
				cellWarnings: {},
				id: `term-import-preview-${rowNumber}-${importBatchId}-${index}`,
				rowErrors: [],
				rowNumber,
				term,
			};
		});
}

function validateTermImportRows(
	rows: TermImportPreviewRow[],
	existingTermNames: Map<string, string>,
) {
	const importedNameCounts = new Map<string, number>();

	rows.forEach((row) => {
		const normalizedName = normalizeTermName(row.term.name);

		if (normalizedName) {
			importedNameCounts.set(
				normalizedName,
				(importedNameCounts.get(normalizedName) ?? 0) + 1,
			);
		}
	});

	return rows.map((row) => {
		const cellErrors: TermImportCellErrors = {};
		const cellWarnings: TermImportCellWarnings = {};
		const rowErrors: string[] = [];
		const normalizedName = normalizeTermName(row.term.name);
		const periodNumber = Number(row.term.period);

		if (!row.term.name.trim()) {
			cellErrors.name = ["Name is required."];
		}

		const existingTermName = existingTermNames.get(normalizedName);

		if (existingTermName) {
			cellErrors.name = [
				...(cellErrors.name ?? []),
				`Term already exists: ${existingTermName}.`,
			];
		}

		if (!TermManagementDatemodeOptions.includes(row.term.datemode)) {
			cellErrors.datemode = ["Datemode must be Day, Month, or Year."];
		}

		if (
			!row.term.period.trim() ||
			!Number.isFinite(periodNumber) ||
			periodNumber < 0
		) {
			cellErrors.period = ["Period must be 0 or greater."];
		} else if (!Number.isInteger(periodNumber)) {
			cellErrors.period = ["Period must be a whole number."];
		} else if (periodNumber === 0) {
			cellWarnings.period = [
				"Period is 0. Import only if this term should not add time.",
			];
		}

		if (normalizedName && (importedNameCounts.get(normalizedName) ?? 0) > 1) {
			cellErrors.name = [
				...(cellErrors.name ?? []),
				"Duplicate name in import.",
			];
		}

		return { ...row, cellErrors, cellWarnings, rowErrors };
	});
}

function rowHasErrors(row: TermImportPreviewRow) {
	return (
		row.rowErrors.length > 0 ||
		Object.values(row.cellErrors).some((errors) => Boolean(errors?.length))
	);
}

function validateImportFileSize(file: File) {
	if (file.size < MinImportFileSizeBytes) {
		return `Upload a file larger than ${formatFileSize(MinImportFileSizeBytes)}.`;
	}

	if (file.size > MaxImportFileSizeBytes) {
		return `Upload a file up to ${formatFileSize(MaxImportFileSizeBytes)}.`;
	}

	return null;
}

function formatFileSize(bytes: number) {
	if (bytes < 1024) {
		return `${bytes} B`;
	}

	const kilobytes = bytes / 1024;

	if (kilobytes < 1024) {
		return `${kilobytes.toFixed(kilobytes >= 10 ? 0 : 1)} KB`;
	}

	const megabytes = kilobytes / 1024;

	return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

function parseTermImportTabularRows(text: string) {
	const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	return normalizedText.includes("\t")
		? normalizedText
			.split("\n")
			.map((line) => line.split("\t").map((cell) => cell.trim()))
		: parseTermImportCsvRows(normalizedText);
}

function parseTermImportCsvRows(text: string) {
	const rows: string[][] = [];
	let cell = "";
	let row: string[] = [];
	let isQuoted = false;

	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		const nextChar = text[index + 1];

		if (char === '"' && isQuoted && nextChar === '"') {
			cell += '"';
			index += 1;
			continue;
		}

		if (char === '"') {
			isQuoted = !isQuoted;
			continue;
		}

		if (char === "," && !isQuoted) {
			row.push(cell.trim());
			cell = "";
			continue;
		}

		if (char === "\n" && !isQuoted) {
			row.push(cell.trim());
			rows.push(row);
			row = [];
			cell = "";
			continue;
		}

		cell += char;
	}

	row.push(cell.trim());
	rows.push(row);

	return rows;
}

function getTermImportHeaderIndexes(row: string[]) {
	const indexes: Partial<Record<TermImportColumnId, number>> = {};

	row.forEach((cell, index) => {
		const key = normalizeTermImportHeader(cell);

		if (key) {
			indexes[key] = index;
		}
	});

	return Object.keys(indexes).length >= 2 ? indexes : null;
}

function normalizeTermImportHeader(value: string): TermImportColumnId | null {
	const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

	if (["name", "term", "termname"].includes(normalized)) {
		return "name";
	}

	if (["datemode", "datebasis", "mode"].includes(normalized)) {
		return "datemode";
	}

	if (["period", "termperiod", "duration"].includes(normalized)) {
		return "period";
	}

	return null;
}

function getImportedTermValue(row: string[], index?: number) {
	return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

function normalizeImportedDatemode(value: string): TermManagementDatemode {
	const normalized = value.trim().toLowerCase();

	if (normalized === "day" || normalized === "days") {
		return "Day";
	}

	if (normalized === "month" || normalized === "months") {
		return "Month";
	}

	if (normalized === "year" || normalized === "years") {
		return "Year";
	}

	return value as TermManagementDatemode;
}

function normalizeTermName(value: string) {
	return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function formatTermImportRowsAsText(rows: string[][]) {
	return rows
		.filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
		.map((row) =>
			row
				.map((cell) => String(cell ?? "").replace(/\r?\n/g, " ").trim())
				.join("\t"),
		)
		.join("\n");
}

function formatTermImportExcelCellValue(value: unknown, displayText?: string) {
	const normalizedDisplayText = String(displayText ?? "")
		.replace(/\r?\n/g, " ")
		.trim();

	if (normalizedDisplayText) {
		return normalizedDisplayText;
	}

	if (value == null) {
		return "";
	}

	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}

	if (typeof value === "object" && value !== null) {
		const record = value as Record<string, unknown>;

		if (Array.isArray(record.richText)) {
			return record.richText
				.map((part) =>
					typeof part === "object" && part !== null
						? String((part as Record<string, unknown>).text ?? "")
						: "",
				)
				.join("")
				.replace(/\r?\n/g, " ")
				.trim();
		}

		if ("text" in record) {
			return String(record.text ?? "").replace(/\r?\n/g, " ").trim();
		}

		if ("result" in record) {
			return formatTermImportExcelCellValue(record.result);
		}
	}

	return String(value).replace(/\r?\n/g, " ").trim();
}

function waitForNextImportBatch() {
	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, 75);
	});
}
