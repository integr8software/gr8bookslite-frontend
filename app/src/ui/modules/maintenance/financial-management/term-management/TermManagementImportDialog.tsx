"use client";

import { useMemo, useState } from "react";
import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	Download,
	LoaderCircle,
	Plus,
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
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type TermImportColumnId = "name" | "datemode" | "period";
type TermImportCellErrors = Partial<Record<TermImportColumnId, string[]>>;

type TermImportPreviewRow = {
	cellErrors: TermImportCellErrors;
	id: string;
	rowErrors: string[];
	rowNumber: number;
	term: Omit<TermManagement, "id">;
};

type ImportProgress = {
	imported: number;
	total: number;
};

const TemplateHeaders = ["Name", "Datemode", "Period"];
const TemplateRows = [
	["Net 30", "Day", "30"],
	["Monthly billing", "Month", "1"],
	["Annual review", "Year", "1"],
];
const DefaultColumnIndexes: Record<TermImportColumnId, number> = {
	name: 0,
	datemode: 1,
	period: 2,
};
const ImportFieldOrder: TermImportColumnId[] = ["name", "datemode", "period"];
const PreviewPageSize = 8;
const ImportBatchSize = 25;
const MinImportFileSizeBytes = 1;
const MaxImportFileSizeBytes = 5 * 1024 * 1024;

