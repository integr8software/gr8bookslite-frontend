"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { ChevronRight, GripVertical, Plus } from "lucide-react";
import type { CSSProperties } from "react";
import {
  AccountLevelLabels,
  NormalBalanceLabels,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import {
  getDropPlacementMode,
  isSpecificAccountLevel,
  isSpecificAccountNumber,
} from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsData";
import type {
  ChartAccount,
  ChartsOfAccountsPermissions,
  ChartsOfAccountsTableRowProps,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import {
  Badge,
  TypeBadge,
  joinClasses,
} from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsControls";
import {
  ModuleTableActionButton,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function ChartsOfAccountsTableRow({
  account,
  activeDragAccount,
  activeDropPlacement,
  canDragRows,
  expandedIds,
  level,
  parentAccount,
  parentPath,
  permissions,
  showHierarchyGuides,
  showParentColumn,
  visibleColumnIds,
  onAddChild,
  onEdit,
  onStatusChange,
  onToggleExpanded,
  onView,
}: ChartsOfAccountsTableRowProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
  } = useDraggable({
    id: account.id,
    disabled: !canDragRows || !isSpecificAccountLevel(account),
  });
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: account.id,
  });
  const targetIsSpecific = isSpecificAccountNumber(account.accountNumber);
  const accountIsSpecific = isSpecificAccountLevel(account);
  const dropPlacementMode = getDropPlacementMode({
    activeDragAccount,
    placement: activeDropPlacement ?? "before",
    targetAccount: account,
    targetIsSpecific,
  });
  const dropMode =
    isOver && !isDragging && activeDropPlacement ? dropPlacementMode : null;
  const rowStyle: CSSProperties = {
    transform: CSS.Translate.toString(transform),
  };

  function setRowNodeRef(node: HTMLTableRowElement | null) {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  }

  const visibleColumnIdSet = new Set(visibleColumnIds);
  const isColumnVisible = (columnId: string) => visibleColumnIdSet.has(columnId);
  const addTitleParentAccount = accountIsSpecific ? parentAccount : account;
  const canAddAccountTitle =
    permissions.canCreate && Boolean(addTitleParentAccount);

  return (
    <motion.tr
      ref={setRowNodeRef}
      data-chart-account-id={account.id}
      style={rowStyle}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={joinClasses(
        "module-table-row group relative z-0 text-darknavy hover:z-30 focus-within:z-30",
        isDragging && "relative z-10 bg-skyblue/5 opacity-70 shadow-sm",
        dropMode === "before" &&
        "border-t-2 border-skyblue bg-skyblue/[0.035]",
        dropMode === "after" &&
        "border-b-2 border-skyblue bg-skyblue/[0.035]",
        dropMode === "inside" && "bg-skyblue/10 ring-1 ring-inset ring-skyblue/25",
      )}
    >
      {isColumnVisible("accountNumber") ? (
        <td className="relative px-5 py-4 font-semibold text-darknavy">
          {dropMode ? (
            <DropPlacementIndicator
              mode={dropMode}
              accountName={account.accountName}
            />
          ) : null}
          {account.accountNumber}
        </td>
      ) : null}
      {isColumnVisible("accountName") ? (
        <td className="relative px-5 py-4">
          {dropMode && !isColumnVisible("accountNumber") ? (
            <DropPlacementIndicator
              mode={dropMode}
              accountName={account.accountName}
            />
          ) : null}
          <AccountNameCell
            account={account}
            canDrag={canDragRows && accountIsSpecific}
            expandedIds={expandedIds}
            dragAttributes={attributes}
            dragListeners={listeners}
            level={level}
            showHierarchyGuides={showHierarchyGuides}
            onToggleExpanded={onToggleExpanded}
          />
          {canAddAccountTitle && addTitleParentAccount ? (
            <AddAccountTitleButton
              parentAccount={addTitleParentAccount}
              onAddChild={onAddChild}
            />
          ) : null}
        </td>
      ) : null}
      {showParentColumn && isColumnVisible("parentPath") ? (
        <td className="px-5 py-4 text-darknavy/70">
          <span className="line-clamp-2 text-sm font-medium" title={parentPath}>
            {parentPath || "--"}
          </span>
        </td>
      ) : null}
      {isColumnVisible("accountType") ? (
        <td className="px-5 py-4 text-center">
          <TypeBadge type={account.accountType} />
        </td>
      ) : null}
      {isColumnVisible("accountLevel") ? (
        <td className="px-5 py-4 text-center">
          <Badge variant="gray">
            {AccountLevelLabels[account.accountLevel]}
          </Badge>
        </td>
      ) : null}
      {isColumnVisible("statementSection") ? (
        <td className="px-5 py-4 text-center text-darknavy">{account.statementSection}</td>
      ) : null}
      {isColumnVisible("normalBalance") ? (
        <td className="px-5 py-4 text-center">
          <Badge variant={account.normalBalance === "DEBIT" ? "blue" : "violet"}>
            {NormalBalanceLabels[account.normalBalance]}
          </Badge>
        </td>
      ) : null}
      {isColumnVisible("reportAlias") ? (
        <td className="px-5 py-4 text-center text-darknavy">
          {account.showInReports ? account.reportAlias : ""}
        </td>
      ) : null}
      {isColumnVisible("status") ? (
        <td className="px-5 py-4 text-center">
          <Badge variant={account.status === "Active" ? "green" : "gray"}>
            {account.status}
          </Badge>
        </td>
      ) : null}
      {isColumnVisible("actions") ? (
        <td className="px-5 py-4 text-center">
          <RowActions
            account={account}
            permissions={permissions}
            onEdit={onEdit}
            onStatusChange={onStatusChange}
            onView={onView}
          />
        </td>
      ) : null}
    </motion.tr>
  );
}

