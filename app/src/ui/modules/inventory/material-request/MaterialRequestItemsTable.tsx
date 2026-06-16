"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
	AlertCircle,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	ClipboardPaste,
	FileText,
	MoreHorizontal,
	Upload,
	X,
} from "lucide-react";
import { MaterialRequestUomOptions } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import {
	createMaterialRequestId,
	emptyMaterialRequestItem,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import type {
	MaterialRequestItem,
	MaterialRequestNumberValue,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { MaterialRequestItemValidationSchema } from "@/app/src/validations/modules/inventory/material-request/MaterialRequestValidation";
import {
	ModuleDataEntry,
	type ModuleDataEntryCellContext,
	type ModuleDataEntryCellTarget,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
	type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleTextareaDialog } from "@/app/src/ui/shared/module/ModuleTextareaDialog";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MaterialRequestItemColumnId = Exclude<keyof MaterialRequestItem, "id">;

type MaterialRequestItemsTableProps = {
	error?: string;
	isReadonly: boolean;
	items: MaterialRequestItem[];
	onAddItems: (count: number) => void;
	onClearItem: (itemId: string) => void;
	onClearItems: (action: ModuleDataEntryClearAction) => void;
	onDuplicateItem: (itemId: string) => void;
	onImportItems: (items: MaterialRequestItem[]) => void;
	onInsertItem: (itemId: string, position: "above" | "below") => void;
	onMoveItem: (fromItemId: string, toItemId: string) => void;
	onPasteItemCells: (
		startItemId: string,
		updates: Partial<MaterialRequestItem>[],
	) => void;
	onRemoveItem: (itemId: string) => void;
	onUpdateItem: (
		itemId: string,
		field: keyof MaterialRequestItem,
		value: MaterialRequestItem[keyof MaterialRequestItem],
	) => void;
};

type ImportPreviewRow = {
	errors: string[];
	fieldErrors: MaterialRequestItemValidationMessages;
	id: string;
	item: MaterialRequestItem;
};

type MaterialRequestItemValidationMessages = Partial<
	Record<MaterialRequestItemColumnId, string>
>;

type MaterialRequestItemValidationResult = {
	errors: string[];
	fieldErrors: MaterialRequestItemValidationMessages;
};

export function MaterialRequestItemsTable({
	error,
	isReadonly,
	items,
	onAddItems,
	onClearItem,
	onClearItems,
	onDuplicateItem,
	onImportItems,
	onInsertItem,
	onMoveItem,
	onPasteItemCells,
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
	const [columnWidths, setColumnWidths] = useState(DefaultItemColumnWidths);
	const [autoWidthColumnIds, setAutoWidthColumnIds] = useState<
		MaterialRequestItemColumnId[]
	>([]);
	const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
	const [remarksEditorTarget, setRemarksEditorTarget] = useState<{
		itemId: string;
		rowNo: number;
		value: string;
	} | null>(null);
	const [touchedItemCellIds, setTouchedItemCellIds] = useState<Set<string>>(
		() => new Set(),
	);
	const resolvedColumnOrder = useMemo(
		() => mergeDefaultItemColumnOrder(columnOrder),
		[columnOrder],
	);
	const resolvedVisibleColumnIds = useMemo(
		() => resolveVisibleItemColumnIds(visibleColumnIds),
		[visibleColumnIds],
	);
	const visibleColumnOrder = resolvedColumnOrder.filter((columnId) =>
		resolvedVisibleColumnIds.includes(columnId),
	);
	const markItemCellTouched = useCallback(
		(itemId: string, columnId: MaterialRequestItemColumnId) => {
			setTouchedItemCellIds((currentIds) => {
				const itemCellId = createItemCellId(itemId, columnId);

				if (currentIds.has(itemCellId)) {
					return currentIds;
				}

				const nextIds = new Set(currentIds);

				nextIds.add(itemCellId);
				return nextIds;
			});
		},
		[],
	);
	const markItemRowTouched = useCallback((itemId: string) => {
		setTouchedItemCellIds((currentIds) => {
			const nextIds = new Set(currentIds);
			let hasNewTouchedCell = false;

			DefaultItemColumnOrder.forEach((columnId) => {
				const itemCellId = createItemCellId(itemId, columnId);

				if (!nextIds.has(itemCellId)) {
					nextIds.add(itemCellId);
					hasNewTouchedCell = true;
				}
			});

			return hasNewTouchedCell ? nextIds : currentIds;
		});
	}, []);
	const handleUpdateItem = useCallback(
		(
			itemId: string,
			field: keyof MaterialRequestItem,
			value: MaterialRequestItem[keyof MaterialRequestItem],
		) => {
			if (isItemColumnId(field)) {
				markItemCellTouched(itemId, field);
			}

			onUpdateItem(itemId, field, value);
		},
		[markItemCellTouched, onUpdateItem],
	);
	const handleClearItem = useCallback(
		(itemId: string) => {
			markItemRowTouched(itemId);
			onClearItem(itemId);
		},
		[markItemRowTouched, onClearItem],
	);
	const handleClearItemCell = useCallback(
		(itemId: string, columnId: string) => {
			if (!isItemColumnId(columnId)) {
				return;
			}

			markItemCellTouched(itemId, columnId);
			onUpdateItem(itemId, columnId, emptyMaterialRequestItem[columnId]);
		},
		[markItemCellTouched, onUpdateItem],
	);
	const getItemCellValue = useCallback(
		(item: MaterialRequestItem, columnId: string) => {
			return isItemColumnId(columnId) ? String(item[columnId] ?? "") : "";
		},
		[],
	);
	const handlePasteItemCells = useCallback(
		(target: ModuleDataEntryCellTarget, pastedRows: string[][]) => {
			if (!isItemColumnId(target.columnId) || pastedRows.length === 0) {
				return;
			}

			const startColumnIndex = visibleColumnOrder.indexOf(target.columnId);

			if (startColumnIndex === -1) {
				return;
			}

			const targetColumnIds = visibleColumnOrder.slice(startColumnIndex);
			const updates = pastedRows
				.map((row, rowOffset) => {
					const update: Partial<MaterialRequestItem> = {};
					const currentItem = items[target.rowIndex + rowOffset];

					row.forEach((cellValue, cellOffset) => {
						const columnId = targetColumnIds[cellOffset];

						if (!columnId) {
							return;
						}

						Object.assign(update, {
							[columnId]: parsePastedItemCellValue(columnId, cellValue),
						});

						if (currentItem) {
							markItemCellTouched(currentItem.id, columnId);
						}
					});

					return update;
				})
				.filter((update) => Object.keys(update).length > 0);

			if (updates.length > 0) {
				onPasteItemCells(target.rowId, updates);
			}
		},
		[
			items,
			markItemCellTouched,
			onPasteItemCells,
			visibleColumnOrder,
		],
	);
	const itemValidationMessages = useMemo(
		() => {
			const messagesById = createItemValidationMessagesById(
				items,
				requiredColumnIds,
			);

			return error
				? messagesById
				: filterItemValidationMessagesByTouchedCells(
					messagesById,
					touchedItemCellIds,
				);
		},
		[error, items, requiredColumnIds, touchedItemCellIds],
	);
	const resolvedColumnWidths = useMemo<
		Record<MaterialRequestItemColumnId, number>
	>(() => {
		const nextWidths = { ...columnWidths };

		autoWidthColumnIds.forEach((columnId) => {
			nextWidths[columnId] = calculateItemColumnFitWidth({
				columnId,
				columnLabels,
				items,
			});
		});

		return nextWidths;
	}, [autoWidthColumnIds, columnLabels, columnWidths, items]);
	const columns = useMemo<ModuleDataEntryColumn<MaterialRequestItem>[]>(
		() =>
			visibleColumnOrder.map((columnId) => ({
				header: columnLabels[columnId],
				id: columnId,
				isRemovable: !ProtectedItemColumnIds.has(columnId),
				width: resolvedColumnWidths[columnId],
				widthClassName: "",
				widthMode: autoWidthColumnIds.includes(columnId) ? "auto" : "fixed",
				renderCell: (item, index, cellContext) =>
					renderItemCell({
						cellContext,
						columnId,
						isReadonly,
						item,
						rowNo: index + 1,
						onOpenRemarks: setRemarksEditorTarget,
						onUpdateItem: handleUpdateItem,
						validationMessage: itemValidationMessages.get(item.id)?.[columnId],
					}),
			})),
		[
			autoWidthColumnIds,
			columnLabels,
			handleUpdateItem,
			itemValidationMessages,
			isReadonly,
			resolvedColumnWidths,
			visibleColumnOrder,
		],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			resolvedColumnOrder.map((columnId) => ({
				id: columnId,
				isHideable: !ProtectedItemColumnIds.has(columnId),
				isRequired: requiredColumnIds.includes(columnId),
				isRequirementConfigurable:
					!DefaultRequiredItemColumnIds.has(columnId),
				isVisible: resolvedVisibleColumnIds.includes(columnId),
				label: columnLabels[columnId],
				width: resolvedColumnWidths[columnId],
				widthMode: autoWidthColumnIds.includes(columnId) ? "auto" : "fixed",
			})),
		[
			autoWidthColumnIds,
			columnLabels,
			resolvedColumnOrder,
			resolvedColumnWidths,
			resolvedVisibleColumnIds,
			requiredColumnIds,
		],
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

	function updateColumnWidth(
		columnId: string,
		width: number,
	) {
		if (!isItemColumnId(columnId)) {
			return;
		}

		setAutoWidthColumnIds((currentColumnIds) =>
			currentColumnIds.filter((currentColumnId) => currentColumnId !== columnId),
		);
		setColumnWidths((currentWidths) => ({
			...currentWidths,
			[columnId]: Math.min(800, Math.max(50, Math.round(width))),
		}));
	}

	function autoSizeColumn(columnId: string) {
		if (!isItemColumnId(columnId)) {
			return;
		}

		setAutoWidthColumnIds((currentColumnIds) =>
			currentColumnIds.includes(columnId)
				? currentColumnIds
				: [...currentColumnIds, columnId],
		);
	}

	function fitColumnWidth(columnId: string) {
		if (!isItemColumnId(columnId)) {
			return;
		}

		updateColumnWidth(
			columnId,
			calculateItemColumnFitWidth({
				columnId,
				columnLabels,
				items,
			}),
		);
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

				return resolvedColumnOrder.filter((currentColumnId) =>
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
			!resolvedVisibleColumnIds.includes(columnId)
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

	async function exportItemsAsExcel() {
		downloadBytesFile(
			"material-request-items.xlsx",
			await createXlsxWorkbook(createExportRows(), "Material Request Items"),
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
				label: "Excel",
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
				isDraggable
				isReadonly={isReadonly}
				isRowNumberColumnFixed
				rows={items}
				title="Data Entry"
				exportOptions={exportOptions}
				getCellValue={getItemCellValue}
				onAddRows={onAddItems}
				onAutoColumnWidth={autoSizeColumn}
				onClearCell={handleClearItemCell}
				onClearRow={handleClearItem}
				onClearRows={onClearItems}
				onDuplicateRow={onDuplicateItem}
				onFitColumnWidth={fitColumnWidth}
				onImport={() => setIsImportDialogOpen(true)}
				onInsertRow={onInsertItem}
				onMoveColumn={moveColumn}
				onMoveRow={onMoveItem}
				onPasteCells={handlePasteItemCells}
				onRemoveRow={onRemoveItem}
				onToggleColumnRequired={toggleColumnRequired}
				onToggleColumnVisibility={toggleColumnVisibility}
				onUpdateColumnHeader={updateColumnHeader}
				onUpdateColumnWidth={updateColumnWidth}
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
			<ModuleTextareaDialog
				key={remarksEditorTarget?.itemId ?? "closed"}
				isOpen={Boolean(remarksEditorTarget)}
				isReadonly={isReadonly}
				title="Remarks"
				subtitle="Item Entry"
				textareaId="material-request-item-remarks-dialog-text"
				value={remarksEditorTarget?.value ?? ""}
				onClose={() => setRemarksEditorTarget(null)}
				onSave={(value) => {
					if (!remarksEditorTarget) {
						return;
					}

					handleUpdateItem(remarksEditorTarget.itemId, "remarks", value);
					setRemarksEditorTarget(null);
				}}
			/>
		</>
	);
}

function renderItemCell({
	cellContext,
	columnId,
	isReadonly,
	item,
	rowNo,
	onOpenRemarks,
	onUpdateItem,
	validationMessage,
}: {
	cellContext: ModuleDataEntryCellContext;
	columnId: MaterialRequestItemColumnId;
	isReadonly: boolean;
	item: MaterialRequestItem;
	rowNo: number;
	onOpenRemarks: (remarks: {
		itemId: string;
		rowNo: number;
		value: string;
	}) => void;
	onUpdateItem: (
		itemId: string,
		field: keyof MaterialRequestItem,
		value: MaterialRequestItem[keyof MaterialRequestItem],
	) => void;
	validationMessage?: string;
}) {
	if (columnId === "uom") {
		return (
			<div className="relative h-10 w-full">
				<select
					value={item.uom}
					disabled={isReadonly}
					aria-invalid={Boolean(validationMessage)}
					tabIndex={cellContext.focusableTabIndex}
					onChange={(event) => onUpdateItem(item.id, "uom", event.target.value)}
					className={`${cellControlClassName(undefined, validationMessage)} app-select-control`}
				>
					{MaterialRequestUomOptions.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
				<CellValidationWarning message={validationMessage} />
			</div>
		);
	}

	if (isNumericItemColumn(columnId)) {
		return (
			<NumberInput
				readOnly={isReadonly}
				tabIndex={cellContext.focusableTabIndex}
				validationMessage={validationMessage}
				value={item[columnId]}
				onChange={(value) => onUpdateItem(item.id, columnId, value)}
			/>
		);
	}

	if (isDateItemColumn(columnId)) {
		return (
			<DateInput
				readOnly={isReadonly}
				tabIndex={cellContext.focusableTabIndex}
				validationMessage={validationMessage}
				value={item[columnId]}
				onChange={(value) => onUpdateItem(item.id, columnId, value)}
			/>
		);
	}

	if (columnId === "remarks") {
		return (
			<div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.5rem]">
				<ItemInput
					readOnly={isReadonly}
					tabIndex={cellContext.focusableTabIndex}
					validationMessage={validationMessage}
					value={item.remarks}
					onChange={(value) => onUpdateItem(item.id, "remarks", value)}
				/>
				<ModuleTooltip title="Open remarks" align="end" className="h-10 w-10">
					<button
						type="button"
						onClick={() =>
							onOpenRemarks({
								itemId: item.id,
								rowNo,
								value: item.remarks,
							})
						}
						className="inline-flex h-10 w-10 items-center justify-center border-l border-darknavy/10 bg-white text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy focus:outline-none focus:ring-2 focus:ring-inset focus:ring-skyblue/35"
						aria-label={`Open remarks for row ${rowNo}`}
					>
						<MoreHorizontal className="h-4 w-4" aria-hidden="true" />
					</button>
				</ModuleTooltip>
			</div>
		);
	}

	return (
		<ItemInput
			readOnly={isReadonly}
			tabIndex={cellContext.focusableTabIndex}
			validationMessage={validationMessage}
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
	rows: ImportPreviewRow[];
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

function ItemInput({
	onChange,
	readOnly,
	tabIndex,
	validationMessage,
	value,
}: {
	onChange: (value: string) => void;
	readOnly: boolean;
	tabIndex: number;
	validationMessage?: string;
	value: string;
}) {
	return (
		<div className="relative h-10 w-full">
			<input
				type="text"
				value={value}
				readOnly={readOnly}
				aria-invalid={Boolean(validationMessage)}
				tabIndex={tabIndex}
				onChange={(event) => onChange(event.target.value)}
				className={cellControlClassName(undefined, validationMessage)}
			/>
			<CellValidationWarning message={validationMessage} />
		</div>
	);
}

function NumberInput({
	onChange,
	readOnly,
	tabIndex,
	validationMessage,
	value,
}: {
	onChange: (value: MaterialRequestNumberValue) => void;
	readOnly: boolean;
	tabIndex: number;
	validationMessage?: string;
	value: MaterialRequestNumberValue;
}) {
	return (
		<div className="relative h-10 w-full">
			<input
				type="number"
				min="0"
				value={formatNumberInputValue(value)}
				readOnly={readOnly}
				aria-invalid={Boolean(validationMessage)}
				tabIndex={tabIndex}
				onChange={(event) => onChange(parseNumberInputValue(event.target.value))}
				className={cellControlClassName("text-right", validationMessage)}
			/>
			<CellValidationWarning message={validationMessage} />
		</div>
	);
}

function DateInput({
	onChange,
	readOnly,
	tabIndex,
	validationMessage,
	value,
}: {
	onChange: (value: string) => void;
	readOnly: boolean;
	tabIndex: number;
	validationMessage?: string;
	value: string;
}) {
	return (
		<div className="relative h-10 w-full">
			<input
				type="date"
				value={value}
				readOnly={readOnly}
				aria-invalid={Boolean(validationMessage)}
				tabIndex={tabIndex}
				onChange={(event) => onChange(event.target.value)}
				className={cellControlClassName(undefined, validationMessage)}
			/>
			<CellValidationWarning message={validationMessage} />
		</div>
	);
}

function CellValidationWarning({ message }: { message?: string }) {
	const triggerRef = useRef<HTMLSpanElement>(null);
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const [tooltipStyle, setTooltipStyle] = useState({
		left: 0,
		top: 0,
		transform: "translateY(-100%)",
	});

	useLayoutEffect(() => {
		if (!isTooltipOpen || !triggerRef.current) {
			return;
		}

		const rect = triggerRef.current.getBoundingClientRect();
		const tooltipWidth = 224;
		const viewportPadding = 8;
		const left = Math.min(
			Math.max(viewportPadding, rect.right - tooltipWidth),
			window.innerWidth - tooltipWidth - viewportPadding,
		);
		const hasRoomAbove = rect.top > 56;
		const top = hasRoomAbove ? rect.top - 8 : rect.bottom + 8;

		setTooltipStyle({
			left,
			top,
			transform: hasRoomAbove ? "translateY(-100%)" : "translateY(0)",
		});
	}, [isTooltipOpen, message]);

	if (!message) {
		return null;
	}

	return (
		<span
			ref={triggerRef}
			tabIndex={-1}
			aria-label={message}
			onBlur={() => setIsTooltipOpen(false)}
			onFocus={() => setIsTooltipOpen(true)}
			onMouseEnter={() => setIsTooltipOpen(true)}
			onMouseLeave={() => setIsTooltipOpen(false)}
			className="group absolute right-2 top-1/2 z-20 inline-flex -translate-y-1/2 items-center justify-center rounded-full text-coralpink outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25"
		>
			<AlertCircle className="h-4 w-4" aria-hidden="true" />
			{isTooltipOpen && typeof document !== "undefined"
				? createPortal(
					<span
						role="tooltip"
						style={tooltipStyle}
						className="pointer-events-none fixed z-[220] w-56 rounded-md border border-coralpink/20 bg-white px-2.5 py-1.5 text-left text-xs font-semibold leading-5 text-coralpink shadow-[0_12px_30px_rgba(33,39,56,0.16)]"
					>
						{message}
					</span>,
					document.body,
				)
				: null}
		</span>
	);
}

function parseNumberInputValue(value: string): MaterialRequestNumberValue {
	if (value.trim() === "") {
		return "";
	}

	const numberValue = Number(value);

	return Number.isFinite(numberValue) ? numberValue : "";
}

function formatNumberInputValue(value: MaterialRequestNumberValue) {
	return value === "" ? "" : String(value);
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
		batchNo: getImportedValue(row, indexes.batchNo),
		barcode: getImportedValue(row, indexes.barcode),
		brand: getImportedValue(row, indexes.brand),
		category: getImportedValue(row, indexes.category),
		color: getImportedValue(row, indexes.color),
		costCenter: getImportedValue(row, indexes.costCenter),
		description: getImportedValue(row, indexes.description),
		expiryDate: getImportedValue(row, indexes.expiryDate),
		id: createMaterialRequestId("import-item"),
		itemCode: getImportedValue(row, indexes.itemCode),
		itemName: getImportedValue(row, indexes.itemName),
		lotNo: getImportedValue(row, indexes.lotNo),
		location: getImportedValue(row, indexes.location),
		manufacturingDate: getImportedValue(row, indexes.manufacturingDate),
		model: getImportedValue(row, indexes.model),
		requestQuantity: normalizeImportedNumber(
			getImportedValue(row, indexes.requestQuantity),
		),
		remarks: getImportedValue(row, indexes.remarks),
		serialNumber: getImportedValue(row, indexes.serialNumber),
		size: getImportedValue(row, indexes.size),
		stockQuantity: normalizeImportedNumber(
			getImportedValue(row, indexes.stockQuantity),
		),
		unitCost: normalizeImportedNumber(getImportedValue(row, indexes.unitCost)),
		unitPrice: normalizeImportedNumber(
			getImportedValue(row, indexes.unitPrice),
		),
		uom: getImportedValue(row, indexes.uom) || emptyMaterialRequestItem.uom,
		warehouse: getImportedValue(row, indexes.warehouse),
	};

	return {
		...validateImportItem(item, requiredColumnIds),
		id: createMaterialRequestId("import-row"),
		item,
	};
}

function validateImportItem(
	item: MaterialRequestItem,
	requiredColumnIds: MaterialRequestItemColumnId[],
): MaterialRequestItemValidationResult {
	const fieldErrors = createItemValidationMessages(item, requiredColumnIds);
	const errors = Object.values(fieldErrors);

	return {
		errors: Array.from(new Set(errors)),
		fieldErrors,
	};
}

function createItemValidationMessagesById(
	items: MaterialRequestItem[],
	requiredColumnIds: MaterialRequestItemColumnId[],
) {
	const messagesById = new Map<string, MaterialRequestItemValidationMessages>();

	items.forEach((item) => {
		const fieldErrors = createItemValidationMessages(item, requiredColumnIds);

		if (Object.keys(fieldErrors).length > 0) {
			messagesById.set(item.id, fieldErrors);
		}
	});

	return messagesById;
}

function filterItemValidationMessagesByTouchedCells(
	messagesById: Map<string, MaterialRequestItemValidationMessages>,
	touchedItemCellIds: Set<string>,
) {
	const touchedMessagesById =
		new Map<string, MaterialRequestItemValidationMessages>();

	messagesById.forEach((fieldErrors, itemId) => {
		const touchedFieldErrors: MaterialRequestItemValidationMessages = {};

		Object.entries(fieldErrors).forEach(([columnId, message]) => {
			if (
				message &&
				isItemColumnId(columnId) &&
				touchedItemCellIds.has(createItemCellId(itemId, columnId))
			) {
				touchedFieldErrors[columnId] = message;
			}
		});

		if (Object.keys(touchedFieldErrors).length > 0) {
			touchedMessagesById.set(itemId, touchedFieldErrors);
		}
	});

	return touchedMessagesById;
}

function createItemValidationMessages(
	item: MaterialRequestItem,
	requiredColumnIds: MaterialRequestItemColumnId[],
) {
	const result = MaterialRequestItemValidationSchema.safeParse(item);
	const fieldErrors: MaterialRequestItemValidationMessages = {};

	if (!result.success) {
		result.error.issues.forEach((issue) => {
			const columnId = issue.path[0];

			if (
				typeof columnId === "string" &&
				isItemColumnId(columnId) &&
				!fieldErrors[columnId]
			) {
				fieldErrors[columnId] = issue.message;
			}
		});
	}

	requiredColumnIds.forEach((columnId) => {
		if (DefaultRequiredItemColumnIds.has(columnId)) {
			return;
		}

		if (itemColumnHasRequiredValue(item, columnId)) {
			return;
		}

		fieldErrors[columnId] =
			fieldErrors[columnId] ??
			`Enter ${DefaultItemColumnLabels[columnId].toLowerCase()}.`;
	});

	return fieldErrors;
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

	if (["itemname", "name"].includes(normalized)) {
		return "itemName";
	}

	if (["description", "itemdescription", "desc"].includes(normalized)) {
		return "description";
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

	if (["serialnumber", "serialno", "serial", "sn"].includes(normalized)) {
		return "serialNumber";
	}

	if (["expirydate", "expirationdate", "expiry", "expiration"].includes(normalized)) {
		return "expiryDate";
	}

	if (["costcenter", "responsibilitycenter", "responsibility"].includes(normalized)) {
		return "costCenter";
	}

	if (["color", "colour"].includes(normalized)) {
		return "color";
	}

	if (["brand"].includes(normalized)) {
		return "brand";
	}

	if (["size"].includes(normalized)) {
		return "size";
	}

	if (["model"].includes(normalized)) {
		return "model";
	}

	if (["manufacturingdate", "manufacturedate", "mfgdate"].includes(normalized)) {
		return "manufacturingDate";
	}

	if (["location", "binlocation", "bin"].includes(normalized)) {
		return "location";
	}

	if (["warehouse", "whse"].includes(normalized)) {
		return "warehouse";
	}

	if (["unitcost", "cost"].includes(normalized)) {
		return "unitCost";
	}

	if (["unitprice", "price"].includes(normalized)) {
		return "unitPrice";
	}

	if (["batchno", "batchnumber", "batch"].includes(normalized)) {
		return "batchNo";
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
	const normalizedValue = value.replace(/[,$\s]/g, "");

	if (!normalizedValue) {
		return "";
	}

	const amount = Number(normalizedValue);

	return Number.isFinite(amount) ? amount : "";
}

function parsePastedItemCellValue(
	columnId: MaterialRequestItemColumnId,
	value: string,
) {
	if (isNumericItemColumn(columnId)) {
		return normalizeImportedNumber(value);
	}

	return String(value ?? "").trim();
}

function itemColumnHasRequiredValue(
	item: MaterialRequestItem,
	columnId: MaterialRequestItemColumnId,
) {
	if (isNumericItemColumn(columnId)) {
		const value = item[columnId];

		if (value === "") {
			return false;
		}

		return columnId === "requestQuantity" ? Number(value) > 0 : Number(value) >= 0;
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
	const ExcelJS = await loadExcelJs();
	const workbook = new ExcelJS.Workbook();

	await workbook.xlsx.load(buffer);

	const worksheet = workbook.worksheets[0];

	if (!worksheet) {
		throw new Error("No worksheet was found in the Excel file.");
	}

	const rows: string[][] = [];

	worksheet.eachRow({ includeEmpty: false }, (row) => {
		const cells: string[] = [];

		row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
			cells[columnNumber - 1] = formatExcelCellValue(cell.value, cell.text);
		});

		rows.push(cells);
	});

	return rows;
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
		item.batchNo.trim() !== "" ||
		item.barcode.trim() !== "" ||
		item.brand.trim() !== "" ||
		item.category.trim() !== "" ||
		item.color.trim() !== "" ||
		item.costCenter.trim() !== "" ||
		item.description.trim() !== "" ||
		item.expiryDate.trim() !== "" ||
		item.itemCode.trim() !== "" ||
		item.itemName.trim() !== "" ||
		item.lotNo.trim() !== "" ||
		item.location.trim() !== "" ||
		item.manufacturingDate.trim() !== "" ||
		item.model.trim() !== "" ||
		item.remarks.trim() !== "" ||
		item.serialNumber.trim() !== "" ||
		item.size.trim() !== "" ||
		item.requestQuantity !== emptyMaterialRequestItem.requestQuantity ||
		item.stockQuantity !== emptyMaterialRequestItem.stockQuantity ||
		item.unitCost !== emptyMaterialRequestItem.unitCost ||
		item.unitPrice !== emptyMaterialRequestItem.unitPrice ||
		item.warehouse.trim() !== "" ||
		item.uom !== emptyMaterialRequestItem.uom
	);
}

function isNumericItemColumn(columnId: MaterialRequestItemColumnId) {
	return (
		columnId === "requestQuantity" ||
		columnId === "stockQuantity" ||
		columnId === "unitCost" ||
		columnId === "unitPrice"
	);
}

function isDateItemColumn(columnId: MaterialRequestItemColumnId) {
	return columnId === "expiryDate" || columnId === "manufacturingDate";
}

function isItemColumnId(columnId: string): columnId is MaterialRequestItemColumnId {
	return DefaultItemColumnOrder.includes(
		columnId as MaterialRequestItemColumnId,
	);
}

function mergeDefaultItemColumnOrder(
	columnIds: MaterialRequestItemColumnId[],
) {
	const defaultColumnIds = new Set(DefaultItemColumnOrder);
	const customColumnIds = columnIds.filter(
		(columnId) => !defaultColumnIds.has(columnId),
	);

	return [...DefaultItemColumnOrder, ...customColumnIds];
}

function resolveVisibleItemColumnIds(
	columnIds: MaterialRequestItemColumnId[],
) {
	const normalizedColumnIds = columnIds.filter(isItemColumnId);

	if (isSameItemColumnOrder(normalizedColumnIds, LegacyDefaultItemColumnOrder)) {
		return DefaultItemColumnOrder;
	}

	const visibleColumnIds = new Set([
		...DefaultRequiredItemColumnOrder,
		...normalizedColumnIds,
	]);

	return DefaultItemColumnOrder.filter((columnId) =>
		visibleColumnIds.has(columnId),
	);
}

function isSameItemColumnOrder(
	firstColumnIds: MaterialRequestItemColumnId[],
	secondColumnIds: readonly MaterialRequestItemColumnId[],
) {
	return (
		firstColumnIds.length === secondColumnIds.length &&
		firstColumnIds.every(
			(columnId, index) => columnId === secondColumnIds[index],
		)
	);
}

function createItemCellId(
	itemId: string,
	columnId: MaterialRequestItemColumnId,
) {
	return `${itemId}:${columnId}`;
}

function cellControlClassName(
	extraClassName?: string,
	validationMessage?: string,
) {
	return joinClasses(
		"app-data-entry-field h-10 w-full rounded-none border-0 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy",
		validationMessage &&
		"bg-coralpink/5 pr-9 ring-2 ring-inset ring-coralpink/50 focus:bg-coralpink/5 focus:ring-coralpink/70",
		extraClassName,
	);
}

function previewCellClassName(
	extraClassName?: string,
	validationMessage?: string,
) {
	return joinClasses(
		"app-data-entry-field h-10 w-full rounded-none border-0 bg-white px-2 text-xs font-medium text-darknavy outline-none transition focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35",
		validationMessage &&
		"bg-coralpink/5 pr-9 ring-2 ring-inset ring-coralpink/50 focus:bg-coralpink/5 focus:ring-coralpink/70",
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

async function loadExcelJs() {
	const ExcelJS = await import("exceljs");

	return ExcelJS.default;
}

async function createXlsxWorkbook(rows: string[][], sheetName: string) {
	const ExcelJS = await loadExcelJs();
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(createExcelSheetName(sheetName));

	workbook.creator = "GR8Books";
	workbook.created = new Date();
	workbook.modified = new Date();
	worksheet.views = [{ state: "frozen", ySplit: 1 }];

	rows.forEach((row) => {
		worksheet.addRow(row);
	});

	const headerRow = worksheet.getRow(1);

	headerRow.height = 22;
	headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
	headerRow.fill = {
		fgColor: { argb: "FF22C55E" },
		pattern: "solid",
		type: "pattern",
	};
	headerRow.alignment = { vertical: "middle" };

	const maxColumnCount = rows.reduce(
		(currentCount, row) => Math.max(currentCount, row.length),
		0,
	);

	Array.from({ length: maxColumnCount }).forEach((_, columnIndex) => {
		const column = worksheet.getColumn(columnIndex + 1);

		column.width = calculateExcelColumnWidth(rows, columnIndex);
		column.alignment = { vertical: "middle" };
	});

	worksheet.eachRow((row) => {
		row.eachCell({ includeEmpty: true }, (cell) => {
			cell.border = {
				bottom: { color: { argb: "FFE5E7EB" }, style: "thin" },
				left: { color: { argb: "FFE5E7EB" }, style: "thin" },
				right: { color: { argb: "FFE5E7EB" }, style: "thin" },
				top: { color: { argb: "FFE5E7EB" }, style: "thin" },
			};
		});
	});

	return workbook.xlsx.writeBuffer();
}

function createExcelSheetName(sheetName: string) {
	const safeSheetName = sheetName.replace(/[\\/*?:[\]]/g, " ").trim();

	return safeSheetName.slice(0, 31) || "Sheet1";
}

function calculateExcelColumnWidth(rows: string[][], columnIndex: number) {
	const maxLength = rows.reduce((currentLength, row) => {
		return Math.max(currentLength, String(row[columnIndex] ?? "").length);
	}, 0);

	return Math.min(42, Math.max(12, maxLength + 2));
}

function formatExcelCellValue(value: unknown, displayText?: string) {
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

	if (typeof value === "object" && isRecord(value)) {
		if (Array.isArray(value.richText)) {
			return value.richText
				.map((part) =>
					isRecord(part) ? String(part.text ?? "") : "",
				)
				.join("")
				.replace(/\r?\n/g, " ")
				.trim();
		}

		if ("text" in value) {
			return String(value.text ?? "")
				.replace(/\r?\n/g, " ")
				.trim();
		}

		if ("result" in value) {
			return formatExcelCellValue(value.result);
		}
	}

	return String(value).replace(/\r?\n/g, " ").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
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

const DefaultItemColumnOrder = [
	"itemCode",
	"barcode",
	"itemName",
	"description",
	"category",
	"uom",
	"serialNumber",
	"batchNo",
	"warehouse",
	"location",
	"costCenter",
	"requestQuantity",
	"stockQuantity",
	"unitCost",
	"unitPrice",
	"lotNo",
	"expiryDate",
	"manufacturingDate",
	"color",
	"brand",
	"size",
	"model",
	"remarks",
] satisfies MaterialRequestItemColumnId[];

const LegacyDefaultItemColumnOrder = [
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
	batchNo: "Batch No.",
	barcode: "Barcode",
	brand: "Brand",
	category: "Item Category",
	color: "Color",
	costCenter: "Cost Center",
	description: "Description",
	expiryDate: "Expiry Date",
	itemCode: "Item Code",
	itemName: "Item Name",
	lotNo: "Lot No.",
	location: "Location",
	manufacturingDate: "Manufacturing Date",
	model: "Model",
	remarks: "Remarks",
	requestQuantity: "Request Quantity",
	serialNumber: "Serial Number",
	size: "Size",
	stockQuantity: "Stock Quantity",
	unitCost: "Unit Cost",
	unitPrice: "Unit Price",
	uom: "UOM",
	warehouse: "Warehouse",
};

const DefaultItemColumnWidths: Record<MaterialRequestItemColumnId, number> = {
	batchNo: 150,
	barcode: 150,
	brand: 150,
	category: 190,
	color: 130,
	costCenter: 190,
	description: 240,
	expiryDate: 170,
	itemCode: 150,
	itemName: 220,
	lotNo: 145,
	location: 170,
	manufacturingDate: 190,
	model: 150,
	remarks: 260,
	requestQuantity: 190,
	serialNumber: 180,
	size: 120,
	stockQuantity: 180,
	unitCost: 150,
	unitPrice: 150,
	uom: 120,
	warehouse: 170,
};

const DefaultImportIndexes: Partial<Record<MaterialRequestItemColumnId, number>> = {
	batchNo: 7,
	barcode: 1,
	brand: 19,
	category: 4,
	color: 18,
	costCenter: 10,
	description: 3,
	expiryDate: 16,
	itemCode: 0,
	itemName: 2,
	lotNo: 15,
	location: 9,
	manufacturingDate: 17,
	model: 21,
	remarks: 22,
	requestQuantity: 11,
	serialNumber: 6,
	size: 20,
	stockQuantity: 12,
	unitCost: 13,
	unitPrice: 14,
	uom: 5,
	warehouse: 8,
};

let materialRequestTextMeasureContext:
	| CanvasRenderingContext2D
	| null
	| undefined;

function calculateItemColumnFitWidth({
	columnId,
	columnLabels,
	items,
}: {
	columnId: MaterialRequestItemColumnId;
	columnLabels: Record<MaterialRequestItemColumnId, string>;
	items: MaterialRequestItem[];
}) {
	const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
	const contentWidth = items.reduce(
		(currentWidth, item) =>
			Math.max(
				currentWidth,
				estimateTextWidth(String(item[columnId] ?? ""), 24),
			),
		50,
	);

	return Math.max(headerWidth, contentWidth);
}

function estimateTextWidth(value: string, horizontalPadding: number) {
	const textWidth = measureTextWidth(value);

	return Math.min(
		800,
		Math.max(50, Math.ceil(textWidth + horizontalPadding)),
	);
}

function measureTextWidth(value: string) {
	const fallbackWidth = estimateFallbackTextWidth(value);

	if (typeof document === "undefined") {
		return fallbackWidth;
	}

	if (materialRequestTextMeasureContext === undefined) {
		materialRequestTextMeasureContext = document
			.createElement("canvas")
			.getContext("2d");
	}

	if (!materialRequestTextMeasureContext) {
		return fallbackWidth;
	}

	materialRequestTextMeasureContext.font =
		"500 14px Inter, Arial, Helvetica, sans-serif";

	return materialRequestTextMeasureContext.measureText(value).width;
}

function estimateFallbackTextWidth(value: string) {
	return Array.from(value).reduce(
		(width, character) => width + getEstimatedCharacterWidth(character),
		0,
	);
}

function getEstimatedCharacterWidth(character: string) {
	if (character === " ") {
		return 4;
	}

	if ("ilI.,:;!'`|".includes(character)) {
		return 4.2;
	}

	if ("mwMW@#%&".includes(character)) {
		return 9.2;
	}

	if (/[0-9]/.test(character)) {
		return 7.4;
	}

	if (/[A-Z]/.test(character)) {
		return 7.6;
	}

	return character.charCodeAt(0) > 127 ? 7.8 : 6.8;
}

const MaterialRequestImportTemplateRows = [
	[
		"ITM-0001",
		"480000000001",
		"Portland Cement",
		"Portland cement bags",
		"Construction Materials",
		"Bag",
		"SN-0001",
		"BATCH-2406",
		"Main Warehouse",
		"Aisle 1",
		"OPS",
		"120",
		"320",
		"245.5",
		"275",
		"LOT-CEM-2405",
		"2026-12-31",
		"2024-01-15",
		"Gray",
		"BuildPro",
		"40kg",
		"CP-40",
		"Priority site requirement",
	],
	[
		"ITM-0002",
		"480000000002",
		"Steel Bar 10mm",
		"Deformed steel bar",
		"Construction Materials",
		"Pcs",
		"SN-0002",
		"BATCH-2405",
		"Site Warehouse 1",
		"Rack B",
		"STR",
		"75",
		"210",
		"140",
		"165",
		"LOT-STL-2405",
		"2028-01-31",
		"2024-02-20",
		"Silver",
		"SteelMax",
		"10mm",
		"SB-10",
		"For structural works",
	],
];

const ImportPageSize = 8;
