"use client";

import { useState, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { CircleOff, Save, Users } from "lucide-react";
import { DepartmentHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
	InitialDepartmentFormValues,
	createDepartmentRecord,
	updateDepartmentRecord,
	type DepartmentFormValues,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { useDepartmentStore } from "@/app/src/hooks/modules/system-administration/user-management/department/useDepartment";
import type {
	DepartmentFormErrors,
	UserManagementActionMode,
} from "@/app/src/types/modules/user-management/UserManagementTypes";
import { DepartmentForm } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentForm";
import { DepartmentNotFound } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentNotFound";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function DepartmentFormPage() {
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

	if ((mode === "edit" || mode === "view") && !existingDepartment) {
		return (
			<DepartmentNotFound
				href={DepartmentHref}
				title="Department Not Found"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={
					mode === "view"
						? "View Department"
						: mode === "edit"
							? "Edit Department"
							: "Add Department"
				}
				description="Maintain teams and department groupings."
				eyebrow={
					<>
						<Users className="h-3.5 w-3.5" aria-hidden="true" />
						User management
					</>
				}
				actions={
					<>
						{existingDepartment ? (
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
								form="department-form"
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
						) : null}
					</>
				}
			/>
			<DepartmentForm
				backHref={DepartmentHref}
				errors={errors}
				isReadonly={isReadonly}
				values={values}
				onSubmit={handleSubmit}
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

function validate(values: DepartmentFormValues) {
	const errors: DepartmentFormErrors = {};

	if (!values.name.trim()) errors.name = "Name is required.";

	return errors;
}
