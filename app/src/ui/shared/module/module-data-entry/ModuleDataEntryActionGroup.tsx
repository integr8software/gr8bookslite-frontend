"use client";

import { Download, Upload } from "lucide-react";
import {
  ModuleDataEntryAddButton,
  ModuleDataEntryAddColumnButton,
  ModuleDataEntryClearButton,
  ModuleDataEntryExportButton,
  ModuleDataEntryToolbarButton,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryActions";
import { ModuleDataEntryColumnSettingsButton } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryColumnSettings";
import type {
  ModuleDataEntryAddColumnOption,
  ModuleDataEntryAddMenuAction,
  ModuleDataEntryClearAction,
  ModuleDataEntryColumnOption,
  ModuleDataEntryExportOption,
  ModuleDataEntryToolbarAction,
} from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function ModuleDataEntryActionGroup({
  addButtonLabel,
  addColumnOptions,
  addMenuActions,
  align = "left",
  canConfigureColumns,
  canEditRows,
  canManageRows,
  columnResetLabel,
  columnOptions,
  exportOptions,
  toolbarActions,
  isAddOpen,
  isClearOpen,
  onAddColumn,
  onAddOpenChange,
  onAddRows,
  onAutoColumnWidth,
  onClearOpenChange,
  onClearRows,
  onExport,
  onImport,
  onMoveColumn,
  onResetColumns,
  onToggleColumnRequired,
  onToggleColumnVisibility,
  onUpdateColumnHeader,
  onUpdateColumnWidth,
}: {
  addButtonLabel?: string;
  addColumnOptions: ModuleDataEntryAddColumnOption[];
  addMenuActions: ModuleDataEntryAddMenuAction[];
  align?: "left" | "right";
  canConfigureColumns: boolean;
  canEditRows: boolean;
  canManageRows: boolean;
  columnResetLabel?: string;
  columnOptions: ModuleDataEntryColumnOption[];
  exportOptions: ModuleDataEntryExportOption[];
  toolbarActions: ModuleDataEntryToolbarAction[];
  isAddOpen: boolean;
  isClearOpen: boolean;
  onAddColumn?: (columnId: string) => void;
  onAddOpenChange: (isOpen: boolean) => void;
  onAddRows: (count: number) => void;
  onAutoColumnWidth?: (columnId: string) => void;
  onClearOpenChange: (isOpen: boolean) => void;
  onClearRows?: (action: ModuleDataEntryClearAction) => void;
  onExport?: () => void;
  onImport?: () => void;
  onMoveColumn?: (fromColumnId: string, toColumnId: string) => void;
  onResetColumns?: () => void;
  onToggleColumnRequired?: (columnId: string, isRequired: boolean) => void;
  onToggleColumnVisibility?: (columnId: string, isVisible: boolean) => void;
  onUpdateColumnHeader?: (columnId: string, header: string) => void;
  onUpdateColumnWidth?: (columnId: string, width: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
      {canEditRows
        ? toolbarActions.map((action) => (
            <ModuleDataEntryToolbarButton
              key={action.id}
              disabled={action.disabled}
              icon={action.icon ?? Upload}
              label={action.label}
              onClick={action.onSelect}
            />
          ))
        : null}
      {canEditRows && onImport ? (
        <ModuleDataEntryToolbarButton icon={Upload} label="Import" onClick={onImport} />
      ) : null}
      {exportOptions.length > 0 ? (
        <ModuleDataEntryExportButton align={align} options={exportOptions} />
      ) : onExport ? (
        <ModuleDataEntryToolbarButton icon={Download} label="Export" onClick={onExport} />
      ) : null}
      {canConfigureColumns ? (
        <ModuleDataEntryColumnSettingsButton
          align={align}
          columns={columnOptions}
          columnResetLabel={columnResetLabel}
          onAutoColumnWidth={onAutoColumnWidth}
          onMoveColumn={onMoveColumn}
          onResetColumns={onResetColumns}
          onToggleColumnRequired={onToggleColumnRequired}
          onToggleColumnVisibility={onToggleColumnVisibility}
          onUpdateColumnHeader={onUpdateColumnHeader}
          onUpdateColumnWidth={onUpdateColumnWidth}
        />
      ) : canEditRows && onAddColumn && addColumnOptions.length > 0 ? (
        <ModuleDataEntryAddColumnButton
          align={align}
          options={addColumnOptions}
          onAddColumn={onAddColumn}
        />
      ) : null}
      {canManageRows && onClearRows ? (
        <ModuleDataEntryClearButton
          align={align}
          isOpen={isClearOpen}
          onClearRows={onClearRows}
          onOpenChange={onClearOpenChange}
        />
      ) : null}
      {canManageRows ? (
        <ModuleDataEntryAddButton
          actions={addMenuActions}
          align={align}
          isOpen={isAddOpen}
          label={addButtonLabel}
          onAddRows={onAddRows}
          onOpenChange={onAddOpenChange}
        />
      ) : null}
    </div>
  );
}
