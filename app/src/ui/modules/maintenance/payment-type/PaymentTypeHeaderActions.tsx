import { Plus, Upload } from "lucide-react";
import type { PaymentTypePermissions } from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function PaymentTypeHeaderActions({
	onAdd,
	onImport,
	permissions,
}: {
	onAdd: () => void;
	onImport: () => void;
	permissions: PaymentTypePermissions;
}) {
	if (!permissions.canCreate && !permissions.canImport) {
		return null;
	}

	return (
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
					Add Payment Type
				</button>
			) : null}
		</>
	);
}
