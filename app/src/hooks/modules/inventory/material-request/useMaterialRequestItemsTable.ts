import {
	useCallback,
	useMemo,
	useState,
} from "react";
import {
	DefaultItemColumnLabels,
	DefaultItemColumnOrder,
	DefaultItemColumnWidths,
	DefaultRequiredItemColumnIds,
	DefaultRequiredItemColumnOrder,
	DefaultVisibleItemColumnOrder,
	ProtectedItemColumnIds,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestItemEntryConstants";
import { emptyMaterialRequestItem } from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import {
	calculateItemColumnFitWidth,
	createItemCellId,
	createItemValidationMessagesById,
	createSimplePdf,
	createXlsxWorkbook,
	downloadBytesFile,
	filterItemValidationMessagesByTouchedCells,
	isItemColumnId,
	materialRequestItemHasData,
	mergeDefaultItemColumnOrder,
	parsePastedItemCellValue,
	resolveVisibleItemColumnIds,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestItemEntryData";
import type {
	MaterialRequestItemColumnId,
	MaterialRequestItemsTableProps,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestItemEntryTypes";
import type { MaterialRequestItem } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import {
	type ModuleDataEntryCellTarget,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
	type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { renderItemCell } from "@/app/src/ui/modules/inventory/material-request/entries/MaterialRequestItemCells";

export function useMaterialRequestItemsTable({
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
	>(DefaultVisibleItemColumnOrder);
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

	return {
		importDialogProps: {
			isOpen: isImportDialogOpen,
			onClose: () => setIsImportDialogOpen(false),
			onImportItems: (importedItems: MaterialRequestItem[]) => {
				onImportItems(importedItems);
				setIsImportDialogOpen(false);
			},
			requiredColumnIds,
		},
		moduleDataEntryProps: {
			columns,
			columnOptions,
			description:
				"Add material request lines, adjust quantities, reorder rows, and manage duplicate item entries.",
			emptyRowLabel: "item",
			exportOptions,
			getCellValue: getItemCellValue,
			isDraggable: true,
			isReadonly,
			isRowNumberColumnFixed: true,
			onAddRows: onAddItems,
			onAutoColumnWidth: autoSizeColumn,
			onClearCell: handleClearItemCell,
			onClearRow: handleClearItem,
			onClearRows: onClearItems,
			onDuplicateRow: onDuplicateItem,
			onFitColumnWidth: fitColumnWidth,
			onImport: () => setIsImportDialogOpen(true),
			onInsertRow: onInsertItem,
			onMoveColumn: moveColumn,
			onMoveRow: onMoveItem,
			onPasteCells: handlePasteItemCells,
			onRemoveRow: onRemoveItem,
			onToggleColumnRequired: toggleColumnRequired,
			onToggleColumnVisibility: toggleColumnVisibility,
			onUpdateColumnHeader: updateColumnHeader,
			onUpdateColumnWidth: updateColumnWidth,
			rows: items,
			title: "Data Entry",
		},
		remarksDialogProps: {
			isOpen: Boolean(remarksEditorTarget),
			isReadonly,
			key: remarksEditorTarget?.itemId ?? "closed",
			onClose: () => setRemarksEditorTarget(null),
			onSave: (value: string) => {
				if (!remarksEditorTarget) {
					return;
				}

				handleUpdateItem(remarksEditorTarget.itemId, "remarks", value);
				setRemarksEditorTarget(null);
			},
			subtitle: "Item Entry",
			textareaId: "material-request-item-remarks-dialog-text",
			title: "Remarks",
			value: remarksEditorTarget?.value ?? "",
		},
	};
}

