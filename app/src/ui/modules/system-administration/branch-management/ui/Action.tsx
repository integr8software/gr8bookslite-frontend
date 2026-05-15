"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
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
import { BranchActionHeader } from "./BranchActionHeader";
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
      <BranchActionHeader
        branch={existingBranch}
        mode={mode}
        isReadonly={isReadonly}
        onDeleteBranch={handleDeleteBranch}
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
