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
import {
	BankMasterfileAccountTypeOptions,
	BankMasterfileStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import type {
	BankMasterfile,
	BankMasterfileFormValues,
	BankMasterfileStatus,
} from "@/app/src/types/modules/maintenance/financial-management/bank-masterfile/BankMasterfileTypes";
import { ClickOrDragDropFile } from "@/app/src/ui/shared/module/ClickOrDragDropFile";
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type BankImportColumnId = keyof BankMasterfileFormValues;
type BankImportCellErrors = Partial<Record<BankImportColumnId, string[]>>;

type BankImportPreviewRow = {
	cellErrors: BankImportCellErrors;
	id: string;
	rowErrors: string[];
	rowNumber: number;
	values: BankMasterfileFormValues;
};

type ImportProgress = {
	imported: number;
	total: number;
};

type ImportMode = "all-valid" | "selected-valid";

const TemplateHeaders = [
	"Bank",
	"Branch",
	"Account Number",
	"Account Type",
	"Currency",
	"Exchange Rate",
	"Series Start",
	"Series End",
	"Series Digits",
	"Default",
	"Status",
] as const;

const ImportFieldOrder: BankImportColumnId[] = [
	"bankName",
	"branch",
	"accountNumber",
	"accountType",
	"currencyCode",
	"currencyExchangeRate",
	"seriesStart",
	"seriesEnd",
	"seriesDigits",
	"isDefault",
	"status",
];

const PreviewPageSize = 10;
const ImportBatchSize = 25;
const MinImportFileSizeBytes = 1;
const MaxImportFileSizeBytes = 2 * 1024 * 1024;

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

function BankImportRow({
	row,
	selected,
	disabled,
	onToggle,
	onUpdate,
}: {
	row: BankImportPreviewRow;
	selected: boolean;
	disabled: boolean;
	onToggle: (rowId: string, selected: boolean) => void;
	onUpdate: (
		rowId: string,
		field: BankImportColumnId,
		value: string | boolean,
	) => void;
}) {
	return (
		<tr className={rowHasErrors(row) ? "bg-coralpink/[0.025]" : undefined}>
			<td className="sticky left-0 z-20 bg-inherit px-2 py-2">
				<input
					type="checkbox"
					checked={selected}
					disabled={disabled}
					onChange={(event) => onToggle(row.id, event.target.checked)}
					aria-label={`Select row ${row.rowNumber}`}
					className="h-4 w-4 rounded accent-skyblue"
				/>
			</td>
			<EditableCell
				row={row}
				field="bankName"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="branch"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="accountNumber"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableSelect
				row={row}
				field="accountType"
				options={BankMasterfileAccountTypeOptions}
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="currencyCode"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="currencyExchangeRate"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="seriesStart"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="seriesEnd"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="seriesDigits"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableSelect
				row={row}
				field="isDefault"
				options={["No", "Yes"]}
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableSelect
				row={row}
				field="status"
				options={BankMasterfileStatusOptions}
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<td className="px-2 py-2 align-top text-xs">
				{rowHasErrors(row) ? (
					<span className="font-medium text-coralpink">
						{[...row.rowErrors, ...Object.values(row.cellErrors).flat()].join(
							" ",
						)}
					</span>
				) : (
					<span className="font-semibold text-emerald-700">Valid</span>
				)}
			</td>
		</tr>
	);
}

function EditableCell({
	row,
	field,
	disabled,
	onUpdate,
}: {
	row: BankImportPreviewRow;
	field: Exclude<BankImportColumnId, "isDefault" | "status">;
	disabled: boolean;
	onUpdate: (rowId: string, field: BankImportColumnId, value: string) => void;
}) {
	const errors = row.cellErrors[field];

	return (
		<td className="px-1 py-1 align-top">
			<input
				value={String(row.values[field])}
				disabled={disabled}
				onChange={(event) => onUpdate(row.id, field, event.target.value)}
				title={errors?.join(" ")}
				className={joinClasses(
					"h-9 w-full min-w-32 rounded-md border bg-white px-2 text-sm outline-none focus:border-skyblue",
					errors?.length ? "border-coralpink/60" : "border-darknavy/10",
				)}
			/>
		</td>
	);
}

function EditableSelect({
	row,
	field,
	options,
	disabled,
	onUpdate,
}: {
	row: BankImportPreviewRow;
	field: "accountType" | "isDefault" | "status";
	options: readonly string[];
	disabled: boolean;
	onUpdate: (
		rowId: string,
		field: BankImportColumnId,
		value: string | boolean,
	) => void;
}) {
	const value =
		field === "isDefault"
			? row.values.isDefault
				? "Yes"
				: "No"
			: String(row.values[field]);
	const errors = row.cellErrors[field];

	return (
		<td className="px-1 py-1 align-top">
			<select
				value={value}
				disabled={disabled}
				onChange={(event) => onUpdate(row.id, field, event.target.value)}
				title={errors?.join(" ")}
				className={joinClasses(
					"h-9 w-full min-w-32 rounded-md border bg-white px-2 text-sm outline-none focus:border-skyblue",
					errors?.length ? "border-coralpink/60" : "border-darknavy/10",
				)}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</td>
	);
}

function createBlankRow(rowNumber: number): BankImportPreviewRow {
	return {
		id: `bank-import-${Date.now()}-${rowNumber}`,
		rowNumber,
		cellErrors: {},
		rowErrors: [],
		values: {
			bankName: "",
			branch: "",
			accountNumber: "",
			accountType: "Checking",
			currencyCode: "PHP",
			currencyExchangeRate: "",
			seriesStart: "",
			seriesEnd: "",
			seriesDigits: "",
			isDefault: false,
			status: "Active",
		},
	};
}

function parseBankImportRows(
	rows: string[][],
	startRowNumber = 1,
): BankImportPreviewRow[] {
	const meaningfulRows = rows.filter((row) => row.some((cell) => cell.trim()));
	if (meaningfulRows.length === 0) return [];

	const headerIndexes = getHeaderIndexes(meaningfulRows[0]);
	const hasHeader = Object.keys(headerIndexes).length >= 2;
	const dataRows = hasHeader ? meaningfulRows.slice(1) : meaningfulRows;

	return dataRows.map((cells, index) => {
		const rowNumber = startRowNumber + index;
		const row = createBlankRow(rowNumber);
		const values = { ...row.values };

		ImportFieldOrder.forEach((field, fieldIndex) => {
			const sourceIndex = headerIndexes[field] ?? fieldIndex;
			const rawValue = cells[sourceIndex]?.trim() ?? "";
			(values as Record<string, string | boolean>)[field] = normalizeCellValue(
				field,
				rawValue,
			);
		});

		return {
			...row,
			id: `bank-import-${Date.now()}-${rowNumber}-${index}`,
			values,
		};
	});
}

function validateBankImportRows(
	rows: BankImportPreviewRow[],
	existingBanks: BankMasterfile[],
) {
	const existingKeys = new Set(existingBanks.map(getBankKey));
	const importCounts = new Map<string, number>();

	rows.forEach((row) => {
		const key = getBankKey(row.values);
		importCounts.set(key, (importCounts.get(key) ?? 0) + 1);
	});

	return rows.map((row) => {
		const cellErrors: BankImportCellErrors = {};
		const rowErrors: string[] = [];
		const values = row.values;
		const key = getBankKey(values);

		addRequiredError(
			cellErrors,
			"bankName",
			values.bankName,
			"Bank is required.",
		);
		addRequiredError(
			cellErrors,
			"accountNumber",
			values.accountNumber,
			"Account number is required.",
		);
		addRequiredError(
			cellErrors,
			"currencyCode",
			values.currencyCode,
			"Currency is required.",
		);

		if (
			!BankMasterfileAccountTypeOptions.includes(values.accountType as never)
		) {
			cellErrors.accountType = ["Select a valid account type."];
		}
		if (!BankMasterfileStatusOptions.includes(values.status)) {
			cellErrors.status = ["Select a valid status."];
		}
		if (
			values.currencyExchangeRate &&
			!isPositiveNumber(values.currencyExchangeRate)
		) {
			cellErrors.currencyExchangeRate = [
				"Exchange rate must be a positive number.",
			];
		}
		if (values.seriesDigits && !isPositiveInteger(values.seriesDigits)) {
			cellErrors.seriesDigits = [
				"Series digits must be a positive whole number.",
			];
		}
		if (values.seriesStart && !/^\d+$/.test(values.seriesStart)) {
			cellErrors.seriesStart = ["Series start must contain digits only."];
		}
		if (values.seriesEnd && !/^\d+$/.test(values.seriesEnd)) {
			cellErrors.seriesEnd = ["Series end must contain digits only."];
		}
		if (
			/^\d+$/.test(values.seriesStart) &&
			/^\d+$/.test(values.seriesEnd) &&
			Number(values.seriesStart) > Number(values.seriesEnd)
		) {
			cellErrors.seriesEnd = [
				"Series end must be greater than or equal to series start.",
			];
		}
		if (existingKeys.has(key))
			rowErrors.push("This bank account already exists.");
		if ((importCounts.get(key) ?? 0) > 1)
			rowErrors.push("Duplicate bank account in import.");

		return { ...row, cellErrors, rowErrors };
	});
}

function addRequiredError(
	errors: BankImportCellErrors,
	field: BankImportColumnId,
	value: string,
	message: string,
) {
	if (!value.trim()) errors[field] = [message];
}

function rowHasErrors(row: BankImportPreviewRow) {
	return row.rowErrors.length > 0 || Object.keys(row.cellErrors).length > 0;
}

function normalizeCellValue(
	field: BankImportColumnId,
	value: string | boolean,
): never {
	if (field === "isDefault") {
		return parseBoolean(value) as never;
	}
	if (field === "status") {
		return parseStatus(String(value)) as never;
	}
	if (field === "accountType") {
		const normalized = String(value).trim().toLowerCase();
		return (BankMasterfileAccountTypeOptions.find(
			(option) => option.toLowerCase() === normalized,
		) ?? String(value).trim()) as never;
	}
	if (field === "currencyCode")
		return String(value).trim().toUpperCase() as never;
	return String(value) as never;
}

function cleanBankValues(values: BankMasterfileFormValues) {
	return {
		...values,
		bankName: values.bankName.trim(),
		branch: values.branch.trim(),
		accountNumber: values.accountNumber.trim(),
		currencyCode: values.currencyCode.trim().toUpperCase(),
		currencyExchangeRate: values.currencyExchangeRate.trim(),
		seriesStart: values.seriesStart.trim(),
		seriesEnd: values.seriesEnd.trim(),
		seriesDigits: values.seriesDigits.trim(),
	};
}

function renumberRows(rows: BankImportPreviewRow[]) {
	return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

function getNextRowNumber(rows: BankImportPreviewRow[]) {
	return rows.length + 1;
}

function getPreviewRowContentKey(row: BankImportPreviewRow) {
	return ImportFieldOrder.map((field) =>
		String(row.values[field]).trim().toLowerCase(),
	).join("|");
}

function getBankKey(
	bank: Pick<BankMasterfileFormValues, "bankName" | "branch" | "accountNumber">,
) {
	return [bank.bankName, bank.branch, bank.accountNumber]
		.map((value) => value.trim().toLowerCase())
		.join("|");
}

function getHeaderIndexes(row: string[]) {
	const indexes: Partial<Record<BankImportColumnId, number>> = {};

	row.forEach((cell, index) => {
		const field = normalizeHeader(cell);
		if (field) indexes[field] = index;
	});

	return indexes;
}

function normalizeHeader(value: string): BankImportColumnId | null {
	const header = value.toLowerCase().replace(/[^a-z0-9]/g, "");
	const headers: Record<string, BankImportColumnId> = {
		bank: "bankName",
		bankname: "bankName",
		branch: "branch",
		accountnumber: "accountNumber",
		accountno: "accountNumber",
		accounttype: "accountType",
		currency: "currencyCode",
		currencycode: "currencyCode",
		exchangerate: "currencyExchangeRate",
		currencyexchangerate: "currencyExchangeRate",
		seriesstart: "seriesStart",
		seriesend: "seriesEnd",
		seriesdigits: "seriesDigits",
		default: "isDefault",
		isdefault: "isDefault",
		status: "status",
	};

	return headers[header] ?? null;
}

async function readBankImportFile(file: File) {
	const fileName = file.name.toLowerCase();

	if (fileName.endsWith(".xlsx")) {
		const ExcelJS = await import("exceljs");
		const workbook = new ExcelJS.default.Workbook();
		await workbook.xlsx.load(await file.arrayBuffer());
		const worksheet = workbook.worksheets[0];
		if (!worksheet)
			throw new Error("No worksheet was found in the Excel file.");

		const rows: string[][] = [];
		worksheet.eachRow((row) => {
			const cells: string[] = [];
			row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
				cells[columnNumber - 1] = formatExcelValue(cell.value, cell.text);
			});
			rows.push(cells);
		});
		return rows;
	}

	if (
		[".csv", ".tsv", ".txt"].some((extension) => fileName.endsWith(extension))
	) {
		return parseTabularText(await file.text());
	}

	throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

function parseTabularText(text: string) {
	const normalized = text.replace(/^\uFEFF/, "").trim();
	if (!normalized) return [];
	return normalized.includes("\t")
		? normalized.split(/\r?\n/).map((line) => line.split("\t"))
		: parseCsvRows(normalized);
}

function parseCsvRows(text: string) {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = "";
	let quoted = false;

	for (let index = 0; index < text.length; index += 1) {
		const character = text[index];
		if (character === '"') {
			if (quoted && text[index + 1] === '"') {
				cell += '"';
				index += 1;
			} else {
				quoted = !quoted;
			}
		} else if (character === "," && !quoted) {
			row.push(cell);
			cell = "";
		} else if ((character === "\n" || character === "\r") && !quoted) {
			if (character === "\r" && text[index + 1] === "\n") index += 1;
			row.push(cell);
			rows.push(row);
			row = [];
			cell = "";
		} else {
			cell += character;
		}
	}
	row.push(cell);
	rows.push(row);
	return rows;
}

async function downloadBankImportTemplate() {
	try {
		const ExcelJS = await import("exceljs");
		const workbook = new ExcelJS.default.Workbook();
		const worksheet = workbook.addWorksheet("Bank Accounts");
		worksheet.addRow([...TemplateHeaders]);
		worksheet.addRow([
			"BDO",
			"Makati",
			"1234567890",
			"Checking",
			"PHP",
			"",
			"",
			"",
			"",
			"No",
			"Active",
		]);
		worksheet.getRow(1).font = { bold: true };
		worksheet.columns.forEach((column) => {
			column.width = 18;
		});
		for (let row = 2; row <= 250; row += 1) {
			worksheet.getCell(`D${row}`).dataValidation = {
				type: "list",
				allowBlank: false,
				formulae: [`"${BankMasterfileAccountTypeOptions.join(",")}"`],
			};
			worksheet.getCell(`J${row}`).dataValidation = {
				type: "list",
				allowBlank: false,
				formulae: ['"No,Yes"'],
			};
			worksheet.getCell(`K${row}`).dataValidation = {
				type: "list",
				allowBlank: false,
				formulae: [`"${BankMasterfileStatusOptions.join(",")}"`],
			};
		}
		const buffer = await workbook.xlsx.writeBuffer();
		downloadBlob(
			new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			}),
			"bank-masterfile-import-template.xlsx",
		);
	} catch {
		downloadBlob(
			new Blob(
				[
					`${TemplateHeaders.join(",")}\nBDO,Makati,1234567890,Checking,PHP,,,,,No,Active\n`,
				],
				{ type: "text/csv;charset=utf-8" },
			),
			"bank-masterfile-import-template.csv",
		);
	}
}

