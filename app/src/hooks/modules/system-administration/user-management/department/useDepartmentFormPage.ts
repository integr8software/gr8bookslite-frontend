"use client";

import { useState, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { DepartmentHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
	InitialDepartmentFormValues,
	createDepartmentRecord,
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
	const departments = useDepartmentStore((state) => state.departments);
	const addDepartment = useDepartmentStore((state) => state.addDepartment);
	const updateDepartment = useDepartmentStore(
		(state) => state.updateDepartment,
	);
	const deleteDepartment = useDepartmentStore(
		(state) => state.deleteDepartment,
	);
	const mode = getActionMode(pathname);
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

		router.push(DepartmentHref);
	}

	function handleDelete() {
		if (
			!existingDepartment ||
			!window.confirm(`Set ${existingDepartment.name} as inactive?`)
		) {
			return;
		}

		deleteDepartment(existingDepartment.id);
		router.push(DepartmentHref);
	}

	return {
		errors,
		existingDepartment,
		handleDelete,
		handleSubmit,
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
