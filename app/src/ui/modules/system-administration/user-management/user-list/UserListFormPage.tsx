"use client";

import { CircleOff, Save, UserRoundCog } from "lucide-react";
import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { useUserListFormPage } from "@/app/src/hooks/modules/system-administration/user-management/user-list/useUserListFormPage";
import { UserListForm } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListForm";
import { UserListNotFound } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListNotFound";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function UserListFormPage() {
  const page = useUserListFormPage();

  if (page.needsRecord && !page.existingUser) {
    return <UserListNotFound title="User Not Found" href={UserListHref} />;
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={
          page.mode === "view"
            ? "View User"
            : page.mode === "edit"
              ? "Edit User"
              : "Add User"
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
            {page.existingUser ? (
              <button
                type="button"
                onClick={page.handleDelete}
                className={moduleHeaderActionClassNames.danger}
              >
                <CircleOff className="h-4 w-4" aria-hidden="true" />
                Inactive
              </button>
            ) : null}
            {!page.isReadonly ? (
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
