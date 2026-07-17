"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MapPin, Save } from "lucide-react";
import {
	StorageLocationStatusOptions,
	StorageLocationsHref,
	StorageLocationsTitle,
} from "@/app/src/constants/modules/maintenance/storage-locations/StorageLocationConstants";
import { useStorageLocationFormPage } from "@/app/src/hooks/modules/maintenance/storage-locations/useStorageLocationFormPage";
import type { WarehouseModuleFormValues } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function StorageLocationFormPage() {
	const page = useStorageLocationFormPage();
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const isReadonly = page.mode === "view";
	const title =
		page.mode === "add"
			? "Add Storage Location"
			: page.mode === "edit"
				? "Edit Storage Location"
				: "Storage Location Details";

	if (page.isNotFound) {
		return <StorageLocationNotFound />;
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
						? "Review the selected storage location."
						: "Maintain zone, aisle, rack, shelf, and bin details."
				}
				eyebrow={
					<>
						<MapPin className="h-3.5 w-3.5" aria-hidden="true" />
						{StorageLocationsTitle}
					</>
				}
				actions={
					<>
						<Link
							href={StorageLocationsHref}
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
					<TextField label="Location Code" readOnly={isReadonly} value={page.form.locationCode} onChange={(value) => updateField("locationCode", value)} />
					<TextField label="Zone" readOnly={isReadonly} value={page.form.zone} onChange={(value) => updateField("zone", value)} />
					<TextField label="Aisle" readOnly={isReadonly} value={page.form.aisle} onChange={(value) => updateField("aisle", value)} />
					<TextField label="Rack No" readOnly={isReadonly} value={page.form.rackNo} onChange={(value) => updateField("rackNo", value)} />
					<TextField label="Shelf No" readOnly={isReadonly} value={page.form.shelfNo} onChange={(value) => updateField("shelfNo", value)} />
					<TextField label="Bin No" readOnly={isReadonly} value={page.form.binNo} onChange={(value) => updateField("binNo", value)} />
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">Status</span>
						<select
							value={page.form.status}
							disabled={isReadonly}
							className={fieldClassName}
							onChange={(event) => updateField("status", event.target.value)}
						>
							{StorageLocationStatusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</label>
				</div>
			</section>
			<AppDialog
				confirmLabel="Confirm"
				description="This will save the storage location record."
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

function StorageLocationNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
			<h1 className="text-xl font-semibold text-darknavy">
				Storage location not found
			</h1>
			<p className="mt-2 text-sm text-darknavy/55">
				The selected storage location may have been removed.
			</p>
			<Link
				href={StorageLocationsHref}
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

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
