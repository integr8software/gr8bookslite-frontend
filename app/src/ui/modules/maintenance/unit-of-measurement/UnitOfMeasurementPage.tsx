"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, CirclePause, Plus, Ruler, Save, Search } from "lucide-react";
import {
	UnitOfMeasurementDescription,
	UnitOfMeasurementDrawerFormId,
	UnitOfMeasurementFieldClassName,
	UnitOfMeasurementPaginationStorageKey,
	UnitOfMeasurementQuantityModeOptions,
	UnitOfMeasurementTitle,
} from "@/app/src/constants/modules/maintenance/unit-of-measurement/UnitOfMeasurementConstants";
import { createUnitOfMeasurementFormValues } from "@/app/src/data/modules/maintenance/unit-of-measurement/UnitOfMeasurementData";
import { useUnitOfMeasurementListPage } from "@/app/src/hooks/modules/maintenance/unit-of-measurement/useUnitOfMeasurementListPage";
import type {
	UnitOfMeasurementDrawerState,
	UnitOfMeasurementFormValues,
	UnitOfMeasurementQuantityMode,
	UnitOfMeasurementRecord,
	UnitOfMeasurementStatus,
} from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function UnitOfMeasurementListPage() {
	const page = useUnitOfMeasurementListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={UnitOfMeasurementTitle}
				description={UnitOfMeasurementDescription}
				eyebrow={
					<>
						<Ruler className="h-3.5 w-3.5" aria-hidden="true" />
						Maintenance
					</>
				}
				actions={
					<button
						type="button"
						className={moduleHeaderActionClassNames.primary}
						onClick={page.openAddDrawer}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Unit
					</button>
				}
			/>
			<ModuleStatisticCards
				className="xl:grid-cols-4"
				items={[
					{
						helper: "Configured units",
						icon: Ruler,
						label: "Total Units",
						value: page.records.length,
					},
					{
						helper: "Available for transactions",
						icon: CheckCircle2,
						label: "Active",
						tone: "emerald",
						value: page.activeCount,
					},
					{
						helper: "Allows decimal quantities",
						icon: Ruler,
						label: "Decimal",
						tone: "violet",
						value: page.decimalCount,
					},
					{
						helper: "Kept for history",
						icon: CirclePause,
						label: "Inactive",
						tone: "amber",
						value: page.records.length - page.activeCount,
					},
				]}
			/>
			<ModuleTable
				emptyDescription="Add a unit of measurement to start maintaining quantity setup."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No unit of measurement records found"
				minWidthClassName="min-w-[64rem]"
				paginationStorageKey={UnitOfMeasurementPaginationStorageKey}
				table={page.table}
				tableTitle="Unit of measurement"
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search Unit of Measurement"
							placeholder="Search by unit, symbol, or quantity type"
							value={page.query}
							onChange={page.setQuery}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={page.statusFilter}
							options={[
								{ label: "All", value: "All" },
								{ label: "Active", value: "Active" },
								{ label: "Inactive", value: "Inactive" },
							]}
							onChange={page.setStatusFilter}
						/>
						<ModuleTableResetButton
							onClick={() => {
								page.setQuery("");
								page.setStatusFilter("Active");
							}}
						/>
					</ModuleTableToolbar>
				}
				renderRow={({ id, original }) => (
					<UnitOfMeasurementTableRow
						key={id}
						record={original}
						onEdit={page.openEditDrawer}
						onToggleStatus={page.toggleStatus}
						onView={page.openViewDrawer}
					/>
				)}
			/>
			<UnitOfMeasurementDrawer
				key={`${page.drawer?.mode ?? "closed"}-${page.drawer?.record?.id ?? "new"}`}
				drawer={page.drawer}
				onClose={page.closeDrawer}
				onSave={page.saveRecord}
			/>
		</section>
	);
}

