import { CashAdvanceMultipleEntryResponsibilityCenterOptions } from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function getCashAdvanceMultipleEntryResponsibilityCenterCode(responsibilityCenter: string) {
  return (
    CashAdvanceMultipleEntryResponsibilityCenterOptions.find(
      (option) => option.name === responsibilityCenter || option.value === responsibilityCenter,
    )?.value ?? responsibilityCenter
  );
}

export function moveCashAdvanceMultipleEntryColumnId(currentColumnIds: string[], fromColumnId: string, toColumnId: string) {
  if (fromColumnId === toColumnId) {
    return currentColumnIds;
  }

  const fromIndex = currentColumnIds.indexOf(fromColumnId);
  const toIndex = currentColumnIds.indexOf(toColumnId);

  if (fromIndex < 0 || toIndex < 0) {
    return currentColumnIds;
  }

  const nextColumnIds = [...currentColumnIds];
  const [movedColumnId] = nextColumnIds.splice(fromIndex, 1);

  nextColumnIds.splice(toIndex, 0, movedColumnId);

  return nextColumnIds;
}

export function updateCashAdvanceMultipleEntryVisibleColumnIds<TRow extends { id: string }>(
  currentVisibleIds: string[],
  columns: ModuleDataEntryColumn<TRow>[],
  columnId: string,
  isVisible: boolean,
  defaultColumnIds: string[],
) {
  const column = columns.find((currentColumn) => currentColumn.id === columnId);

  if (!column) {
    return currentVisibleIds;
  }

  if (isVisible) {
    return currentVisibleIds.includes(columnId)
      ? currentVisibleIds
      : columns
          .map((currentColumn) => currentColumn.id)
          .filter((currentColumnId) => currentColumnId === columnId || currentVisibleIds.includes(currentColumnId));
  }

  if (defaultColumnIds.includes(columnId)) {
    return currentVisibleIds;
  }

  return currentVisibleIds.filter((currentColumnId) => currentColumnId !== columnId);
}
