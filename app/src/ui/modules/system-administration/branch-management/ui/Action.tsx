"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Edit3, Save, Trash2, X } from "lucide-react";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/TaxData";
import {
  BranchManagementInitialFormValues,
  createBranchFormValues,
  createBranchFromForm,
  getMainBranchTinOptions,
  updateBranchFromForm,
  type BranchManagementFormValues,
} from "@/app/src/data/modules/system-administration/branch-management/BranchManagementData";
import { useBranchManagementStore } from "@/app/src/hooks/modules/system-administration/branch-management/useBranchManagement";
import { BranchManagementHref } from "@/app/src/constants/modules/branch-manager/BranchManagementConstants";
import type {
  BranchActionMode,
  BranchFormErrors,
} from "@/app/src/types/modules/branch-manager/BranchActionTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { BranchDetailsFields } from "./BranchDetailsFields";
import { BranchNotFound } from "./BranchNotFound";

export function BranchManagementAction() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const branches = useBranchManagementStore((state) => state.branches);
  const addBranch = useBranchManagementStore((state) => state.addBranch);
  const updateBranch = useBranchManagementStore((state) => state.updateBranch);
  const deleteBranch = useBranchManagementStore((state) => state.deleteBranch);
  const mode = getActionMode(pathname);
  const existingBranch = branches.find(
    (branch) => branch.id === params.recordId,
  );
  const isReadonly = mode === "view";
  const [values, setValues] = useState(() =>
    existingBranch
      ? createBranchFormValues(existingBranch)
      : BranchManagementInitialFormValues,
  );
  const [errors, setErrors] = useState<BranchFormErrors>({});
  const mainBranchOptions = useMemo(
    () =>
      getMainBranchTinOptions(branches).filter(
        (branch) => branch.id !== existingBranch?.id,
      ),
    [branches, existingBranch?.id],
  );
  const selectedMainBranch = mainBranchOptions.find(
    (branch) => branch.id === values.linkedMainBranchId,
  );

  function updateField(
    field: keyof BranchManagementFormValues,
    value: string | boolean,
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "classification" && value === "satellite"
        ? { isMain: false, tin: "" }
        : {}),
      ...(field === "classification" && value === "branch"
        ? { linkedMainBranchId: "" }
        : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const value =
      event.target.name === "tin"
        ? FormatTinNumber(event.target.value)
        : event.target.name === "contactNo"
          ? FormatPhilippineContactNumber(event.target.value)
        : event.target.value;

    updateField(
      event.target.name as keyof BranchManagementFormValues,
      value,
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateBranchForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (mode === "edit" && existingBranch) {
      updateBranch(
        updateBranchFromForm(existingBranch, values, selectedMainBranch),
      );
    } else {
      addBranch(createBranchFromForm(values, selectedMainBranch));
    }

    router.push(BranchManagementHref);
  }

  function handleDeleteBranch() {
    if (!existingBranch || !window.confirm(`Delete ${existingBranch.name}?`)) {
      return;
    }

    deleteBranch(existingBranch.id);
    router.push(BranchManagementHref);
  }

  if ((mode === "edit" || mode === "view") && !existingBranch) {
    return <BranchNotFound />;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={
          mode === "view"
            ? "View Branch"
            : mode === "edit"
              ? "Edit Branch"
              : "Add Branch"
        }
        description={
          mode === "view"
            ? "Review branch and satellite details used by the topbar switcher."
            : mode === "edit"
              ? "Update the branch record shared with the topbar switcher."
              : "New records are added to the shared branch mock data used by the topbar switcher."
        }
        eyebrow={
          <>
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            System administration
          </>
        }
        actions={
          <>
            {mode === "view" ? (
              <Link
                href={BranchManagementHref}
                className={moduleHeaderActionClassNames.secondary}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Link>
            ) : null}
            {mode === "view" && existingBranch ? (
              <Link
                href={`${BranchManagementHref}/edit/${existingBranch.id}`}
                className={moduleHeaderActionClassNames.secondary}
              >
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                Edit
              </Link>
            ) : null}
            {existingBranch ? (
              <button
                type="button"
                onClick={handleDeleteBranch}
                className={moduleHeaderActionClassNames.danger}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </button>
            ) : null}
            {mode === "edit" && existingBranch ? (
              <Link
                href={`${BranchManagementHref}/view/${existingBranch.id}`}
                className={moduleHeaderActionClassNames.secondary}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Link>
            ) : null}
            {!isReadonly ? (
              <button
                type="submit"
                className={moduleHeaderActionClassNames.primary}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save Branch
              </button>
            ) : null}
          </>
        }
      />
      <BranchDetailsFields
        errors={errors}
        isReadonly={isReadonly}
        mainBranchOptions={mainBranchOptions}
        values={values}
        onInputChange={handleInputChange}
        onUpdateField={updateField}
      />
    </form>
  );
}

function getActionMode(pathname: string): BranchActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

function validateBranchForm(values: BranchManagementFormValues) {
  const errors: BranchFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (values.classification === "satellite") {
    if (!values.linkedMainBranchId) {
      errors.linkedMainBranchId = "Select the main branch TIN.";
    }
  } else if (!values.tin.trim()) {
    errors.tin = "TIN is required for a branch.";
  }

  return errors;
}
