"use client";

import { AlertCircle } from "lucide-react";
import { AppMaxFileUploadSizeLabel } from "@/app/src/constants/shared/app/AppConstants";
import {
  getModuleImportDataColumnWidth,
  ModuleImportFixedColumnsWidth,
  ModuleImportRowNumberColumnWidth,
  ModuleImportSelectionColumnWidth,
} from "@/app/src/constants/shared/module/ModuleImportConstants";
import { useDeliveryVehicleModuleImportDialog } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleImportDialog";
import type {
  DeliveryVehicleModuleConfig,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";
import {
  ModuleImportEmptyDropzone,
  ModuleImportFooter,
  ModuleImportHeaderActions,
  ModuleImportPaginationBar,
  ModuleImportProgressPanel,
  ModuleImportRowNumberHeader,
  ModuleImportSelectionHeader,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import { ModuleImportResizableColumnHeader } from "@/app/src/ui/shared/module/ModuleImportResizableColumnHeader";
import { DeliveryVehicleImportPreviewTableRow } from "@/app/src/ui/modules/delivery-vehicle-management/import/DeliveryVehicleImportPreviewTableRow";
import {
  DeliveryVehicleImportAcceptedFileExtensions,
  DeliveryVehicleImportAcceptedFileLabel,
  downloadDeliveryVehicleImportTemplate,
  getDeliveryVehicleImportColumnWidth,
  isDeliveryVehicleImportGridPasteTarget,
} from "@/app/src/ui/modules/delivery-vehicle-management/import/DeliveryVehicleModuleImportUtils";

type DeliveryVehicleModuleImportDialogProps = {
  config: DeliveryVehicleModuleConfig;
  existingRecords: DeliveryVehicleModuleRecord[];
  isOpen: boolean;
  onClose: () => void;
  onImportRecords: (rows: Array<Record<string, string>>) => void;
};

export function DeliveryVehicleModuleImportDialog({
  config,
  existingRecords,
  isOpen,
  onClose,
  onImportRecords,
}: DeliveryVehicleModuleImportDialogProps) {
  const importDialog = useDeliveryVehicleModuleImportDialog({
    config,
    existingRecords,
    onClose,
    onImportRecords,
  });
  const importTableWidth =
    ModuleImportFixedColumnsWidth +
    importDialog.fields.reduce(
      (total, field) =>
        total +
        (importDialog.columnWidths[field.key] ?? getDeliveryVehicleImportColumnWidth(field)),
      0,
    );

  return (
    <ModuleImportDialog
      isOpen={isOpen}
      isBusy={Boolean(importDialog.progress)}
      title={`Import ${config.title}`}
      titleId={`delivery-vehicle-${config.key}-import-title`}
      description="Upload, validate, edit, and import data in queued batches."
      onClose={onClose}
      actions={
        <ModuleImportHeaderActions
          accept={DeliveryVehicleImportAcceptedFileExtensions}
          disabled={Boolean(importDialog.progress)}
          isParsing={importDialog.isParsing}
          onDownloadTemplate={() =>
            void downloadDeliveryVehicleImportTemplate(config, importDialog.fields)
          }
          onFileSelect={(file) => void importDialog.handleFileUpload(file)}
        />
      }
      progress={
        importDialog.progress ? (
          <ModuleImportProgressPanel progress={importDialog.progress} />
        ) : null
      }
      footer={
        <ModuleImportFooter
          canImportAllRows={importDialog.canImportAllRows}
          canImportAllValid={importDialog.canImportAllValid}
          canImportSelectedValid={importDialog.canImportSelectedValid}
          importLabel={`Import ${config.title}`}
          importMode={importDialog.importMode}
          isBusy={Boolean(importDialog.progress)}
          isImportMenuOpen={importDialog.isImportMenuOpen}
          selectedValidRowsCount={importDialog.validSelectedRows.length}
          totalRowsCount={importDialog.validatedRows.length}
          validRowsCount={importDialog.validRows.length}
          onCancel={onClose}
          onImport={(mode) => void importDialog.handleImport(mode)}
          onReset={importDialog.resetImportState}
          onSetImportMode={importDialog.setImportSelection}
          onToggleImportMenu={() => importDialog.setIsImportMenuOpen((current) => !current)}
        />
      }
    >
      <div className="flex h-full min-h-0 flex-col gap-3">
        {importDialog.importError ? (
          <div className="flex gap-2 rounded-md border border-coralpink/25 bg-coralpink/8 px-3 py-2 text-sm font-medium text-coralpink">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{importDialog.importError}</span>
          </div>
        ) : null}

        <div
          tabIndex={0}
          onDragOver={(event) => {
            if (!importDialog.progress) event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            if (!importDialog.progress)
              void importDialog.handleFileUpload(event.dataTransfer.files[0]);
          }}
          onPaste={(event) => {
            if (!isDeliveryVehicleImportGridPasteTarget(event.target)) {
              return;
            }

            const text = event.clipboardData.getData("text");

            if (text.trim()) {
              event.preventDefault();
              importDialog.pasteIntoPreviewGrid(text);
            }
          }}
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-purple-200 shadow-[0_0_0_2px_rgba(168,85,247,0.08)] outline-none focus:ring-2 focus:ring-purple-500/15"
          aria-label={`${config.title} import preview grid. Paste copied Excel rows here.`}
        >
          <div className="min-h-36 flex-1 overflow-auto">
            <table
              className="module-import-preview-table table-fixed text-left text-sm text-darknavy"
              style={{ width: `max(100%, ${importTableWidth}px)` }}
            >
              <colgroup>
                <col style={{ width: ModuleImportSelectionColumnWidth }} />
                <col style={{ width: ModuleImportRowNumberColumnWidth }} />
                {importDialog.fields.map((field) => (
                  <col
                    key={field.key}
                    style={{
                      width: getModuleImportDataColumnWidth(
                        importDialog.columnWidths[field.key] ??
                          getDeliveryVehicleImportColumnWidth(field),
                        Object.values(importDialog.columnWidths).reduce(
                          (total, width) => total + width,
                          0,
                        ),
                      ),
                    }}
                  />
                ))}
              </colgroup>
              <thead className="text-xs uppercase text-darknavy/55">
                <tr>
                  <ModuleImportSelectionHeader
                    checked={importDialog.selectedRowIds.size > 0}
                    disabled={
                      importDialog.visibleRows.length === 0 || Boolean(importDialog.progress)
                    }
                    isOpen={importDialog.isSelectionMenuOpen}
                    onClearSelection={importDialog.clearRowSelection}
                    onSelectAll={() => importDialog.selectRows("all")}
                    onSelectPage={() => importDialog.selectRows("page")}
                    onToggleOpen={() => importDialog.setIsSelectionMenuOpen((current) => !current)}
                  />
                  <ModuleImportRowNumberHeader />
                  {importDialog.fields.map((field) => (
                    <ModuleImportResizableColumnHeader
                      key={field.key}
                      className="px-3"
                      width={
                        importDialog.columnWidths[field.key] ??
                        getDeliveryVehicleImportColumnWidth(field)
                      }
                      onResize={(width) => importDialog.updateColumnWidth(field.key, width)}
                    >
                      {field.label}
                    </ModuleImportResizableColumnHeader>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-darknavy/8 bg-white">
                {importDialog.visibleRows.length > 0 ? (
                  importDialog.visibleRows.map((row) => (
                    <DeliveryVehicleImportPreviewTableRow
                      key={row.id}
                      fields={importDialog.fields}
                      isSelected={importDialog.selectedRowIds.has(row.id)}
                      row={row}
                      onPasteCell={importDialog.pasteIntoPreviewCell}
                      onToggleSelected={importDialog.toggleRowSelection}
                      onUpdateCell={importDialog.updatePreviewCell}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={importDialog.fields.length + 2}
                      className="module-import-empty-cell px-3 py-10 text-center text-sm font-medium text-darknavy/45"
                    >
                      <ModuleImportEmptyDropzone
                        accept={DeliveryVehicleImportAcceptedFileExtensions}
                        acceptedFileLabel={DeliveryVehicleImportAcceptedFileLabel}
                        disabled={Boolean(importDialog.progress)}
                        isParsing={importDialog.isParsing}
                        maxFileSizeLabel={AppMaxFileUploadSizeLabel}
                        onFileSelect={(file) => void importDialog.handleFileUpload(file)}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <ModuleImportPaginationBar
            currentPage={importDialog.safePreviewPage}
            invalidCount={importDialog.invalidRows.length}
            isBusy={Boolean(importDialog.progress)}
            selectedCount={importDialog.progress ? 0 : importDialog.selectedRowIds.size}
            totalRowsCount={importDialog.validatedRows.length}
            totalPages={importDialog.totalPages}
            onAddRow={importDialog.addBlankRow}
            onGoToPage={importDialog.setPreviewPage}
            onNextPage={() =>
              importDialog.setPreviewPage((page) => Math.min(importDialog.totalPages, page + 1))
            }
            onPreviousPage={() => importDialog.setPreviewPage((page) => Math.max(1, page - 1))}
            onRemoveSelected={importDialog.removeSelectedRows}
          />
        </div>
      </div>
    </ModuleImportDialog>
  );
}
