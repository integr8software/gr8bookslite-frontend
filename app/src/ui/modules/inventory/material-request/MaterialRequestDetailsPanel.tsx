"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PartyManagementHref } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import { useWarehouseManagementStore } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseManagement";
import type {
	MaterialRequestFormErrors,
	MaterialRequestFormValues,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import type { WarehouseActionMode } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { WarehouseDrawer } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseDrawer";
import { MaterialRequestStatusBadge } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestStatusBadge";

type MaterialRequestDetailsPanelProps = {
	errors: MaterialRequestFormErrors;
	isReadonly: boolean;
	updateField: <TKey extends keyof MaterialRequestFormValues>(
		field: TKey,
		value: MaterialRequestFormValues[TKey],
	) => void;
	values: MaterialRequestFormValues;
};

type WarehouseDrawerTarget = null | "from" | "to";

export function MaterialRequestDetailsPanel({
	errors,
	isReadonly,
	updateField,
	values,
}: MaterialRequestDetailsPanelProps) {
	const { warehouses } = useWarehouseManagementStore();
	const { records: partyRecords } = usePartyManagementStore();
	const [warehouseDrawerTarget, setWarehouseDrawerTarget] =
		useState<WarehouseDrawerTarget>(null);
	const remainingRemarks = Math.max(0, RemarksLimit - values.remarks.length);
	const warehouseOptions = useMemo<AppAdvancedDropdownOption[]>(
		() =>
			warehouses.map((warehouse) => ({
				description: warehouse.branchName,
				label: warehouse.code,
				name: warehouse.name,
				value: warehouse.name,
			})),
		[warehouses],
	);
	const partyOptions = useMemo<AppAdvancedDropdownOption[]>(
		() =>
			partyRecords.map((party) => ({
				description: party.partyTypes.join(", "),
				label: party.partyCodeNo,
				name: getPartyDisplayName(party),
				value: party.partyCodeNo,
			})),
		[partyRecords],
	);

	return (
		<>
			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
				<div className="grid gap-x-10 gap-y-5 xl:grid-cols-2">
					<div className="grid content-start gap-4">
						<WarehouseDropdownField
							error={errors.fromWarehouse}
							isReadonly={isReadonly}
							isRequired
							label="From Warehouse"
							value={values.fromWarehouse}
							options={warehouseOptions}
							onAddWarehouse={() => setWarehouseDrawerTarget("from")}
							onChange={(value) => updateField("fromWarehouse", value)}
						/>
						<WarehouseDropdownField
							error={errors.toWarehouse}
							isReadonly={isReadonly}
							isRequired
							label="To Warehouse"
							value={values.toWarehouse}
							options={warehouseOptions}
							onAddWarehouse={() => setWarehouseDrawerTarget("to")}
							onChange={(value) => updateField("toWarehouse", value)}
						/>
						<PartyNameField
							errors={errors}
							isReadonly={isReadonly}
							options={partyOptions}
							values={values}
							updateField={updateField}
						/>
						<div>
							<label className="grid gap-2 text-sm font-semibold text-darknavy">
								Remarks
								<textarea
									value={values.remarks}
									readOnly={isReadonly}
									maxLength={RemarksLimit}
									onChange={(event) =>
										updateField("remarks", event.target.value)
									}
									rows={4}
									className={fieldClassName("min-h-28 py-2")}
								/>
							</label>
							<p className="mt-1 text-xs font-medium text-darknavy/55">
								Characters remaining: {remainingRemarks}
							</p>
						</div>
					</div>

					<div className="grid content-start gap-4">
						<Field
							error={errors.requestNo}
							isRequired
							label="Material Request No."
							value={values.requestNo}
							readOnly={isReadonly}
							onChange={(value) => updateField("requestNo", value)}
						/>
						<ReferenceField
							isReadonly={isReadonly}
							moduleValue={values.referenceModule}
							referenceNo={values.referenceNo}
							onModuleChange={(value) => updateField("referenceModule", value)}
							onReferenceNoChange={(value) => updateField("referenceNo", value)}
						/>
						<Field
							error={errors.documentDate}
							label="Documentation Date"
							type="date"
							value={values.documentDate}
							readOnly={isReadonly}
							onChange={(value) => updateField("documentDate", value)}
						/>
						<StatusField error={errors.status} status={values.status} />
					</div>
				</div>
			</div>

			<WarehouseDrawer
				isOpen={Boolean(warehouseDrawerTarget)}
				mode={"add" satisfies WarehouseActionMode}
				onClose={() => setWarehouseDrawerTarget(null)}
			/>
		</>
	);
}

const ReferenceModuleOptions = [
	"",
	"Purchase Request",
	"Pick List",
	"Goods Issue",
	"Job Order",
	"Project",
] as const;
const RemarksLimit = 500;

type FieldProps = {
	error?: string;
	isRequired?: boolean;
	label: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	type?: string;
	value: string;
};

function WarehouseDropdownField({
	error,
	isReadonly,
	isRequired = false,
	label,
	onAddWarehouse,
	onChange,
	options,
	value,
}: {
	error?: string;
	isReadonly: boolean;
	isRequired?: boolean;
	label: string;
	onAddWarehouse: () => void;
	onChange: (value: string) => void;
	options: AppAdvancedDropdownOption[];
	value: string;
}) {
	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel isRequired={isRequired}>{label}</FieldLabel>
			<div>
				<div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
					<AppAdvancedDropdown
						disabled={isReadonly}
						options={options}
						placeholder="Select warehouse"
						searchPlaceholder="Search warehouses"
						showSelectedDetails
						value={value}
						onChange={(nextValue) => onChange(String(nextValue))}
					/>
					<button
						type="button"
						disabled={isReadonly}
						onClick={onAddWarehouse}
						className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-skyblue/25 bg-white px-4 text-sm font-semibold text-skyblue shadow-sm transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15 disabled:cursor-not-allowed disabled:opacity-45"
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add
					</button>
				</div>
				{error ? <ErrorText message={error} /> : null}
			</div>
		</div>
	);
}

