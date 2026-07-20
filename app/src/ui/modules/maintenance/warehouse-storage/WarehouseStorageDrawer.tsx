"use client";

import {
	type ChangeEvent,
	type FormEvent,
	type ReactNode,
	useMemo,
	useState,
} from "react";
import {
	WarehouseStorageStatusOptions,
} from "@/app/src/constants/modules/maintenance/warehouse-storage/WarehouseStorageConstants";
import {
	createBlankWarehouseStorageForm,
	createStorageCodeFromForm,
	createWarehouseStorageFormFromRow,
	getWarehouseStorageSetup,
} from "@/app/src/data/modules/maintenance/warehouse-storage/WarehouseStorageData";
import type { WarehouseStorageActionMode, WarehouseStorageListRecord } from "@/app/src/types/modules/maintenance/warehouse-storage/WarehouseStorageTypes";
import type { WarehouseModuleFormValues } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import { ModuleDrawer, getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";

const WarehouseStorageDrawerFormId = "storage-location-drawer-form";

type WarehouseStorageDrawerProps = {
	isOpen: boolean;
	isSaving: boolean;
	mode: WarehouseStorageActionMode;
	record?: WarehouseStorageListRecord;
	warehouses: WarehouseRecord[];
	onClose: () => void;
	onSave: (form: WarehouseModuleFormValues, record?: WarehouseStorageListRecord) => void;
};

export function WarehouseStorageDrawer({
	isOpen,
	isSaving,
	mode,
	onClose,
	onSave,
	record,
	warehouses,
}: WarehouseStorageDrawerProps) {
	const initialForm = useMemo(() => {
		if (record) {
			return createWarehouseStorageFormFromRow(
				{
					id: record.id,
					kind: "warehouse-storage",
					recordId: record.recordId,
					status: record.status,
					values: record.values,
					warehouseId: record.warehouseId,
				},
				warehouses,
			);
		}

		return createBlankWarehouseStorageForm(warehouses);
	}, [record, warehouses]);
	const [form, setForm] = useState(initialForm);
	const isReadonly = mode === "view";
	const selectedWarehouse = warehouses.find((warehouse) => warehouse.id === form.warehouseId) ?? warehouses[0];
	const setup = getWarehouseStorageSetup(selectedWarehouse);
	const generatedCode = createStorageCodeFromForm(form);
	const title = mode === "add" ? "Add Storage Location" : mode === "edit" ? "Edit Storage Location" : "Storage Location Details";

	function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
		setForm((current) => ({
			...current,
			[event.target.name]: event.target.value,
		}));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		onSave(
			{
				...form,
				locationCode: form.locationCode.trim() || generatedCode,
				locationName: form.locationName.trim() || form.locationCode.trim() || generatedCode,
			},
			record,
		);
	}

	return (
		<ModuleDrawer
			description="Set the storage code and only the location details this warehouse actually uses."
			eyebrow="Storage Locations"
			formId={WarehouseStorageDrawerFormId}
			isOpen={isOpen}
			isReadonly={isReadonly}
			isSaving={isSaving}
			onClose={onClose}
			savingLabel={getModuleSavePendingLabel(mode)}
			submitLabel={mode === "edit" ? "Update Location" : "Save Location"}
			title={title}
		>
			<form id={WarehouseStorageDrawerFormId} onSubmit={handleSubmit} className="grid gap-5 px-6 py-5">
				<div className="rounded-lg border border-skyblue/20 bg-skyblue/8 p-4">
					<p className="text-sm font-semibold text-darknavy">{selectedWarehouse?.name ?? "Warehouse"} setup</p>
					<p className="mt-1 text-sm leading-6 text-darknavy/60">
						{setup.trackingMode === "Structured"
							? "This warehouse uses zone, aisle, rack, level, and bin fields."
							: setup.trackingMode === "Custom"
								? "This warehouse uses custom fields, such as room or temperature zone."
								: "This warehouse can use simple named areas like Back Room or Display Shelf."}
					</p>
				</div>
				<div className="grid gap-4 lg:grid-cols-2">
					<FormField label="Warehouse" required>
						<select name="warehouseId" value={form.warehouseId} onChange={handleInputChange} disabled={isReadonly} className={fieldClassName}>
							{warehouses.map((warehouse) => (
								<option key={warehouse.id} value={warehouse.id}>
									{warehouse.name}
								</option>
							))}
						</select>
					</FormField>
					<FormField label="Storage Code" helper={form.locationCode ? undefined : generatedCode ? `Will use ${generatedCode}` : undefined} required>
						<input name="locationCode" value={form.locationCode} onChange={handleInputChange} readOnly={isReadonly} className={fieldClassName} placeholder="BR-01" />
					</FormField>
					<FormField label="Location Name" className="lg:col-span-2" required>
						<input name="locationName" value={form.locationName} onChange={handleInputChange} readOnly={isReadonly} className={fieldClassName} placeholder="Back Room, Freezer, Receiving Area" />
					</FormField>
					{setup.trackingMode !== "Simple" ? (
						<>
							{setup.trackingMode === "Structured" || setup.requiredFields.includes("zone") ? <TextField name="zone" label="Zone" value={form.zone} readOnly={isReadonly} onChange={handleInputChange} /> : null}
							{setup.trackingMode === "Custom" || setup.requiredFields.includes("room") ? <TextField name="room" label="Room" value={form.room} readOnly={isReadonly} onChange={handleInputChange} /> : null}
							{setup.trackingMode === "Structured" || setup.requiredFields.includes("aisle") ? <TextField name="aisle" label="Aisle" value={form.aisle} readOnly={isReadonly} onChange={handleInputChange} /> : null}
							{setup.trackingMode !== "No Tracking" ? <TextField name="rackNo" label="Rack" value={form.rackNo} readOnly={isReadonly} onChange={handleInputChange} /> : null}
							{setup.trackingMode === "Structured" ? <TextField name="shelfNo" label="Level / Shelf" value={form.shelfNo} readOnly={isReadonly} onChange={handleInputChange} /> : null}
							{setup.trackingMode !== "No Tracking" ? <TextField name="binNo" label="Bin" value={form.binNo} readOnly={isReadonly} onChange={handleInputChange} /> : null}
							{setup.temperatureTracking !== "Off" ? <TextField name="temperatureZone" label="Temperature Zone" value={form.temperatureZone} readOnly={isReadonly} onChange={handleInputChange} /> : null}
						</>
					) : null}
					{setup.capacityTracking !== "Off" ? (
						<>
							<TextField name="capacity" label="Capacity" value={form.capacity} readOnly={isReadonly} onChange={handleInputChange} />
							<TextField name="capacityUom" label="Capacity UOM" value={form.capacityUom} readOnly={isReadonly} onChange={handleInputChange} />
						</>
					) : null}
					<FormField label="Status" required>
						<select name="status" value={form.status} onChange={handleInputChange} disabled={isReadonly} className={fieldClassName}>
							{WarehouseStorageStatusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</FormField>
					<FormField label="Purpose" helper="Optional. Use only when it helps operations." >
						<input name="locationType" value={form.locationType} onChange={handleInputChange} readOnly={isReadonly} className={fieldClassName} placeholder="Picking, receiving, cold storage" />
					</FormField>
					<FormField label="Notes" className="lg:col-span-2">
						<textarea name="notes" value={form.notes} onChange={handleInputChange} readOnly={isReadonly} className={`${fieldClassName} min-h-24 py-3`} placeholder="Optional storage instructions" />
					</FormField>
				</div>
			</form>
		</ModuleDrawer>
	);
}

function TextField({
	label,
	name,
	onChange,
	readOnly,
	value,
}: {
	label: string;
	name: keyof WarehouseModuleFormValues;
	readOnly: boolean;
	value: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<FormField label={label}>
			<input name={name} value={value} onChange={onChange} readOnly={readOnly} className={fieldClassName} />
		</FormField>
	);
}

function FormField({
	children,
	className,
	helper,
	label,
	required,
}: {
	children: ReactNode;
	className?: string;
	helper?: string;
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
			{helper ? <span className="mt-1 block text-xs font-medium text-darknavy/45">{helper}</span> : null}
		</label>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
