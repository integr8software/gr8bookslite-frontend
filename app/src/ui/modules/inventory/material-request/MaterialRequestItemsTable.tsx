"use client";

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
import { MaterialRequestUomOptions } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import {
	createMaterialRequestId,
	emptyMaterialRequestItem,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import type { MaterialRequestItem } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { MaterialRequestItemValidationSchema } from "@/app/src/validations/modules/inventory/material-request/MaterialRequestValidation";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
	type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MaterialRequestItemColumnId = Exclude<keyof MaterialRequestItem, "id">;

type MaterialRequestItemsTableProps = {
	error?: string;
	isReadonly: boolean;
	items: MaterialRequestItem[];
	onAddItems: (count: number) => void;
	onClearItems: (action: ModuleDataEntryClearAction) => void;
	onDuplicateItem: (itemId: string) => void;
	onImportItems: (items: MaterialRequestItem[]) => void;
	onInsertItem: (itemId: string, position: "above" | "below") => void;
	onMoveItem: (fromItemId: string, toItemId: string) => void;
	onRemoveItem: (itemId: string) => void;
	onUpdateItem: (
		itemId: string,
		field: keyof MaterialRequestItem,
		value: string | number,
	) => void;
};

type ImportPreviewRow = {
	errors: string[];
	id: string;
	item: MaterialRequestItem;
};

export function MaterialRequestItemsTable({
	error,
	isReadonly,
	items,
	onAddItems,
	onClearItems,
	onDuplicateItem,
	onImportItems,
	onInsertItem,
	onMoveItem,
	onRemoveItem,
	onUpdateItem,
}: MaterialRequestItemsTableProps) {
	const [columnOrder, setColumnOrder] = useState<MaterialRequestItemColumnId[]>(
		DefaultItemColumnOrder,
	);
	const [visibleColumnIds, setVisibleColumnIds] = useState<
		MaterialRequestItemColumnId[]
	>(DefaultItemColumnOrder);
	const [requiredColumnIds, setRequiredColumnIds] = useState<
		MaterialRequestItemColumnId[]
	>(DefaultRequiredItemColumnOrder);
	const [columnLabels, setColumnLabels] = useState(DefaultItemColumnLabels);
	const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
	const visibleColumnOrder = columnOrder.filter((columnId) =>
		visibleColumnIds.includes(columnId),
	);
	const columns = useMemo<ModuleDataEntryColumn<MaterialRequestItem>[]>(
		() =>
			visibleColumnOrder.map((columnId) => ({
				header: columnLabels[columnId],
				id: columnId,
				isRemovable: !ProtectedItemColumnIds.has(columnId),
				widthClassName: ItemColumnWidthClassNames[columnId],
				renderCell: (item) =>
					renderItemCell({
						columnId,
						isReadonly,
						item,
						onUpdateItem,
					}),
			})),
		[columnLabels, isReadonly, onUpdateItem, visibleColumnOrder],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columnOrder.map((columnId) => ({
				id: columnId,
				isHideable: !ProtectedItemColumnIds.has(columnId),
				isRequired: requiredColumnIds.includes(columnId),
				isRequirementConfigurable:
					!DefaultRequiredItemColumnIds.has(columnId),
				isVisible: visibleColumnIds.includes(columnId),
				label: columnLabels[columnId],
			})),
		[columnLabels, columnOrder, requiredColumnIds, visibleColumnIds],
	);

	function updateColumnHeader(columnId: string, header: string) {
		if (!isItemColumnId(columnId)) {
			return;
		}

		setColumnLabels((currentLabels) => ({
			...currentLabels,
			[columnId]: header,
		}));
	}

	function moveColumn(fromColumnId: string, toColumnId: string) {
		setColumnOrder((currentOrder) => {
			const fromIndex = currentOrder.indexOf(
				fromColumnId as MaterialRequestItemColumnId,
			);
			const toIndex = currentOrder.indexOf(
				toColumnId as MaterialRequestItemColumnId,
			);

			if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
				return currentOrder;
			}

			const nextOrder = [...currentOrder];
			const [movedColumn] = nextOrder.splice(fromIndex, 1);

			nextOrder.splice(toIndex, 0, movedColumn);
			return nextOrder;
		});
	}

	function removeColumn(columnId: string) {
		if (!isItemColumnId(columnId) || ProtectedItemColumnIds.has(columnId)) {
			return;
		}

		setRequiredColumnIds((currentRequiredIds) =>
			currentRequiredIds.filter(
				(currentColumnId) => currentColumnId !== columnId,
			),
		);
		setVisibleColumnIds((currentVisibleIds) =>
			currentVisibleIds.length <= 1
				? currentVisibleIds
				: currentVisibleIds.filter(
						(currentColumnId) => currentColumnId !== columnId,
					),
		);
	}

	function toggleColumnVisibility(columnId: string, isVisible: boolean) {
		if (!isItemColumnId(columnId)) {
			return;
		}

		if (!isVisible && ProtectedItemColumnIds.has(columnId)) {
			return;
		}

		if (!isVisible) {
			setRequiredColumnIds((currentRequiredIds) =>
				currentRequiredIds.filter(
					(currentColumnId) =>
						currentColumnId !== columnId ||
						DefaultRequiredItemColumnIds.has(currentColumnId),
				),
			);
		}

		setVisibleColumnIds((currentVisibleIds) => {
			if (isVisible) {
				const nextVisibleIds = new Set([...currentVisibleIds, columnId]);

				return columnOrder.filter((currentColumnId) =>
					nextVisibleIds.has(currentColumnId),
				);
			}

			if (currentVisibleIds.length <= 1) {
				return currentVisibleIds;
			}

			return currentVisibleIds.filter(
				(currentColumnId) => currentColumnId !== columnId,
			);
		});
	}

	function toggleColumnRequired(columnId: string, isRequired: boolean) {
		if (
			!isItemColumnId(columnId) ||
			DefaultRequiredItemColumnIds.has(columnId) ||
			!visibleColumnIds.includes(columnId)
		) {
			return;
		}

		setRequiredColumnIds((currentRequiredIds) => {
			if (isRequired) {
				return currentRequiredIds.includes(columnId)
					? currentRequiredIds
					: [...currentRequiredIds, columnId];
			}

			return currentRequiredIds.filter(
				(currentColumnId) => currentColumnId !== columnId,
			);
		});
	}

	function createExportRows() {
		return [
			visibleColumnOrder.map((columnId) => columnLabels[columnId]),
			...items
				.filter(materialRequestItemHasData)
				.map((item) =>
					visibleColumnOrder.map((columnId) =>
						String(item[columnId] ?? ""),
					),
				),
		];
	}

	function exportItemsAsExcel() {
		downloadBytesFile(
			"material-request-items.xlsx",
			createXlsxWorkbook(createExportRows(), "Material Request Items"),
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		);
	}

	function exportItemsAsPdf() {
		downloadBytesFile(
			"material-request-items.pdf",
			createSimplePdf("Material Request Items", createExportRows()),
			"application/pdf",
		);
	}

	const exportOptions = useMemo<ModuleDataEntryExportOption[]>(
		() => [
			{
				id: "excel",
				label: "Excel (.xlsx)",
				onSelect: exportItemsAsExcel,
			},
			{
				id: "pdf",
				label: "PDF",
				onSelect: exportItemsAsPdf,
			},
		],
		// Export handlers are intentionally recreated with current rows/columns.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[items, visibleColumnOrder, columnLabels],
	);

	return (
		<>
			<ModuleDataEntry
				columns={columns}
				columnOptions={columnOptions}
				description="Add material request lines, adjust quantities, reorder rows, and manage duplicate item entries."
				emptyRowLabel="item"
				error={error}
				isDraggable
				isReadonly={isReadonly}
				rows={items}
				title="Data Entry"
				exportOptions={exportOptions}
				onAddRows={onAddItems}
				onClearRows={onClearItems}
				onDuplicateRow={onDuplicateItem}
				onImport={() => setIsImportDialogOpen(true)}
				onInsertRow={onInsertItem}
				onMoveColumn={moveColumn}
				onMoveRow={onMoveItem}
				onRemoveColumn={removeColumn}
				onRemoveRow={onRemoveItem}
				onToggleColumnRequired={toggleColumnRequired}
				onToggleColumnVisibility={toggleColumnVisibility}
				onUpdateColumnHeader={updateColumnHeader}
			/>

			<MaterialRequestItemImportDialog
				isOpen={isImportDialogOpen}
				onClose={() => setIsImportDialogOpen(false)}
				onImportItems={(importedItems) => {
					onImportItems(importedItems);
					setIsImportDialogOpen(false);
				}}
				requiredColumnIds={requiredColumnIds}
			/>
		</>
	);
}

