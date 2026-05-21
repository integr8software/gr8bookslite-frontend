"use client";

import { useState, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { CircleOff, Save, ShieldCheck } from "lucide-react";
import { UserRoleHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
	InitialUserRoleFormValues,
	createUserRoleRecord,
	updateUserRoleRecord,
	type UserRoleFormValues,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { useUserRoleStore } from "@/app/src/hooks/modules/system-administration/user-management/user-role/useUserRole";
import type {
	UserManagementActionMode,
	UserRoleFormErrors,
} from "@/app/src/types/modules/user-management/UserManagementTypes";
import { UserRoleForm } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleForm";
import { UserRoleNotFound } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleNotFound";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function UserRoleFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const userRoles = useUserRoleStore((state) => state.userRoles);
	const addUserRole = useUserRoleStore((state) => state.addUserRole);
	const updateUserRole = useUserRoleStore(
		(state) => state.updateUserRole,
	);
	const deleteUserRole = useUserRoleStore(
		(state) => state.deleteUserRole,
	);
	const mode = getActionMode(pathname);
	const existingUserRole = userRoles.find(
		(item) => item.id === params.recordId,
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<UserRoleFormValues>(() =>
		existingUserRole
			? {
					name: existingUserRole.name,
					description: existingUserRole.description,
					accessRoles: existingUserRole.accessRoles,
					status: existingUserRole.status,
				}
			: InitialUserRoleFormValues,
	);
	const [errors, setErrors] = useState<UserRoleFormErrors>({});

	function updateField(
		field: keyof UserRoleFormValues,
		value: string | string[],
	) {
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

	function updateAccessRoles(accessRoles: string[]) {
		updateField("accessRoles", accessRoles);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const nextErrors = validate(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingUserRole) {
			updateUserRole(updateUserRoleRecord(existingUserRole, values));
		} else {
			addUserRole(createUserRoleRecord(values));
		}

		router.push(UserRoleHref);
	}

	function handleDelete() {
		if (
			!existingUserRole ||
			!window.confirm(`Set ${existingUserRole.name} as inactive?`)
		) {
			return;
		}

		deleteUserRole(existingUserRole.id);
		router.push(UserRoleHref);
	}

	if ((mode === "edit" || mode === "view") && !existingUserRole) {
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
					mode === "view"
						? "View User Role"
						: mode === "edit"
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
						{existingUserRole ? (
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
				errors={errors}
				isReadonly={isReadonly}
				values={values}
				onSubmit={handleSubmit}
				onUpdateAccessRoles={updateAccessRoles}
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

function validate(values: UserRoleFormValues) {
	const errors: UserRoleFormErrors = {};

	if (!values.name.trim()) errors.name = "Name is required.";
	if (values.accessRoles.length === 0) {
		errors.accessRoles = "Select at least one access role.";
	}

	return errors;
}
