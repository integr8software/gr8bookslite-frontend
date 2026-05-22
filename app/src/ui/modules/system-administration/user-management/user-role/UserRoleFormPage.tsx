"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	CheckCircle2,
	CircleOff,
	Edit3,
	Save,
	UserCog,
	X,
} from "lucide-react";
import { UserRoleHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
	getNextUserStatus,
	type UserStatus,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { useUserRoleFormPage } from "@/app/src/hooks/modules/system-administration/user-management/user-role/useUserRoleFormPage";
import { UserRoleForm } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleForm";
import { UserRoleNotFound } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleNotFound";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/system/AppDialog";

export function UserRoleFormPage() {
	return (
		<Suspense fallback={null}>
			<UserRoleFormPageInner />
		</Suspense>
	);
}

function UserRoleFormPageInner() {
	const page = useUserRoleFormPage();
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const nextStatus = page.existingUserRole
		? getNextUserStatus(page.existingUserRole.status)
		: "Inactive";
	const StatusIcon = nextStatus === "Active" ? CheckCircle2 : CircleOff;

	if (page.needsRecord && !page.existingUserRole) {
		return (
			<UserRoleNotFound href={UserRoleHref} title="User Role Not Found" />
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={
					page.mode === "view"
						? "View User Role"
						: page.mode === "edit"
							? "Edit User Role"
							: "Add User Role"
				}
				description="Maintain access roles and permissions."
				eyebrow={
					<>
						<UserCog className="h-3.5 w-3.5" aria-hidden="true" />
						User management
					</>
				}
				actions={
					<>
						{page.mode === "view" ? (
							<Link
								href={page.cancelHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<ArrowLeft className="h-4 w-4" aria-hidden="true" />
								Back
							</Link>
						) : null}
						{page.mode === "view" && page.editHref ? (
							<Link
								href={page.editHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<Edit3 className="h-4 w-4" aria-hidden="true" />
								Edit
							</Link>
						) : null}
						{page.mode !== "view" ? (
							<Link
								href={page.cancelHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<X className="h-4 w-4" aria-hidden="true" />
								Cancel
							</Link>
						) : null}
						{page.existingUserRole ? (
							<button
								type="button"
								onClick={() => setIsStatusDialogOpen(true)}
								className={
									nextStatus === "Inactive"
										? moduleHeaderActionClassNames.danger
										: moduleHeaderActionClassNames.secondary
								}
							>
								<StatusIcon className="h-4 w-4" aria-hidden="true" />
								{nextStatus === "Inactive" ? "Inactive" : "Active"}
							</button>
						) : null}
						{!page.isReadonly ? (
							<button
								type="submit"
								form="user-role-form"
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
						) : null}
					</>
				}
			/>
			<UserRoleForm
				errors={page.errors}
				isReadonly={page.isReadonly}
				values={page.values}
				onSubmit={page.handleSubmit}
				onUpdateAccessRoles={page.updateAccessRoles}
				onToggleAccessRole={page.toggleAccessRole}
				onUpdateField={page.updateField}
			/>
			<StatusConfirmDialog
				entityName={page.existingUserRole?.name}
				isOpen={isStatusDialogOpen}
				isPending={page.isMutating}
				nextStatus={nextStatus}
				noun="user role"
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
		<AppDialog
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

