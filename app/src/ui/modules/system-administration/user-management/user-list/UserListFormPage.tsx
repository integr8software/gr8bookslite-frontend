"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
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
import { UserListFormHeader } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListFormHeader";
import { UserListForm } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListForm";
import { UserListNotFound } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListNotFound";

export function UserListFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const users = useUserManagementStore((state) => state.users);
  const userTypes = useUserManagementStore((state) => state.userTypes);
  const userGroups = useUserManagementStore((state) => state.userGroups);
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
          userTypeId: existingUser.userTypeId,
          userGroupId: existingUser.userGroupId,
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
    if (!existingUser || !window.confirm(`Delete ${existingUser.name}?`)) {
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
      <UserListFormHeader
        title={mode === "view" ? "View User" : mode === "edit" ? "Edit User" : "Add User"}
        isReadonly={isReadonly}
        canDelete={Boolean(existingUser)}
        onDelete={handleDelete}
      />
      <UserListForm
        errors={errors}
        isReadonly={isReadonly}
        userGroups={userGroups}
        userTypes={userTypes}
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
