"use client";
import { useMemo } from "react";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { formatCurrency } from "@/app/src/utils/currency.util";
import type { PostDatedCheckDetail } from "@/app/src/types/modules/cash-receipt/post-dated-check/PostDatedCheckTypes";
import { createPostDatedCheckLineColumns } from "./PostDatedCheckLineColumns";

export function PostDatedCheckEntrySection({
  rows,
  isReadonly,
  error,
  detailErrors,
  onCheckNumberBlur,
  onAddRows,
  onRemoveRow,
  onDuplicateRow,
  onInsertRow,
  onMoveRow,
  onUpdateRow,
}: {
  rows: PostDatedCheckDetail[];
  isReadonly: boolean;
  error?: string;
  detailErrors?: Record<string, Partial<Record<keyof PostDatedCheckDetail, string>>>;
  onCheckNumberBlur: (id: string, checkNumber: string) => void;
  onAddRows: (count: number) => void;
  onRemoveRow: (id: string) => void;
  onDuplicateRow: (id: string) => void;
  onInsertRow: (id: string, position: "above" | "below") => void;
  onMoveRow: (from: string, to: string) => void;
  onUpdateRow: (id: string, field: keyof PostDatedCheckDetail, value: string | number) => void;
}) {
  const columns = useMemo(
    () => createPostDatedCheckLineColumns({ detailErrors, isReadonly, onCheckNumberBlur, onUpdateRow }),
    [detailErrors, isReadonly, onCheckNumberBlur, onUpdateRow],
  );
  const total = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  return (
    <ModuleDataEntry
      columns={columns}
      description="Record each post-dated check received from the selected party."
      emptyRowLabel="PDC row"
      error={error}
      isDraggable
      isReadonly={isReadonly}
      isRowNumberColumnFixed
      rows={rows}
      title="Post Dated Check"
      summaryCells={{ amount: formatCurrency(total) }}
      summaryRowHeader="Total"
      onAddRows={onAddRows}
      onDuplicateRow={onDuplicateRow}
      onInsertRow={onInsertRow}
      onMoveRow={onMoveRow}
      onRemoveRow={onRemoveRow}
    />
  );
}
