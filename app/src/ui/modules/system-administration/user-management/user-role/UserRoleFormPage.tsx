"use client";

import { CircleOff, Save, ShieldCheck } from "lucide-react";
import { UserRoleHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { useUserRoleFormPage } from "@/app/src/hooks/modules/system-administration/user-management/user-role/useUserRoleFormPage";
import { UserRoleForm } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleForm";
import { UserRoleNotFound } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleNotFound";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function UserRoleFormPage() {
	const page = useUserRoleFormPage();

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
						<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
						User management
					</>
				}
				actions={
					<>
						{page.existingUserRole ? (
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
				backHref={UserRoleHref}
				errors={page.errors}
				isReadonly={page.isReadonly}
				values={page.values}
				onSubmit={page.handleSubmit}
				onUpdateAccessRoles={page.updateAccessRoles}
				onToggleAccessRole={page.toggleAccessRole}
				onUpdateField={page.updateField}
			/>
		</section>
	);
}
