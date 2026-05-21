"use client";

import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { useUserListFormPage } from "@/app/src/hooks/modules/system-administration/user-management/users/useUserListFormPage";
import { UserListForm } from "@/app/src/ui/modules/system-administration/user-management/users/UserListForm";
import { UserListFormHeader } from "@/app/src/ui/modules/system-administration/user-management/users/UserListFormHeader";
import { UserListNotFound } from "@/app/src/ui/modules/system-administration/user-management/users/UserListNotFound";

export function UserListFormPage() {
  const page = useUserListFormPage();

  if (page.needsRecord && !page.existingUser) {
    return <UserListNotFound title="User Not Found" href={UserListHref} />;
  }

  return (
    <section className="grid gap-5">
      <UserListFormHeader
        canDelete={Boolean(page.existingUser)}
        isReadonly={page.isReadonly}
        onDelete={page.handleDelete}
        title={
          page.mode === "view"
            ? "View User"
            : page.mode === "edit"
              ? "Edit User"
              : "Add User"
        }
      />
      <UserListForm
        errors={page.errors}
        isReadonly={page.isReadonly}
        departments={page.departments}
        userRoles={page.userRoles}
        values={page.values}
        onChange={page.handleInputChange}
        onSubmit={page.handleSubmit}
        onUpdateField={page.updateField}
      />
    </section>
  );
}
