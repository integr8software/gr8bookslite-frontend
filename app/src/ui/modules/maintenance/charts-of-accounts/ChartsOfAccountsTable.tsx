"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Search } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Table } from "@tanstack/react-table";
import type {
  ChartAccount,
  FlattenedChartAccount,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ChartsOfAccountsTableRow } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsTableRow";

type ChartsOfAccountsTableProps = {
  accounts: ChartAccount[];
  expandedIds: Set<string>;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  table: Table<FlattenedChartAccount>;
  toolbar?: ReactNode;
  canDragRows: boolean;
  showHierarchyGuides: boolean;
  showParentColumn: boolean;
  permissions: {
    canCreate: boolean;
    canUpdate: boolean;
    canView: boolean;
  };
  onEdit: (account: ChartAccount) => void;
  onAddChild: (account: ChartAccount) => void;
  onStatusChange: (account: ChartAccount) => void;
  onReorderAccount: (accountId: string, overAccountId: string) => void;
  onToggleExpanded: (accountId: string) => void;
  onView: (account: ChartAccount) => void;
};

type ActiveDragAccount = {
  id: string;
  isSpecific: boolean;
  parentId: string | null;
};

export function ChartsOfAccountsTable(props: ChartsOfAccountsTableProps) {
  const [activeDragAccount, setActiveDragAccount] =
    useState<ActiveDragAccount>();
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveDragAccount(undefined);

    if (
      !props.canDragRows ||
      !over ||
      active.id === over.id ||
      !activeDragAccount?.isSpecific
    ) {
      return;
    }

    props.onReorderAccount(String(active.id), String(over.id));
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragCancel={() => setActiveDragAccount(undefined)}
      onDragEnd={handleDragEnd}
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
        pageSizeOptions={[25, 50, 100, 150, 200]}
        table={props.table}
        tableTitle="Ledger accounts"
        toolbar={props.toolbar}
        variant="embedded"
        renderRow={({ id, original }) => (
          <ChartsOfAccountsTableRow
            key={id}
            account={original.account}
            activeDragAccount={activeDragAccount}
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

