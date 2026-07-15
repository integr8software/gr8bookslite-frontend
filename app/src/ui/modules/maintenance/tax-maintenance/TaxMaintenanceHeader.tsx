import { Plus, ReceiptText } from "lucide-react";
import {
  TaxMaintenanceDescription,
  TaxMaintenanceParentLabel,
  TaxMaintenanceTitle,
} from "@/app/src/constants/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceConstants";
import type { TaxMaintenancePermissions } from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function TaxMaintenanceHeader({
  onAdd,
  permissions,
}: {
  onAdd: () => void;
  permissions: TaxMaintenancePermissions;
}) {
  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={TaxMaintenanceTitle}
      description={TaxMaintenanceDescription}
      actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
      eyebrow={
        <>
          <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
          {TaxMaintenanceParentLabel}
        </>
      }
      actions={
        permissions.canCreate ? (
          <button
            type="button"
            onClick={onAdd}
            data-spotlight-id="maintenance-create-record"
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Tax
          </button>
        ) : null
      }
    />
  );
}