function formatExcelValue(value: unknown, displayText?: string) {
	if (displayText?.trim()) return displayText.trim();
	if (value === null || value === undefined) return "";
	if (typeof value === "object" && "result" in value) {
		return formatExcelValue((value as { result?: unknown }).result);
	}
	return String(value);
}

function parseBoolean(value: string | boolean) {
	if (typeof value === "boolean") return value;
	return ["yes", "true", "1", "default"].includes(value.trim().toLowerCase());
}

function parseStatus(value: string): BankMasterfileStatus {
	return value.trim().toLowerCase() === "inactive" ? "Inactive" : "Active";
}

function isPositiveNumber(value: string) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0;
}

function isPositiveInteger(value: string) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0;
}

function validateImportFileSize(file: File) {
	if (file.size < MinImportFileSizeBytes) return "The selected file is empty.";
	if (file.size > MaxImportFileSizeBytes) return "Upload a file up to 2 MB.";
	return null;
}

function waitForNextBatch() {
	return new Promise<void>((resolve) => window.setTimeout(resolve, 0));
}

const secondaryActionClassName =
	"inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-55 lg:w-auto";
const pagerActionClassName =
	"inline-flex h-8 items-center gap-1 rounded-md border border-darknavy/10 px-2 text-xs font-semibold text-darknavy disabled:cursor-not-allowed disabled:opacity-45";
