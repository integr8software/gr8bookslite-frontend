import { Package, ShieldCheck } from "lucide-react";
import {
	WarehouseManagementHref,
	createWarehouseAccessHref,
	createWarehouseItemsHref,
} from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type WarehouseRecordActionsProps = {
	warehouse: WarehouseRecord;
	onDeleteWarehouse: (warehouse: WarehouseRecord) => void;
	onEditWarehouse: (warehouse: WarehouseRecord) => void;
};

export function WarehouseRecordActions({
	warehouse,
	onDeleteWarehouse,
	onEditWarehouse,
}: WarehouseRecordActionsProps) {
	return (
		<ModuleTableActions>
			<ModuleTableActionLink
				variant="view"
				href={`${WarehouseManagementHref}/view/${warehouse.id}`}
				label={`View ${warehouse.name}`}
			/>
			<ModuleTableActionButton
				variant="edit"
				onClick={() => onEditWarehouse(warehouse)}
				label={`Edit ${warehouse.name}`}
			/>
			<ModuleTableActionLink
				icon={ShieldCheck}
				href={createWarehouseAccessHref(warehouse.id)}
				label={`Edit access for ${warehouse.name}`}
			/>
			<ModuleTableActionLink
				icon={Package}
				href={createWarehouseItemsHref(warehouse.id)}
				label={`View items in ${warehouse.name}`}
			/>
			<ModuleTableActionButton
				variant="delete"
				onClick={() => onDeleteWarehouse(warehouse)}
				label={`Set ${warehouse.name} inactive`}
			/>
		</ModuleTableActions>
	);
}