function PartyNameField({
	errors,
	isReadonly,
	options,
	updateField,
	values,
}: {
	errors: MaterialRequestFormErrors;
	isReadonly: boolean;
	options: AppAdvancedDropdownOption[];
	updateField: <TKey extends keyof MaterialRequestFormValues>(
		field: TKey,
		value: MaterialRequestFormValues[TKey],
	) => void;
	values: MaterialRequestFormValues;
}) {
	function applyParty(code: string) {
		const party = options.find((option) => option.value === code);

		updateField("vceCode", code);
		updateField("vceName", party?.name ?? "");
	}

	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel isRequired>Party Member</FieldLabel>
			<div>
				<div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
					<AppAdvancedDropdown
						disabled={isReadonly}
						options={options}
						placeholder="Select party member"
						searchPlaceholder="Search party member"
						showSelectedDetails
						value={values.vceCode}
						onChange={(value) => applyParty(String(value))}
					/>
					<Link
						href={`${PartyManagementHref}/add`}
						className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-skyblue/25 bg-white px-4 text-sm font-semibold text-skyblue shadow-sm transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add
					</Link>
				</div>
				{errors.vceCode ? <ErrorText message={errors.vceCode} /> : null}
				{errors.vceName ? <ErrorText message={errors.vceName} /> : null}
			</div>
		</div>
	);
}

function ReferenceField({
	isReadonly,
	moduleValue,
	onModuleChange,
	onReferenceNoChange,
	referenceNo,
}: {
	isReadonly: boolean;
	moduleValue: string;
	onModuleChange: (value: string) => void;
	onReferenceNoChange: (value: string) => void;
	referenceNo: string;
}) {
	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel isRequired={false}>Reference</FieldLabel>
			<div className="grid grid-cols-[minmax(7rem,1fr)_minmax(0,2fr)]">
				<select
					value={moduleValue}
					disabled={isReadonly}
					onChange={(event) => onModuleChange(event.target.value)}
					className={fieldClassName(
						"rounded-r-none border-r-0 bg-white focus:z-10",
					)}
				>
					{ReferenceModuleOptions.map((option) => (
						<option key={option} value={option}>
							{option || "Module"}
						</option>
					))}
				</select>
				<input
					type="text"
					value={referenceNo}
					readOnly={isReadonly}
					placeholder="Reference number"
					onChange={(event) => onReferenceNoChange(event.target.value)}
					className={fieldClassName("rounded-l-none bg-white focus:z-10")}
				/>
			</div>
		</div>
	);
}

function StatusField({
	error,
	status,
}: {
	error?: string;
	status: MaterialRequestFormValues["status"];
}) {
	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel isRequired={false}>Status</FieldLabel>
			<div>
				<div className="flex h-11 items-center rounded-lg border border-darknavy/10 bg-offwhite/60 px-3">
					<MaterialRequestStatusBadge status={status} />
				</div>
				{error ? <ErrorText message={error} /> : null}
			</div>
		</div>
	);
}

function Field({
	error,
	isRequired = false,
	label,
	onChange,
	readOnly,
	type = "text",
	value,
}: FieldProps) {
	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel isRequired={isRequired}>{label}</FieldLabel>
			<div>
				<input
					type={type}
					value={value}
					readOnly={readOnly}
					onChange={(event) => onChange(event.target.value)}
					className={fieldClassName()}
				/>
				{error ? <ErrorText message={error} /> : null}
			</div>
		</div>
	);
}

function FieldLabel({
	children,
	isRequired,
}: {
	children: string;
	isRequired: boolean;
}) {
	return (
		<span className="pt-2 text-sm font-semibold text-darknavy">
			{children}
			{isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
		</span>
	);
}

function fieldClassName(extraClassName?: string) {
	return joinClasses(
		"h-11 w-full rounded-lg border border-darknavy/10 bg-offwhite/60 px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-offwhite/80 disabled:bg-offwhite/80",
		extraClassName,
	);
}

function ErrorText({ message }: { message: string }) {
	return <p className="mt-1.5 text-xs font-semibold text-coralpink">{message}</p>;
}
