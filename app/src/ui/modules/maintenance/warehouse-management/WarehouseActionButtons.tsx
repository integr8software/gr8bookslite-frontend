import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import { WarehouseManagementHref } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import type {
	WarehouseActionMode,
	WarehouseRecord,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type WarehouseActionButtonsProps = {
	isReadonly: boolean;
	mode: WarehouseActionMode;
	warehouse?: WarehouseRecord;
	onDeleteWarehouse: () => void;
};

export function WarehouseActionButtons({
	isReadonly,
	mode,
	onDeleteWarehouse,
	warehouse,
}: WarehouseActionButtonsProps) {
	return (
		<>
			<Link
				href={WarehouseManagementHref}
				className={moduleHeaderActionClassNames.secondary}
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back
			</Link>
			{mode === "view" && warehouse ? (
				<Link
					href={`${WarehouseManagementHref}/edit/${warehouse.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : null}
			{warehouse ? (
				<button
					type="button"
					onClick={onDeleteWarehouse}
					className={moduleHeaderActionClassNames.danger}
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					Delete
				</button>
			) : null}
			{mode === "edit" && warehouse ? (
				<Link
					href={`${WarehouseManagementHref}/view/${warehouse.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
			) : null}
			{!isReadonly ? (
				<button type="submit" className={moduleHeaderActionClassNames.primary}>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save Warehouse
				</button>
			) : null}
		</>
	);
}

