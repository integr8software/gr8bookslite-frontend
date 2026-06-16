import Link from "next/link";
import { ItemsHref } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import { getWarehouseAvailableStock } from "@/app/src/data/modules/maintenance/warehouse-management/WarehouseManagementData";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";

export function WarehouseItemsTable({ warehouse }: { warehouse: WarehouseRecord }) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="border-b border-darknavy/10 px-4 py-3 text-sm font-semibold text-darknavy">
				{warehouse.items.length} item{warehouse.items.length === 1 ? "" : "s"} in
				this warehouse
			</div>
			<table className="w-full min-w-[92rem] text-left text-sm">
				<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
					<tr>
						<th className="px-4 py-3">Item</th>
						<th className="px-4 py-3">Category</th>
						<th className="px-4 py-3">UOM</th>
						<th className="px-4 py-3 text-right">On Hand</th>
						<th className="px-4 py-3 text-right">Reserved</th>
						<th className="px-4 py-3 text-right">Available</th>
						<th className="px-4 py-3">Lot Number</th>
						<th className="px-4 py-3">Serial Number</th>
						<th className="px-4 py-3">Storage Location</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-darknavy/8">
					{warehouse.items.map((item) => (
						<tr key={item.id}>
							<td className="px-4 py-4">
								<Link
									href={`${ItemsHref}/view/${item.itemId}`}
									className="font-medium text-darknavy transition hover:text-skyblue"
								>
									{item.itemName}
								</Link>
								<div className="text-xs text-darknavy/55">{item.itemCode}</div>
							</td>
							<td className="px-4 py-4 text-darknavy/70">{item.category}</td>
							<td className="px-4 py-4 text-darknavy/70">{item.uom}</td>
							<td className="px-4 py-4 text-right font-semibold">
								{item.onHand.toLocaleString()}
							</td>
							<td className="px-4 py-4 text-right text-darknavy/70">
								{item.reserved.toLocaleString()}
							</td>
							<td className="px-4 py-4 text-right font-semibold text-darknavy">
								{getWarehouseAvailableStock(item).toLocaleString()}
							</td>
							<td className="px-4 py-4 text-darknavy/70">
								{item.lotNumber || "-"}
							</td>
							<td className="px-4 py-4 text-darknavy/70">
								{item.serialNumber || "-"}
							</td>
							<td className="px-4 py-4 text-darknavy/70">
								{item.storageLocation || "-"}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
