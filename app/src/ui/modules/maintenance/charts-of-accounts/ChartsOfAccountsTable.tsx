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
  expandedIds: Set<string>;
  isLoading: boolean;
  lastSyncedAt?: number | string | Date | null;
  table: Table<FlattenedChartAccount>;
  toolbar?: ReactNode;
  onDelete: (account: ChartAccount) => void;
  onEdit: (account: ChartAccount) => void;
  onReorderAccount: (accountId: string, overAccountId: string) => void;
  onToggleExpanded: (accountId: string) => void;
};

type ActiveDragAccount = {
  id: string;
  isSpecific: boolean;
  parentId: string | null;
};

export function ChartsOfAccountsTable(props: ChartsOfAccountsTableProps) {
  const [activeDragAccount, setActiveDragAccount] =
    useState<ActiveDragAccount>();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const activeAccount = props.table
      .getPrePaginationRowModel()
      .rows.find((row) => row.original.account.id === event.active.id)
      ?.original.account;

    setActiveDragAccount(
      activeAccount
        ? {
          id: activeAccount.id,
          isSpecific: isSpecificAccountNumber(activeAccount.accountNumber),
          parentId: activeAccount.parentId,
        }
        : undefined,
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveDragAccount(undefined);

    if (!over || active.id === over.id) {
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
        lastSyncedAt={props.lastSyncedAt}
        paginationLabel="accounts"
        table={props.table}
        tableTitle="Ledger accounts"
        toolbar={props.toolbar}
        variant="embedded"
        renderRow={({ id, original }) => (
          <ChartsOfAccountsTableRow
            key={id}
            account={original.account}
            activeDragAccount={activeDragAccount}
            expandedIds={props.expandedIds}
            level={original.level}
            onDelete={props.onDelete}
            onEdit={props.onEdit}
            onToggleExpanded={props.onToggleExpanded}
          />
        )}
      />
    </DndContext>
  );
}

function isSpecificAccountNumber(accountNumber: string) {
  return !accountNumber.endsWith("000");
}
