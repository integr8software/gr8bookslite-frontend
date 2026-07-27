import { Percent, Plus, Upload } from "lucide-react";
import {
	DiscountMaintenanceDescription,
	DiscountMaintenanceParentLabel,
	DiscountMaintenanceTitle,
} from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import type { DiscountMaintenancePermissions } from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function DiscountMaintenanceHeader({
	onAdd,
	onImport,
	permissions,
}: {
	onAdd: () => void;
	onImport: () => void;
	permissions: DiscountMaintenancePermissions;
}) {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={DiscountMaintenanceTitle}
			description={DiscountMaintenanceDescription}
			actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
			eyebrow={
				<>
					<Percent className="h-3.5 w-3.5" aria-hidden="true" />
					{DiscountMaintenanceParentLabel}
				</>
			}
			actions={
				<>
					{permissions.canImport ? (
						<button
							type="button"
							onClick={onImport}
							data-spotlight-id="maintenance-import-records"
							className={`${moduleHeaderActionClassNames.secondary} order-2 lg:order-1`}
						>
							<Upload className="h-4 w-4" aria-hidden="true" />
							Import
						</button>
					) : null}
					{permissions.canCreate ? (
						<button
							type="button"
							onClick={onAdd}
							data-spotlight-id="maintenance-create-record"
							className={`${moduleHeaderActionClassNames.primary} order-1 lg:order-2`}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Discount
						</button>
					) : null}
				</>
			}
		/>
	);
}

