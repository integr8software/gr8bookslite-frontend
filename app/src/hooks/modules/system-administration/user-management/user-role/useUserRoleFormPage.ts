"use client";

import { useState, type FormEvent } from "react";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	UserManagementEditFromParam,
	UserManagementEditFromViewQuery,
	UserManagementEditFromViewValue,
	UserRoleHref,
} from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
	InitialUserRoleFormValues,
	createUserRoleRecord,
	getNextUserStatus,
	updateUserRoleRecord,
	type UserRoleFormValues,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import type {
	UserManagementActionMode,
	UserRoleFormErrors,
} from "@/app/src/types/modules/user-management/UserManagementTypes";
import { validateUserRoleForm } from "@/app/src/validations/modules/system-administration/user-management/user-role/UserRoleValidation";
import { useUserRoleStore } from "./useUserRole";

export function useUserRoleFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const searchParams = useSearchParams();
	const userRoles = useUserRoleStore((state) => state.userRoles);
	const addUserRole = useUserRoleStore((state) => state.addUserRole);
	const updateUserRole = useUserRoleStore(
		(state) => state.updateUserRole,
	);
	const isMutating = useUserRoleStore((state) => state.isMutating);
	const mode = getActionMode(pathname);
	const wasOpenedFromView =
		mode === "edit" &&
		searchParams.get(UserManagementEditFromParam) ===
			UserManagementEditFromViewValue;
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
	const viewHref = existingUserRole
		? `${UserRoleHref}/view/${existingUserRole.id}`
		: UserRoleHref;
	const submitHref =
		mode === "edit" && wasOpenedFromView ? viewHref : UserRoleHref;
	const cancelHref =
		mode === "edit" && wasOpenedFromView ? viewHref : UserRoleHref;
	const editHref = existingUserRole
		? `${UserRoleHref}/edit/${existingUserRole.id}?${UserManagementEditFromViewQuery}`
		: undefined;

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
		const nextErrors = validateUserRoleForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingUserRole) {
			updateUserRole(updateUserRoleRecord(existingUserRole, values));
		} else {
			addUserRole(createUserRoleRecord(values));
		}

		router.push(submitHref);
	}

	function handleStatusChange() {
		if (!existingUserRole) {
			return;
		}

		updateUserRole({
			...existingUserRole,
			status: getNextUserStatus(existingUserRole.status),
		});
		router.push(UserRoleHref);
	}

	return {
		cancelHref,
		editHref,
		errors,
		existingUserRole,
		handleStatusChange,
		handleSubmit,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		toggleAccessRole,
		updateAccessRoles,
		updateField,
		values,
	};
}

function getActionMode(pathname: string): UserManagementActionMode {
	if (pathname.includes("/view/")) return "view";
	if (pathname.includes("/edit/")) return "edit";
	return "add";
}

