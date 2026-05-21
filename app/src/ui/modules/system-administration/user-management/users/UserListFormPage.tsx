"use client";

import { Suspense, useState } from "react";
import {
	getNextUserStatus,
	type UserStatus,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { useUserListFormPage } from "@/app/src/hooks/modules/system-administration/user-management/users/useUserListFormPage";
import { UserListForm } from "@/app/src/ui/modules/system-administration/user-management/users/UserListForm";
import { UserListFormHeader } from "@/app/src/ui/modules/system-administration/user-management/users/UserListFormHeader";
import { UserListNotFound } from "@/app/src/ui/modules/system-administration/user-management/users/UserListNotFound";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";

export function UserListFormPage() {
  return (
    <Suspense fallback={null}>
      <UserListFormPageInner />
    </Suspense>
  );
}

function UserListFormPageInner() {
  const page = useUserListFormPage();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const nextStatus = page.existingUser
    ? getNextUserStatus(page.existingUser.status)
    : "Inactive";

  if (page.needsRecord && !page.existingUser) {
    return <UserListNotFound title="User Not Found" href={UserListHref} />;
  }

  return (
    <section className="grid gap-5">
      <UserListFormHeader
        cancelHref={page.cancelHref}
        editHref={page.editHref}
        isReadonly={page.isReadonly}
        mode={page.mode}
        status={page.existingUser?.status}
        onStatusChange={() => setIsStatusDialogOpen(true)}
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
        userRoles={page.userRoles}
        values={page.values}
        onChange={page.handleInputChange}
        onSubmit={page.handleSubmit}
        onUpdateField={page.updateField}
      />
      <StatusConfirmDialog
        entityName={page.existingUser?.name}
        isOpen={isStatusDialogOpen}
        isPending={page.isMutating}
        nextStatus={nextStatus}
        noun="user"
        onCancel={() => setIsStatusDialogOpen(false)}
        onConfirm={page.handleStatusChange}
      />
    </section>
  );
}

function StatusConfirmDialog({
	entityName,
	isOpen,
	isPending,
	nextStatus,
	noun,
	onCancel,
	onConfirm,
}: {
	entityName?: string;
	isOpen: boolean;
	isPending: boolean;
	nextStatus: UserStatus;
	noun: string;
	onCancel: () => void;
	onConfirm: () => void;
}) {
	return (
		<AppConfirmDialog
			isOpen={isOpen}
			isPending={isPending}
			title={`Set ${noun} as ${nextStatus.toLowerCase()}?`}
			description={`This will mark ${entityName ?? `the selected ${noun}`} as ${nextStatus.toLowerCase()}.`}
			confirmLabel={
				nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active"
			}
			tone={nextStatus === "Inactive" ? "danger" : "success"}
			onCancel={onCancel}
			onConfirm={onConfirm}
		/>
	);
}
