"use client";

import { useState } from "react";
import type {
  DeliveryVehicleModuleListPageProps,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { DeliveryVehicleModuleHeader } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleHeader";
import { DeliveryVehicleModuleImportDialog } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleImportDialog";
import { DeliveryVehicleModuleRecordDialog } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleRecordDialog";
import { DeliveryVehicleModuleStatisticCards } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleStatisticCards";
import { DeliveryVehicleModuleTable } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleTable";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

const ActiveStatus = "Active";

export function DeliveryVehicleModuleListPage({
  pageConfig,
  paginationKey,
  createRecord,
  initialRecords,
  validateRecord,
}: DeliveryVehicleModuleListPageProps) {
  const page = useDeliveryVehicleModuleListPage({
    config: pageConfig,
    createRecord,
    initialRecords,
    validateRecord,
  });
  const [isImportOpen, setIsImportOpen] = useState(false);
  const defaultStatusFilter = page.config.statuses.includes(ActiveStatus) ? ActiveStatus : "";
  const hasActiveFilters =
    page.query.trim().length > 0 ||
    page.statusFilter !== defaultStatusFilter ||
    page.vehicleTypeFilter.length > 0 ||
    page.workTypeFilter.length > 0;
  const isPendingRecordActive = page.pendingStatusRecord?.status === ActiveStatus;

  function openRecord(mode: "edit" | "view", record: DeliveryVehicleModuleRecord) {
    page.setEditor({ mode, record });
  }

  return (
    <section className="grid min-h-[calc(100vh-8rem)] content-start gap-5 pb-2">
      <DeliveryVehicleModuleHeader
        config={page.config}
        onAdd={() => page.setEditor({ mode: "add" })}
        onImport={() => setIsImportOpen(true)}
      />
      <DeliveryVehicleModuleStatisticCards config={page.config} statistics={page.statistics} />
      <DeliveryVehicleModuleTable
        config={page.config}
        hasActiveFilters={hasActiveFilters}
        page={page}
        paginationKey={paginationKey}
        onAdvanceRecord={page.advanceRecord}
        onEditRecord={(record) => openRecord("edit", record)}
        onToggleStatus={page.setPendingStatusRecord}
        onViewRecord={(record) => openRecord("view", record)}
      />
      {page.editor ? (
        <DeliveryVehicleModuleRecordDialog
          config={page.config}
          mode={page.editor.mode}
          record={page.editor.mode === "add" ? undefined : page.editor.record}
          validate={page.validateRecord}
          onClose={() => page.setEditor(null)}
          onSave={page.saveRecord}
        />
      ) : null}
      <DeliveryVehicleModuleImportDialog
        config={page.config}
        existingRecords={page.records}
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportRecords={page.importRecords}
      />
      <AppDialog
        isOpen={Boolean(page.pendingStatusRecord)}
        title={isPendingRecordActive ? `Disable ${page.config.noun}?` : `Enable ${page.config.noun}?`}
        description={
          isPendingRecordActive
            ? `${page.pendingStatusRecord?.name ?? `This ${page.config.noun}`} will remain in history and references, but will no longer be active for normal selection.`
            : `${page.pendingStatusRecord?.name ?? `This ${page.config.noun}`} will be available for normal selection again.`
        }
        confirmLabel={isPendingRecordActive ? "Disable" : "Enable"}
        tone={isPendingRecordActive ? "deactivate" : "activate"}
        onCancel={() => page.setPendingStatusRecord(null)}
        onConfirm={page.confirmStatusChange}
      />
    </section>
  );
}
