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
import type {
	BankMasterfile,
	BankMasterfileFormValues,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import { ClickOrDragDropFile } from "@/app/src/ui/shared/module/ClickOrDragDropFile";
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";

import {
	ImportBatchSize,
	PreviewPageSize,
	TemplateHeaders,
} from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import type {
	BankImportColumnId,
	BankImportPreviewRow,
	ImportMode,
	ImportProgress,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import { BankImportRow } from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileImportPreviewTableRow";
import {
	cleanBankValues,
	createBlankRow,
	downloadBankImportTemplate,
	getNextRowNumber,
	getPreviewRowContentKey,
	normalizeCellValue,
	parseBankImportRows,
	parseTabularText,
	readBankImportFile,
	renumberRows,
	rowHasErrors,
	validateBankImportRows,
	validateImportFileSize,
	waitForNextBatch,
} from "@/app/src/data/modules/maintenance/financial-management/bank-masterfile/BankMasterfileData";

export function BankMasterfileImportDialog({
	existingBanks,
	isOpen,
	onClose,
	onImportBanks,
}: {
	existingBanks: BankMasterfile[];
	isOpen: boolean;
	onClose: () => void;
	onImportBanks: (
		banks: BankMasterfileFormValues[],
	) => Promise<BankMasterfile[]>;
}) {
	const [importError, setImportError] = useState<string | null>(null);
	const [isParsing, setIsParsing] = useState(false);
	const [previewRows, setPreviewRows] = useState<BankImportPreviewRow[]>([]);
	const [previewPage, setPreviewPage] = useState(1);
	const [progress, setProgress] = useState<ImportProgress | null>(null);
	const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
	const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
	const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(
		() => new Set(),
	);
	const [importMode, setImportMode] = useState<ImportMode>("all-valid");
	const selectionMenuRef = useRef<HTMLTableCellElement>(null);
	const importMenuRef = useRef<HTMLDivElement>(null);
	const validatedRows = useMemo(
		() => validateBankImportRows(previewRows, existingBanks),
		[existingBanks, previewRows],
	);
	const invalidRows = validatedRows.filter(rowHasErrors);
	const validRows = validatedRows.filter((row) => !rowHasErrors(row));
	const validSelectedRows = validRows.filter((row) =>
		selectedRowIds.has(row.id),
	);
	const importableRows =
		importMode === "selected-valid" ? validSelectedRows : validRows;
	const totalPages = Math.max(
		1,
		Math.ceil(validatedRows.length / PreviewPageSize),
	);
	const safePreviewPage = Math.min(previewPage, totalPages);
	const visibleRows = validatedRows.slice(
		(safePreviewPage - 1) * PreviewPageSize,
		safePreviewPage * PreviewPageSize,
	);
	const progressPercent = progress
		? Math.round((progress.imported / progress.total) * 100)
		: 0;
	const isBusy = Boolean(progress) || isParsing;
	const canImport = importableRows.length > 0 && !isBusy;
	const canImportAllValid = validRows.length > 0 && !isBusy;
	const canImportSelectedValid = validSelectedRows.length > 0 && !isBusy;

	useEffect(() => {
		if (!isSelectionMenuOpen) return;

		function closeSelectionMenu(event: PointerEvent) {
			if (
				event.target instanceof Node &&
				!selectionMenuRef.current?.contains(event.target)
			) {
				setIsSelectionMenuOpen(false);
			}
		}

		function closeSelectionMenuOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") setIsSelectionMenuOpen(false);
		}

		document.addEventListener("pointerdown", closeSelectionMenu);
		document.addEventListener("keydown", closeSelectionMenuOnEscape);

		return () => {
			document.removeEventListener("pointerdown", closeSelectionMenu);
			document.removeEventListener("keydown", closeSelectionMenuOnEscape);
		};
	}, [isSelectionMenuOpen]);

	useEffect(() => {
		if (!isImportMenuOpen) return;

		function closeImportMenu(event: PointerEvent) {
			if (
				event.target instanceof Node &&
				!importMenuRef.current?.contains(event.target)
			) {
				setIsImportMenuOpen(false);
			}
		}

		function closeImportMenuOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") setIsImportMenuOpen(false);
		}

		document.addEventListener("pointerdown", closeImportMenu);
		document.addEventListener("keydown", closeImportMenuOnEscape);

		return () => {
			document.removeEventListener("pointerdown", closeImportMenu);
			document.removeEventListener("keydown", closeImportMenuOnEscape);
		};
	}, [isImportMenuOpen]);

	function resetImportState() {
		if (progress) return;

		setImportError(null);
		setPreviewRows([]);
		setPreviewPage(1);
		setSelectedRowIds(new Set());
		setImportMode("all-valid");
		setIsSelectionMenuOpen(false);
		setIsImportMenuOpen(false);
	}

	function closeDialog() {
		if (progress) return;
		resetImportState();
		onClose();
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

	function addBlankRow() {
		const nextRows = [
			...previewRows,
			createBlankRow(getNextRowNumber(previewRows)),
		];

		setPreviewRows(nextRows);
		setPreviewPage(Math.ceil(nextRows.length / PreviewPageSize));
		setImportError(null);
	}

	function updateCell(
		rowId: string,
		field: BankImportColumnId,
		value: string | boolean,
	) {
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

	function setImportSelection(mode: ImportMode) {
		setImportMode(mode);
		setIsImportMenuOpen(false);
	}

	function removeSelectedRows() {
		const nextRows = renumberRows(
			previewRows.filter((row) => !selectedRowIds.has(row.id)),
		);

		setPreviewRows(nextRows);
		setSelectedRowIds(new Set());
		setPreviewPage((page) =>
			Math.max(1, Math.min(page, Math.ceil(nextRows.length / PreviewPageSize))),
		);
	}

	async function handleImport() {
		if (!canImport) return;

		const rows = importableRows;
		const importedIds = new Set(rows.map((row) => row.id));
		setProgress({ imported: 0, total: rows.length });
		setImportError(null);

		try {
			for (let index = 0; index < rows.length; index += ImportBatchSize) {
				const batch = rows.slice(index, index + ImportBatchSize);
				await onImportBanks(batch.map((row) => cleanBankValues(row.values)));
				setProgress({
					imported: Math.min(index + batch.length, rows.length),
					total: rows.length,
				});
				await waitForNextBatch();
			}

			toast.success(
				`${rows.length} bank ${rows.length === 1 ? "account" : "accounts"} imported.`,
			);
			const nextRows = renumberRows(
				previewRows.filter((row) => !importedIds.has(row.id)),
			);
			setPreviewRows(nextRows);
			setSelectedRowIds(new Set());
			setPreviewPage(1);
			setImportMode("all-valid");

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

	return (
		<ModuleImportDialog
			isOpen={isOpen}
			isBusy={Boolean(progress)}
			title="Import Data"
			titleId="bank-masterfile-import-title"
			description="Upload, validate, edit, and import bank accounts in queued batches."
			onClose={closeDialog}
			actions={
				<div className="grid gap-3 lg:grid-cols-[minmax(18rem,1fr)_auto]">
					<ClickOrDragDropFile
						accept=".xlsx,.csv,.tsv,.txt"
						acceptedFileLabel=".xlsx, .csv, .tsv, .txt"
						className="inline-flex min-h-20 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-skyblue/35 bg-skyblue/8 px-4 py-3 text-center text-sm font-semibold text-skyblue transition hover:bg-skyblue/12"
						disabled={isBusy}
						isBusy={isParsing}
						label="Upload or Drag and Drop Files"
						size="medium"
						stackable
						onFileSelect={(file) => void handleFileUpload(file)}
					/>
					<div className="grid grid-cols-2 gap-2 lg:flex lg:items-start">
						<button
							type="button"
							onClick={() => void downloadBankImportTemplate()}
							disabled={isBusy}
							className={secondaryActionClassName}
						>
							<Download className="h-4 w-4" aria-hidden="true" />
							Template
						</button>
						<button
							type="button"
							onClick={addBlankRow}
							disabled={isBusy}
							className={secondaryActionClassName}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Row
						</button>
					</div>
					<div className="grid gap-2 text-xs font-medium text-darknavy/45 lg:col-span-2 lg:grid-cols-[1fr_auto]">
						<p>Accepted: .xlsx, .csv, .tsv, .txt. Maximum size: 2 MB.</p>
						<div className="flex gap-3 font-semibold text-darknavy/60">
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
						<div className="flex justify-between text-sm font-semibold text-darknavy">
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
						onClick={closeDialog}
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
							onClick={() => void handleImport()}
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
								: "Import Data"}
						</button>
						<button
							type="button"
							onClick={() => setIsImportMenuOpen((open) => !open)}
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
						if (
							event.target instanceof HTMLInputElement ||
							event.target instanceof HTMLSelectElement
						) {
							return;
						}

						const text = event.clipboardData.getData("text");
						if (text.trim()) {
							event.preventDefault();
							pasteRows(text);
						}
					}}
					className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-darknavy/10 outline-none focus:ring-2 focus:ring-skyblue/15"
					aria-label="Bank import preview grid. Paste copied Excel rows here."
				>
					<div className="min-h-36 flex-1 overflow-auto">
						<table className="w-full min-w-[118rem] text-left text-sm text-darknavy">
							<thead className="text-xs uppercase text-darknavy/55">
								<tr>
									<th
										ref={selectionMenuRef}
										className="sticky left-0 top-0 z-40 w-16 bg-slate-50 px-2 py-2"
									>
										<input
											type="checkbox"
											checked={selectedRowIds.size > 0}
											readOnly
											disabled={visibleRows.length === 0 || Boolean(progress)}
											onClick={(event) => {
												event.preventDefault();
												setIsSelectionMenuOpen((open) => !open);
											}}
											aria-label="Choose rows to select"
											title="Choose rows to select"
											className="h-4 w-4 rounded accent-skyblue"
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
									{TemplateHeaders.map((header) => (
										<th
											key={header}
											className="sticky top-0 z-30 min-w-36 bg-slate-50 px-2 py-2"
										>
											{header}
										</th>
									))}
									<th className="sticky top-0 z-30 min-w-52 bg-slate-50 px-2 py-2">
										Validation
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-darknavy/8 bg-white">
								{visibleRows.length > 0 ? (
									visibleRows.map((row) => (
										<BankImportRow
											key={row.id}
											row={row}
											selected={selectedRowIds.has(row.id)}
											disabled={Boolean(progress)}
											onToggle={toggleRow}
											onUpdate={updateCell}
										/>
									))
								) : (
									<tr>
										<td
											colSpan={13}
											className="px-3 py-10 text-center font-medium text-darknavy/45"
										>
											Upload a file, add a row, or paste copied Excel rows here.
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
						<span className="text-center text-xs font-semibold text-skyblue">
							{selectedRowIds.size > 0 ? `${selectedRowIds.size} selected` : ""}
						</span>
						<div className="flex justify-end gap-2">
							<button
								type="button"
								disabled={selectedRowIds.size === 0 || Boolean(progress)}
								onClick={removeSelectedRows}
								className="inline-flex h-8 items-center gap-1 rounded-md border border-coralpink/25 px-2 text-xs font-semibold text-coralpink disabled:opacity-45"
							>
								<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
								Remove
							</button>
							<button
								type="button"
								disabled={safePreviewPage <= 1}
								onClick={() => setPreviewPage((page) => Math.max(1, page - 1))}
								className={pagerActionClassName}
							>
								<ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Prev
							</button>
							<button
								type="button"
								disabled={safePreviewPage >= totalPages}
								onClick={() =>
									setPreviewPage((page) => Math.min(totalPages, page + 1))
								}
								className={pagerActionClassName}
							>
								Next <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</ModuleImportDialog>
	);
}

const secondaryActionClassName =
	"inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-55 lg:w-auto";
const pagerActionClassName =
	"inline-flex h-8 items-center gap-1 rounded-md border border-darknavy/10 px-2 text-xs font-semibold text-darknavy disabled:cursor-not-allowed disabled:opacity-45";
