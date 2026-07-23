import { Plus, Ruler, Upload } from "lucide-react";
import {
	UnitOfMeasurementDescription,
	UnitOfMeasurementParentLabel,
	UnitOfMeasurementTitle,
} from "@/app/src/constants/modules/item-management/unit-of-measurement/UnitOfMeasurementConstants";
import type { UnitOfMeasurementPermissions } from "@/app/src/types/modules/item-management/unit-of-measurement/UnitOfMeasurementTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function UnitOfMeasurementHeader({
	onAdd,
	onImport,
	permissions,
}: {
	onAdd: () => void;
	onImport: () => void;
	permissions: UnitOfMeasurementPermissions;
}) {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={UnitOfMeasurementTitle}
			description={UnitOfMeasurementDescription}
			actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
			eyebrow={
				<>
					<Ruler className="h-3.5 w-3.5" aria-hidden="true" />
					{UnitOfMeasurementParentLabel}
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
							Add Unit
						</button>
					) : null}
				</>
			}
		/>
	);
}
