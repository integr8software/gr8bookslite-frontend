"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, PackageCheck, Save } from "lucide-react";
import {
	WarehouseReceivingPutawayConfigs,
	WarehouseReceivingPutawayHref,
} from "@/app/src/constants/modules/warehouse-management/receiving-putaway/WarehouseReceivingPutawayConstants";
import { createWarehouseReceivingPutawayRecords } from "@/app/src/data/modules/warehouse-management/receiving-putaway/WarehouseReceivingPutawayData";
import { MockWarehousesData } from "@/app/src/data/modules/warehouse-management/receiving-putaway/MockWarehousesData";
import type { WarehouseReceivingPutawayRecord } from "@/app/src/types/modules/warehouse-management/receiving-putaway/WarehouseReceivingPutawayTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

const Module = "receiving-putaway";

export function WarehouseReceivingPutawayFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const mode = pathname.includes("/view/") ? "view" : pathname.includes("/edit/") ? "edit" : "add";
	const config = WarehouseReceivingPutawayConfigs[Module];
	const records = useMemo(() => createWarehouseReceivingPutawayRecords(Module), []);
	const record = records.find((item) => item.id === params.recordId);
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const [form, setForm] = useState<WarehouseReceivingPutawayRecord>(() =>
		record ?? {
			cells: {
				document: `GRN-2026-${Date.now().toString().slice(-4)}`,
				source: "",
				supplier: "",
				expectedDate: new Date().toISOString().slice(0, 10),
				dockDoor: "RCV-DOCK-01",
				receivingType: "Purchase Order",
				items: "",
				received: "0 / 0",
				putaway: "0 / 0",
				stagingLocation: "RCV-STAGE-A",
				targetLocations: "",
				qcStatus: "Pending",
				progress: "0%",
				handledBy: "",
			},
			id: "",
			status: "Expected",
			warehouseId: MockWarehousesData[0]?.id ?? "wh-main",
			warehouseName: MockWarehousesData[0]?.name ?? "Main Warehouse",
		},
	);
	const isReadonly = mode === "view";
	const isNotFound = mode !== "add" && !record;
	const title = mode === "add" ? "Add Receiving Transaction" : mode === "edit" ? "Edit Receiving Transaction" : "Receiving Transaction Details";
	const warehouseOptions = MockWarehousesData.map((warehouse) => ({
		description: warehouse.code,
		label: warehouse.code,
		name: warehouse.name,
		value: warehouse.id,
	}));

	if (isNotFound) {
		return <ReceivingPutawayNotFound />;
	}

	function updateCell(field: string, value: string) {
		setForm((current) => ({
			...current,
			cells: { ...current.cells, [field]: value },
		}));
	}

	function updateWarehouse(warehouseId: string) {
		const warehouse = MockWarehousesData.find((item) => item.id === warehouseId);
		setForm((current) => ({
			...current,
			warehouseId,
			warehouseName: warehouse?.name ?? current.warehouseName,
		}));
	}

	function handleSave() {
		setIsSaveDialogOpen(false);
		router.push(WarehouseReceivingPutawayHref);
	}

	return (
		<form className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
				title={title}
				description="Track inbound documents through dock assignment, receiving, quality inspection, staging, and final putaway."
				eyebrow={
					<>
						<PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
						{config.title}
					</>
				}
				actions={
					<>
						<Link href={WarehouseReceivingPutawayHref} className={`${moduleHeaderActionClassNames.secondary} order-2 lg:order-1`}>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						{!isReadonly ? (
							<button type="button" className={`${moduleHeaderActionClassNames.primary} order-1 lg:order-2`} onClick={() => setIsSaveDialogOpen(true)}>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
						) : null}
					</>
				}
			/>
			<section className="grid gap-5 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 pb-4">
					<div>
						<p className="text-xs font-bold uppercase text-darknavy/45">Transaction status</p>
						<h2 className="mt-1 text-lg font-semibold text-darknavy">{form.cells.document || "New receiving document"}</h2>
					</div>
					<ModuleStatusBadge status={form.status} />
				</div>
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">Warehouse *</span>
						<AppAdvancedDropdown
							disabled={isReadonly}
							isClearable={false}
							options={warehouseOptions}
							value={form.warehouseId}
							showSelectedDetails
							onChange={(value) => updateWarehouse(Array.isArray(value) ? (value[0] ?? "") : value)}
						/>
					</label>
					{config.columns.filter((column) => !["actions", "status"].includes(column.id)).map((column, index) => (
						<TextField
							key={column.id}
							label={`${column.label}${index < 3 ? " *" : ""}`}
							readOnly={isReadonly}
							value={form.cells[column.id] ?? ""}
							onChange={(value) => updateCell(column.id, value)}
						/>
					))}
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">Status *</span>
						<select
							value={form.status}
							disabled={isReadonly}
							className={fieldClassName}
							onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
						>
							{["Expected", "Receiving", "Received", "Putaway In Progress", "Completed"].map((status) => (
								<option key={status}>{status}</option>
							))}
						</select>
					</label>
				</div>
			</section>
			<AppDialog
				confirmLabel="Confirm"
				description="This saves the receiving transaction in the connected mock workspace."
				iconTone="question"
				isOpen={isSaveDialogOpen}
				title={mode === "edit" ? "Save receiving changes?" : "Save receiving transaction?"}
				tone="success"
				onCancel={() => setIsSaveDialogOpen(false)}
				onConfirm={handleSave}
			/>
		</form>
	);
}

function TextField({ label, onChange, readOnly, value }: { label: string; readOnly: boolean; value: string; onChange: (value: string) => void }) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<input className={fieldClassName} readOnly={readOnly} value={value} onChange={(event) => onChange(event.target.value)} />
		</label>
	);
}

function ReceivingPutawayNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
			<h1 className="text-xl font-semibold text-darknavy">Receiving transaction not found</h1>
			<p className="mt-2 text-sm text-darknavy/55">The selected receiving transaction may have been removed.</p>
			<Link href={WarehouseReceivingPutawayHref} className={`${moduleHeaderActionClassNames.secondary} mt-5`}>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back
			</Link>
		</section>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
