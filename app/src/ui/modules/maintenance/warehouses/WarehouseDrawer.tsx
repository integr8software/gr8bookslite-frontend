"use client";

import { WarehouseFormPageCopy } from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import { useWarehouseFormPage } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouseFormPage";
import type { WarehouseActionMode, WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { WarehouseFields } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseFields";

const formId = "warehouse-drawer-form";

export function WarehouseDrawer({
  isOpen,
  mode,
  onClose,
  warehouse,
}: {
  isOpen: boolean;
  mode: WarehouseActionMode;
  onClose: () => void;
  warehouse?: WarehouseRecord;
}) {
  return <WarehouseDrawerPanel key={`${mode}-${warehouse?.id ?? "new"}`} isOpen={isOpen} mode={mode} onClose={onClose} warehouse={warehouse} />;
}

function WarehouseDrawerPanel({
  isOpen,
  mode,
  onClose,
  warehouse,
}: {
  isOpen: boolean;
  mode: WarehouseActionMode;
  onClose: () => void;
  warehouse?: WarehouseRecord;
}) {
  const page = useWarehouseFormPage({
    existingWarehouse: warehouse,
    mode,
    onSaved: onClose,
  });
  const copy = WarehouseFormPageCopy[mode];

  return (
    <ModuleDrawer
      description={copy.description}
      eyebrow="Inventory maintenance"
      formId={formId}
      isOpen={isOpen}
      isReadonly={page.isReadonly}
      isSaving={page.isMutating}
      onBeforeSaveConfirm={page.validateBeforeSubmit}
      onClose={onClose}
      savingLabel={getModuleSavePendingLabel(mode)}
      title={copy.title}
    >
      <form id={formId} onSubmit={page.handleSubmit} className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <WarehouseFields
          branchOptions={page.branchOptions}
          errors={page.errors}
          isWarehouseCodeReadonly={page.isWarehouseCodeReadonly}
          values={page.values}
          onAvailabilityModeChange={page.updateAvailabilityMode}
          onInputChange={page.handleInputChange}
          onSetBranchSelection={page.setBranchSelection}
          onToggleBranch={page.toggleBranch}
        />
      </form>
    </ModuleDrawer>
  );
}
