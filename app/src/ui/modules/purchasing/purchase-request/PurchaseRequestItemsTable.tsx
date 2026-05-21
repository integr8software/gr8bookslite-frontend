import { Plus, Trash2 } from "lucide-react";
import { PurchaseRequestUomOptions } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import {
	formatPurchaseRequestCurrency,
	getPurchaseRequestItemAmount,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import type { PurchaseRequestItem } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

type PurchaseRequestItemsTableProps = {
	error?: string;
	isReadonly: boolean;
	items: PurchaseRequestItem[];
	onAddItem: () => void;
	onRemoveItem: (itemId: string) => void;
	onUpdateItem: (
		itemId: string,
		field: keyof PurchaseRequestItem,
		value: string | number,
	) => void;
};

export function PurchaseRequestItemsTable({
	error,
	isReadonly,
	items,
	onAddItem,
	onRemoveItem,
	onUpdateItem,
}: PurchaseRequestItemsTableProps) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 p-5">
				<div>
					<h2 className="text-base font-semibold text-darknavy">Items</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						Requested item lines and gross amount calculations.
					</p>
					{error ? (
						<p className="mt-2 text-xs font-semibold text-coralpink">{error}</p>
					) : null}
				</div>
				<button
					type="button"
					disabled={isReadonly}
					onClick={onAddItem}
					className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/10 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add Item
				</button>
			</div>
			<div className="overflow-x-auto">
				<table className="min-w-[1280px] divide-y divide-darknavy/10 text-sm text-darknavy">
					<thead className="module-table-header text-left text-xs uppercase tracking-wide text-darknavy/70">
						<tr>
							<th className="w-14 px-3 py-3">No.</th>
							<th className="px-3 py-3">Item Code</th>
							<th className="px-3 py-3">Barcode</th>
							<th className="px-3 py-3">Description</th>
							<th className="px-3 py-3">UOM</th>
							<th className="px-3 py-3 text-right">Qty</th>
							<th className="px-3 py-3">Lot No.</th>
							<th className="px-3 py-3">Expiry Date</th>
							<th className="px-3 py-3 text-right">Cost</th>
							<th className="px-3 py-3 text-right">Gross Amount</th>
							<th className="px-3 py-3">Res. Center</th>
							<th className="w-14 px-3 py-3"></th>
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/10">
						{items.map((item, index) => (
							<tr key={item.id} className="module-table-row">
								<td className="px-3 py-3 text-darknavy/60">{index + 1}</td>
								<ItemCell
									value={item.itemCode}
									disabled={isReadonly}
									onChange={(value) => onUpdateItem(item.id, "itemCode", value)}
								/>
								<ItemCell
									value={item.barcode}
									disabled={isReadonly}
									onChange={(value) => onUpdateItem(item.id, "barcode", value)}
								/>
								<ItemCell
									value={item.description}
									disabled={isReadonly}
									onChange={(value) => onUpdateItem(item.id, "description", value)}
								/>
								<td className="px-3 py-3">
									<select
										value={item.uom}
										disabled={isReadonly}
										onChange={(event) =>
											onUpdateItem(item.id, "uom", event.target.value)
										}
										className={tableFieldClassName}
									>
										{PurchaseRequestUomOptions.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</select>
								</td>
								<ItemCell
									type="number"
									value={item.quantity}
									disabled={isReadonly}
									align="right"
									onChange={(value) => onUpdateItem(item.id, "quantity", value)}
								/>
								<ItemCell
									value={item.lotNo}
									disabled={isReadonly}
									onChange={(value) => onUpdateItem(item.id, "lotNo", value)}
								/>
								<ItemCell
									type="date"
									value={item.expiryDate}
									disabled={isReadonly}
									onChange={(value) => onUpdateItem(item.id, "expiryDate", value)}
								/>
								<ItemCell
									type="number"
									value={item.cost}
									disabled={isReadonly}
									align="right"
									onChange={(value) => onUpdateItem(item.id, "cost", value)}
								/>
								<td className="px-3 py-3 text-right font-semibold">
									{formatPurchaseRequestCurrency(
										getPurchaseRequestItemAmount(item),
									)}
								</td>
								<ItemCell
									value={item.responsibilityCenter}
									disabled={isReadonly}
									onChange={(value) =>
										onUpdateItem(item.id, "responsibilityCenter", value)
									}
								/>
								<td className="px-3 py-3">
									<button
										type="button"
										disabled={isReadonly || items.length === 1}
										onClick={() => onRemoveItem(item.id)}
										className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 disabled:cursor-not-allowed disabled:opacity-40"
									>
										<Trash2 className="h-4 w-4" aria-hidden="true" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
					<tfoot className="bg-skyblue/10">
						<tr>
							<td
								colSpan={9}
								className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-darknavy/60"
							>
								Total
							</td>
							<td className="px-3 py-3 text-right font-bold">
								{formatPurchaseRequestCurrency(
									items.reduce(
										(total, item) =>
											total + getPurchaseRequestItemAmount(item),
										0,
									),
								)}
							</td>
							<td colSpan={2}></td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
}

function ItemCell({
	align,
	disabled,
	onChange,
	type = "text",
	value,
}: {
	align?: "right";
	disabled: boolean;
	onChange: (value: string | number) => void;
	type?: "date" | "number" | "text";
	value: number | string;
}) {
	return (
		<td className="px-3 py-3">
			<input
				type={type}
				value={value}
				disabled={disabled}
				onChange={(event) =>
					onChange(type === "number" ? Number(event.target.value) : event.target.value)
				}
				className={[tableFieldClassName, align === "right" ? "text-right" : ""]
					.filter(Boolean)
					.join(" ")}
			/>
		</td>
	);
}

const tableFieldClassName =
	"h-10 w-full min-w-28 rounded-md border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/15 disabled:bg-offwhite/65 disabled:text-darknavy/65";
