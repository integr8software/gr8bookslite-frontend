"use client";

import { useState, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { UserTypeHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
  InitialUserTypeFormValues,
  createUserTypeRecord,
  updateUserTypeRecord,
  type UserTypeFormValues,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import type {
  UserManagementActionMode,
  UserTypeFormErrors,
} from "@/app/src/types/modules/user-management/UserManagementTypes";
import { UserTypeFormHeader } from "@/app/src/ui/modules/system-administration/user-management/user-type/UserTypeFormHeader";
import { UserTypeForm } from "@/app/src/ui/modules/system-administration/user-management/user-type/UserTypeForm";
import { UserTypeNotFound } from "@/app/src/ui/modules/system-administration/user-management/user-type/UserTypeNotFound";

export function UserTypeFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const userTypes = useUserManagementStore((state) => state.userTypes);
  const addUserType = useUserManagementStore((state) => state.addUserType);
  const updateUserType = useUserManagementStore((state) => state.updateUserType);
  const deleteUserType = useUserManagementStore((state) => state.deleteUserType);
  const mode = getActionMode(pathname);
  const existingUserType = userTypes.find((item) => item.id === params.recordId);
  const isReadonly = mode === "view";
  const [values, setValues] = useState<UserTypeFormValues>(() =>
    existingUserType
      ? {
          name: existingUserType.name,
          description: existingUserType.description,
          accessRoles: existingUserType.accessRoles,
          status: existingUserType.status,
        }
      : InitialUserTypeFormValues,
  );
  const [errors, setErrors] = useState<UserTypeFormErrors>({});

  function updateField(field: keyof UserTypeFormValues, value: string | string[]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleAccessRole(role: string) {
    const nextRoles = values.accessRoles.includes(role)
      ? values.accessRoles.filter((item) => item !== role)
      : [...values.accessRoles, role];

    updateField("accessRoles", nextRoles);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (mode === "edit" && existingUserType) {
      updateUserType(updateUserTypeRecord(existingUserType, values));
    } else {
      addUserType(createUserTypeRecord(values));
    }

    router.push(UserTypeHref);
  }

  function handleDelete() {
    if (!existingUserType || !window.confirm(`Delete ${existingUserType.name}?`)) {
      return;
    }

    deleteUserType(existingUserType.id);
    router.push(UserTypeHref);
  }

  if ((mode === "edit" || mode === "view") && !existingUserType) {
    return <UserTypeNotFound href={UserTypeHref} title="User Type Not Found" />;
  }

  return (
    <section className="grid gap-5">
      <UserTypeFormHeader
        canDelete={Boolean(existingUserType)}
        isReadonly={isReadonly}
        onDelete={handleDelete}
        title={
          mode === "view"
            ? "View User Type"
            : mode === "edit"
              ? "Edit User Type"
              : "Add User Type"
        }
      />
      <UserTypeForm
        backHref={UserTypeHref}
        errors={errors}
        isReadonly={isReadonly}
        values={values}
        onSubmit={handleSubmit}
        onToggleAccessRole={toggleAccessRole}
        onUpdateField={updateField}
      />
    </section>
  );
}

function getActionMode(pathname: string): UserManagementActionMode {
  if (pathname.includes("/view/")) return "view";
  if (pathname.includes("/edit/")) return "edit";
  return "add";
}

function validate(values: UserTypeFormValues) {
  const errors: UserTypeFormErrors = {};

  if (!values.name.trim()) errors.name = "Name is required.";
  if (values.accessRoles.length === 0) {
    errors.accessRoles = "Select at least one access role.";
  }

  return errors;
}
