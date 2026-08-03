import { History, ShieldCheck } from "lucide-react";
import { AuditTrailHref } from "@/app/src/constants/modules/system-administration/audit-trail/AuditTrailConstants";
import { createWarehouseAccessHref } from "@/app/src/constants/modules/warehouse-management/warehouses/WarehouseConstants";
import type { WarehouseRecordActionsProps } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { ModuleTableActionButton, ModuleTableActionLink, ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function WarehouseRecordActions({ permissions, warehouse, onDeleteWarehouse, onEditWarehouse, onViewWarehouse }: WarehouseRecordActionsProps) {
  return (
    <ModuleTableActions className="w-full !justify-center">
      <ModuleTableActionButton variant="view" onClick={() => onViewWarehouse(warehouse)} label={`View ${warehouse.name}`} />
      {permissions.canUpdate ? (
        <ModuleTableActionButton variant="edit" onClick={() => onEditWarehouse(warehouse)} label={`Edit ${warehouse.name}`} />
      ) : null}
      <ModuleTableActionLink
        icon={ShieldCheck}
        href={createWarehouseAccessHref(warehouse.id)}
        label={`Edit access for ${warehouse.name}`}
      />
      <ModuleTableActionLink
        icon={History}
        href={`${AuditTrailHref}?module=Warehouse&record=${encodeURIComponent(warehouse.code)}`}
        label={`View audit history for ${warehouse.name}`}
      />
      {permissions.canUpdate ? (
        <ModuleTableActionButton
          variant={warehouse.status === "Active" ? "inactive" : "active"}
          onClick={() => onDeleteWarehouse(warehouse)}
          label={`Set ${warehouse.name} ${warehouse.status === "Active" ? "inactive" : "active"}`}
        />
      ) : null}
    </ModuleTableActions>
  );
}
