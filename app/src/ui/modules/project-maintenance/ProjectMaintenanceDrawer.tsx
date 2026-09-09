"use client";

import {
  ProjectMaintenanceActionCopy,
  ProjectMaintenanceDrawerFormId,
  ProjectMaintenanceTitle,
} from "@/app/src/constants/modules/project-maintenance/ProjectMaintenanceConstants";
import { useProjectMaintenanceFormPage } from "@/app/src/hooks/modules/project-maintenance/useProjectMaintenanceFormPage";
import type { ProjectMaintenanceDrawerProps } from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import { ProjectMaintenanceFields } from "@/app/src/ui/modules/project-maintenance/ProjectMaintenanceFields";
import { ModuleDrawer, getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";

export function ProjectMaintenanceDrawer({ initialValues, isOpen, mode, onClose, project }: ProjectMaintenanceDrawerProps) {
  const formKey = initialValues ? `${initialValues.projectName}-${initialValues.status}` : "new";

  return (
    <ProjectMaintenanceDrawerPanel
      key={`${mode}-${project?.id ?? formKey}`}
      initialValues={initialValues}
      isOpen={isOpen}
      mode={mode}
      onClose={onClose}
      project={project}
    />
  );
}

function ProjectMaintenanceDrawerPanel({ initialValues, isOpen, mode, onClose, project }: ProjectMaintenanceDrawerProps) {
  const page = useProjectMaintenanceFormPage({
    existingProject: project,
    initialValues,
    isOpen,
    mode,
    onSaved: onClose,
  });
  const copy = ProjectMaintenanceActionCopy[mode];

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
      eyebrow={ProjectMaintenanceTitle}
      formId={ProjectMaintenanceDrawerFormId}
      isOpen={isOpen}
      isReadonly={page.isReadonly}
      isSaving={page.isSubmitting}
      onBeforeSaveConfirm={page.validateBeforeSubmit}
      onCancel={handleCancel}
      onClose={handleClose}
      savingLabel={getModuleSavePendingLabel(mode)}
      submitLabel={mode === "edit" ? "Update Project" : "Save Project"}
      title={copy.title}
    >
      <form id={ProjectMaintenanceDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
        <ProjectMaintenanceFields
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
