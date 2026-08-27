"use client";

import {
  DiscountMaintenanceActionCopy,
  DiscountMaintenanceDrawerFormId,
} from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import { useDiscountMaintenanceFormPage } from "@/app/src/hooks/modules/financial-maintenance/discount-maintenance/useDiscountMaintenanceFormPage";
import type { DiscountMaintenanceDrawerProps } from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { DiscountMaintenanceFields } from "@/app/src/ui/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceFields";

export function DiscountMaintenanceDrawer({ discount, isOpen, mode, onClose }: DiscountMaintenanceDrawerProps) {
  return (
    <DiscountMaintenanceDrawerPanel
      key={`${mode}-${discount?.id ?? "new"}`}
      discount={discount}
      isOpen={isOpen}
      mode={mode}
      onClose={onClose}
    />
  );
}

function DiscountMaintenanceDrawerPanel({ discount, isOpen, mode, onClose }: DiscountMaintenanceDrawerProps) {
  const page = useDiscountMaintenanceFormPage({ existingDiscount: discount, isOpen, mode, onSaved: onClose });
  const copy = DiscountMaintenanceActionCopy[mode];

  function handleClose() {
    page.saveDraft();
    onClose();
  }

  function handleCancel() {
    page.discardDraft();
    onClose();
  }

  return (
    <ModuleDrawer
      description={copy.description}
      eyebrow="Accounting master data"
      formId={DiscountMaintenanceDrawerFormId}
      isOpen={isOpen}
      isReadonly={page.isReadonly}
      isSaving={page.isMutating}
      onBeforeSaveConfirm={page.validateBeforeSubmit}
      onCancel={handleCancel}
      onClose={handleClose}
      savingLabel={getModuleSavePendingLabel(mode)}
      title={copy.title}
    >
      <form id={DiscountMaintenanceDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
        <DiscountMaintenanceFields
          errors={page.errors}
          generatedAccount={page.generatedAccount}
          isReadonly={page.isReadonly}
          values={page.values}
          onInputChange={page.handleInputChange}
          onStatusChange={page.handleStatusChange}
        />
      </form>
    </ModuleDrawer>
  );
}
