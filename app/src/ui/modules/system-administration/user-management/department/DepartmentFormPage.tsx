"use client";

import { CircleOff, Save, Users } from "lucide-react";
import { DepartmentHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { useDepartmentFormPage } from "@/app/src/hooks/modules/system-administration/user-management/department/useDepartmentFormPage";
import { DepartmentForm } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentForm";
import { DepartmentNotFound } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentNotFound";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function DepartmentFormPage() {
	const page = useDepartmentFormPage();

	if (page.needsRecord && !page.existingDepartment) {
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
					page.mode === "view"
						? "View Department"
						: page.mode === "edit"
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
						{page.existingDepartment ? (
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
				errors={page.errors}
				isReadonly={page.isReadonly}
				values={page.values}
				onSubmit={page.handleSubmit}
				onUpdateField={page.updateField}
			/>
		</section>
	);
}
