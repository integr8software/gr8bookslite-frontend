import type { ItemRecord } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { ItemRecordActions } from "@/app/src/ui/modules/maintenance/item-management/items/ItemRecordActions";
import { formatCurrency } from "@/app/src/utils/currency.util";

type ItemsTableRowProps = {
	item: ItemRecord;
	onStatusChange: (item: ItemRecord) => void;
};

export function ItemsTableRow({ item, onStatusChange }: ItemsTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{item.code}</td>
			<td className="px-4 py-4">{item.skuCode || "Not set"}</td>
			<td className="px-4 py-4">
				<div className="font-medium">{item.name}</div>
				<div className="text-xs text-darknavy/55">{item.description}</div>
			</td>
			<td className="px-4 py-4">
				{item.primaryCategory || item.category}
			</td>
			<td className="px-4 py-4">{item.uom}</td>
			<td className="px-4 py-4">
				{formatCurrency(item.costPrice)}
			</td>
			<td className="px-4 py-4">
				{formatCurrency(item.sellingPrice)}
			</td>
			<td className="px-4 py-4">
				<span
					className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
						item.status === "Active"
							? "bg-emerald-50 text-emerald-700"
							: "bg-amber-50 text-amber-700"
					}`}
				>
					{item.status}
				</span>
			</td>
			<td className="px-4 py-4 text-center">
				<ItemRecordActions item={item} onStatusChange={onStatusChange} />
			</td>
		</tr>
	);
}

