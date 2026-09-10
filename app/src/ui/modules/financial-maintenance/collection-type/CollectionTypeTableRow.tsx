import type { ReactNode } from "react";
import { formatDateTime } from "@/app/src/utils/date.util";
import { CollectionTypeStatuses } from "@/app/src/constants/modules/financial-maintenance/collection-type/CollectionTypeConstants";
import { getCollectionTypeTypeLabel } from "@/app/src/data/modules/financial-maintenance/collection-type/CollectionTypeData";
import type {
  CollectionType,
  CollectionTypePermissions,
  CollectionTypeTableRowProps,
} from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import { ModuleTableActionButton, ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

export function CollectionTypeTableRow({
  row,
  permissions,
  onEditCollectionType,
  onToggleStatus,
  onViewCollectionType,
}: CollectionTypeTableRowProps) {
  return (
    <tr className="module-table-row">
      {row.getVisibleCells().map((cell) => (
        <CollectionTypeTableCell key={cell.id} className={getColumnMetaClassName(cell.column.columnDef.meta)}>
          <CollectionTypeCellContent
            columnId={cell.column.id}
            collectionType={row.original}
            permissions={permissions}
            onEditCollectionType={onEditCollectionType}
            onToggleStatus={onToggleStatus}
            onViewCollectionType={onViewCollectionType}
          />
        </CollectionTypeTableCell>
      ))}
    </tr>
  );
}

function CollectionTypeCellContent({
  columnId,
  collectionType,
  permissions,
  onEditCollectionType,
  onToggleStatus,
  onViewCollectionType,
}: {
  columnId: string;
  collectionType: CollectionType;
  permissions: CollectionTypePermissions;
  onEditCollectionType: (account: CollectionType) => void;
  onToggleStatus: (account: CollectionType) => void;
  onViewCollectionType: (account: CollectionType) => void;
}) {
  const nextStatus = collectionType.status === CollectionTypeStatuses.Active ? CollectionTypeStatuses.Inactive : CollectionTypeStatuses.Active;
  const statusActionLabel = collectionType.status === CollectionTypeStatuses.Active ? "Inactivate" : "Activate";

  switch (columnId) {
    case "collectionTypeName":
      return <span className="font-medium text-darknavy">{collectionType.collectionTypeName}</span>;
    case "description":
      return (
        <span className="block truncate text-darknavy/75" title={collectionType.description}>
          {collectionType.description || "-"}
        </span>
      );
    case "type":
      return <TypeBadge type={collectionType.type} />;
    case "accountCode":
      return (
        <div className="grid gap-1.5">
          {collectionType.generatedAccounts.map((generated) => (
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
          {collectionType.generatedAccounts.map((generated) => (
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
      return <ModuleStatusBadge status={collectionType.status} />;
    case "createdBy":
      return <span>{collectionType.createdBy ?? ""}</span>;
    case "createdAt":
      return <span>{formatDateTime(collectionType.createdAt)}</span>;
    case "updatedBy":
      return <span>{collectionType.updatedBy ?? ""}</span>;
    case "updatedAt":
      return <span>{formatDateTime(collectionType.updatedAt)}</span>;
    case "actions":
      return (
        <ModuleTableActions className="w-full !justify-center">
          <ModuleTableActionButton
            variant="view"
            onClick={() => onViewCollectionType(collectionType)}
            label={`View ${collectionType.collectionTypeName}`}
          />
          {permissions.canUpdate ? (
            <ModuleTableActionButton
              variant="edit"
              onClick={() => onEditCollectionType(collectionType)}
              label={`Edit ${collectionType.collectionTypeName}`}
            />
          ) : null}
          {permissions.canCancel ? (
            <ModuleTableActionButton
              variant={nextStatus === CollectionTypeStatuses.Inactive ? "inactive" : "active"}
              onClick={() => onToggleStatus(collectionType)}
              label={`${statusActionLabel} ${collectionType.collectionTypeName}`}
            />
          ) : null}
        </ModuleTableActions>
      );
    default:
      return null;
  }
}

function CollectionTypeTableCell({ className = "text-left", children }: { className?: string; children: ReactNode }) {
  return <td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>{children}</td>;
}

function TypeBadge({ type }: { type: CollectionType["type"] }) {
  return (
    <span className="inline-flex rounded-full bg-[var(--skyblue)] px-2.5 py-1 text-xs font-semibold text-white">
      {getCollectionTypeTypeLabel(type)}
    </span>
  );
}
