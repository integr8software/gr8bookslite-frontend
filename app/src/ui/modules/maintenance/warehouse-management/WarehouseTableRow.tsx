import type {
	WarehouseRecord,
	WarehouseTableRecord,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { WarehouseRecordActions } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseRecordActions";

type WarehouseTableRowProps = {
	warehouse: WarehouseTableRecord;
	onDeleteWarehouse: (warehouse: WarehouseRecord) => void;
	onEditWarehouse: (warehouse: WarehouseRecord) => void;
};

export function WarehouseTableRow({
	warehouse,
	onDeleteWarehouse,
	onEditWarehouse,
}: WarehouseTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-medium text-darknavy">{warehouse.code}</td>
			<td className="px-4 py-4">
				<div className="font-medium">{warehouse.name}</div>
				<div className="text-xs text-darknavy/55">{warehouse.address}</div>
			</td>
			<td className="px-4 py-4">{warehouse.type}</td>
			<td className="px-4 py-4">
				{warehouse.availableBranchLabel}
			</td>
			<td className="px-4 py-4">{warehouse.managerName}</td>
			<td className="px-4 py-4">{warehouse.totalItems}</td>
			<td className="px-4 py-4">
				{new Intl.NumberFormat("en-US", {
					currency: "PHP",
					style: "currency",
				}).format(warehouse.inventoryValue)}
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
					onEditWarehouse={onEditWarehouse}
				/>
			</td>
		</tr>
	);
}
