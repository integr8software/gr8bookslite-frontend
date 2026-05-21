"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	UserListHref,
	UserManagementEditFromParam,
	UserManagementEditFromViewQuery,
	UserManagementEditFromViewValue,
} from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
	InitialUserFormValues,
	createUserRecord,
	getNextUserStatus,
	updateUserRecord,
	type UserFormValues,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/ContactData";
import type {
	UserFormErrors,
	UserManagementActionMode,
} from "@/app/src/types/modules/user-management/UserManagementTypes";
import { validateUserForm } from "@/app/src/validations/modules/system-administration/user-management/users/UserListValidation";
import { useUserManagementStore } from "../useUserManagement";

export function useUserListFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const searchParams = useSearchParams();
	const users = useUserManagementStore((state) => state.users);
	const userRoles = useUserManagementStore((state) => state.userRoles);
	const addUser = useUserManagementStore((state) => state.addUser);
	const updateUser = useUserManagementStore((state) => state.updateUser);
	const isMutating = useUserManagementStore((state) => state.isMutating);
	const mode = getActionMode(pathname);
	const wasOpenedFromView =
		mode === "edit" &&
		searchParams.get(UserManagementEditFromParam) ===
			UserManagementEditFromViewValue;
	const existingUser = users.find((user) => user.id === params.recordId);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<UserFormValues>(() =>
		existingUser
			? {
					name: existingUser.name,
					email: existingUser.email,
					contactNumber: existingUser.contactNumber,
					userRoleId: existingUser.userRoleId,
					status: existingUser.status,
				}
			: InitialUserFormValues,
	);
	const [errors, setErrors] = useState<UserFormErrors>({});
	const viewHref = existingUser
		? `${UserListHref}/view/${existingUser.id}`
		: UserListHref;
	const submitHref =
		mode === "edit" && wasOpenedFromView ? viewHref : UserListHref;
	const cancelHref =
		mode === "edit" && wasOpenedFromView ? viewHref : UserListHref;
	const editHref = existingUser
		? `${UserListHref}/edit/${existingUser.id}?${UserManagementEditFromViewQuery}`
		: undefined;

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

		const nextErrors = validateUserForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingUser) {
			updateUser(updateUserRecord(existingUser, values));
		} else {
			addUser(createUserRecord(values));
		}

		router.push(submitHref);
	}

	function handleStatusChange() {
		if (!existingUser) {
			return;
		}

		updateUser({
			...existingUser,
			status: getNextUserStatus(existingUser.status),
		});
		router.push(UserListHref);
	}

	return {
		cancelHref,
		editHref,
		errors,
		existingUser,
		handleInputChange,
		handleStatusChange,
		handleSubmit,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		updateField,
		userRoles,
		values,
	};
}

function getActionMode(pathname: string): UserManagementActionMode {
	if (pathname.includes("/view/")) return "view";
	if (pathname.includes("/edit/")) return "edit";
	return "add";
}