export function TermManagementImportDialog({
	existingTerms,
	isOpen,
	onClose,
	onImportTerms,
}: {
	existingTerms: TermManagement[];
	isOpen: boolean;
	onClose: () => void;
	onImportTerms: (terms: TermManagement[]) => void;
}) {
	const [importError, setImportError] = useState<string | null>(null);
	const [isParsing, setIsParsing] = useState(false);
	const [previewRows, setPreviewRows] = useState<TermImportPreviewRow[]>([]);
	const [previewPage, setPreviewPage] = useState(1);
	const [progress, setProgress] = useState<ImportProgress | null>(null);
	const existingNames = useMemo(
		() => new Set(existingTerms.map((term) => normalizeTermName(term.name))),
		[existingTerms],
	);
	const validatedRows = useMemo(
		() => validateTermImportRows(previewRows, existingNames),
		[existingNames, previewRows],
	);
	const invalidRows = validatedRows.filter((row) => rowHasErrors(row));
	const canImport =
		validatedRows.length > 0 && invalidRows.length === 0 && !progress;
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

	function resetImportState() {
		if (progress) {
			return;
		}

		setImportError(null);
		setPreviewRows([]);
		setPreviewPage(1);
	}

	function previewImportText(text: string) {
		try {
			const rows = parseTermImportText(text);

			setPreviewRows(rows);
			setPreviewPage(1);
			setImportError(null);
		} catch (error) {
			setPreviewRows([]);
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
		setImportError(null);
	}

	function updatePreviewCell(
		rowId: string,
		field: TermImportColumnId,
		value: string,
	) {
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
	}

	async function handleFileUpload(file: File | undefined) {
		if (!file || progress) {
			return;
		}

		const sizeError = validateImportFileSize(file);

		if (sizeError) {
			setImportError(sizeError);
			setPreviewRows([]);
			return;
		}

		setIsParsing(true);

		try {
			const text = await readTermImportFileText(file);

			previewImportText(text);
		} catch (error) {
			setPreviewRows([]);
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

		setPreviewRows((rows) => {
			const startRowIndex = rows.findIndex((row) => row.id === rowId);

			if (startRowIndex < 0) {
				return rows;
			}

			const nextRows = [...rows];

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

				nextRows[targetIndex] = {
					...targetRow,
					term: nextTerm,
				};
			});

			return nextRows;
		});
		setImportError(null);
	}

	async function handleImport() {
		if (!canImport) {
			return;
		}

		const termsToImport = validatedRows.map((row, index) => ({
			...row.term,
			id: `term-import-${Date.now()}-${index}`,
		}));

		setProgress({ imported: 0, total: termsToImport.length });

		for (let index = 0; index < termsToImport.length; index += ImportBatchSize) {
			const batch = termsToImport.slice(index, index + ImportBatchSize);

			onImportTerms(batch);
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
		resetImportState();
		onClose();
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
				<div className="grid gap-3 sm:grid-cols-[minmax(12rem,1fr)_auto_auto_auto]">
					<label
						onDragOver={(event) => event.preventDefault()}
						onDrop={(event) => {
							event.preventDefault();
							void handleFileUpload(event.dataTransfer.files[0]);
						}}
						className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-skyblue/35 bg-skyblue/8 px-4 text-sm font-semibold text-skyblue transition hover:bg-skyblue/12"
					>
						{isParsing ? (
							<LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
						) : (
							<Upload className="h-4 w-4" aria-hidden="true" />
						)}
						Upload File
						<input
							type="file"
							accept=".xlsx,.csv,.tsv,.txt"
							disabled={Boolean(progress)}
							className="sr-only"
							onChange={(event) => handleFileUpload(event.target.files?.[0])}
						/>
					</label>
					<button
						type="button"
						onClick={() => void downloadTermImportTemplate()}
						disabled={Boolean(progress)}
						className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-55"
					>
						<Download className="h-4 w-4" aria-hidden="true" />
						Template
					</button>
					<button
						type="button"
						onClick={addBlankRow}
						disabled={Boolean(progress)}
						className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-55"
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Row
					</button>
					<p className="text-xs font-medium text-darknavy/45 sm:col-span-4">
						Accepted: .xlsx, .csv, .tsv, .txt. Size:{" "}
						{formatFileSize(MinImportFileSizeBytes)} to{" "}
						{formatFileSize(MaxImportFileSizeBytes)}. Drag a file onto Upload File,
						or paste copied spreadsheet data directly into any editable cell.
					</p>
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
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<button
						type="button"
						onClick={resetImportState}
						disabled={Boolean(progress)}
						className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-55"
					>
						Reset
					</button>
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<button
							type="button"
							onClick={onClose}
							disabled={Boolean(progress)}
							className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-55"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={() => void handleImport()}
							disabled={!canImport}
							className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-55"
						>
							{progress ? (
								<LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
							) : (
								<Upload className="h-4 w-4" aria-hidden="true" />
							)}
							Import Data
						</button>
					</div>
				</div>
			}
		>
			<div className="grid min-h-0 content-start gap-3">
				<div className="grid gap-2 rounded-lg border border-darknavy/10 bg-darknavy/[0.025] p-3 sm:grid-cols-3">
					<ImportSummaryCard label="Rows" value={validatedRows.length} />
					<ImportSummaryCard
						label="Valid"
						value={validatedRows.length - invalidRows.length}
					/>
					<ImportSummaryCard label="With Errors" value={invalidRows.length} />
				</div>

				{importError ? (
					<div className="flex gap-2 rounded-md border border-coralpink/25 bg-coralpink/8 px-3 py-2 text-sm font-medium text-coralpink">
						<AlertCircle
							className="mt-0.5 h-4 w-4 shrink-0"
							aria-hidden="true"
						/>
						<span>{importError}</span>
					</div>
				) : null}

				<div className="overflow-hidden rounded-lg border border-darknavy/10">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[44rem] text-left text-sm text-darknavy">
							<thead className="bg-darknavy/[0.035] text-xs uppercase text-darknavy/55">
								<tr>
									<th className="w-16 px-3 py-2">Row</th>
									<th className="px-3 py-2">Name</th>
									<th className="w-40 px-3 py-2">Datemode</th>
									<th className="w-32 px-3 py-2">Period</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-darknavy/8 bg-white">
								{visibleRows.length > 0 ? (
									visibleRows.map((row) => (
										<TermImportPreviewTableRow
											key={row.id}
											row={row}
											onUpdateCell={updatePreviewCell}
											onPasteCell={pasteIntoPreviewCell}
										/>
									))
								) : (
									<tr>
										<td
											colSpan={4}
											className="px-3 py-10 text-center text-sm font-medium text-darknavy/45"
										>
											Upload a file or paste rows to preview terms.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
					<div className="flex flex-col gap-2 border-t border-darknavy/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
						<span className="text-xs font-semibold text-darknavy/55">
							Page {safePreviewPage} of {totalPages}
						</span>
						<div className="flex gap-2">
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
	onUpdateCell,
	onPasteCell,
}: {
	row: TermImportPreviewRow;
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
}) {
	return (
		<>
			<tr className={rowHasErrors(row) ? "bg-coralpink/[0.025]" : undefined}>
				<td className="px-3 py-2 align-top font-semibold">{row.rowNumber}</td>
				<td className="px-3 py-2 align-top">
					<EditableImportCell
						value={row.term.name}
						errors={row.cellErrors.name}
						onChange={(value) => onUpdateCell(row.id, "name", value)}
						onPaste={(text) => onPasteCell(row.id, "name", text)}
					/>
				</td>
				<td className="px-3 py-2 align-top">
					<EditableImportSelect
						value={row.term.datemode}
						errors={row.cellErrors.datemode}
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
						onChange={(value) => onUpdateCell(row.id, "period", value)}
						onPaste={(text) => onPasteCell(row.id, "period", text)}
					/>
				</td>
			</tr>
			{row.rowErrors.length > 0 ? (
				<tr className="bg-coralpink/[0.025]">
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
	type = "text",
	value,
	onChange,
	onPaste,
}: {
	errors?: string[];
	type?: "number" | "text";
	value: string;
	onChange: (value: string) => void;
	onPaste: (text: string) => void;
}) {
	return (
		<label className="block">
			<input
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onPaste={(event) => {
					const text = event.clipboardData.getData("text");

					if (isTabularPaste(text)) {
						event.preventDefault();
						onPaste(text);
					}
				}}
				className={joinClasses(
					"h-10 w-full rounded-md border bg-white px-2 text-sm font-medium text-darknavy outline-none transition focus:ring-2",
					errors?.length
						? "border-coralpink/45 focus:border-coralpink focus:ring-coralpink/15"
						: "border-darknavy/12 focus:border-skyblue focus:ring-skyblue/15",
				)}
			/>
			<CellErrors errors={errors} />
		</label>
	);
}

function EditableImportSelect<TOption extends string>({
	errors,
	options,
	value,
	onChange,
	onPaste,
}: {
	errors?: string[];
	options: readonly TOption[];
	value: string;
	onChange: (value: string) => void;
	onPaste: (text: string) => void;
}) {
	return (
		<label className="block">
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
				className={joinClasses(
					"h-10 w-full rounded-md border bg-white px-2 text-sm font-medium text-darknavy outline-none transition focus:ring-2",
					errors?.length
						? "border-coralpink/45 focus:border-coralpink focus:ring-coralpink/15"
						: "border-darknavy/12 focus:border-skyblue focus:ring-skyblue/15",
				)}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			<CellErrors errors={errors} />
		</label>
	);
}

function CellErrors({ errors }: { errors?: string[] }) {
	if (!errors?.length) {
		return null;
	}

	return (
		<span className="mt-1 block text-xs font-semibold leading-4 text-coralpink">
			{errors.join(" ")}
		</span>
	);
}

function ImportSummaryCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-md bg-white px-3 py-2 shadow-sm">
			<p className="text-xs font-semibold text-darknavy/50">{label}</p>
			<p className="mt-1 text-xl font-semibold text-darknavy">{value}</p>
		</div>
	);
}

function createBlankImportRow(rowNumber: number): TermImportPreviewRow {
	return {
		cellErrors: {},
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
		TemplateRows.forEach((row) => worksheet.addRow(row));
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
	return [TemplateHeaders, ...TemplateRows]
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

function parseTermImportText(text: string): TermImportPreviewRow[] {
	const rows = parseTermImportTabularRows(text).filter((row) =>
		row.some((cell) => cell.trim() !== ""),
	);

	if (rows.length === 0) {
		return [];
	}

	const headerIndexes = getTermImportHeaderIndexes(rows[0]);
	const indexes = headerIndexes ?? DefaultColumnIndexes;
	const dataRows = headerIndexes ? rows.slice(1) : rows;

	return dataRows
		.filter((row) => row.some((cell) => cell.trim() !== ""))
		.map((row, index) => {
			const rowNumber = index + 1;
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
				id: `term-import-preview-${rowNumber}`,
				rowErrors: [],
				rowNumber,
				term,
			};
		});
}

function validateTermImportRows(
	rows: TermImportPreviewRow[],
	existingNames: Set<string>,
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
		const rowErrors: string[] = [];
		const normalizedName = normalizeTermName(row.term.name);
		const periodNumber = Number(row.term.period);

		if (!row.term.name.trim()) {
			cellErrors.name = ["Name is required."];
		}

		if (!TermManagementDatemodeOptions.includes(row.term.datemode)) {
			cellErrors.datemode = ["Datemode must be Day, Month, or Year."];
		}

		if (
			!row.term.period.trim() ||
			!Number.isFinite(periodNumber) ||
			periodNumber <= 0
		) {
			cellErrors.period = ["Period must be greater than 0."];
		} else if (!Number.isInteger(periodNumber)) {
			cellErrors.period = ["Period must be a whole number."];
		}

		if (normalizedName && existingNames.has(normalizedName)) {
			rowErrors.push("Name already exists.");
		}

		if (normalizedName && (importedNameCounts.get(normalizedName) ?? 0) > 1) {
			rowErrors.push("Duplicate name in import.");
		}

		return { ...row, cellErrors, rowErrors };
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
