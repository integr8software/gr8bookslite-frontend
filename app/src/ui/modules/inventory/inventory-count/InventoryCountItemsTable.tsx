import type { ReactNode } from "react";
import type { InventoryCountLine } from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";

export function InventoryCountItemsTable({
	rows,
}: {
	rows: InventoryCountLine[];
}) {
	const totalVariance = rows.reduce(
		(total, row) => total + (Number.parseFloat(row.variance) || 0),
		0,
	);

	return (
		<section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-3">
				<div className="flex min-w-0 items-center gap-2">
					<h2 className="text-sm font-semibold text-darknavy">Inventory Count Items</h2>
					<span className="rounded-full border border-darknavy/10 bg-offwhite px-2 py-0.5 text-xs font-medium text-darknavy/55">
						{rows.length} {rows.length === 1 ? "item" : "items"}
					</span>
				</div>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[82rem] table-fixed border-collapse text-left text-xs text-darknavy">
					<colgroup>
						<col className="w-[7rem]" />
						<col className="w-[7rem]" />
						<col className="w-[14rem]" />
						<col className="w-[6rem]" />
						<col className="w-[6rem]" />
						<col className="w-[7rem]" />
						<col className="w-[7rem]" />
						<col className="w-[8rem]" />
						<col className="w-[6rem]" />
						<col className="w-[7rem]" />
						<col className="w-[7rem]" />
						<col className="w-[6rem]" />
						<col className="w-[6rem]" />
						<col className="w-[5rem]" />
						<col className="w-[6rem]" />
					</colgroup>
					<thead>
						<tr className="bg-[#f59e0b] text-white">
							<TableHeaderCell>Item Code *</TableHeaderCell>
							<TableHeaderCell>Barcode</TableHeaderCell>
							<TableHeaderCell>Item Name *</TableHeaderCell>
							<TableHeaderCell className="text-right">Stock Qty</TableHeaderCell>
							<TableHeaderCell>UOM *</TableHeaderCell>
							<TableHeaderCell className="text-right">Inventory Count</TableHeaderCell>
							<TableHeaderCell className="text-right">Variance</TableHeaderCell>
							<TableHeaderCell>Expiration Date</TableHeaderCell>
							<TableHeaderCell>Lot No</TableHeaderCell>
							<TableHeaderCell>Serial No.</TableHeaderCell>
							<TableHeaderCell>Res Center</TableHeaderCell>
							<TableHeaderCell>Color</TableHeaderCell>
							<TableHeaderCell>Brand</TableHeaderCell>
							<TableHeaderCell>Size</TableHeaderCell>
							<TableHeaderCell>Model</TableHeaderCell>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr key={row.id} className="border-b border-darknavy/10 last:border-b-0 even:bg-offwhite/55">
								<TableCell>{row.itemCode}</TableCell>
								<TableCell>{row.barcode}</TableCell>
								<TableCell>{row.itemName}</TableCell>
								<TableCell className="text-right tabular-nums">
									{row.systemQty}
								</TableCell>
								<TableCell>{row.uom}</TableCell>
								<TableCell className="text-right tabular-nums">
									{row.countQty}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{row.variance}
								</TableCell>
								<TableCell>{row.expiryDate}</TableCell>
								<TableCell>{row.lotNo}</TableCell>
								<TableCell>{row.serialNumber}</TableCell>
								<TableCell>{row.responsibilityCenter}</TableCell>
								<TableCell>{row.color}</TableCell>
								<TableCell>{row.brand}</TableCell>
								<TableCell>{row.size}</TableCell>
								<TableCell>{row.model}</TableCell>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-3 border-t border-darknavy/10 px-4 py-3">
				<span className="text-xs font-medium text-darknavy/55">
					{rows.length} {rows.length === 1 ? "item" : "items"}
				</span>
				<span className="text-sm font-semibold text-darknavy">
					Total Variance: {totalVariance.toFixed(2)}
				</span>
			</div>
		</section>
	);
}

export function TableHeaderCell({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<th className={`h-9 border-r border-white/20 px-2 py-1.5 text-xs font-semibold last:border-r-0 ${className}`}>
			{children}
		</th>
	);
}

export function TableCell({
	children,
	className = "",
}: {
	children?: ReactNode;
	className?: string;
}) {
	return (
		<td className={`h-9 border-r border-darknavy/10 px-2 py-1.5 last:border-r-0 ${className}`}>
			{children}
		</td>
	);
}
