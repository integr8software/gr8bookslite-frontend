import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { WarehouseRecordActions } from "./WarehouseRecordActions";

type WarehouseTableRowProps = {
	warehouse: WarehouseRecord;
	onDeleteWarehouse: (warehouse: WarehouseRecord) => void;
};

export function WarehouseTableRow({
	warehouse,
	onDeleteWarehouse,
}: WarehouseTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{warehouse.code}</td>
			<td className="px-4 py-4">
				<div className="font-medium">{warehouse.name}</div>
				<div className="text-xs text-darknavy/55">{warehouse.address}</div>
			</td>
			<td className="px-4 py-4">{warehouse.branchName}</td>
			<td className="px-4 py-4">{warehouse.managerName}</td>
			<td className="px-4 py-4 text-right font-semibold">
				{warehouse.items.length}
			</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{warehouse.status}
				</span>
			</td>
			<td className="px-4 py-4">
				<WarehouseRecordActions
					warehouse={warehouse}
					onDeleteWarehouse={onDeleteWarehouse}
				/>
			</td>
		</tr>
	);
}

