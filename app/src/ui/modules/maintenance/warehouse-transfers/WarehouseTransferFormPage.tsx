"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MoveRight, Save } from "lucide-react";
import {
	WarehouseTransfersHref,
	WarehouseTransfersTitle,
	WarehouseTransferStatusOptions,
} from "@/app/src/constants/modules/maintenance/warehouse-transfers/WarehouseTransferConstants";
import { useWarehouseTransferFormPage } from "@/app/src/hooks/modules/maintenance/warehouse-transfers/useWarehouseTransferFormPage";
import type { WarehouseModuleFormValues } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function WarehouseTransferFormPage() {
	const page = useWarehouseTransferFormPage();
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const isReadonly = page.mode === "view";
	const title =
		page.mode === "add"
			? "Add Warehouse Transfer"
			: page.mode === "edit"
				? "Edit Warehouse Transfer"
				: "Warehouse Transfer Details";

	if (page.isNotFound) {
		return <WarehouseTransferNotFound />;
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
						? "Review the selected warehouse transfer."
						: "Track a warehouse transfer request and destination details."
				}
				eyebrow={
					<>
						<MoveRight className="h-3.5 w-3.5" aria-hidden="true" />
						{WarehouseTransfersTitle}
					</>
				}
				actions={
					<>
						<Link
							href={WarehouseTransfersHref}
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
						<span className="text-sm font-semibold text-darknavy">
							Source Warehouse
						</span>
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
					<TextField label="Date" readOnly={isReadonly} type="date" value={page.form.date} onChange={(value) => updateField("date", value)} />
					<TextField label="Transfer Number" readOnly={isReadonly} value={page.form.referenceNumber} onChange={(value) => updateField("referenceNumber", value)} />
					<TextField label="Destination Warehouse" readOnly={isReadonly} value={page.form.destinationWarehouse} onChange={(value) => updateField("destinationWarehouse", value)} />
					<TextField label="Requested By" readOnly={isReadonly} value={page.form.requestedBy} onChange={(value) => updateField("requestedBy", value)} />
					<TextField label="Approved By" readOnly={isReadonly} value={page.form.approvedBy} onChange={(value) => updateField("approvedBy", value)} />
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">Status</span>
						<select
							value={page.form.status}
							disabled={isReadonly}
							className={fieldClassName}
							onChange={(event) => updateField("status", event.target.value)}
						>
							{WarehouseTransferStatusOptions.map((status) => (
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
				description="This will save the warehouse transfer record."
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

function WarehouseTransferNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
			<h1 className="text-xl font-semibold text-darknavy">
				Warehouse transfer not found
			</h1>
			<p className="mt-2 text-sm text-darknavy/55">
				The selected warehouse transfer may have been removed.
			</p>
			<Link
				href={WarehouseTransfersHref}
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
	type = "text",
	value,
}: {
	label: string;
	readOnly: boolean;
	type?: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<input
				type={type}
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