function UnitOfMeasurementTableRow({
	record,
	onEdit,
	onToggleStatus,
	onView,
}: {
	record: UnitOfMeasurementRecord;
	onEdit: (record: UnitOfMeasurementRecord) => void;
	onToggleStatus: (record: UnitOfMeasurementRecord) => void;
	onView: (record: UnitOfMeasurementRecord) => void;
}) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{record.name}</td>
			<td className="px-4 py-4 font-semibold">{record.symbol}</td>
			<td className="px-4 py-4 text-darknavy/70">
				{formatQuantityMode(record.quantityMode)}
			</td>
			<td className="px-4 py-4">
				<ModuleStatusBadge<UnitOfMeasurementStatus> status={record.status} />
			</td>
			<td className="px-4 py-4 text-center">
				<ModuleTableActions className="justify-center">
					<ModuleTableActionButton
						variant="view"
						label={`View ${record.name}`}
						onClick={() => onView(record)}
					/>
					<ModuleTableActionButton
						variant="edit"
						label={`Edit ${record.name}`}
						onClick={() => onEdit(record)}
					/>
					<ModuleTableActionButton
						variant={record.status === "Active" ? "inactive" : "active"}
						label={
							record.status === "Active"
								? `Set ${record.name} inactive`
								: `Set ${record.name} active`
						}
						onClick={() => onToggleStatus(record)}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}

function UnitOfMeasurementDrawer({
	drawer,
	onClose,
	onSave,
}: {
	drawer: UnitOfMeasurementDrawerState;
	onClose: () => void;
	onSave: (values: UnitOfMeasurementFormValues) => void;
}) {
	const [values, setValues] = useState(() =>
		createUnitOfMeasurementFormValues(drawer?.record),
	);

	if (!drawer) {
		return null;
	}

	const isReadonly = drawer.mode === "view";
	const title =
		drawer.mode === "add"
			? "Add Unit of Measurement"
			: drawer.mode === "edit"
				? `Edit ${drawer.record?.name ?? "Unit of Measurement"}`
				: drawer.record?.name ?? "Unit of Measurement";

	return (
		<ModuleDrawer
			isOpen
			title={title}
			description="Maintain the unit setup details."
			position="right"
			maxWidthClassName="max-w-xl"
			onClose={onClose}
			footer={
				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						className={moduleHeaderActionClassNames.secondary}
					>
						{isReadonly ? "Close" : "Cancel"}
					</button>
					{!isReadonly ? (
						<button
							type="submit"
							form={UnitOfMeasurementDrawerFormId}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save
						</button>
					) : null}
				</div>
			}
		>
			<form
				id={UnitOfMeasurementDrawerFormId}
				className="grid gap-4 px-6 py-5"
				onSubmit={(event) => {
					event.preventDefault();
					onSave({
						...values,
						symbol: values.symbol.toUpperCase(),
					});
				}}
			>
				<Field label="Unit of Measurement" required>
					<input
						value={values.name}
						readOnly={isReadonly}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								name: event.target.value,
							}))
						}
						className={UnitOfMeasurementFieldClassName}
						placeholder="Box"
					/>
				</Field>
				<Field label="Symbol" required>
					<input
						value={values.symbol}
						readOnly={isReadonly}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								symbol: event.target.value.toUpperCase(),
							}))
						}
						className={UnitOfMeasurementFieldClassName}
						placeholder="BOX"
					/>
				</Field>
				<Field label="Quantity Type" required>
					<select
						value={values.quantityMode}
						disabled={isReadonly}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								quantityMode: event.target
									.value as UnitOfMeasurementQuantityMode,
							}))
						}
						className={UnitOfMeasurementFieldClassName}
					>
						{UnitOfMeasurementQuantityModeOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</Field>
				<Field label="Status" required>
					<select
						value={values.status}
						disabled={isReadonly}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								status: event.target.value as UnitOfMeasurementStatus,
							}))
						}
						className={UnitOfMeasurementFieldClassName}
					>
						<option>Active</option>
						<option>Inactive</option>
					</select>
				</Field>
			</form>
		</ModuleDrawer>
	);
}

function Field({
	children,
	label,
	required,
}: {
	children: ReactNode;
	label: string;
	required?: boolean;
}) {
	return (
		<label>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
		</label>
	);
}


function formatQuantityMode(mode: UnitOfMeasurementQuantityMode) {
	return mode === "Integer" ? "Whole number" : "Decimal";
}
