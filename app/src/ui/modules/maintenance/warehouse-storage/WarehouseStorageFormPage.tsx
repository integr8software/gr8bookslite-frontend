"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MapPin, Save, Settings2 } from "lucide-react";
import {
	WarehouseStorageTypeOptions,
	WarehouseStorageStatusOptions,
	WarehouseStorageHref,
	WarehouseStorageTitle,
} from "@/app/src/constants/modules/maintenance/warehouse-storage/WarehouseStorageConstants";
import { useWarehouseStorageFormPage } from "@/app/src/hooks/modules/maintenance/warehouse-storage/useWarehouseStorageFormPage";
import type { WarehouseModuleFormValues } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function WarehouseStorageFormPage() {
	const page = useWarehouseStorageFormPage();
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const isReadonly = page.mode === "view";
	const title =
		page.mode === "add"
			? "Add Storage Location"
			: page.mode === "edit"
				? "Edit Storage Location"
				: "Storage Location Details";

	if (page.isNotFound) {
		return <WarehouseStorageNotFound />;
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
						? "Review the selected warehouse storage."
						: "Maintain storage codes, simple areas, or structured warehouse paths."
				}
				eyebrow={
					<>
						<MapPin className="h-3.5 w-3.5" aria-hidden="true" />
						{WarehouseStorageTitle}
					</>
				}
				actions={
					<>
						<Link
							href={WarehouseStorageHref}
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
				<div className="grid gap-5">
					<div className="rounded-lg border border-skyblue/20 bg-skyblue/8 p-4">
						<div className="flex items-start gap-3">
							<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-skyblue">
								<Settings2 className="h-4 w-4" aria-hidden="true" />
							</div>
							<div>
								<h2 className="text-sm font-semibold text-darknavy">{page.selectedWarehouse?.name ?? "Warehouse"} storage setup</h2>
								<p className="mt-1 text-sm leading-6 text-darknavy/60">
									{page.storageSetup.trackingMode === "Structured"
										? "This warehouse uses structured location fields."
										: page.storageSetup.trackingMode === "Custom"
											? "This warehouse uses custom storage fields."
											: "This warehouse can start with simple named areas."}
								</p>
								<p className="mt-1 text-xs font-semibold text-darknavy/45">Code format: {page.storageSetup.codeFormat}</p>
							</div>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">Warehouse *</span>
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
					<TextField label="Storage Code *" readOnly={isReadonly} value={page.form.locationCode} placeholder={page.generatedStorageCode || "BR-01"} onChange={(value) => updateField("locationCode", value)} />
					<TextField label="Location Name *" readOnly={isReadonly} value={page.form.locationName} placeholder="Back Room, Freezer, Aisle A" onChange={(value) => updateField("locationName", value)} />
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">Type</span>
						<select
							value={page.form.locationType}
							disabled={isReadonly}
							className={fieldClassName}
							onChange={(event) => updateField("locationType", event.target.value)}
						>
							{WarehouseStorageTypeOptions.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</label>
					{page.storageSetup.trackingMode !== "Simple" ? (
						<>
							{page.storageSetup.requiredFields.includes("zone") || page.storageSetup.trackingMode === "Structured" ? (
								<TextField label={createFieldLabel("Zone", page.storageSetup.requiredFields.includes("zone"))} readOnly={isReadonly} value={page.form.zone} onChange={(value) => updateField("zone", value)} />
							) : null}
							{page.storageSetup.requiredFields.includes("room") || page.storageSetup.trackingMode === "Custom" ? (
								<TextField label={createFieldLabel("Room", page.storageSetup.requiredFields.includes("room"))} readOnly={isReadonly} value={page.form.room} onChange={(value) => updateField("room", value)} />
							) : null}
							{page.storageSetup.requiredFields.includes("aisle") || page.storageSetup.trackingMode === "Structured" ? (
								<TextField label={createFieldLabel("Aisle", page.storageSetup.requiredFields.includes("aisle"))} readOnly={isReadonly} value={page.form.aisle} onChange={(value) => updateField("aisle", value)} />
							) : null}
							{page.storageSetup.requiredFields.includes("rackNo") || page.storageSetup.trackingMode !== "No Tracking" ? (
								<TextField label={createFieldLabel("Rack", page.storageSetup.requiredFields.includes("rackNo"))} readOnly={isReadonly} value={page.form.rackNo} onChange={(value) => updateField("rackNo", value)} />
							) : null}
							{page.storageSetup.requiredFields.includes("shelfNo") || page.storageSetup.trackingMode === "Structured" ? (
								<TextField label={createFieldLabel("Level / Shelf", page.storageSetup.requiredFields.includes("shelfNo"))} readOnly={isReadonly} value={page.form.shelfNo} onChange={(value) => updateField("shelfNo", value)} />
							) : null}
							{page.storageSetup.requiredFields.includes("binNo") || page.storageSetup.trackingMode !== "No Tracking" ? (
								<TextField label={createFieldLabel("Bin", page.storageSetup.requiredFields.includes("binNo"))} readOnly={isReadonly} value={page.form.binNo} onChange={(value) => updateField("binNo", value)} />
							) : null}
							{page.storageSetup.temperatureTracking !== "Off" ? (
								<TextField label={createFieldLabel("Temperature Zone", page.storageSetup.requiredFields.includes("temperatureZone"))} readOnly={isReadonly} value={page.form.temperatureZone} onChange={(value) => updateField("temperatureZone", value)} />
							) : null}
						</>
					) : null}
					{page.storageSetup.capacityTracking !== "Off" ? (
						<>
							<TextField label={createFieldLabel("Capacity", page.storageSetup.capacityTracking === "Required")} readOnly={isReadonly} value={page.form.capacity} placeholder="1000" onChange={(value) => updateField("capacity", value)} />
							<TextField label="Capacity UOM" readOnly={isReadonly} value={page.form.capacityUom} placeholder="kg, pcs, cases" onChange={(value) => updateField("capacityUom", value)} />
						</>
					) : null}
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">Status *</span>
						<select
							value={page.form.status}
							disabled={isReadonly}
							className={fieldClassName}
							onChange={(event) => updateField("status", event.target.value)}
						>
							{WarehouseStorageStatusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</label>
					<div className="md:col-span-2">
						<TextField label="Notes" readOnly={isReadonly} value={page.form.notes} placeholder="Optional storage instructions" onChange={(value) => updateField("notes", value)} />
					</div>
					</div>
				</div>
			</section>
			<AppDialog
				confirmLabel="Confirm"
				description="This will save the warehouse storage record."
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

function WarehouseStorageNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
			<h1 className="text-xl font-semibold text-darknavy">
				Warehouse storage not found
			</h1>
			<p className="mt-2 text-sm text-darknavy/55">
				The selected warehouse storage may have been removed.
			</p>
			<Link
				href={WarehouseStorageHref}
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
	placeholder,
	readOnly,
	value,
}: {
	label: string;
	readOnly: boolean;
	value: string;
	placeholder?: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<input
				type="text"
				value={value}
				placeholder={placeholder}
				readOnly={readOnly}
				className={fieldClassName}
				onChange={(event) => onChange(event.target.value)}
			/>
		</label>
	);
}

function createFieldLabel(label: string, required: boolean) {
	return required ? `${label} *` : label;
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
