import { MapPin, Plus } from "lucide-react";
import {
	WarehouseStorageDescription,
	WarehouseStorageTitle,
} from "@/app/src/constants/modules/warehouse-management/warehouse-storage/WarehouseStorageConstants";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

type WarehouseStorageHeaderProps = {
	onAdd: () => void;
};

export function WarehouseStorageHeader({ onAdd }: WarehouseStorageHeaderProps) {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={WarehouseStorageTitle}
			description={WarehouseStorageDescription}
			actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
			eyebrow={
				<>
					<MapPin className="h-3.5 w-3.5" aria-hidden="true" />
					Warehouse management
				</>
			}
			actions={
				<button
					type="button"
					onClick={onAdd}
					className={moduleHeaderActionClassNames.primary}
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add Storage
				</button>
			}
		/>
	);
}