function DropPlacementIndicator({
  accountName,
  mode,
}: {
  accountName: string;
  mode: "before" | "inside" | "after";
}) {
  if (mode === "inside") {
    return (
      <span
        className="pointer-events-none absolute left-3 top-1/2 z-20 inline-flex -translate-y-1/2 items-center gap-2 rounded-full border border-skyblue/30 bg-white px-2.5 py-1 text-[11px] font-bold uppercase text-skyblue shadow-[0_8px_24px_rgba(14,165,233,0.18)]"
        aria-hidden="true"
      >
        <span className="h-2 w-2 rounded-full bg-skyblue" />
        Place inside {accountName}
      </span>
    );
  }

  return (
    <span
      className={joinClasses(
        "pointer-events-none absolute left-0 right-[calc(-100vw)] z-20 h-0.5 bg-skyblue shadow-[0_0_0_3px_rgba(14,165,233,0.14)]",
        mode === "after" ? "-bottom-1" : "-top-1",
      )}
      aria-hidden="true"
    >
      <span className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-skyblue shadow-sm" />
      <span className="absolute left-8 top-1/2 -translate-y-1/2 rounded-full border border-skyblue/30 bg-white px-2.5 py-1 text-[11px] font-bold uppercase text-skyblue shadow-[0_8px_24px_rgba(14,165,233,0.18)]">
        Place {mode} {accountName}
      </span>
    </span>
  );
}

