"use client";

import { useMemo, useState } from "react";
import { type ColumnDef, type PaginationState, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import {
  ResponsibilityCenterDefaultColumnOrder,
  ResponsibilityCenterDefaultColumnVisibility,
  ResponsibilityCenterTableColumns,
} from "@/app/src/constants/modules/maintenance/responsibility-center/ResponsibilityCenterConstants";
import {
  buildResponsibilityCenterTree,
  flattenResponsibilityCenterTree,
  getResponsibilityCenterExpandableIds,
} from "@/app/src/data/modules/maintenance/responsibility-center/ResponsibilityCenterData";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/maintenance/responsibility-center/useResponsibilityCenter";
import { useResponsibilityCenterTablePreferences } from "@/app/src/hooks/modules/maintenance/responsibility-center/useResponsibilityCenterTablePreferences";
import type {
  FlattenedResponsibilityCenterTreeNode,
  ResponsibilityCenter,
  ResponsibilityCenterStatusFilter,
  ResponsibilityCenterTableColumnKey,
  ResponsibilityCenterViewMode,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";

export function useResponsibilityCenterListPage() {
  const {
    centers,
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    permissions,
    refreshCenters,
    statistics,
    updateCenterStatus,
  } = useResponsibilityCenterStore();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [financialTypeFilter, setFinancialTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<ResponsibilityCenterStatusFilter>("Active");
  const [viewMode, setViewMode] = useState<ResponsibilityCenterViewMode>("tree");
  const [collapsedTreeIds, setCollapsedTreeIds] = useState<Set<string>>(() => new Set());
  const [treePagination, setTreePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const tablePreferences = useResponsibilityCenterTablePreferences();
  const {
    columnOrder: treeColumnOrder,
    columnVisibility: treeColumnVisibility,
    setColumnOrder: setTreeColumnOrder,
    setColumnVisibility: setTreeColumnVisibility,
  } = tablePreferences;
  const [pendingStatusCenter, setPendingStatusCenter] = useState<ResponsibilityCenter | null>(null);

  const expandedTreeIds = useMemo(() => {
    const expandableIds = getResponsibilityCenterExpandableIds(centers);

    collapsedTreeIds.forEach((centerId) => expandableIds.delete(centerId));

    return expandableIds;
  }, [centers, collapsedTreeIds]);

  const filteredCenters = useMemo(() => {
    const normalizedQuery = normalizeLowercaseText(query);

    return centers.filter((center) => {
      if (statusFilter && center.status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== "All" && center.category !== categoryFilter) {
        return false;
      }

      if (financialTypeFilter !== "All" && center.financialType !== financialTypeFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const parentName = center.parentId ? centers.find((parentCenter) => parentCenter.id === center.parentId)?.name : "";

      return [center.code, center.name, center.category, center.financialType, center.manager, parentName, center.status, center.description]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [categoryFilter, centers, financialTypeFilter, query, statusFilter]);

  const responsibilityCenterTree = useMemo(() => buildResponsibilityCenterTree(filteredCenters), [filteredCenters]);
  const flattenedTreeCenters = useMemo(
    () => flattenResponsibilityCenterTree(responsibilityCenterTree, expandedTreeIds),
    [expandedTreeIds, responsibilityCenterTree],
  );
  const treeColumns = useMemo<ColumnDef<FlattenedResponsibilityCenterTreeNode>[]>(
    () =>
      ResponsibilityCenterTableColumns.filter((column) => !("key" in column) || column.key !== "parentId").map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            meta: { className: column.className, label: column.label },
          };
        }

        return createResponsibilityCenterTreeColumn(column.key, column.label, column.className);
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const treeTable = useReactTable({
    data: flattenedTreeCenters,
    columns: treeColumns,
    initialState: {
      columnOrder: ResponsibilityCenterDefaultColumnOrder,
      columnVisibility: ResponsibilityCenterDefaultColumnVisibility,
    },
    state: {
      columnOrder: treeColumnOrder,
      columnVisibility: treeColumnVisibility,
      pagination: treePagination,
    },
    onColumnOrderChange: setTreeColumnOrder,
    onColumnVisibilityChange: setTreeColumnVisibility,
    onPaginationChange: setTreePagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  function confirmCenterStatusChange() {
    if (!pendingStatusCenter) {
      return;
    }

    updateCenterStatus({
      ...pendingStatusCenter,
      status: pendingStatusCenter.status === "Active" ? "Inactive" : "Active",
      updatedAt: new Date().toISOString(),
    })
      .then(() => setPendingStatusCenter(null))
      .catch(() => undefined);
  }

  function toggleTreeNode(centerId: string) {
    setCollapsedTreeIds((current) => {
      const next = new Set(current);

      if (next.has(centerId)) {
        next.delete(centerId);
      } else {
        next.add(centerId);
      }

      return next;
    });
  }

  return {
    categoryFilter,
    centers,
    confirmCenterStatusChange,
    expandedTreeIds,
    filteredCenters,
    flattenedTreeCenters,
    financialTypeFilter,
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    pendingStatusCenter,
    permissions,
    query,
    refreshCenters,
    setCategoryFilter,
    setFinancialTypeFilter,
    setPendingStatusCenter,
    setQuery,
    setStatusFilter,
    setViewMode,
    statistics,
    statusFilter,
    tablePreferences,
    toggleTreeNode,
    treeTable,
    viewMode,
  };
}

function createResponsibilityCenterTreeColumn(
  id: ResponsibilityCenterTableColumnKey,
  header: string,
  className: string,
): ColumnDef<FlattenedResponsibilityCenterTreeNode> {
  return {
    id,
    header,
    enableSorting: false,
    meta: { className, label: header },
  };
}
