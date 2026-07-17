import { Package, ShieldCheck } from "lucide-react";
import {
	WarehouseHref,
	createWarehouseAccessHref,
	createWarehouseItemsHref,
} from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import type { WarehouseRecordActionsProps } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function WarehouseRecordActions({
	warehouse,
	onDeleteWarehouse,
	onEditWarehouse,
}: WarehouseRecordActionsProps) {
	return (
		<ModuleTableActions className="justify-center">
			<ModuleTableActionLink
				variant="view"
				href={`${WarehouseHref}/view/${warehouse.id}`}
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