function AccountNameCell({
  account,
  canDrag,
  expandedIds,
  dragAttributes,
  dragListeners,
  level,
  showHierarchyGuides,
  onToggleExpanded,
}: {
  account: ChartAccount;
  canDrag: boolean;
  expandedIds: Set<string>;
  dragAttributes: ReturnType<typeof useDraggable>["attributes"];
  dragListeners: ReturnType<typeof useDraggable>["listeners"];
  level: number;
  showHierarchyGuides: boolean;
  onToggleExpanded: (accountId: string) => void;
}) {
  const hasChildren = Boolean(account.children?.length);

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {showHierarchyGuides && level > 0 ? (
        <div className="flex self-stretch" aria-hidden="true">
          {Array.from({ length: level }).map((_, index) => {
            const isCurrentLevel = index === level - 1;

            return (
              <span key={index} className="relative block w-5 shrink-0">
                <span className="absolute bottom-[-1rem] left-1/2 top-[-1rem] border-l border-darknavy/20" />
                {isCurrentLevel ? (
                  <>
                    <span className="absolute left-1/2 top-1/2 h-px w-3.5 border-t border-darknavy/20" />
                  </>
                ) : null}
              </span>
            );
          })}
        </div>
      ) : null}
      {canDrag ? (
        <button
          type="button"
          aria-label={`Drag ${account.accountName}`}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-darknavy/40 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/30"
          {...dragAttributes}
          {...dragListeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
      {hasChildren ? (
        <button
          type="button"
          onClick={() => onToggleExpanded(account.id)}
          aria-label={`Toggle ${account.accountName}`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-darknavy/50 transition hover:bg-white hover:text-skyblue"
        >
          <ChevronRight
            className={joinClasses(
              "h-4 w-4 transition",
              expandedIds.has(account.id) && "rotate-90",
            )}
            aria-hidden="true"
          />
        </button>
      ) : null}
      <div className="flex min-h-9 min-w-0 flex-1 flex-col justify-center">
        <p className="truncate font-semibold text-darknavy">
          {account.accountName}
        </p>
        {account.description ? (
          <p className="truncate text-sm text-darknavy/60">
            {account.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function AddAccountTitleButton({
  parentAccount,
  onAddChild,
}: {
  parentAccount: ChartAccount;
  onAddChild: (account: ChartAccount) => void;
}) {
  const addTitleLabel = `Add account title under ${parentAccount.accountName}`;

  return (
    <button
      type="button"
      aria-label={addTitleLabel}
      title={addTitleLabel}
      className="absolute bottom-0 left-1/2 z-20 inline-flex -translate-x-1/2 translate-y-1/2 items-center gap-1.5 rounded-full border border-skyblue/25 bg-white px-3 py-1 text-[11px] font-bold uppercase text-skyblue opacity-0 shadow-[0_8px_24px_rgba(14,165,233,0.16)] transition hover:border-skyblue/45 hover:bg-skyblue/5 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25 group-hover:opacity-100"
      onClick={(event) => {
        event.stopPropagation();
        onAddChild(parentAccount);
      }}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      Add account title
    </button>
  );
}

function RowActions({
  account,
  permissions,
  onEdit,
  onStatusChange,
  onView,
}: {
  account: ChartAccount;
  permissions: Omit<ChartsOfAccountsPermissions, "canExport">;
  onEdit: (account: ChartAccount) => void;
  onStatusChange: (account: ChartAccount) => void;
  onView: (account: ChartAccount) => void;
}) {
  const nextStatus = account.status === "Active" ? "Inactive" : "Active";
  const canManageAccount =
    permissions.canUpdate && (account.isUserCreated || account.isBankLinked);

  return (
    <ModuleTableActions className="w-full !justify-center">
      {permissions.canView ? (
        <ModuleTableActionButton
          variant="view"
          label={`View ${account.accountName}`}
          onClick={() => onView(account)}
        />
      ) : null}
      {canManageAccount ? (
        <>
          <ModuleTableActionButton
            variant="edit"
            label={`Edit ${account.accountName}`}
            onClick={() => onEdit(account)}
          />
          <ModuleTableActionButton
            variant={nextStatus === "Inactive" ? "inactive" : "active"}
            label={`${nextStatus === "Inactive" ? "Deactivate" : "Activate"} ${account.accountName}`}
            onClick={() => onStatusChange(account)}
          />
        </>
      ) : null}
    </ModuleTableActions>
  );
}
