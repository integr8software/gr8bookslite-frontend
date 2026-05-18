"use client";

import { useState, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { UserGroupHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
  InitialUserGroupFormValues,
  createUserGroupRecord,
  updateUserGroupRecord,
  type UserGroupFormValues,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import type {
  UserGroupFormErrors,
  UserManagementActionMode,
} from "@/app/src/types/modules/user-management/UserManagementTypes";
import { UserGroupFormHeader } from "@/app/src/ui/modules/system-administration/user-management/user-group/UserGroupFormHeader";
import { UserGroupForm } from "@/app/src/ui/modules/system-administration/user-management/user-group/UserGroupForm";
import { UserGroupNotFound } from "@/app/src/ui/modules/system-administration/user-management/user-group/UserGroupNotFound";

export function UserGroupFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const userGroups = useUserManagementStore((state) => state.userGroups);
  const addUserGroup = useUserManagementStore((state) => state.addUserGroup);
  const updateUserGroup = useUserManagementStore((state) => state.updateUserGroup);
  const deleteUserGroup = useUserManagementStore((state) => state.deleteUserGroup);
  const mode = getActionMode(pathname);
  const existingUserGroup = userGroups.find((item) => item.id === params.recordId);
  const isReadonly = mode === "view";
  const [values, setValues] = useState<UserGroupFormValues>(() =>
    existingUserGroup
      ? {
          name: existingUserGroup.name,
          description: existingUserGroup.description,
          accessRoles: existingUserGroup.accessRoles,
          status: existingUserGroup.status,
        }
      : InitialUserGroupFormValues,
  );
  const [errors, setErrors] = useState<UserGroupFormErrors>({});

  function updateField(field: keyof UserGroupFormValues, value: string | string[]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleAccessRole(role: string) {
    updateField(
      "accessRoles",
      values.accessRoles.includes(role)
        ? values.accessRoles.filter((item) => item !== role)
        : [...values.accessRoles, role],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (mode === "edit" && existingUserGroup) {
      updateUserGroup(updateUserGroupRecord(existingUserGroup, values));
    } else {
      addUserGroup(createUserGroupRecord(values));
    }

    router.push(UserGroupHref);
  }

  function handleDelete() {
    if (!existingUserGroup || !window.confirm(`Delete ${existingUserGroup.name}?`)) {
      return;
    }

    deleteUserGroup(existingUserGroup.id);
    router.push(UserGroupHref);
  }

  if ((mode === "edit" || mode === "view") && !existingUserGroup) {
    return <UserGroupNotFound href={UserGroupHref} title="User Group Not Found" />;
  }

  return (
    <section className="grid gap-5">
      <UserGroupFormHeader
        canDelete={Boolean(existingUserGroup)}
        isReadonly={isReadonly}
        onDelete={handleDelete}
        title={
          mode === "view"
            ? "View User Group"
            : mode === "edit"
              ? "Edit User Group"
              : "Add User Group"
        }
      />
      <UserGroupForm
        backHref={UserGroupHref}
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

function validate(values: UserGroupFormValues) {
  const errors: UserGroupFormErrors = {};

  if (!values.name.trim()) errors.name = "Name is required.";
  if (values.accessRoles.length === 0) {
    errors.accessRoles = "Select at least one access role.";
  }

  return errors;
}
