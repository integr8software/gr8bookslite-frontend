import Link from "next/link";
import { Edit3, Eye, Package, ShieldCheck, Trash2 } from "lucide-react";
import {
	WarehouseManagementHref,
	createWarehouseAccessHref,
	createWarehouseItemsHref,
} from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";

type WarehouseRecordActionsProps = {
	warehouse: WarehouseRecord;
	onDeleteWarehouse: (warehouse: WarehouseRecord) => void;
};

export function WarehouseRecordActions({
	warehouse,
	onDeleteWarehouse,
}: WarehouseRecordActionsProps) {
	return (
		<div className="flex items-center gap-2">
			<Link
				href={`${WarehouseManagementHref}/view/${warehouse.id}`}
				aria-label={`View ${warehouse.name}`}
				className={tableActionClassName}
			>
				<Eye className="h-4 w-4" aria-hidden="true" />
			</Link>
			<Link
				href={`${WarehouseManagementHref}/edit/${warehouse.id}`}
				aria-label={`Edit ${warehouse.name}`}
				className={tableActionClassName}
			>
				<Edit3 className="h-4 w-4" aria-hidden="true" />
			</Link>
			<Link
				href={createWarehouseAccessHref(warehouse.id)}
				aria-label={`Edit access for ${warehouse.name}`}
				className={tableActionClassName}
			>
				<ShieldCheck className="h-4 w-4" aria-hidden="true" />
			</Link>
			<Link
				href={createWarehouseItemsHref(warehouse.id)}
				aria-label={`View items in ${warehouse.name}`}
				className={tableActionClassName}
			>
				<Package className="h-4 w-4" aria-hidden="true" />
			</Link>
			<button
				type="button"
				onClick={() => onDeleteWarehouse(warehouse)}
				aria-label={`Delete ${warehouse.name}`}
				className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
			>
				<Trash2 className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}

const tableActionClassName =
	"inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";
