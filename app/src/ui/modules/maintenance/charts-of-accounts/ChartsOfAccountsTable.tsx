"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { getEventCoordinates } from "@dnd-kit/utilities";
import { Search } from "lucide-react";
import { useState } from "react";
import { getPointerDropPlacement } from "@/app/src/data/modules/maintenance/charts-of-accounts/ChartsOfAccountsData";
import type {
  ActiveDragAccount,
  ActiveDropTarget,
  ChartsOfAccountsTableProps,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ChartsOfAccountsTableRow } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsTableRow";

export function ChartsOfAccountsTable(props: ChartsOfAccountsTableProps) {
  const [activeDragAccount, setActiveDragAccount] =
    useState<ActiveDragAccount>();
  const [activeDropTarget, setActiveDropTarget] =
    useState<ActiveDropTarget | null>(null);
  const visibleColumnIds = props.table
    .getVisibleLeafColumns()
    .map((column) => column.id);
  const accountById = new Map(
    props.accounts.map((account) => [account.id, account]),
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    if (!props.canDragRows) {
      return;
    }

    const activeAccount = props.table
      .getPrePaginationRowModel()
      .rows.find((row) => row.original.account.id === event.active.id)
      ?.original.account;

    setActiveDragAccount(
      activeAccount
        ? {
          id: activeAccount.id,
          isSpecific: activeAccount.accountLevel === "SPECIFIC",
          parentId: activeAccount.parentId,
        }
        : undefined,
    );
  }

  function handleDragMove(event: DragMoveEvent) {
    setActiveDropTarget(getActiveDropTarget(event));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const dropTarget = getActiveDropTarget(event);

    setActiveDragAccount(undefined);
    setActiveDropTarget(null);

    if (
      !props.canDragRows ||
      !over ||
      active.id === over.id ||
      !activeDragAccount?.isSpecific ||
      !dropTarget
    ) {
      return;
    }

    props.onReorderAccount(
      String(active.id),
      dropTarget.id,
      dropTarget.placement,
    );
  }

  function handleDragCancel() {
    setActiveDragAccount(undefined);
    setActiveDropTarget(null);
  }

  function getActiveDropTarget(
    event: DragMoveEvent | DragEndEvent,
  ): ActiveDropTarget | null {
    const { active, over } = event;

    if (
      !props.canDragRows ||
      !over ||
      active.id === over.id ||
      !activeDragAccount?.isSpecific
    ) {
      return null;
    }

    const targetAccount = accountById.get(String(over.id));

    if (!targetAccount) {
      return null;
    }

    return {
      id: String(over.id),
      placement: getPointerDropPlacement({
        pointerY: getPointerY(event),
        targetAccountLevel: targetAccount.accountLevel,
        targetHeight: over.rect.height,
        targetTop: over.rect.top,
      }),
    };
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragStart={handleDragStart}
    >
      <ModuleTable
        emptyDescription="Adjust the filters or add a new ledger account."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No accounts found"
        isLoading={props.isLoading}
        isSyncing={props.isRefreshing}
        lastSyncedAt={props.lastSyncedAt}
        paginationLabel="accounts"
        paginationStorageKey="maintenance:chart-of-accounts"
        pageSizeOptions={[25, 50, 100, 150, 200]}
        table={props.table}
        tableTitle="Ledger Accounts"
        toolbar={props.toolbar}
        useColumnSizing
        variant="embedded"
        renderRow={({ id, original }) => (
          <ChartsOfAccountsTableRow
            key={id}
            account={original.account}
            activeDragAccount={activeDragAccount}
            activeDropPlacement={
              activeDropTarget?.id === original.account.id
                ? activeDropTarget.placement
                : null
            }
            canDragRows={props.canDragRows}
            expandedIds={props.expandedIds}
            level={original.level}
            parentAccount={
              original.account.parentId
                ? accountById.get(original.account.parentId) ?? null
                : null
            }
            parentPath={original.parentPath}
            permissions={props.permissions}
            showHierarchyGuides={props.showHierarchyGuides}
            showParentColumn={props.showParentColumn}
            visibleColumnIds={visibleColumnIds}
            onAddChild={props.onAddChild}
            onEdit={props.onEdit}
            onStatusChange={props.onStatusChange}
            onToggleExpanded={props.onToggleExpanded}
            onView={props.onView}
          />
        )}
      />
    </DndContext>
  );
}

function getPointerY(event: DragMoveEvent | DragEndEvent) {
  const initialCoordinates = getEventCoordinates(event.activatorEvent);

  if (!initialCoordinates) {
    return null;
  }

  return initialCoordinates.y + event.delta.y;
}


