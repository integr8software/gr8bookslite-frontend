import { Plus, ReceiptText, Upload } from "lucide-react";
import {
  ServicesMaintenanceDescription,
  ServicesMaintenanceParentLabel,
  ServicesMaintenanceTitle,
} from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import type { ServicesMaintenancePermissions } from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function ServicesMaintenanceHeader({
  onAdd,
  onImport,
  permissions,
}: {
  onAdd: () => void;
  onImport: () => void;
  permissions: ServicesMaintenancePermissions;
}) {
  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={ServicesMaintenanceTitle}
      description={ServicesMaintenanceDescription}
      actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
      eyebrow={
        <>
          <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
          {ServicesMaintenanceParentLabel}
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
              Add Service
            </button>
          ) : null}
        </>
      }
    />
  );
}
