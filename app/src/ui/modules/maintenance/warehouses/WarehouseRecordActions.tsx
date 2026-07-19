import { History, ShieldCheck } from "lucide-react";
import { AuditTrailHref } from "@/app/src/constants/modules/system-administration/audit-trail/AuditTrailConstants";
import { createWarehouseAccessHref } from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import type { WarehouseRecordActionsProps } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import { ModuleTableActionButton, ModuleTableActionLink, ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function WarehouseRecordActions({ warehouse, onDeleteWarehouse, onEditWarehouse, onViewWarehouse }: WarehouseRecordActionsProps) {
  return (
    <ModuleTableActions className="w-full !justify-center">
      <ModuleTableActionButton className="h-8 w-8" variant="view" onClick={() => onViewWarehouse(warehouse)} label={`View ${warehouse.name}`} />
      <ModuleTableActionButton className="h-8 w-8" variant="edit" onClick={() => onEditWarehouse(warehouse)} label={`Edit ${warehouse.name}`} />
      <ModuleTableActionLink
        className="h-8 w-8"
        icon={ShieldCheck}
        href={createWarehouseAccessHref(warehouse.id)}
        label={`Edit access for ${warehouse.name}`}
      />
      <ModuleTableActionLink
        className="h-8 w-8"
        icon={History}
        href={`${AuditTrailHref}?module=Warehouse&record=${encodeURIComponent(warehouse.code)}`}
        label={`View audit history for ${warehouse.name}`}
      />
      <ModuleTableActionButton
        className="h-8 w-8"
        variant={warehouse.status === "Active" ? "inactive" : "active"}
        onClick={() => onDeleteWarehouse(warehouse)}
        label={`Set ${warehouse.name} ${warehouse.status === "Active" ? "inactive" : "active"}`}
      />
    </ModuleTableActions>
  );
}
