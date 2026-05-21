"use client";

import { useState, type FormEvent } from "react";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	DepartmentHref,
	UserManagementEditFromParam,
	UserManagementEditFromViewQuery,
	UserManagementEditFromViewValue,
} from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
	InitialDepartmentFormValues,
	createDepartmentRecord,
	getNextUserStatus,
	updateDepartmentRecord,
	type DepartmentFormValues,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import type {
	DepartmentFormErrors,
	UserManagementActionMode,
} from "@/app/src/types/modules/user-management/UserManagementTypes";
import { useDepartmentStore } from "./useDepartment";

export function useDepartmentFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const searchParams = useSearchParams();
	const departments = useDepartmentStore((state) => state.departments);
	const addDepartment = useDepartmentStore((state) => state.addDepartment);
	const updateDepartment = useDepartmentStore(
		(state) => state.updateDepartment,
	);
	const isMutating = useDepartmentStore((state) => state.isMutating);
	const mode = getActionMode(pathname);
	const wasOpenedFromView =
		mode === "edit" &&
		searchParams.get(UserManagementEditFromParam) ===
			UserManagementEditFromViewValue;
	const existingDepartment = departments.find(
		(item) => item.id === params.recordId,
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<DepartmentFormValues>(() =>
		existingDepartment
			? {
					name: existingDepartment.name,
					description: existingDepartment.description,
					status: existingDepartment.status,
				}
			: InitialDepartmentFormValues,
	);
	const [errors, setErrors] = useState<DepartmentFormErrors>({});
	const viewHref = existingDepartment
		? `${DepartmentHref}/view/${existingDepartment.id}`
		: DepartmentHref;
	const submitHref =
		mode === "edit" && wasOpenedFromView ? viewHref : DepartmentHref;
	const cancelHref =
		mode === "edit" && wasOpenedFromView ? viewHref : DepartmentHref;
	const editHref = existingDepartment
		? `${DepartmentHref}/edit/${existingDepartment.id}?${UserManagementEditFromViewQuery}`
		: undefined;

	function updateField(field: keyof DepartmentFormValues, value: string) {
		if (isReadonly) return;
		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const nextErrors = validate(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingDepartment) {
			updateDepartment(updateDepartmentRecord(existingDepartment, values));
		} else {
			addDepartment(createDepartmentRecord(values));
		}

		router.push(submitHref);
	}

	function handleStatusChange() {
		if (!existingDepartment) {
			return;
		}

		updateDepartment({
			...existingDepartment,
			status: getNextUserStatus(existingDepartment.status),
		});
		router.push(DepartmentHref);
	}

	return {
		cancelHref,
		editHref,
		errors,
		existingDepartment,
		handleStatusChange,
		handleSubmit,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		updateField,
		values,
	};
}

function getActionMode(pathname: string): UserManagementActionMode {
	if (pathname.includes("/view/")) return "view";
	if (pathname.includes("/edit/")) return "edit";
	return "add";
}

function validate(values: DepartmentFormValues) {
	const errors: DepartmentFormErrors = {};

	if (!values.name.trim()) errors.name = "Name is required.";

	return errors;
}
