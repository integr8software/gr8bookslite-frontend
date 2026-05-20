"use client";

import { useState, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
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
import { UserRoleFormHeader } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleFormHeader";
import { UserRoleForm } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleForm";
import { UserRoleNotFound } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleNotFound";

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
			<UserRoleFormHeader
				canDelete={Boolean(existingUserRole)}
				isReadonly={isReadonly}
				onDelete={handleDelete}
				title={
					mode === "view"
						? "View User Role"
						: mode === "edit"
							? "Edit User Role"
							: "Add User Role"
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
