import Link from "next/link";
import type { FormEvent } from "react";
import type { UserRoleFormValues } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import type { UserRoleFormErrors } from "@/app/src/types/modules/user-management/UserManagementTypes";
import { UserRolePermissionsPanel } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRolePermissionsPanel";

export function UserRoleForm({
	backHref,
	errors,
	isReadonly,
	values,
	onSubmit,
	onUpdateAccessRoles,
	onToggleAccessRole,
	onUpdateField,
}: {
	backHref: string;
	errors: UserRoleFormErrors;
	isReadonly: boolean;
	values: UserRoleFormValues;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onUpdateAccessRoles: (accessRoles: string[]) => void;
	onToggleAccessRole: (role: string) => void;
	onUpdateField: (
		field: keyof UserRoleFormValues,
		value: string | string[],
	) => void;
}) {
	return (
		<form id="user-role-form" onSubmit={onSubmit} className="grid gap-5">
			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div className="grid gap-4 lg:grid-cols-2">
					<UserRoleField label="Name" error={errors.name} required>
						<input
							value={values.name}
							onChange={(event) =>
								onUpdateField("name", event.target.value)
							}
							readOnly={isReadonly}
							className={fieldClassName}
						/>
					</UserRoleField>
					<UserRoleField label="Status">
						<select
							value={values.status}
							onChange={(event) =>
								onUpdateField("status", event.target.value)
							}
							disabled={isReadonly}
							className={fieldClassName}
						>
							<option value="Active">Active</option>
							<option value="Inactive">Inactive</option>
						</select>
					</UserRoleField>
					<UserRoleField
						label="Description"
						className="lg:col-span-2"
					>
						<textarea
							value={values.description}
							onChange={(event) =>
								onUpdateField("description", event.target.value)
							}
							readOnly={isReadonly}
							rows={3}
							className={fieldClassName}
						/>
					</UserRoleField>
					<div className="lg:col-span-2">
						<UserRolePermissionsPanel
							error={errors.accessRoles}
							isReadonly={isReadonly}
							values={values.accessRoles}
							onUpdateAccessRoles={onUpdateAccessRoles}
							onToggleAccessRole={onToggleAccessRole}
						/>
					</div>
				</div>
			</div>
			<Link
				href={backHref}
				className="text-sm font-semibold text-skyblue"
			>
				Back to list
			</Link>
		</form>
	);
}

function UserRoleField({
	children,
	className,
	error,
	label,
	required,
}: {
	children: React.ReactNode;
	className?: string;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label className={className}>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
