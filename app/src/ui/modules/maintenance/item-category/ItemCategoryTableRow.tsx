import { ChevronRight } from "lucide-react";
import type { Row } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type {
  ItemCategoryPermissions,
  ItemCategoryTableRowData,
} from "@/app/src/types/modules/maintenance/item-category/ItemCategoryTypes";
import { formatDateTime } from "@/app/src/utils/date.util";
import {
  ModuleTableActionButton,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";

type ItemCategoryTableRowProps = {
  expandedIds: Set<string>;
  permissions: ItemCategoryPermissions;
  row: Row<ItemCategoryTableRowData>;
  onEditRecord: (row: ItemCategoryTableRowData) => void;
  onStatusChange: (row: ItemCategoryTableRowData) => void;
  onToggleExpanded: (recordId: string) => void;
  onViewRecord: (row: ItemCategoryTableRowData) => void;
};

const AccountingBadgeClassNames = {
  Configured: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Inherited: "bg-skyblue/12 text-darknavy ring-skyblue/25",
} as const;

export function ItemCategoryTableRow({
  expandedIds,
  onEditRecord,
  onStatusChange,
  onToggleExpanded,
  onViewRecord,
  permissions,
  row,
}: ItemCategoryTableRowProps) {
  const rowData = row.original;
  const { record } = rowData;
  const isStatusLockedByParent =
    Boolean(rowData.hasInactiveAncestor) && record.status === "Inactive";

  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      {row.getVisibleCells().map((cell) => (
        <ItemCategoryTableCell
          key={cell.id}
          className={getColumnMetaClassName(cell.column.columnDef.meta)}
        >
          <ItemCategoryCellContent
            columnId={cell.column.id}
            expandedIds={expandedIds}
            isStatusLockedByParent={isStatusLockedByParent}
            permissions={permissions}
            row={rowData}
            onEditRecord={onEditRecord}
            onStatusChange={onStatusChange}
            onToggleExpanded={onToggleExpanded}
            onViewRecord={onViewRecord}
          />
        </ItemCategoryTableCell>
      ))}
    </tr>
  );
}

function ItemCategoryCellContent({
  columnId,
  expandedIds,
  isStatusLockedByParent,
  onEditRecord,
  onStatusChange,
  onToggleExpanded,
  onViewRecord,
  permissions,
  row,
}: {
  columnId: string;
  expandedIds: Set<string>;
  isStatusLockedByParent: boolean;
  permissions: ItemCategoryPermissions;
  row: ItemCategoryTableRowData;
  onEditRecord: (row: ItemCategoryTableRowData) => void;
  onStatusChange: (row: ItemCategoryTableRowData) => void;
  onToggleExpanded: (recordId: string) => void;
  onViewRecord: (row: ItemCategoryTableRowData) => void;
}) {
  const { record } = row;

  switch (columnId) {
    case "name":
      return (
        <div className="flex items-center gap-2">
          {row.level > 0 ? (
            <div className="flex self-stretch" aria-hidden="true">
              {Array.from({ length: row.level }).map((_, index) => {
                const isCurrentLevel = index === row.level - 1;

                return (
                  <span key={index} className="relative block w-7 shrink-0">
                    <span className="absolute bottom-[-1rem] left-1/2 top-[-1rem] border-l border-dashed border-slate-300" />
                    {isCurrentLevel ? (
                      <>
                        <span className="absolute left-1/2 top-1/2 h-px w-5 border-t border-dashed border-slate-300" />
                        <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-300" />
                      </>
                    ) : null}
                  </span>
                );
              })}
            </div>
          ) : null}
          <button
            type="button"
            disabled={!row.hasChildren}
            onClick={() => onToggleExpanded(record.id)}
            aria-label={`Toggle ${record.name}`}
            className={joinClasses(
              "flex h-7 w-7 items-center justify-center rounded-md transition",
              row.hasChildren
                ? "text-darknavy/50 hover:bg-white hover:text-skyblue"
                : "text-transparent",
            )}
          >
            <ChevronRight
              className={joinClasses(
                "h-4 w-4 transition",
                expandedIds.has(record.id) && "rotate-90",
              )}
              aria-hidden="true"
            />
          </button>
          <div className="min-w-0 text-left">
            <div className="font-medium">{record.name}</div>
            <div className="mt-1 truncate text-xs text-darknavy/55">{record.description}</div>
            {row.usedByItemCount > 0 ? (
              <div className="mt-1 text-xs font-medium text-darknavy/55">
                Used by {row.usedByItemCount} item
                {row.usedByItemCount === 1 ? "" : "s"}
              </div>
            ) : null}
          </div>
        </div>
      );
    case "parentName":
      return <span className="text-darknavy/65">{row.parentName}</span>;
    case "accountingSetupStatus":
      return (
        <div className="grid justify-items-center gap-1">
          <span
            className={joinClasses(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
              AccountingBadgeClassNames[row.accountingSetupStatus],
            )}
          >
            {row.accountingSetupStatus}
          </span>
          {row.accountingSetupStatus === "Inherited" && row.inheritedAccountingSourceName ? (
            <span className="max-w-[9rem] text-xs text-darknavy/50">
              {row.inheritedAccountingSourceName}
            </span>
          ) : null}
        </div>
      );
    case "status":
      return <ModuleStatusBadge status={record.status} />;
    case "createdBy":
      return <span>{record.createdBy ?? ""}</span>;
    case "createdAt":
      return <span>{formatDateTime(record.createdAt, { emptyValue: "" })}</span>;
    case "updatedBy":
      return <span>{record.updatedBy ?? ""}</span>;
    case "updatedAt":
      return <span>{formatDateTime(record.updatedAt, { emptyValue: "" })}</span>;
    case "actions":
      return row.isVirtual ? null : (
        <ModuleTableActions className="w-full !justify-center">
          {permissions.canView ? (
            <ModuleTableActionButton
              variant="view"
              onClick={() => onViewRecord(row)}
              label={`View ${record.name}`}
            />
          ) : null}
          {permissions.canUpdate ? (
            <>
              <ModuleTableActionButton
                variant="edit"
                onClick={() => onEditRecord(row)}
                label={`Edit ${record.name}`}
              />
              <ModuleTableActionButton
                variant={record.status === "Active" ? "inactive" : "active"}
                disabled={isStatusLockedByParent}
                onClick={() => onStatusChange(row)}
                label={
                  isStatusLockedByParent
                    ? `Reactivate a parent category before reactivating ${record.name}`
                    : record.status === "Active"
                      ? `Set ${record.name} inactive`
                      : `Reactivate ${record.name}`
                }
                title={isStatusLockedByParent ? "Reactivate the parent category first." : undefined}
              />
            </>
          ) : null}
        </ModuleTableActions>
      );
    default:
      return null;
  }
}

function ItemCategoryTableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={joinClasses("px-4 py-4 align-middle text-sm text-darknavy", className)}>
      {children}
    </td>
  );
}
