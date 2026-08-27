"use client";

import {
  TermsMaintenanceActionCopy,
  TermsMaintenanceDrawerFormId,
  TermsMaintenanceTitle,
} from "@/app/src/constants/modules/financial-maintenance/terms-maintenance/TermsMaintenanceConstants";
import { useTermsMaintenanceFormPage } from "@/app/src/hooks/modules/financial-maintenance/terms-maintenance/useTermsMaintenanceFormPage";
import type { TermsMaintenanceDrawerProps } from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { TermsMaintenanceFields } from "@/app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceFields";

export function TermsMaintenanceDrawer({ initialValues, isOpen, mode, onClose, term }: TermsMaintenanceDrawerProps) {
  const formKey = initialValues ? `${initialValues.name}-${initialValues.datemode}-${initialValues.period}-${initialValues.status}` : "new";

  return (
    <TermsMaintenanceDrawerPanel
      key={`${mode}-${term?.id ?? formKey}`}
      initialValues={initialValues}
      isOpen={isOpen}
      mode={mode}
      onClose={onClose}
      term={term}
    />
  );
}

function TermsMaintenanceDrawerPanel({ initialValues, isOpen, mode, onClose, term }: TermsMaintenanceDrawerProps) {
  const page = useTermsMaintenanceFormPage({
    existingTerm: term,
    initialValues,
    isOpen,
    mode,
    onSaved: onClose,
  });
  const copy = TermsMaintenanceActionCopy[mode];

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
      eyebrow={TermsMaintenanceTitle}
      formId={TermsMaintenanceDrawerFormId}
      isOpen={isOpen}
      isReadonly={page.isReadonly}
      isSaving={page.isSubmitting}
      onBeforeSaveConfirm={page.validateBeforeSubmit}
      onCancel={handleCancel}
      onClose={handleClose}
      savingLabel={getModuleSavePendingLabel(mode)}
      submitLabel={mode === "edit" ? "Update Term" : "Save Term"}
      title={copy.title}
    >
      <form id={TermsMaintenanceDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
        <TermsMaintenanceFields
          errors={page.errors}
          isReadonly={page.isReadonly}
          values={page.values}
          onInputChange={page.handleInputChange}
          onStatusChange={page.handleStatusChange}
        />
      </form>
    </ModuleDrawer>
  );
}