function renderItemCell({
	columnId,
	isReadonly,
	item,
	onUpdateItem,
}: {
	columnId: MaterialRequestItemColumnId;
	isReadonly: boolean;
	item: MaterialRequestItem;
	onUpdateItem: (
		itemId: string,
		field: keyof MaterialRequestItem,
		value: string | number,
	) => void;
}) {
	if (columnId === "uom") {
		return (
			<select
				value={item.uom}
				disabled={isReadonly}
				onChange={(event) => onUpdateItem(item.id, "uom", event.target.value)}
				className={`${cellControlClassName()} app-select-control`}
			>
				{MaterialRequestUomOptions.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		);
	}

	if (columnId === "requestQuantity" || columnId === "stockQuantity") {
		return (
			<NumberInput
				readOnly={isReadonly}
				value={Number(item[columnId])}
				onChange={(value) => onUpdateItem(item.id, columnId, value)}
			/>
		);
	}

	return (
		<ItemInput
			readOnly={isReadonly}
			value={String(item[columnId] ?? "")}
			onChange={(value) => onUpdateItem(item.id, columnId, value)}
		/>
	);
}

function MaterialRequestItemImportDialog({
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
	const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
	const validatedPreviewRows = useMemo(
		() =>
			previewRows.map((row) => ({
				...row,
				errors: validateImportItem(row.item, requiredColumnIds),
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
		value: string | number,
	) {
		setPreviewRows((currentRows) =>
			currentRows.map((row) => {
				if (row.id !== rowId) {
					return row;
				}

				const nextItem = { ...row.item, [field]: value };

				return {
					...row,
					errors: validateImportItem(nextItem, requiredColumnIds),
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

	function downloadImportTemplate() {
		downloadBytesFile(
			"material-request-item-template.xlsx",
			createXlsxWorkbook(
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
	rows: ImportPreviewRow[];
	rowOffset: number;
	onUpdateItem: (
		rowId: string,
		field: MaterialRequestItemColumnId,
		value: string | number,
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
						<th className="w-[15rem] border border-darknavy/10 px-2 py-2 font-semibold">
							Validation
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr key={row.id} className="border-b border-darknavy/10">
							<td className="border border-darknavy/10 px-2 py-2 text-center font-semibold">
								{rowOffset + index + 1}
							</td>
							{DefaultItemColumnOrder.map((columnId) => (
								<td
									key={`${row.id}-${columnId}`}
									className="border border-darknavy/10 p-0"
								>
									{columnId === "uom" ? (
										<select
											value={row.item.uom}
											onChange={(event) =>
												onUpdateItem(row.id, "uom", event.target.value)
											}
											className={`${previewCellClassName()} app-select-control`}
										>
											{MaterialRequestUomOptions.map((option) => (
												<option key={option} value={option}>
													{option}
												</option>
											))}
										</select>
									) : columnId === "requestQuantity" ||
										columnId === "stockQuantity" ? (
										<input
											type="number"
											min="0"
											value={Number(row.item[columnId])}
											onChange={(event) =>
												onUpdateItem(
													row.id,
													columnId,
													Number(event.target.value),
												)
											}
											className={previewCellClassName("text-right")}
										/>
									) : (
										<input
											type="text"
											value={String(row.item[columnId] ?? "")}
											onChange={(event) =>
												onUpdateItem(row.id, columnId, event.target.value)
											}
											className={previewCellClassName()}
										/>
									)}
								</td>
							))}
							<td className="border border-darknavy/10 px-2 py-2">
								{row.errors.length === 0 ? (
									<span className="inline-flex items-center gap-1.5 rounded-full border border-citron/30 bg-citron/12 px-2 py-1 text-[11px] font-semibold text-darknavy">
										<CheckCircle2
											className="h-3.5 w-3.5 text-citron"
											aria-hidden="true"
										/>
										Ready
									</span>
								) : (
									<ul className="grid gap-1 text-[11px] font-semibold text-coralpink">
										{row.errors.map((error) => (
											<li key={error}>{error}</li>
										))}
									</ul>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function ItemInput({
	onChange,
	readOnly,
	value,
}: {
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<input
			type="text"
			value={value}
			readOnly={readOnly}
			onChange={(event) => onChange(event.target.value)}
			className={cellControlClassName()}
		/>
	);
}

function NumberInput({
	onChange,
	readOnly,
	value,
}: {
	onChange: (value: number) => void;
	readOnly: boolean;
	value: number;
}) {
	return (
		<input
			type="number"
			min="0"
			value={value}
			readOnly={readOnly}
			onChange={(event) => onChange(Number(event.target.value))}
			className={cellControlClassName("text-right")}
		/>
	);
}

function parseMaterialRequestImportText(
	text: string,
	requiredColumnIds: MaterialRequestItemColumnId[],
) {
	const trimmedText = text.trim();

	if (!trimmedText) {
		throw new Error("No item rows were found to import.");
	}

	const delimiter = trimmedText.includes("\t") ? "\t" : ",";
	const rows =
		delimiter === "\t"
			? trimmedText
					.split(/\r?\n/)
					.map((line) => line.split("\t").map((cell) => cell.trim()))
			: parseCsvRows(trimmedText);
	const nonEmptyRows = rows.filter((row) =>
		row.some((cell) => String(cell ?? "").trim() !== ""),
	);

	if (nonEmptyRows.length === 0) {
		throw new Error("No item rows were found to import.");
	}

	const headerIndexes = getImportHeaderIndexes(nonEmptyRows[0]);
	const dataRows = headerIndexes ? nonEmptyRows.slice(1) : nonEmptyRows;
	const indexes = headerIndexes ?? DefaultImportIndexes;
	const previewRows = dataRows
		.map((row) => createImportPreviewRow(row, indexes, requiredColumnIds))
		.filter((row) => materialRequestItemHasData(row.item));

	if (previewRows.length === 0) {
		throw new Error("The import did not contain usable item rows.");
	}

	return previewRows;
}

function createImportPreviewRow(
	row: string[],
	indexes: Partial<Record<MaterialRequestItemColumnId, number>>,
	requiredColumnIds: MaterialRequestItemColumnId[],
): ImportPreviewRow {
	const item: MaterialRequestItem = {
		...emptyMaterialRequestItem,
		barcode: getImportedValue(row, indexes.barcode),
		category: getImportedValue(row, indexes.category),
		id: createMaterialRequestId("import-item"),
		itemCode: getImportedValue(row, indexes.itemCode),
		itemName: getImportedValue(row, indexes.itemName),
		lotNo: getImportedValue(row, indexes.lotNo),
		requestQuantity: normalizeImportedNumber(
			getImportedValue(row, indexes.requestQuantity),
		),
		remarks: getImportedValue(row, indexes.remarks),
		stockQuantity: normalizeImportedNumber(
			getImportedValue(row, indexes.stockQuantity),
		),
		uom: getImportedValue(row, indexes.uom) || emptyMaterialRequestItem.uom,
	};

	return {
		errors: validateImportItem(item, requiredColumnIds),
		id: createMaterialRequestId("import-row"),
		item,
	};
}

function validateImportItem(
	item: MaterialRequestItem,
	requiredColumnIds: MaterialRequestItemColumnId[],
) {
	const result = MaterialRequestItemValidationSchema.safeParse(item);
	const errors = result.success
		? []
		: result.error.issues.map((issue) => issue.message);

	requiredColumnIds.forEach((columnId) => {
		if (DefaultRequiredItemColumnIds.has(columnId)) {
			return;
		}

		if (itemColumnHasRequiredValue(item, columnId)) {
			return;
		}

		errors.push(`Enter ${DefaultItemColumnLabels[columnId].toLowerCase()}.`);
	});

	return Array.from(new Set(errors));
}

function getImportHeaderIndexes(row: string[]) {
	const indexes: Partial<Record<MaterialRequestItemColumnId, number>> = {};

	row.forEach((cell, index) => {
		const key = normalizeImportHeader(cell);

		if (key) {
			indexes[key] = index;
		}
	});

	return Object.keys(indexes).length >= 2
		? (indexes as Partial<Record<MaterialRequestItemColumnId, number>>)
		: null;
}

function normalizeImportHeader(value: string): MaterialRequestItemColumnId | null {
	const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

	if (["itemcode", "code", "sku"].includes(normalized)) {
		return "itemCode";
	}

	if (["barcode", "barcodeno"].includes(normalized)) {
		return "barcode";
	}

	if (["itemname", "name", "description"].includes(normalized)) {
		return "itemName";
	}

	if (["itemcategory", "category"].includes(normalized)) {
		return "category";
	}

	if (["uom", "unit", "unitofmeasure"].includes(normalized)) {
		return "uom";
	}

	if (["requestqty", "requestquantity", "qty", "quantity"].includes(normalized)) {
		return "requestQuantity";
	}

	if (["stockqty", "stockquantity", "stock"].includes(normalized)) {
		return "stockQuantity";
	}

	if (["lotno", "lotnumber", "lot"].includes(normalized)) {
		return "lotNo";
	}

	if (["remarks", "remark", "notes", "memo"].includes(normalized)) {
		return "remarks";
	}

	return null;
}

function parseCsvRows(text: string) {
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

		if ((char === "\n" || char === "\r") && !isQuoted) {
			if (char === "\r" && nextChar === "\n") {
				index += 1;
			}

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

function getImportedValue(row: string[], index?: number) {
	return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

function normalizeImportedNumber(value: string) {
	const amount = Number(value.replace(/[,$\s]/g, ""));

	return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function itemColumnHasRequiredValue(
	item: MaterialRequestItem,
	columnId: MaterialRequestItemColumnId,
) {
	if (columnId === "requestQuantity" || columnId === "stockQuantity") {
		return Number(item[columnId]) > 0;
	}

	return String(item[columnId] ?? "").trim() !== "";
}

async function readMaterialRequestImportFileText(file: File) {
	const fileName = file.name.toLowerCase();

	if (fileName.endsWith(".xlsx")) {
		const rows = await readMaterialRequestXlsxRawRows(await file.arrayBuffer());

		return formatRowsAsTabularText(rows);
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

async function readMaterialRequestXlsxRawRows(buffer: ArrayBuffer) {
	const entries = await readZipEntries(buffer);
	const sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml"));
	const sheetPath = findFirstWorksheetPath(entries);
	const sheetXml = entries.get(sheetPath);

	if (!sheetXml) {
		throw new Error("No worksheet was found in the Excel file.");
	}

	const documentNode = new DOMParser().parseFromString(sheetXml, "text/xml");

	return Array.from(documentNode.getElementsByTagName("row")).map((row) => {
		const cells: string[] = [];

		Array.from(row.getElementsByTagName("c")).forEach((cell) => {
			const reference = cell.getAttribute("r") ?? "";
			const columnIndex = getExcelColumnIndex(reference);
			const cellType = cell.getAttribute("t");
			const rawValue =
				cellType === "inlineStr"
					? Array.from(cell.getElementsByTagName("t"))
							.map((node) => node.textContent ?? "")
							.join("")
					: (cell.getElementsByTagName("v")[0]?.textContent ?? "");
			const value =
				cellType === "s" ? (sharedStrings[Number(rawValue)] ?? "") : rawValue;

			if (columnIndex >= 0) {
				cells[columnIndex] = value.trim();
			}
		});

		return cells;
	});
}

function formatRowsAsTabularText(rows: string[][]) {
	return rows
		.filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
		.map((row) => row.map(formatTabularCell).join("\t"))
		.join("\n");
}

function formatTabularCell(value: string) {
	return String(value ?? "")
		.replace(/\r?\n/g, " ")
		.trim();
}

function materialRequestItemHasData(item: MaterialRequestItem) {
	return (
		item.barcode.trim() !== "" ||
		item.category.trim() !== "" ||
		item.itemCode.trim() !== "" ||
		item.itemName.trim() !== "" ||
		item.lotNo.trim() !== "" ||
		item.remarks.trim() !== "" ||
		item.requestQuantity !== emptyMaterialRequestItem.requestQuantity ||
		item.stockQuantity !== emptyMaterialRequestItem.stockQuantity ||
		item.uom !== emptyMaterialRequestItem.uom
	);
}

function isItemColumnId(columnId: string): columnId is MaterialRequestItemColumnId {
	return DefaultItemColumnOrder.includes(
		columnId as MaterialRequestItemColumnId,
	);
}

function cellControlClassName(extraClassName?: string) {
	return joinClasses(
		"app-data-entry-field h-10 w-full rounded-none border-0 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy",
		extraClassName,
	);
}

function previewCellClassName(extraClassName?: string) {
	return joinClasses(
		"app-data-entry-field h-10 w-full rounded-none border-0 bg-white px-2 text-xs font-medium text-darknavy outline-none transition focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35",
		extraClassName,
	);
}

function downloadBytesFile(
	fileName: string,
	content: BlobPart,
	type: string,
) {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(url);
}

function createXlsxWorkbook(rows: string[][], sheetName: string) {
	const worksheetXml = createWorksheetXml(rows);
	const workbookXml = createWorkbookXml(sheetName);

	return createStoredZipArchive([
		{
			name: "[Content_Types].xml",
			text:
				'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
				'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
				'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
				'<Default Extension="xml" ContentType="application/xml"/>' +
				'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
				'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
				"</Types>",
		},
		{
			name: "_rels/.rels",
			text:
				'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
				'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
				'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
				"</Relationships>",
		},
		{
			name: "xl/workbook.xml",
			text: workbookXml,
		},
		{
			name: "xl/_rels/workbook.xml.rels",
			text:
				'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
				'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
				'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
				"</Relationships>",
		},
		{
			name: "xl/worksheets/sheet1.xml",
			text: worksheetXml,
		},
	]);
}

function createWorkbookXml(sheetName: string) {
	return (
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
		'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
		`<sheets><sheet name="${escapeXmlText(sheetName)}" sheetId="1" r:id="rId1"/></sheets>` +
		"</workbook>"
	);
}

function createWorksheetXml(rows: string[][]) {
	const rowXml = rows
		.map((row, rowIndex) => {
			const rowNumber = rowIndex + 1;
			const cellXml = row
				.map((cell, columnIndex) => {
					const reference = `${getExcelColumnLetters(columnIndex)}${rowNumber}`;
					const value = String(cell ?? "");

					return (
						`<c r="${reference}" t="inlineStr">` +
						`<is><t>${escapeXmlText(value)}</t></is>` +
						"</c>"
					);
				})
				.join("");

			return `<row r="${rowNumber}">${cellXml}</row>`;
		})
		.join("");

	return (
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
		"<sheetData>" +
		rowXml +
		"</sheetData>" +
		"</worksheet>"
	);
}

function createStoredZipArchive(files: { name: string; text: string }[]) {
	const encoder = new TextEncoder();
	const localParts: Uint8Array[] = [];
	const centralParts: Uint8Array[] = [];
	let offset = 0;

	files.forEach((file) => {
		const nameBytes = encoder.encode(file.name);
		const dataBytes = encoder.encode(file.text);
		const crc = calculateCrc32(dataBytes);
		const localHeader = createZipLocalHeader(nameBytes, dataBytes, crc);
		const centralHeader = createZipCentralHeader(
			nameBytes,
			dataBytes,
			crc,
			offset,
		);

		localParts.push(localHeader, dataBytes);
		centralParts.push(centralHeader);
		offset += localHeader.byteLength + dataBytes.byteLength;
	});

	const centralDirectoryOffset = offset;
	const centralDirectorySize = centralParts.reduce(
		(sum, part) => sum + part.byteLength,
		0,
	);
	const endRecord = createZipEndRecord(
		files.length,
		centralDirectorySize,
		centralDirectoryOffset,
	);

	return concatBytes([...localParts, ...centralParts, endRecord]);
}

function createZipLocalHeader(
	nameBytes: Uint8Array,
	dataBytes: Uint8Array,
	crc: number,
) {
	const header = new Uint8Array(30 + nameBytes.byteLength);
	const view = new DataView(header.buffer);

	view.setUint32(0, 0x04034b50, true);
	view.setUint16(4, 20, true);
	view.setUint16(6, 0, true);
	view.setUint16(8, 0, true);
	view.setUint16(10, 0, true);
	view.setUint16(12, 0, true);
	view.setUint32(14, crc, true);
	view.setUint32(18, dataBytes.byteLength, true);
	view.setUint32(22, dataBytes.byteLength, true);
	view.setUint16(26, nameBytes.byteLength, true);
	view.setUint16(28, 0, true);
	header.set(nameBytes, 30);

	return header;
}

function createZipCentralHeader(
	nameBytes: Uint8Array,
	dataBytes: Uint8Array,
	crc: number,
	localHeaderOffset: number,
) {
	const header = new Uint8Array(46 + nameBytes.byteLength);
	const view = new DataView(header.buffer);

	view.setUint32(0, 0x02014b50, true);
	view.setUint16(4, 20, true);
	view.setUint16(6, 20, true);
	view.setUint16(8, 0, true);
	view.setUint16(10, 0, true);
	view.setUint16(12, 0, true);
	view.setUint16(14, 0, true);
	view.setUint32(16, crc, true);
	view.setUint32(20, dataBytes.byteLength, true);
	view.setUint32(24, dataBytes.byteLength, true);
	view.setUint16(28, nameBytes.byteLength, true);
	view.setUint16(30, 0, true);
	view.setUint16(32, 0, true);
	view.setUint16(34, 0, true);
	view.setUint16(36, 0, true);
	view.setUint32(38, 0, true);
	view.setUint32(42, localHeaderOffset, true);
	header.set(nameBytes, 46);

	return header;
}

function createZipEndRecord(
	fileCount: number,
	centralDirectorySize: number,
	centralDirectoryOffset: number,
) {
	const header = new Uint8Array(22);
	const view = new DataView(header.buffer);

	view.setUint32(0, 0x06054b50, true);
	view.setUint16(4, 0, true);
	view.setUint16(6, 0, true);
	view.setUint16(8, fileCount, true);
	view.setUint16(10, fileCount, true);
	view.setUint32(12, centralDirectorySize, true);
	view.setUint32(16, centralDirectoryOffset, true);
	view.setUint16(20, 0, true);

	return header;
}

function concatBytes(parts: Uint8Array[]) {
	const totalLength = parts.reduce((sum, part) => sum + part.byteLength, 0);
	const output = new Uint8Array(totalLength);
	let offset = 0;

	parts.forEach((part) => {
		output.set(part, offset);
		offset += part.byteLength;
	});

	return output;
}

function calculateCrc32(bytes: Uint8Array) {
	let crc = 0xffffffff;

	bytes.forEach((byte) => {
		crc ^= byte;

		for (let bit = 0; bit < 8; bit += 1) {
			crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
		}
	});

	return (crc ^ 0xffffffff) >>> 0;
}

async function readZipEntries(buffer: ArrayBuffer) {
	const view = new DataView(buffer);
	const entries = new Map<string, string>();
	const endOfCentralDirectoryOffset = findEndOfCentralDirectory(view);
	const entryCount = view.getUint16(endOfCentralDirectoryOffset + 10, true);
	let centralDirectoryOffset = view.getUint32(
		endOfCentralDirectoryOffset + 16,
		true,
	);
	const decoder = new TextDecoder();

	for (let index = 0; index < entryCount; index += 1) {
		if (view.getUint32(centralDirectoryOffset, true) !== 0x02014b50) {
			break;
		}

		const compressionMethod = view.getUint16(
			centralDirectoryOffset + 10,
			true,
		);
		const compressedSize = view.getUint32(centralDirectoryOffset + 20, true);
		const fileNameLength = view.getUint16(centralDirectoryOffset + 28, true);
		const extraLength = view.getUint16(centralDirectoryOffset + 30, true);
		const commentLength = view.getUint16(centralDirectoryOffset + 32, true);
		const localHeaderOffset = view.getUint32(centralDirectoryOffset + 42, true);
		const fileNameBytes = new Uint8Array(
			buffer,
			centralDirectoryOffset + 46,
			fileNameLength,
		);
		const fileName = decoder.decode(fileNameBytes);
		const localFileNameLength = view.getUint16(localHeaderOffset + 26, true);
		const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
		const dataOffset =
			localHeaderOffset + 30 + localFileNameLength + localExtraLength;
		const compressedBytes = buffer.slice(dataOffset, dataOffset + compressedSize);
		const fileText =
			compressionMethod === 0
				? decoder.decode(compressedBytes)
				: compressionMethod === 8
					? decoder.decode(await inflateRaw(compressedBytes))
					: "";

		if (fileText) {
			entries.set(fileName, fileText);
		}

		centralDirectoryOffset += 46 + fileNameLength + extraLength + commentLength;
	}

	return entries;
}

function findEndOfCentralDirectory(view: DataView) {
	const minimumOffset = Math.max(0, view.byteLength - 66000);

	for (let offset = view.byteLength - 22; offset >= minimumOffset; offset -= 1) {
		if (view.getUint32(offset, true) === 0x06054b50) {
			return offset;
		}
	}

	throw new Error("The Excel file could not be read.");
}

async function inflateRaw(compressedBytes: ArrayBuffer) {
	if (typeof DecompressionStream === "undefined") {
		throw new Error("This browser cannot read compressed Excel files.");
	}

	const stream = new Blob([compressedBytes])
		.stream()
		.pipeThrough(new DecompressionStream("deflate-raw"));

	return new Response(stream).arrayBuffer();
}

function parseSharedStrings(xml?: string) {
	if (!xml) {
		return [];
	}

	const documentNode = new DOMParser().parseFromString(xml, "text/xml");

	return Array.from(documentNode.getElementsByTagName("si")).map((item) =>
		Array.from(item.getElementsByTagName("t"))
			.map((node) => node.textContent ?? "")
			.join(""),
	);
}

function findFirstWorksheetPath(entries: Map<string, string>) {
	if (entries.has("xl/worksheets/sheet1.xml")) {
		return "xl/worksheets/sheet1.xml";
	}

	const worksheetPath = Array.from(entries.keys()).find(
		(path) => path.startsWith("xl/worksheets/") && path.endsWith(".xml"),
	);

	if (!worksheetPath) {
		throw new Error("No worksheet was found in the Excel file.");
	}

	return worksheetPath;
}

function getExcelColumnIndex(reference: string) {
	const columnLetters = reference.match(/[A-Z]+/i)?.[0]?.toUpperCase() ?? "";

	if (!columnLetters) {
		return -1;
	}

	return (
		columnLetters.split("").reduce((sum, letter) => {
			return sum * 26 + letter.charCodeAt(0) - 64;
		}, 0) - 1
	);
}

function getExcelColumnLetters(columnIndex: number) {
	let columnNumber = columnIndex + 1;
	let letters = "";

	while (columnNumber > 0) {
		const remainder = (columnNumber - 1) % 26;
		letters = String.fromCharCode(65 + remainder) + letters;
		columnNumber = Math.floor((columnNumber - 1) / 26);
	}

	return letters;
}

function createSimplePdf(title: string, rows: string[][]) {
	const pageWidth = 792;
	const pageHeight = 612;
	const margin = 36;
	const lineHeight = 14;
	const maxLineLength = 132;
	const lines = [
		title,
		`Generated: ${new Date().toLocaleString()}`,
		"",
		...rows.map((row) =>
			row
				.map((cell) => String(cell ?? "").replace(/\s+/g, " ").trim())
				.join(" | "),
		),
	];
	const pages: string[][] = [];
	let currentPage: string[] = [];

	lines.flatMap((line) => wrapPdfLine(line, maxLineLength)).forEach((line) => {
		if (currentPage.length >= Math.floor((pageHeight - margin * 2) / lineHeight)) {
			pages.push(currentPage);
			currentPage = [];
		}

		currentPage.push(line);
	});

	if (currentPage.length > 0) {
		pages.push(currentPage);
	}

	const objects: string[] = [];
	const pageObjectNumbers: number[] = [];
	const fontObjectNumber = 3;
	let nextObjectNumber = 4;

	pages.forEach((pageLines) => {
		const contentObjectNumber = nextObjectNumber;
		const pageObjectNumber = nextObjectNumber + 1;
		nextObjectNumber += 2;
		const content = createPdfPageContent(pageLines, margin, pageHeight, lineHeight);

		objects[contentObjectNumber] =
			`<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`;
		objects[pageObjectNumber] =
			`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
			`/Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> ` +
			`/Contents ${contentObjectNumber} 0 R >>`;
		pageObjectNumbers.push(pageObjectNumber);
	});

	objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
	objects[2] =
		`<< /Type /Pages /Count ${pageObjectNumbers.length} /Kids [` +
		pageObjectNumbers.map((objectNumber) => `${objectNumber} 0 R`).join(" ") +
		"] >>";
	objects[fontObjectNumber] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

	return writePdfObjects(objects);
}

function createPdfPageContent(
	lines: string[],
	margin: number,
	pageHeight: number,
	lineHeight: number,
) {
	const startY = pageHeight - margin;

	return [
		"BT",
		"/F1 9 Tf",
		`${margin} ${startY} Td`,
		...lines.flatMap((line, index) => [
			index === 0 ? "" : `0 -${lineHeight} Td`,
			`(${escapePdfText(line)}) Tj`,
		]),
		"ET",
	]
		.filter(Boolean)
		.join("\n");
}

function wrapPdfLine(line: string, maxLineLength: number) {
	if (line.length <= maxLineLength) {
		return [line];
	}

	const chunks: string[] = [];
	let remaining = line;

	while (remaining.length > maxLineLength) {
		const breakIndex = Math.max(
			remaining.lastIndexOf(" ", maxLineLength),
			Math.floor(maxLineLength * 0.75),
		);

		chunks.push(remaining.slice(0, breakIndex).trimEnd());
		remaining = remaining.slice(breakIndex).trimStart();
	}

	chunks.push(remaining);
	return chunks;
}

function writePdfObjects(objects: string[]) {
	const parts = ["%PDF-1.4\n"];
	const offsets: number[] = [0];
	let offset = byteLength(parts[0]);

	for (let objectNumber = 1; objectNumber < objects.length; objectNumber += 1) {
		const object = objects[objectNumber];

		if (!object) {
			continue;
		}

		offsets[objectNumber] = offset;
		const part = `${objectNumber} 0 obj\n${object}\nendobj\n`;

		parts.push(part);
		offset += byteLength(part);
	}

	const xrefOffset = offset;
	const xrefRows = Array.from({ length: objects.length }, (_, index) => {
		if (index === 0) {
			return "0000000000 65535 f ";
		}

		return `${String(offsets[index] ?? 0).padStart(10, "0")} 00000 n `;
	}).join("\n");
	const trailer =
		`xref\n0 ${objects.length}\n${xrefRows}\n` +
		`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\n` +
		`startxref\n${xrefOffset}\n%%EOF`;

	parts.push(trailer);
	return new TextEncoder().encode(parts.join(""));
}

function byteLength(value: string) {
	return new TextEncoder().encode(value).byteLength;
}

function escapePdfText(value: string) {
	return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function escapeXmlText(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

const DefaultItemColumnOrder = [
	"itemCode",
	"barcode",
	"itemName",
	"category",
	"uom",
	"requestQuantity",
	"stockQuantity",
	"lotNo",
	"remarks",
] satisfies MaterialRequestItemColumnId[];

const DefaultRequiredItemColumnOrder = [
	"itemCode",
	"itemName",
	"uom",
	"requestQuantity",
] satisfies MaterialRequestItemColumnId[];

const DefaultRequiredItemColumnIds = new Set<MaterialRequestItemColumnId>(
	DefaultRequiredItemColumnOrder,
);

const ProtectedItemColumnIds = DefaultRequiredItemColumnIds;

const DefaultItemColumnLabels: Record<MaterialRequestItemColumnId, string> = {
	barcode: "Barcode",
	category: "Item Category",
	itemCode: "Item Code",
	itemName: "Item Name",
	lotNo: "Lot No.",
	remarks: "Remarks",
	requestQuantity: "Request QTY",
	stockQuantity: "Stock QTY",
	uom: "UOM",
};

const ItemColumnWidthClassNames: Record<MaterialRequestItemColumnId, string> = {
	barcode: "w-[11rem]",
	category: "w-[15rem]",
	itemCode: "w-[11rem]",
	itemName: "w-[17rem]",
	lotNo: "w-[11rem]",
	remarks: "w-[16rem]",
	requestQuantity: "w-[10rem]",
	stockQuantity: "w-[10rem]",
	uom: "w-[10rem]",
};

const DefaultImportIndexes: Partial<Record<MaterialRequestItemColumnId, number>> = {
	barcode: 1,
	category: 3,
	itemCode: 0,
	itemName: 2,
	lotNo: 7,
	remarks: 8,
	requestQuantity: 5,
	stockQuantity: 6,
	uom: 4,
};

const MaterialRequestImportTemplateRows = [
	[
		"ITM-0001",
		"480000000001",
		"Portland Cement",
		"Construction Materials",
		"Bag",
		"120",
		"320",
		"LOT-CEM-2405",
		"Priority site requirement",
	],
	[
		"ITM-0002",
		"480000000002",
		"Steel Bar 10mm",
		"Construction Materials",
		"Pcs",
		"75",
		"210",
		"LOT-STL-2405",
		"For structural works",
	],
];

const ImportPageSize = 8;
