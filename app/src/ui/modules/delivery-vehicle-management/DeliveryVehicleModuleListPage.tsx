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
  const defaultStatusFilter = page.config.statuses.includes("Active") ? "Active" : "";
  const hasActiveFilters =
    page.query.trim().length > 0 || page.statusFilter !== defaultStatusFilter;

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
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportRecords={page.importRecords}
      />
    </section>
  );
}
