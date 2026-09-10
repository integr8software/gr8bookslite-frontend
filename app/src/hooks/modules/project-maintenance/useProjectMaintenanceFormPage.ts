"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ProjectMaintenanceHref } from "@/app/src/constants/modules/project-maintenance/ProjectMaintenanceConstants";
import {
  ProjectMaintenanceInitialFormValues,
  createProjectMaintenanceFormValues,
  updateProjectMaintenanceFromForm,
} from "@/app/src/data/modules/project-maintenance/ProjectMaintenanceData";
import { useProjectMaintenanceStore } from "@/app/src/hooks/modules/project-maintenance/useProjectMaintenance";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import type {
  ProjectMaintenanceActionMode,
  ProjectMaintenanceFormErrors,
  ProjectMaintenanceFormPageOptions,
  ProjectMaintenanceFormValues,
  ProjectMaintenanceStatus,
} from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import { validateProjectMaintenanceForm } from "@/app/src/validations/modules/project-maintenance/ProjectMaintenanceValidation";

export function useProjectMaintenanceFormPage(options: ProjectMaintenanceFormPageOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const { addProject, projects, updateProject } = useProjectMaintenanceStore(undefined, {
    refetchOnMount: false,
  });
  const mode = options.mode ?? getActionMode(pathname);
  const existingProject = options.existingProject ?? projects.find((project) => project.id === params.recordId);
  const isReadonly = mode === "view";
  const initialValues: ProjectMaintenanceFormValues = options.initialValues
    ? options.initialValues
    : existingProject
      ? createProjectMaintenanceFormValues(existingProject)
      : ProjectMaintenanceInitialFormValues;
  const initialValuesRef = useRef<ProjectMaintenanceFormValues>(initialValues);
  const [values, setValues] = useState<ProjectMaintenanceFormValues>(initialValues);
  const [errors, setErrors] = useState<ProjectMaintenanceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const nextStatus: ProjectMaintenanceStatus = existingProject?.status === "Active" ? "Inactive" : "Active";

  const draft = useModuleDraft({
    enabled: (options.isOpen ?? true) && !isReadonly,
    initialValues,
    key: createModuleDraftKey({
      mode,
      moduleId: "project-maintenance",
      recordId: params.recordId ?? existingProject?.id,
    }),
    setValues,
    values,
  });

  function updateField(field: keyof ProjectMaintenanceFormValues, value: ProjectMaintenanceFormValues[keyof ProjectMaintenanceFormValues]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = event.target.name as keyof ProjectMaintenanceFormValues;

    updateField(field, event.target.value);
  }

  function validateBeforeSubmit() {
    const nextErrors = validateProjectMaintenanceForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please review the highlighted fields and enter valid information.");
      return false;
    }

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isReadonly || isSubmittingRef.current) {
      return;
    }

    const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return;
    }

    const releaseSubmitLock = acquireModuleActionLock(
      `project-maintenance:submit:${mode}:${existingProject?.id ?? values.projectName ?? "new"}`,
    );

    if (!releaseSubmitLock) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    if (!validateBeforeSubmit()) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return;
    }

    void saveProject(releaseSubmitLock);
  }

  async function saveProject(releaseSubmitLock: () => void) {
    try {
      const savedProject =
        mode === "edit" && existingProject
          ? await updateProject(updateProjectMaintenanceFromForm(existingProject, values))
          : mode === "edit"
            ? undefined
            : await addProject(values);

      if (!savedProject) {
        toast.error("Could not find the project record to update.");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        releaseSubmitLock();
        return;
      }

      if (mode === "add") {
        setValues(ProjectMaintenanceInitialFormValues);
        setErrors({});
      }

      draft.clearDraft();
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      options.onSaved?.(savedProject);
      if (!options.onSaved) router.push(ProjectMaintenanceHref);
    } catch {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
    }
  }

  function handleConfirmStatusChange() {
    if (!existingProject) {
      toast.error("Could not find the project record to update.");
      return;
    }

    updateProject({
      ...existingProject,
      status: nextStatus,
    });
    setIsStatusDialogOpen(false);
  }

  return {
    clearDraft: draft.clearDraft,
    discardDraft: draft.discardDraft,
    saveDraft: draft.saveDraft,
    errors,
    existingProject,
    handleConfirmStatusChange,
    handleInputChange,
    handleStatusChange: (status: ProjectMaintenanceFormValues["status"]) => updateField("status", status),
    handleSubmit,
    isStatusDialogOpen,
    isSubmitting,
    isReadonly,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    nextStatus,
    setIsStatusDialogOpen,
    validateBeforeSubmit,
    values,
  };
}

function getActionMode(pathname: string): ProjectMaintenanceActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
