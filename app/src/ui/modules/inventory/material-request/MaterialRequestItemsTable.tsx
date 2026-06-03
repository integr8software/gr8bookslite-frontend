"use client";

import { useMemo } from "react";
import { MaterialRequestUomOptions } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import type { MaterialRequestItem } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryColumn,
	type ModuleDataEntryClearAction,
} from "@/app/src/ui/shared/module/data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MaterialRequestItemsTableProps = {
	error?: string;
	isReadonly: boolean;
	items: MaterialRequestItem[];
	onAddItems: (count: number) => void;
	onClearItems: (action: ModuleDataEntryClearAction) => void;
	onDuplicateItem: (itemId: string) => void;
	onInsertItem: (itemId: string, position: "above" | "below") => void;
	onMoveItem: (fromItemId: string, toItemId: string) => void;
	onRemoveItem: (itemId: string) => void;
	onUpdateItem: (
		itemId: string,
		field: keyof MaterialRequestItem,
		value: string | number,
	) => void;
};

export function MaterialRequestItemsTable({
	error,
	isReadonly,
	items,
	onAddItems,
	onClearItems,
	onDuplicateItem,
	onInsertItem,
	onMoveItem,
	onRemoveItem,
	onUpdateItem,
}: MaterialRequestItemsTableProps) {
	const columns = useMemo<ModuleDataEntryColumn<MaterialRequestItem>[]>(
		() => [
			{
				header: "Item Code",
				id: "itemCode",
				widthClassName: "w-[11rem]",
				renderCell: (item) => (
					<ItemInput
						readOnly={isReadonly}
						value={item.itemCode}
						onChange={(value) => onUpdateItem(item.id, "itemCode", value)}
					/>
				),
			},
			{
				header: "Barcode",
				id: "barcode",
				widthClassName: "w-[11rem]",
				renderCell: (item) => (
					<ItemInput
						readOnly={isReadonly}
						value={item.barcode}
						onChange={(value) => onUpdateItem(item.id, "barcode", value)}
					/>
				),
			},
			{
				header: "Item Name",
				id: "itemName",
				widthClassName: "w-[17rem]",
				renderCell: (item) => (
					<ItemInput
						readOnly={isReadonly}
						value={item.itemName}
						onChange={(value) => onUpdateItem(item.id, "itemName", value)}
					/>
				),
			},
			{
				header: "Item Category",
				id: "category",
				widthClassName: "w-[15rem]",
				renderCell: (item) => (
					<ItemInput
						readOnly={isReadonly}
						value={item.category}
						onChange={(value) => onUpdateItem(item.id, "category", value)}
					/>
				),
			},
			{
				header: "UOM",
				id: "uom",
				widthClassName: "w-[10rem]",
				renderCell: (item) => (
					<select
						value={item.uom}
						disabled={isReadonly}
						onChange={(event) =>
							onUpdateItem(item.id, "uom", event.target.value)
						}
						className={cellControlClassName()}
					>
						{MaterialRequestUomOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				),
			},
			{
				header: "Request QTY",
				id: "requestQuantity",
				widthClassName: "w-[10rem]",
				renderCell: (item) => (
					<NumberInput
						readOnly={isReadonly}
						value={item.requestQuantity}
						onChange={(value) =>
							onUpdateItem(item.id, "requestQuantity", value)
						}
					/>
				),
			},
			{
				header: "Stock QTY",
				id: "stockQuantity",
				widthClassName: "w-[10rem]",
				renderCell: (item) => (
					<NumberInput
						readOnly={isReadonly}
						value={item.stockQuantity}
						onChange={(value) => onUpdateItem(item.id, "stockQuantity", value)}
					/>
				),
			},
			{
				header: "Lot No.",
				id: "lotNo",
				widthClassName: "w-[11rem]",
				renderCell: (item) => (
					<ItemInput
						readOnly={isReadonly}
						value={item.lotNo}
						onChange={(value) => onUpdateItem(item.id, "lotNo", value)}
					/>
				),
			},
			{
				header: "Remarks",
				id: "remarks",
				widthClassName: "w-[16rem]",
				renderCell: (item) => (
					<ItemInput
						readOnly={isReadonly}
						value={item.remarks}
						onChange={(value) => onUpdateItem(item.id, "remarks", value)}
					/>
				),
			},
		],
		[isReadonly, onUpdateItem],
	);

	return (
		<ModuleDataEntry
			columns={columns}
			description="Add material request lines, adjust quantities, reorder rows, and manage duplicate item entries."
			emptyRowLabel="item"
			error={error}
			isDraggable
			isReadonly={isReadonly}
			rows={items}
			title="Data Entry"
			onAddRows={onAddItems}
			onClearRows={onClearItems}
			onDuplicateRow={onDuplicateItem}
			onInsertRow={onInsertItem}
			onMoveRow={onMoveItem}
			onRemoveRow={onRemoveItem}
		/>
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

function cellControlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-offwhite/45 disabled:bg-offwhite/45",
		extraClassName,
	);
}
