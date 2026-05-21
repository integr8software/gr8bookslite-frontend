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
import { DepartmentHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
	getNextUserStatus,
	type UserStatus,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { useDepartmentFormPage } from "@/app/src/hooks/modules/system-administration/user-management/department/useDepartmentFormPage";
import { DepartmentForm } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentForm";
import { DepartmentNotFound } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentNotFound";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";

export function DepartmentFormPage() {
	return (
		<Suspense fallback={null}>
			<DepartmentFormPageInner />
		</Suspense>
	);
}

function DepartmentFormPageInner() {
	const page = useDepartmentFormPage();
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const nextStatus = page.existingDepartment
		? getNextUserStatus(page.existingDepartment.status)
		: "Inactive";
	const StatusIcon = nextStatus === "Active" ? CheckCircle2 : CircleOff;

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
						{page.existingDepartment ? (
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
				errors={page.errors}
				isReadonly={page.isReadonly}
				values={page.values}
				onSubmit={page.handleSubmit}
				onUpdateField={page.updateField}
			/>
			<StatusConfirmDialog
				entityName={page.existingDepartment?.name}
				isOpen={isStatusDialogOpen}
				isPending={page.isMutating}
				nextStatus={nextStatus}
				noun="department"
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
		<AppConfirmDialog
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
