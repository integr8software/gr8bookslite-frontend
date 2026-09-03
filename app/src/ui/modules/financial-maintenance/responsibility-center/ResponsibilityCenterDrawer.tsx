"use client";

import {
  ResponsibilityCenterActionCopy,
  ResponsibilityCenterDrawerFormId,
  ResponsibilityCenterTitle,
} from "@/app/src/constants/modules/financial-maintenance/responsibility-center/ResponsibilityCenterConstants";
import { useResponsibilityCenterFormPage } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenterFormPage";
import type { ResponsibilityCenterDrawerProps } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import { ResponsibilityCenterFields } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterFields";
import { ModuleDrawer, getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";

export function ResponsibilityCenterDrawer(props: ResponsibilityCenterDrawerProps) {
  return (
    <ResponsibilityCenterDrawerPanel
      key={`${props.mode}-${props.center?.id ?? "new"}-${props.initialValues?.classificationId ?? ""}-${props.initialValues?.typeId ?? ""}`}
      {...props}
    />
  );
}

function ResponsibilityCenterDrawerPanel({ center, initialValues, isOpen, mode, onClose, onSaved }: ResponsibilityCenterDrawerProps) {
  const page = useResponsibilityCenterFormPage({
    center,
    initialValues,
    isOpen,
    mode,
    onSaved: (savedCenter) => {
      onSaved?.(savedCenter);
      onClose();
    },
  });
  const copy = ResponsibilityCenterActionCopy[mode];

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
      eyebrow={ResponsibilityCenterTitle}
      formId={ResponsibilityCenterDrawerFormId}
      isOpen={isOpen}
      isReadonly={page.isReadonly}
      isSaving={page.isSubmitting}
      onBeforeSaveConfirm={page.validateBeforeSubmit}
      onCancel={handleCancel}
      onClose={handleClose}
      savingLabel={getModuleSavePendingLabel(mode)}
      submitLabel={mode === "edit" ? "Update Responsibility Center" : "Save Responsibility Center"}
      title={copy.title}
    >
      <form id={ResponsibilityCenterDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
        <ResponsibilityCenterFields
          classifications={page.classifications}
          codePlaceholder={page.codePlaceholder}
          errors={page.errors}
          isReadonly={page.isReadonly}
          nameLabel={page.nameLabel}
          onFieldChange={page.handleFieldChange}
          onInputChange={page.handleInputChange}
          parentOptions={page.parentOptions}
          typeOptions={page.typeOptions}
          values={page.values}
        />
      </form>
    </ModuleDrawer>
  );
}
