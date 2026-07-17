"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";
import {
	WarehouseAccessHref,
	WarehouseAccessLevelOptions,
	WarehouseAccessPermissionOptions,
	WarehouseAccessStatusOptions,
	WarehouseAccessTitle,
} from "@/app/src/constants/modules/maintenance/warehouse-access/WarehouseAccessConstants";
import { useWarehouseAccessFormPage } from "@/app/src/hooks/modules/maintenance/warehouse-access/useWarehouseAccessFormPage";
import type { WarehouseAccessPermission } from "@/app/src/types/modules/maintenance/warehouse-access/WarehouseAccessTypes";
import type { WarehouseModuleFormValues } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";

export function WarehouseAccessFormPage() {
	const page = useWarehouseAccessFormPage();
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const isReadonly = page.mode === "view";
	const title =
		page.mode === "add"
			? "Add Warehouse Access"
			: page.mode === "edit"
				? "Edit Warehouse Access"
				: "Warehouse Access Details";

	if (page.isNotFound) {
		return <WarehouseAccessNotFound />;
	}

	function updateField<TKey extends keyof WarehouseModuleFormValues>(
		field: TKey,
		value: WarehouseModuleFormValues[TKey],
	) {
		page.setForm({ ...page.form, [field]: value });
	}

	return (
		<form className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={title}
				description={
					isReadonly
						? "Review the selected warehouse access assignment."
						: "Assign a user and permissions to a warehouse."
				}
				eyebrow={
					<>
						<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
						{WarehouseAccessTitle}
					</>
				}
				actions={
					<>
						<Link
							href={WarehouseAccessHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						{!isReadonly ? (
							<button
								type="button"
								disabled={page.isMutating}
								className={moduleHeaderActionClassNames.primary}
								onClick={() => setIsSaveDialogOpen(true)}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
						) : null}
					</>
				}
			/>
			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div className="grid gap-4 md:grid-cols-2">
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">Warehouse</span>
						<select
							value={page.form.warehouseId}
							disabled={isReadonly}
							className={fieldClassName}
							onChange={(event) => updateField("warehouseId", event.target.value)}
						>
							{page.warehouses.map((warehouse) => (
								<option key={warehouse.id} value={warehouse.id}>
									{warehouse.name}
								</option>
							))}
						</select>
					</label>
					<TextField
						label="User"
						readOnly={isReadonly}
						value={page.form.userName}
						onChange={(value) => updateField("userName", value)}
					/>
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">
							Access Level
						</span>
						<select
							value={page.form.accessLevel}
							disabled={isReadonly}
							className={fieldClassName}
							onChange={(event) =>
								updateField("accessLevel", event.target.value as never)
							}
						>
							{WarehouseAccessLevelOptions.map((level) => (
								<option key={level} value={level}>
									{level}
								</option>
							))}
						</select>
					</label>
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">Status</span>
						<select
							value={page.form.status}
							disabled={isReadonly}
							className={fieldClassName}
							onChange={(event) => updateField("status", event.target.value)}
						>
							{WarehouseAccessStatusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</label>
					<PermissionField
						readOnly={isReadonly}
						value={page.form.permissions}
						onChange={(value) => updateField("permissions", value)}
					/>
				</div>
			</section>
			<AppDialog
				confirmLabel="Confirm"
				description="This will save the warehouse access assignment."
				iconTone="question"
				isOpen={isSaveDialogOpen}
				isPending={page.isMutating}
				pendingLabel={getModuleSavePendingLabel(page.mode)}
				title={page.mode === "edit" ? "Save changes?" : "Save this record?"}
				tone="success"
				onCancel={() => setIsSaveDialogOpen(false)}
				onConfirm={() => page.handleSave(page.form)}
			/>
		</form>
	);
}

function WarehouseAccessNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
			<h1 className="text-xl font-semibold text-darknavy">
				Warehouse access not found
			</h1>
			<p className="mt-2 text-sm text-darknavy/55">
				The selected warehouse access record may have been removed.
			</p>
			<Link
				href={WarehouseAccessHref}
				className={`${moduleHeaderActionClassNames.secondary} mt-5`}
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back
			</Link>
		</section>
	);
}

function TextField({
	label,
	onChange,
	readOnly,
	value,
}: {
	label: string;
	readOnly: boolean;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<input
				type="text"
				value={value}
				readOnly={readOnly}
				className={fieldClassName}
				onChange={(event) => onChange(event.target.value)}
			/>
		</label>
	);
}

function PermissionField({
	onChange,
	readOnly,
	value,
}: {
	readOnly: boolean;
	value: WarehouseAccessPermission[];
	onChange: (value: WarehouseAccessPermission[]) => void;
}) {
	return (
		<fieldset className="grid gap-2 md:col-span-2">
			<legend className="text-sm font-semibold text-darknavy">Permissions</legend>
			<div className="grid gap-2 rounded-md border border-darknavy/10 p-3 sm:grid-cols-2">
				{WarehouseAccessPermissionOptions.map((permission) => (
					<label
						key={permission}
						className="flex items-center gap-2 text-sm font-medium text-darknavy"
					>
						<input
							type="checkbox"
							checked={value.includes(permission)}
							disabled={readOnly}
							className="h-4 w-4 accent-skyblue"
							onChange={(event) => {
								onChange(
									event.target.checked
										? [...value, permission]
										: value.filter((current) => current !== permission),
								);
							}}
						/>
						{permission}
					</label>
				))}
			</div>
		</fieldset>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
