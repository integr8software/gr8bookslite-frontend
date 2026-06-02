import { Plus, Trash2 } from "lucide-react";
import { MaterialRequestUomOptions } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import type { MaterialRequestItem } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MaterialRequestItemsTableProps = {
	error?: string;
	isReadonly: boolean;
	items: MaterialRequestItem[];
	onAddItem: () => void;
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
	onAddItem,
	onRemoveItem,
	onUpdateItem,
}: MaterialRequestItemsTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<div className="flex items-center justify-between border-b border-darknavy/10 px-5 py-4">
				<div>
					<h2 className="text-base font-semibold text-darknavy">Items</h2>
					<p className="mt-1 text-sm text-darknavy/60">
						Review requested quantities against available stock before saving.
					</p>
				</div>
				{isReadonly ? null : (
					<button
						type="button"
						onClick={onAddItem}
						className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Item
					</button>
				)}
			</div>
			<div className="overflow-x-auto p-4">
				<table className="w-full min-w-[90rem] border-collapse text-left text-sm text-darknavy">
					<thead className="bg-skyblue text-xs font-semibold text-white">
						<tr>
							<th className="w-[4rem] px-3 py-3 text-center">No.</th>
							<th className="w-[11rem] px-3 py-3">Item Code</th>
							<th className="w-[11rem] px-3 py-3">Barcode</th>
							<th className="w-[17rem] px-3 py-3">Item Name</th>
							<th className="w-[15rem] px-3 py-3">Item Category</th>
							<th className="w-[10rem] px-3 py-3">UOM</th>
							<th className="w-[10rem] px-3 py-3">Request QTY</th>
							<th className="w-[10rem] px-3 py-3">Stock QTY</th>
							<th className="w-[11rem] px-3 py-3">Lot No.</th>
							<th className="w-[5rem] px-3 py-3 text-right">Action</th>
						</tr>
					</thead>
					<tbody>
						{items.map((item, index) => (
							<tr
								key={item.id}
								className="border-b border-darknavy/8 last:border-b-0"
							>
								<td className="px-3 py-2 text-center font-semibold">
									{index + 1}
								</td>
								<td className="px-3 py-2">
									<ItemInput
										value={item.itemCode}
										readOnly={isReadonly}
										onChange={(value) =>
											onUpdateItem(item.id, "itemCode", value)
										}
									/>
								</td>
								<td className="px-3 py-2">
									<ItemInput
										value={item.barcode}
										readOnly={isReadonly}
										onChange={(value) =>
											onUpdateItem(item.id, "barcode", value)
										}
									/>
								</td>
								<td className="px-3 py-2">
									<ItemInput
										value={item.itemName}
										readOnly={isReadonly}
										onChange={(value) =>
											onUpdateItem(item.id, "itemName", value)
										}
									/>
								</td>
								<td className="px-3 py-2">
									<ItemInput
										value={item.category}
										readOnly={isReadonly}
										onChange={(value) =>
											onUpdateItem(item.id, "category", value)
										}
									/>
								</td>
								<td className="px-3 py-2">
									<select
										value={item.uom}
										disabled={isReadonly}
										onChange={(event) =>
											onUpdateItem(item.id, "uom", event.target.value)
										}
										className={inputClassName()}
									>
										{MaterialRequestUomOptions.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</select>
								</td>
								<td className="px-3 py-2">
									<NumberInput
										value={item.requestQuantity}
										readOnly={isReadonly}
										onChange={(value) =>
											onUpdateItem(item.id, "requestQuantity", value)
										}
									/>
								</td>
								<td className="px-3 py-2">
									<NumberInput
										value={item.stockQuantity}
										readOnly={isReadonly}
										onChange={(value) =>
											onUpdateItem(item.id, "stockQuantity", value)
										}
									/>
								</td>
								<td className="px-3 py-2">
									<ItemInput
										value={item.lotNo}
										readOnly={isReadonly}
										onChange={(value) =>
											onUpdateItem(item.id, "lotNo", value)
										}
									/>
								</td>
								<td className="px-3 py-2 text-right">
									<button
										type="button"
										disabled={isReadonly || items.length === 1}
										onClick={() => onRemoveItem(item.id)}
										aria-label={`Remove ${item.itemName || "item"}`}
										className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-coralpink/30 bg-white text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coralpink/20 disabled:cursor-not-allowed disabled:opacity-40"
									>
										<Trash2 className="h-4 w-4" aria-hidden="true" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{error ? (
				<p className="border-t border-darknavy/10 px-5 py-3 text-sm font-semibold text-coralpink">
					{error}
				</p>
			) : null}
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
			className={inputClassName()}
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
			className={inputClassName()}
		/>
	);
}

function inputClassName() {
	return joinClasses(
		"h-10 w-full rounded-md border border-darknavy/10 bg-offwhite/60 px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-offwhite/80 disabled:bg-offwhite/80",
	);
}
