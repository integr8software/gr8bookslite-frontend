"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { CircleOff, Save, UserRoundCog } from "lucide-react";
import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
  InitialUserFormValues,
  createUserRecord,
  updateUserRecord,
  type UserFormValues,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/ContactData";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import type {
  UserFormErrors,
  UserManagementActionMode,
} from "@/app/src/types/modules/user-management/UserManagementTypes";
import { UserListForm } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListForm";
import { UserListNotFound } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListNotFound";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function UserListFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const users = useUserManagementStore((state) => state.users);
  const userRoles = useUserManagementStore((state) => state.userRoles);
  const departments = useUserManagementStore((state) => state.departments);
  const addUser = useUserManagementStore((state) => state.addUser);
  const updateUser = useUserManagementStore((state) => state.updateUser);
  const deleteUser = useUserManagementStore((state) => state.deleteUser);
  const mode = getActionMode(pathname);
  const existingUser = users.find((user) => user.id === params.recordId);
  const isReadonly = mode === "view";
  const [values, setValues] = useState<UserFormValues>(() =>
    existingUser
      ? {
          name: existingUser.name,
          email: existingUser.email,
          contactNumber: existingUser.contactNumber,
          userRoleId: existingUser.userRoleId,
          departmentId: existingUser.departmentId,
          status: existingUser.status,
        }
      : InitialUserFormValues,
  );
  const [errors, setErrors] = useState<UserFormErrors>({});

  function updateField(field: keyof UserFormValues, value: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const value =
      event.target.name === "contactNumber"
        ? FormatPhilippineContactNumber(event.target.value)
        : event.target.value;

    updateField(event.target.name as keyof UserFormValues, value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateUser(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (mode === "edit" && existingUser) {
      updateUser(updateUserRecord(existingUser, values));
    } else {
      addUser(createUserRecord(values));
    }

    router.push(UserListHref);
  }

  function handleDelete() {
    if (
      !existingUser ||
      !window.confirm(`Set ${existingUser.name} as inactive?`)
    ) {
      return;
    }

    deleteUser(existingUser.id);
    router.push(UserListHref);
  }

  if ((mode === "edit" || mode === "view") && !existingUser) {
    return <UserListNotFound title="User Not Found" href={UserListHref} />;
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={
          mode === "view" ? "View User" : mode === "edit" ? "Edit User" : "Add User"
        }
        description="Maintain user account assignments and access."
        eyebrow={
          <>
            <UserRoundCog className="h-3.5 w-3.5" aria-hidden="true" />
            User management
          </>
        }
        actions={
          <>
            {existingUser ? (
              <button
                type="button"
                onClick={handleDelete}
                className={moduleHeaderActionClassNames.danger}
              >
                <CircleOff className="h-4 w-4" aria-hidden="true" />
                Inactive
              </button>
            ) : null}
            {!isReadonly ? (
              <button
                type="submit"
                form="user-list-form"
                className={moduleHeaderActionClassNames.primary}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save User
              </button>
            ) : null}
          </>
        }
      />
      <UserListForm
        errors={errors}
        isReadonly={isReadonly}
        departments={departments}
        userRoles={userRoles}
        values={values}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
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

function validateUser(values: UserFormValues) {
  const errors: UserFormErrors = {};

  if (!values.name.trim()) errors.name = "Name is required.";
  if (!values.email.trim()) errors.email = "Email is required.";
  if (!values.contactNumber.trim()) {
    errors.contactNumber = "Contact number is required.";
  }

  return errors;
}
