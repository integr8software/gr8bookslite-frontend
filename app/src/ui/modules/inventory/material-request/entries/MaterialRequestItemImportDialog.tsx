import { useMemo, useState } from "react";
import {
	AlertCircle,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	ClipboardPaste,
	FileText,
	Upload,
	X,
} from "lucide-react";
import {
	DefaultItemColumnLabels,
	DefaultItemColumnOrder,
	ImportPageSize,
	MaterialRequestImportTemplateRows,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestItemEntryConstants";
import { MaterialRequestUomOptions } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import {
	AppMaxFileUploadSizeBytes,
	AppMaxFileUploadSizeLabel,
} from "@/app/src/constants/shared/app/AppConstants";
import {
	createXlsxWorkbook,
	downloadBytesFile,
	formatNumberInputValue,
	parseMaterialRequestImportText,
	parseNumberInputValue,
	readMaterialRequestImportFileText,
	validateImportItem,
	isDateItemColumn,
	isNumericItemColumn,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestItemEntryData";
import type {
	MaterialRequestImportPreviewRow,
	MaterialRequestItemColumnId,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestItemEntryTypes";
import type { MaterialRequestItem } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { CellValidationWarning } from "@/app/src/ui/modules/inventory/material-request/entries/MaterialRequestItemCells";
import { previewCellClassName } from "@/app/src/ui/modules/inventory/material-request/entries/MaterialRequestItemEntryStyles";

export function MaterialRequestItemImportDialog({
	isOpen,
	onClose,
	onImportItems,
	requiredColumnIds,
}: {
	isOpen: boolean;
	onClose: () => void;
	onImportItems: (items: MaterialRequestItem[]) => void;
	requiredColumnIds: MaterialRequestItemColumnId[];
}) {
	const [fileInputKey, setFileInputKey] = useState(0);
	const [importError, setImportError] = useState<string | null>(null);
	const [isDragActive, setIsDragActive] = useState(false);
	const [pageIndex, setPageIndex] = useState(0);
	const [pasteText, setPasteText] = useState("");
	const [previewRows, setPreviewRows] = useState<MaterialRequestImportPreviewRow[]>([]);
	const validatedPreviewRows = useMemo(
		() =>
			previewRows.map((row) => ({
				...row,
				...validateImportItem(row.item, requiredColumnIds),
			})),
		[previewRows, requiredColumnIds],
	);
	const totalPages = Math.max(
		1,
		Math.ceil(validatedPreviewRows.length / ImportPageSize),
	);
	const currentRows = validatedPreviewRows.slice(
		pageIndex * ImportPageSize,
		pageIndex * ImportPageSize + ImportPageSize,
	);
	const invalidRowCount = validatedPreviewRows.filter(
		(row) => row.errors.length > 0,
	).length;
	const canImport = validatedPreviewRows.length > 0 && invalidRowCount === 0;

	if (!isOpen) {
		return null;
	}

	function previewText(text: string) {
		try {
			const rows = parseMaterialRequestImportText(text, requiredColumnIds);

			setPreviewRows(rows);
			setPageIndex(0);
			setImportError(null);
		} catch (error) {
			setPreviewRows([]);
			setImportError(
				error instanceof Error
					? error.message
					: "Could not read the imported material request items.",
			);
		}
	}

	function handleFiles(fileList: FileList | null) {
		const file = fileList?.[0];

		if (!file) {
			return;
		}

		if (file.size > AppMaxFileUploadSizeBytes) {
			setImportError(
				`Upload a file up to ${AppMaxFileUploadSizeLabel}.`,
			);
			setFileInputKey((current) => current + 1);
			return;
		}

		readMaterialRequestImportFileText(file)
			.then((text) => {
				setPasteText(text);
				previewText(text);
				setFileInputKey((current) => current + 1);
			})
			.catch((error) => {
				setImportError(
					error instanceof Error
						? error.message
						: "Could not read the selected file.",
				);
			});
	}

	function updatePreviewItem(
		rowId: string,
		field: MaterialRequestItemColumnId,
		value: MaterialRequestItem[keyof MaterialRequestItem],
	) {
		setPreviewRows((currentRows) =>
			currentRows.map((row) => {
				if (row.id !== rowId) {
					return row;
				}

				const nextItem = { ...row.item, [field]: value };

				return {
					...row,
					...validateImportItem(nextItem, requiredColumnIds),
					item: nextItem,
				};
			}),
		);
	}

	function resetImportState() {
		setFileInputKey((current) => current + 1);
		setImportError(null);
		setIsDragActive(false);
		setPageIndex(0);
		setPasteText("");
		setPreviewRows([]);
	}

	async function downloadImportTemplate() {
		downloadBytesFile(
			"material-request-item-template.xlsx",
			await createXlsxWorkbook(
				[
					DefaultItemColumnOrder.map((columnId) => DefaultItemColumnLabels[columnId]),
					...MaterialRequestImportTemplateRows,
				],
				"Material Request Items",
			),
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		);
	}

	return (
		<div
			role="presentation"
			className="fixed inset-0 z-[130] flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby="material-request-import-title"
				className="flex max-h-[min(92vh,820px)] w-full max-w-6xl flex-col overflow-hidden rounded-[20px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.18)]"
			>
				<div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-skyblue">
							Material Request Items
						</p>
						<h2
							id="material-request-import-title"
							className="mt-1 text-xl font-semibold text-darknavy"
						>
							Import Itemized Data Entry Rows
						</h2>
						<p className="mt-1 text-sm text-darknavy/58">
							Drop an Excel/CSV/TSV file or paste rows, review each page, then
							import only when validation passes.
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-darknavy/60 transition hover:bg-darknavy/6 hover:text-darknavy"
						aria-label="Close item import"
					>
						<X className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
					<div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
						<label
							className={joinClasses(
								"app-theme-field-readonly flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition",
								isDragActive
									? "border-skyblue bg-skyblue/12"
									: "hover:border-skyblue/45 hover:bg-skyblue/8",
							)}
							onDragEnter={(event) => {
								event.preventDefault();
								setIsDragActive(true);
							}}
							onDragOver={(event) => {
								event.preventDefault();
								setIsDragActive(true);
							}}
							onDragLeave={(event) => {
								if (event.currentTarget === event.target) {
									setIsDragActive(false);
								}
							}}
							onDrop={(event) => {
								event.preventDefault();
								setIsDragActive(false);
								handleFiles(event.dataTransfer.files);
							}}
						>
							<Upload className="h-7 w-7 text-skyblue" aria-hidden="true" />
							<span className="mt-3 text-sm font-semibold text-darknavy">
								Drop Excel, CSV, or TSV here
							</span>
							<span className="mt-1 max-w-md text-xs leading-5 text-darknavy/55">
								Headers may use Item Code, Barcode, Item Name, Item Category,
								UOM, Request QTY, Stock QTY, Lot No., and Remarks.
							</span>
							<input
								key={fileInputKey}
								type="file"
								accept=".xlsx,.csv,.tsv,.txt"
								onChange={(event) => handleFiles(event.target.files)}
								className="sr-only"
							/>
						</label>

						<div className="grid min-w-0 gap-3">
							<div className="flex items-center gap-2 text-sm font-semibold text-darknavy">
								<ClipboardPaste
									className="h-4 w-4 text-skyblue"
									aria-hidden="true"
								/>
								Paste item rows
							</div>
							<textarea
								value={pasteText}
								onChange={(event) => setPasteText(event.target.value)}
								className="app-theme-field min-h-28 resize-y rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-skyblue/45"
								placeholder={
									"Item Code\tBarcode\tItem Name\tItem Category\tUOM\tRequest QTY\tStock QTY\tLot No.\tRemarks"
								}
							/>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<p className="text-xs leading-5 text-darknavy/55">
									Use the first row as headers or paste item values in the
									template order.
								</p>
								<div className="flex flex-wrap items-center gap-2">
									<button
										type="button"
										onClick={resetImportState}
										className="inline-flex h-10 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
									>
										Clear
									</button>
									<button
										type="button"
										onClick={downloadImportTemplate}
										className="inline-flex h-10 items-center justify-center rounded-xl border border-skyblue/25 bg-skyblue/8 px-4 text-sm font-semibold text-skyblue transition hover:bg-skyblue/14"
									>
										Download Template
									</button>
									<button
										type="button"
										disabled={!pasteText.trim()}
										onClick={() => previewText(pasteText)}
										className="theme-accent-contrast-text inline-flex h-10 items-center justify-center rounded-xl bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-45"
									>
										Preview Rows
									</button>
								</div>
							</div>
						</div>
					</div>

					{importError ? (
						<div className="mt-4 flex items-start gap-2 rounded-lg border border-coralpink/20 bg-coralpink/8 px-4 py-3 text-sm font-semibold text-coralpink">
							<AlertCircle className="mt-0.5 h-4 w-4" aria-hidden="true" />
							{importError}
						</div>
					) : null}

					{previewRows.length > 0 ? (
						<div className="mt-5 grid gap-3">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-sm font-semibold text-darknavy">
										Itemized Preview
									</p>
									<p className="mt-1 text-xs text-darknavy/55">
										{previewRows.length} rows found. {invalidRowCount} need
										correction.
									</p>
								</div>
								<div className="flex items-center gap-2">
									<span className="inline-flex items-center gap-1.5 rounded-full border border-darknavy/10 bg-offwhite/45 px-3 py-1 text-xs font-semibold text-darknavy/60">
										<FileText className="h-3.5 w-3.5" aria-hidden="true" />
										Page {pageIndex + 1} of {totalPages}
									</span>
									<button
										type="button"
										disabled={pageIndex === 0}
										onClick={() =>
											setPageIndex((current) => Math.max(0, current - 1))
										}
										className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-darknavy/12 bg-white text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-45"
										aria-label="Previous import page"
									>
										<ChevronLeft className="h-4 w-4" aria-hidden="true" />
									</button>
									<button
										type="button"
										disabled={pageIndex >= totalPages - 1}
										onClick={() =>
											setPageIndex((current) =>
												Math.min(totalPages - 1, current + 1),
											)
										}
										className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-darknavy/12 bg-white text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-45"
										aria-label="Next import page"
									>
										<ChevronRight className="h-4 w-4" aria-hidden="true" />
									</button>
								</div>
							</div>

							<MaterialRequestImportPreviewTable
								rows={currentRows}
								rowOffset={pageIndex * ImportPageSize}
								onUpdateItem={updatePreviewItem}
							/>
						</div>
					) : null}
				</div>

				<div className="flex flex-col-reverse gap-3 border-t border-darknavy/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2 text-xs font-semibold text-darknavy/55">
						{canImport ? (
							<>
								<CheckCircle2 className="h-4 w-4 text-citron" aria-hidden="true" />
								Validated and ready to import
							</>
						) : (
							<>
								<AlertCircle
									className="h-4 w-4 text-coralpink"
									aria-hidden="true"
								/>
								Fix validation issues before importing
							</>
						)}
					</div>
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
						<button
							type="button"
							onClick={onClose}
							className="inline-flex h-10 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
						>
							Close
						</button>
						<button
							type="button"
							disabled={!canImport}
							onClick={() =>
								onImportItems(validatedPreviewRows.map((row) => row.item))
							}
							className="theme-accent-contrast-text inline-flex h-10 items-center justify-center rounded-xl bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-45"
						>
							Import Valid Items
						</button>
					</div>
				</div>
			</section>
		</div>
	);
}

function MaterialRequestImportPreviewTable({
	rows,
	rowOffset,
	onUpdateItem,
}: {
	rows: MaterialRequestImportPreviewRow[];
	rowOffset: number;
	onUpdateItem: (
		rowId: string,
		field: MaterialRequestItemColumnId,
		value: MaterialRequestItem[keyof MaterialRequestItem],
	) => void;
}) {
	return (
		<div className="app-theme-field max-h-[25rem] overflow-auto rounded-lg border">
			<table className="min-w-[96rem] table-fixed border-collapse text-left text-xs text-darknavy">
				<thead className="bg-skyblue/10">
					<tr>
						<th className="w-16 border border-darknavy/10 px-2 py-2 text-center font-semibold">
							No.
						</th>
						{DefaultItemColumnOrder.map((columnId) => (
							<th
								key={columnId}
								className="border border-darknavy/10 px-2 py-2 font-semibold"
							>
								{DefaultItemColumnLabels[columnId]}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => {
						const isValid = row.errors.length === 0;

						return (
							<tr
								key={row.id}
								className={joinClasses(
									"border-b border-darknavy/10",
									!isValid && "bg-coralpink/5",
								)}
							>
								<td className="border border-darknavy/10 px-2 py-2 text-center font-semibold">
									{rowOffset + index + 1}
								</td>
								{DefaultItemColumnOrder.map((columnId) => (
									<td
										key={`${row.id}-${columnId}`}
										className="border border-darknavy/10 p-0"
									>
										{columnId === "uom" ? (
											<div className="relative h-10 w-full">
												<select
													value={row.item.uom}
													aria-invalid={Boolean(row.fieldErrors[columnId])}
													onChange={(event) =>
														onUpdateItem(row.id, "uom", event.target.value)
													}
													className={`${previewCellClassName(
														undefined,
														row.fieldErrors[columnId],
													)} app-select-control`}
												>
													{MaterialRequestUomOptions.map((option) => (
														<option key={option} value={option}>
															{option}
														</option>
													))}
												</select>
												<CellValidationWarning
													message={row.fieldErrors[columnId]}
												/>
											</div>
										) : isNumericItemColumn(columnId) ? (
											<div className="relative h-10 w-full">
												<input
													type="number"
													min="0"
													value={formatNumberInputValue(row.item[columnId])}
													aria-invalid={Boolean(row.fieldErrors[columnId])}
													onChange={(event) =>
														onUpdateItem(
															row.id,
															columnId,
															parseNumberInputValue(event.target.value),
														)
													}
													className={previewCellClassName(
														"text-right",
														row.fieldErrors[columnId],
													)}
												/>
												<CellValidationWarning
													message={row.fieldErrors[columnId]}
												/>
											</div>
										) : isDateItemColumn(columnId) ? (
											<div className="relative h-10 w-full">
												<input
													type="date"
													value={String(row.item[columnId] ?? "")}
													aria-invalid={Boolean(row.fieldErrors[columnId])}
													onChange={(event) =>
														onUpdateItem(row.id, columnId, event.target.value)
													}
													className={previewCellClassName(
														undefined,
														row.fieldErrors[columnId],
													)}
												/>
												<CellValidationWarning
													message={row.fieldErrors[columnId]}
												/>
											</div>
										) : (
											<div className="relative h-10 w-full">
												<input
													type="text"
													value={String(row.item[columnId] ?? "")}
													aria-invalid={Boolean(row.fieldErrors[columnId])}
													onChange={(event) =>
														onUpdateItem(row.id, columnId, event.target.value)
													}
													className={previewCellClassName(
														undefined,
														row.fieldErrors[columnId],
													)}
												/>
												<CellValidationWarning
													message={row.fieldErrors[columnId]}
												/>
											</div>
										)}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

