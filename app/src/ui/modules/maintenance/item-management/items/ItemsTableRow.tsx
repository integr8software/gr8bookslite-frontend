import type { ItemRecord } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { ItemRecordActions } from "./ItemRecordActions";

type ItemsTableRowProps = {
	item: ItemRecord;
	onDeleteItem: (item: ItemRecord) => void;
};

export function ItemsTableRow({ item, onDeleteItem }: ItemsTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{item.code}</td>
			<td className="px-4 py-4">{item.skuCode || "Not set"}</td>
			<td className="px-4 py-4">
				<div className="font-medium">{item.name}</div>
				<div className="text-xs text-darknavy/55">{item.description}</div>
			</td>
			<td className="px-4 py-4">
				<div>{item.category}</div>
				<div className="text-xs text-darknavy/55">{item.subcategory}</div>
			</td>
			<td className="px-4 py-4">
				<div>{item.type}</div>
				<div className="text-xs text-darknavy/55">{item.subtype}</div>
			</td>
			<td className="px-4 py-4">{item.uom}</td>
			<td className="px-4 py-4">
				{new Intl.NumberFormat("en-US", {
					currency: "PHP",
					style: "currency",
				}).format(item.sellingPrice)}
			</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{item.status}
				</span>
			</td>
			<td className="px-4 py-4">
				<ItemRecordActions item={item} onDeleteItem={onDeleteItem} />
			</td>
		</tr>
	);
}
