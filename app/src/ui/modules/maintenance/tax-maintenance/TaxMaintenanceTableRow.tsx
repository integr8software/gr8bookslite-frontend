import type {
  TaxMaintenance,
  TaxMaintenancePermissions,
  TaxMaintenanceTableRowProps,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";
import {
  formatTaxMaintenancePercentage,
} from "@/app/src/data/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceData";
import {
  ModuleTableActionButton,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";
import { formatDateTime } from "@/app/src/utils/date.util";

export function TaxMaintenanceTableRow({
  row,
  permissions,
  onEditTax,
  onToggleStatus,
  onViewTax,
}: TaxMaintenanceTableRowProps) {
  return (
    <tr className="module-table-row">
      {row.getVisibleCells().map((cell) => (
        <TaxMaintenanceTableCell
          key={cell.id}
          className={getColumnMetaClassName(cell.column.columnDef.meta)}
        >
          <TaxMaintenanceCellContent
            columnId={cell.column.id}
            tax={row.original}
            permissions={permissions}
            onEditTax={onEditTax}
            onToggleStatus={onToggleStatus}
            onViewTax={onViewTax}
          />
        </TaxMaintenanceTableCell>
      ))}
    </tr>
  );
}

function TaxMaintenanceCellContent({
  columnId,
  tax,
  permissions,
  onEditTax,
  onToggleStatus,
  onViewTax,
}: {
  columnId: string;
  tax: TaxMaintenance;
  permissions: TaxMaintenancePermissions;
  onEditTax: (tax: TaxMaintenance) => void;
  onToggleStatus: (tax: TaxMaintenance) => void;
  onViewTax: (tax: TaxMaintenance) => void;
}) {
  const nextStatus = tax.status === "Active" ? "Inactive" : "Active";
  const statusActionLabel = tax.status === "Active" ? "Deactivate" : "Activate";

  switch (columnId) {
    case "name":
      return <span className="font-medium text-darknavy">{tax.name}</span>;
    case "percentage":
      return <span>{formatTaxMaintenancePercentage(tax.percentage)}</span>;
    case "inputVatAccountCode":
      return <AccountText value={tax.accounts?.inputVatAccount?.accountCode} />;
    case "inputVatAccountTitle":
      return <AccountText value={tax.accounts?.inputVatAccount?.accountTitle} />;
    case "outputVatAccountCode":
      return <AccountText value={tax.accounts?.outputVatAccount?.accountCode} />;
    case "outputVatAccountTitle":
      return <AccountText value={tax.accounts?.outputVatAccount?.accountTitle} />;
    case "vatPayableAccountCode":
      return <AccountText value={tax.accounts?.vatPayableAccount?.accountCode} />;
    case "vatPayableAccountTitle":
      return (
        <AccountText value={tax.accounts?.vatPayableAccount?.accountTitle} />
      );
    case "deferredInputTaxAccountCode":
      return (
        <AccountText
          value={tax.accounts?.deferredInputTaxAccount?.accountCode}
        />
      );
    case "deferredInputTaxAccountTitle":
      return (
        <AccountText
          value={tax.accounts?.deferredInputTaxAccount?.accountTitle}
        />
      );
    case "deferredOutputVatAccountCode":
      return (
        <AccountText
          value={tax.accounts?.deferredOutputVatAccount?.accountCode}
        />
      );
    case "deferredOutputVatAccountTitle":
      return (
        <AccountText
          value={tax.accounts?.deferredOutputVatAccount?.accountTitle}
        />
      );
    case "status":
      return <StatusBadge status={tax.status} />;
    case "createdBy":
      return <span>{tax.createdBy ?? ""}</span>;
    case "createdAt":
      return (
        <span>
          {formatDateTime(tax.createdAt, { emptyValue: "", locale: "en-US" })}
        </span>
      );
    case "updatedBy":
      return <span>{tax.updatedBy ?? ""}</span>;
    case "updatedAt":
      return (
        <span>
          {formatDateTime(tax.updatedAt, { emptyValue: "", locale: "en-US" })}
        </span>
      );
    case "actions":
      return (
        <ModuleTableActions
          data-spotlight-id="maintenance-record-actions"
          className="w-full !justify-center"
        >
          <ModuleTableActionButton
            variant="view"
            onClick={() => onViewTax(tax)}
            data-spotlight-id="maintenance-record-view"
            label={`View ${tax.name}`}
          />
          {permissions.canUpdate ? (
            <>
              <ModuleTableActionButton
                variant="edit"
                onClick={() => onEditTax(tax)}
                data-spotlight-id="maintenance-record-edit"
                label={`Edit ${tax.name}`}
              />
              <ModuleTableActionButton
                variant={nextStatus === "Inactive" ? "inactive" : "active"}
                onClick={() => onToggleStatus(tax)}
                data-spotlight-id="maintenance-record-status"
                label={`${statusActionLabel} ${tax.name}`}
              />
            </>
          ) : null}
        </ModuleTableActions>
      );
    default:
      return null;
  }
}

function TaxMaintenanceTableCell({
  className = "text-left",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>
      {children}
    </td>
  );
}

function AccountText({ value }: { value?: string | null }) {
  return (
    <span className="block truncate text-darknavy/75" title={value ?? ""}>
      {value ?? ""}
    </span>
  );
}

function StatusBadge({ status }: { status: TaxMaintenance["status"] }) {
  const statusClass =
    status === "Active"
      ? "bg-citron/25 text-darknavy"
      : "bg-darknavy/8 text-darknavy/55";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
    >
      {status}
    </span>
  );
}
