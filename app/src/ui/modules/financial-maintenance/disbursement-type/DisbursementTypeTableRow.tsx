import type { ReactNode } from "react";
import { formatDateTime } from "@/app/src/utils/date.util";
import { DisbursementTypeStatuses } from "@/app/src/constants/modules/financial-maintenance/disbursement-type/DisbursementTypeConstants";
import { getDisbursementTypeTypeLabel } from "@/app/src/data/modules/financial-maintenance/disbursement-type/DisbursementTypeMaintenanceData";
import type {
  DisbursementType,
  DisbursementTypePermissions,
  DisbursementTypeTableRowProps,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import { ModuleTableActionButton, ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

export function DisbursementTypeTableRow({
  row,
  permissions,
  onEditDisbursementType,
  onToggleStatus,
  onViewDisbursementType,
}: DisbursementTypeTableRowProps) {
  return (
    <tr className="module-table-row">
      {row.getVisibleCells().map((cell) => (
        <DisbursementTypeTableCell key={cell.id} className={getColumnMetaClassName(cell.column.columnDef.meta)}>
          <DisbursementTypeCellContent
            columnId={cell.column.id}
            disbursementType={row.original}
            permissions={permissions}
            onEditDisbursementType={onEditDisbursementType}
            onToggleStatus={onToggleStatus}
            onViewDisbursementType={onViewDisbursementType}
          />
        </DisbursementTypeTableCell>
      ))}
    </tr>
  );
}

function DisbursementTypeCellContent({
  columnId,
  disbursementType,
  permissions,
  onEditDisbursementType,
  onToggleStatus,
  onViewDisbursementType,
}: {
  columnId: string;
  disbursementType: DisbursementType;
  permissions: DisbursementTypePermissions;
  onEditDisbursementType: (account: DisbursementType) => void;
  onToggleStatus: (account: DisbursementType) => void;
  onViewDisbursementType: (account: DisbursementType) => void;
}) {
  const nextStatus =
    disbursementType.status === DisbursementTypeStatuses.Active ? DisbursementTypeStatuses.Inactive : DisbursementTypeStatuses.Active;
  const statusActionLabel = disbursementType.status === DisbursementTypeStatuses.Active ? "Inactivate" : "Activate";

  switch (columnId) {
    case "disbursementTypeName":
      return <span className="font-medium text-darknavy">{disbursementType.disbursementTypeName}</span>;
    case "description":
      return (
        <span className="block truncate text-darknavy/75" title={disbursementType.description}>
          {disbursementType.description || "-"}
        </span>
      );
    case "type":
      return <TypeBadge type={disbursementType.type} />;
    case "accountCode":
      return (
        <div className="grid gap-1.5">
          {disbursementType.generatedAccounts.map((generated) => (
            <span
              key={`${generated.role}-${generated.chartAccountId}`}
              className="block truncate font-semibold text-darknavy"
              title={generated.accountCode}
            >
              {generated.accountCode}
            </span>
          ))}
        </div>
      );
    case "accountName":
      return (
        <div className="grid gap-1.5">
          {disbursementType.generatedAccounts.map((generated) => (
            <span
              key={`${generated.role}-${generated.chartAccountId}`}
              className="block truncate text-darknavy/75"
              title={generated.accountTitle}
            >
              {generated.accountTitle}
            </span>
          ))}
        </div>
      );
    case "status":
      return <ModuleStatusBadge status={disbursementType.status} />;
    case "createdBy":
      return <span>{disbursementType.createdBy ?? ""}</span>;
    case "createdAt":
      return <span>{formatDateTime(disbursementType.createdAt)}</span>;
    case "updatedBy":
      return <span>{disbursementType.updatedBy ?? ""}</span>;
    case "updatedAt":
      return <span>{formatDateTime(disbursementType.updatedAt)}</span>;
    case "actions":
      return (
        <ModuleTableActions className="w-full !justify-center">
          <ModuleTableActionButton
            variant="view"
            onClick={() => onViewDisbursementType(disbursementType)}
            label={`View ${disbursementType.disbursementTypeName}`}
          />
          {permissions.canUpdate ? (
            <ModuleTableActionButton
              variant="edit"
              onClick={() => onEditDisbursementType(disbursementType)}
              label={`Edit ${disbursementType.disbursementTypeName}`}
            />
          ) : null}
          {permissions.canCancel ? (
            <ModuleTableActionButton
              variant={nextStatus === DisbursementTypeStatuses.Inactive ? "inactive" : "active"}
              onClick={() => onToggleStatus(disbursementType)}
              label={`${statusActionLabel} ${disbursementType.disbursementTypeName}`}
            />
          ) : null}
        </ModuleTableActions>
      );
    default:
      return null;
  }
}

function DisbursementTypeTableCell({ className = "text-left", children }: { className?: string; children: ReactNode }) {
  return <td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>{children}</td>;
}

function TypeBadge({ type }: { type: DisbursementType["type"] }) {
  return (
    <span className="inline-flex rounded-full bg-[var(--skyblue)] px-2.5 py-1 text-xs font-semibold text-white">
      {getDisbursementTypeTypeLabel(type)}
    </span>
  );
}
