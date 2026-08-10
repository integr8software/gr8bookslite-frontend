import type { ReactNode } from "react";
import { formatDateTime } from "@/app/src/utils/date.util";
import { getDefaultAccountTypeLabel } from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import type {
  DefaultAccount,
  DefaultAccountPermissions,
  DefaultAccountTableRowProps,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { ModuleTableActionButton, ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

export function DefaultAccountTableRow({
  row,
  permissions,
  onEditDefaultAccount,
  onToggleStatus,
  onViewDefaultAccount,
}: DefaultAccountTableRowProps) {
  return (
    <tr className="module-table-row">
      {row.getVisibleCells().map((cell) => (
        <DefaultAccountTableCell key={cell.id} className={getColumnMetaClassName(cell.column.columnDef.meta)}>
          <DefaultAccountCellContent
            columnId={cell.column.id}
            defaultAccount={row.original}
            permissions={permissions}
            onEditDefaultAccount={onEditDefaultAccount}
            onToggleStatus={onToggleStatus}
            onViewDefaultAccount={onViewDefaultAccount}
          />
        </DefaultAccountTableCell>
      ))}
    </tr>
  );
}

function DefaultAccountCellContent({
  columnId,
  defaultAccount,
  permissions,
  onEditDefaultAccount,
  onToggleStatus,
  onViewDefaultAccount,
}: {
  columnId: string;
  defaultAccount: DefaultAccount;
  permissions: DefaultAccountPermissions;
  onEditDefaultAccount: (account: DefaultAccount) => void;
  onToggleStatus: (account: DefaultAccount) => void;
  onViewDefaultAccount: (account: DefaultAccount) => void;
}) {
  const nextStatus = defaultAccount.status === "Active" ? "Inactive" : "Active";
  const statusActionLabel = defaultAccount.status === "Active" ? "Inactivate" : "Activate";

  switch (columnId) {
    case "defaultAccountName":
      return <span className="font-medium text-darknavy">{defaultAccount.defaultAccountName}</span>;
    case "description":
      return (
        <span className="block truncate text-darknavy/75" title={defaultAccount.description}>
          {defaultAccount.description || "-"}
        </span>
      );
    case "type":
      return <TypeBadge type={defaultAccount.type} />;
    case "accountCode":
      return (
        <div className="grid gap-1.5">
          {defaultAccount.generatedAccounts.map((generated) => (
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
          {defaultAccount.generatedAccounts.map((generated) => (
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
      return <ModuleStatusBadge status={defaultAccount.status} />;
    case "createdBy":
      return <span>{defaultAccount.createdBy ?? ""}</span>;
    case "createdAt":
      return <span>{formatDateTime(defaultAccount.createdAt)}</span>;
    case "updatedBy":
      return <span>{defaultAccount.updatedBy ?? ""}</span>;
    case "updatedAt":
      return <span>{formatDateTime(defaultAccount.updatedAt)}</span>;
    case "actions":
      return (
        <ModuleTableActions className="w-full !justify-center">
          <ModuleTableActionButton
            variant="view"
            onClick={() => onViewDefaultAccount(defaultAccount)}
            label={`View ${defaultAccount.defaultAccountName}`}
          />
          {permissions.canUpdate ? (
            <ModuleTableActionButton
              variant="edit"
              onClick={() => onEditDefaultAccount(defaultAccount)}
              label={`Edit ${defaultAccount.defaultAccountName}`}
            />
          ) : null}
          {permissions.canCancel ? (
            <ModuleTableActionButton
              variant={nextStatus === "Inactive" ? "inactive" : "active"}
              onClick={() => onToggleStatus(defaultAccount)}
              label={`${statusActionLabel} ${defaultAccount.defaultAccountName}`}
            />
          ) : null}
        </ModuleTableActions>
      );
    default:
      return null;
  }
}

function DefaultAccountTableCell({ className = "text-left", children }: { className?: string; children: ReactNode }) {
  return <td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>{children}</td>;
}

function TypeBadge({ type }: { type: DefaultAccount["type"] }) {
  return (
    <span className="inline-flex rounded-full bg-[var(--skyblue)] px-2.5 py-1 text-xs font-semibold text-white">
      {getDefaultAccountTypeLabel(type)}
    </span>
  );
}
