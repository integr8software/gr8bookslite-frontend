import type {
  ServicesMaintenanceCellContentProps,
  ServicesMaintenanceTableRowProps,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import { ModuleTableActionButton, ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";
import { formatDateTime } from "@/app/src/utils/date.util";

export function ServicesMaintenanceTableRow({
  permissions,
  row,
  onEditService,
  onToggleStatus,
  onViewService,
}: ServicesMaintenanceTableRowProps) {
  return (
    <tr className="module-table-row">
      {row.getVisibleCells().map((cell) => (
        <ServicesMaintenanceTableCell key={cell.id} className={getColumnMetaClassName(cell.column.columnDef.meta)}>
          <ServicesMaintenanceCellContent
            columnId={cell.column.id}
            permissions={permissions}
            service={row.original}
            onEditService={onEditService}
            onToggleStatus={onToggleStatus}
            onViewService={onViewService}
          />
        </ServicesMaintenanceTableCell>
      ))}
    </tr>
  );
}

function ServicesMaintenanceCellContent({
  columnId,
  permissions,
  service,
  onEditService,
  onToggleStatus,
  onViewService,
}: ServicesMaintenanceCellContentProps) {
  const nextStatus = service.status === "Active" ? "Inactive" : "Active";
  const statusActionLabel = service.status === "Active" ? "Inactivate" : "Activate";

  switch (columnId) {
    case "serviceName":
      return <span className="font-medium text-darknavy">{service.serviceName}</span>;
    case "description":
      return (
        <span className="block truncate text-darknavy/70" title={service.description}>
          {service.description}
        </span>
      );
    case "revenueAccountCode":
      return <span className="font-mono text-darknavy/80">{service.revenueAccountCode}</span>;
    case "revenueAccountTitle":
      return (
        <span className="block truncate text-darknavy/75" title={service.revenueAccountTitle}>
          {service.revenueAccountTitle}
        </span>
      );
    case "status":
      return <ModuleStatusBadge status={service.status} />;
    case "createdBy":
      return <span>{service.createdBy ?? ""}</span>;
    case "createdAt":
      return <span>{formatDateTime(service.createdAt, { emptyValue: "", locale: "en-US" })}</span>;
    case "updatedBy":
      return <span>{service.updatedBy ?? ""}</span>;
    case "updatedAt":
      return <span>{formatDateTime(service.updatedAt, { emptyValue: "", locale: "en-US" })}</span>;
    case "actions":
      return (
        <ModuleTableActions className="w-full !justify-center">
          <ModuleTableActionButton variant="view" onClick={() => onViewService(service)} label={`View ${service.serviceName}`} />
          {permissions.canUpdate ? (
            <>
              <ModuleTableActionButton variant="edit" onClick={() => onEditService(service)} label={`Edit ${service.serviceName}`} />
              <ModuleTableActionButton
                variant={nextStatus === "Inactive" ? "inactive" : "active"}
                onClick={() => onToggleStatus(service)}
                label={`${statusActionLabel} ${service.serviceName}`}
              />
            </>
          ) : null}
        </ModuleTableActions>
      );
    default:
      return null;
  }
}

function ServicesMaintenanceTableCell({ children, className = "text-left" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>{children}</td>;
}
