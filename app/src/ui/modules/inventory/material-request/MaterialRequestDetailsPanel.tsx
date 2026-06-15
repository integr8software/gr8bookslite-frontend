"use client";

import {
	useMemo,
	useState,
} from "react";
import { Plus } from "lucide-react";
import { GlobalReferenceModuleOptions } from "@/app/src/constants/shared/module/ReferenceModuleConstants";
import {
	getPartyDisplayName,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
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
import { PartyManagementDrawer } from "@/app/src/ui/modules/maintenance/party-management/PartyManagementDrawer";
import { WarehouseDrawer } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseDrawer";

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
	const {
		addRecord: addPartyRecord,
		isMutating: isPartyMutating,
		records: partyRecords,
	} = usePartyManagementStore();
	const [warehouseDrawerTarget, setWarehouseDrawerTarget] =
		useState<WarehouseDrawerTarget>(null);
	const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
	const [partyDrawerKey, setPartyDrawerKey] = useState(0);
	const remainingRemarks = Math.max(0, RemarksLimit - values.remarks.length);
	const warehouseOptions = useMemo<AppAdvancedDropdownOption[]>(
		() =>
			includeCurrentWarehouseOptions(
				warehouses.map((warehouse) => ({
					description: warehouse.branchName,
					label: warehouse.code,
					name: warehouse.name,
					value: warehouse.name,
				})),
				[values.fromWarehouse, values.toWarehouse],
			),
		[values.fromWarehouse, values.toWarehouse, warehouses],
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

	function openPartyDrawer() {
		setPartyDrawerKey((current) => current + 1);
		setIsPartyDrawerOpen(true);
	}

	return (
		<>
			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
				<div className="grid gap-x-10 gap-y-5 xl:grid-cols-2">
					<div className="grid content-start gap-4">
						<WarehouseDropdownField
							error={errors.fromWarehouse}
							id={MaterialRequestFieldIds.fromWarehouse}
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
							id={MaterialRequestFieldIds.toWarehouse}
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
							onAddParty={openPartyDrawer}
							updateField={updateField}
						/>
						<div>
							<label
								htmlFor={MaterialRequestFieldIds.remarks}
								className="block text-sm font-semibold text-darknavy"
							>
								Remarks
							</label>
							<textarea
								id={MaterialRequestFieldIds.remarks}
								value={values.remarks}
								readOnly={isReadonly}
								maxLength={RemarksLimit}
								onChange={(event) =>
									updateField("remarks", event.target.value)
								}
								rows={4}
								className={fieldClassName("mt-2 min-h-28 py-2")}
							/>
							<p className="mt-1 text-xs font-medium text-darknavy/55">
								Characters remaining: {remainingRemarks}
							</p>
						</div>
					</div>

					<div className="grid content-start gap-4">
						<Field
							error={errors.requestNo}
							id={MaterialRequestFieldIds.requestNo}
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
							id={MaterialRequestFieldIds.documentDate}
							isRequired
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
			<PartyManagementDrawer
				key={partyDrawerKey}
				isOpen={!isReadonly && isPartyDrawerOpen}
				isPending={isPartyMutating}
				records={partyRecords}
				onAddRecord={addPartyRecord}
				onClose={() => setIsPartyDrawerOpen(false)}
				onCreateParty={(record) => {
					updateField("vceCode", record.partyCodeNo);
					updateField("vceName", getPartyDisplayName(record));
				}}
			/>
		</>
	);
}

const RemarksLimit = 500;
const MaterialRequestFieldIds = {
	documentDate: "material-request-document-date",
	fromWarehouse: "material-request-from-warehouse",
	partyMember: "material-request-party-member",
	referenceModule: "material-request-reference-module",
	referenceNo: "material-request-reference-no",
	remarks: "material-request-remarks",
	requestNo: "material-request-request-no",
	status: "material-request-status",
	toWarehouse: "material-request-to-warehouse",
} as const;
const ReferenceModuleDropdownOptions: AppAdvancedDropdownOption[] =
	GlobalReferenceModuleOptions.filter((option) => option !== "").map(
		(option) => ({
			name: option,
			value: option,
		}),
	);

type FieldProps = {
	error?: string;
	id: string;
	isRequired?: boolean;
	label: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	type?: string;
	value: string;
};

function WarehouseDropdownField({
	error,
	id,
	isReadonly,
	isRequired = false,
	label,
	onAddWarehouse,
	onChange,
	options,
	value,
}: {
	error?: string;
	id: string;
	isReadonly: boolean;
	isRequired?: boolean;
	label: string;
	onAddWarehouse: () => void;
	onChange: (value: string) => void;
	options: AppAdvancedDropdownOption[];
	value: string;
}) {
	const errorId = error ? `${id}-error` : undefined;
	const labelId = `${id}-label`;

	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel id={labelId} htmlFor={id} isRequired={isRequired}>
				{label}
			</FieldLabel>
			<div>
				<div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
					<AppAdvancedDropdown
						aria-describedby={errorId}
						aria-invalid={Boolean(error)}
						aria-labelledby={labelId}
						id={id}
						options={options}
						placeholder="Select warehouse"
						readOnly={isReadonly}
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
				{error ? <ErrorText id={errorId} message={error} /> : null}
			</div>
		</div>
	);
}

function PartyNameField({
	errors,
	isReadonly,
	onAddParty,
	options,
	updateField,
	values,
}: {
	errors: MaterialRequestFormErrors;
	isReadonly: boolean;
	onAddParty: () => void;
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

	const errorId =
		errors.vceCode || errors.vceName
			? `${MaterialRequestFieldIds.partyMember}-error`
			: undefined;
	const labelId = `${MaterialRequestFieldIds.partyMember}-label`;

	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel
				id={labelId}
				htmlFor={MaterialRequestFieldIds.partyMember}
				isRequired
			>
				Party Member
			</FieldLabel>
			<div>
				<div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
					<AppAdvancedDropdown
						aria-describedby={errorId}
						aria-invalid={Boolean(errorId)}
						aria-labelledby={labelId}
						id={MaterialRequestFieldIds.partyMember}
						options={options}
						placeholder="Select party member"
						readOnly={isReadonly}
						searchPlaceholder="Search party member"
						showSelectedDetails
						value={values.vceCode}
						onChange={(value) => applyParty(String(value))}
					/>
					<button
						type="button"
						disabled={isReadonly}
						onClick={onAddParty}
						className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-skyblue/25 bg-white px-4 text-sm font-semibold text-skyblue shadow-sm transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15 disabled:cursor-not-allowed disabled:opacity-45"
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add
					</button>
				</div>
				{errors.vceCode ? (
					<ErrorText id={errorId} message={errors.vceCode} />
				) : null}
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
	const hasReferenceModule = Boolean(moduleValue);

	function handleModuleChange(value: string | string[]) {
		const nextValue = Array.isArray(value) ? (value[0] ?? "") : value;

		onModuleChange(nextValue);

		if (!nextValue) {
			onReferenceNoChange("");
		}
	}

	const labelId = `${MaterialRequestFieldIds.referenceModule}-label`;

	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel
				id={labelId}
				htmlFor={MaterialRequestFieldIds.referenceModule}
				isRequired={false}
			>
				Reference
			</FieldLabel>
			<div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
				<AppAdvancedDropdown
					aria-labelledby={labelId}
					className="[&_.app-advanced-dropdown-control]:rounded-r-none [&_.app-advanced-dropdown-control]:border-r-0 [&_.app-advanced-dropdown-control]:bg-white [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-menu]:min-w-64"
					id={MaterialRequestFieldIds.referenceModule}
					isClearable
					options={ReferenceModuleDropdownOptions}
					placeholder=""
					readOnly={isReadonly}
					searchPlaceholder="Search modules"
					showSelectionIndicator={false}
					value={moduleValue}
					onChange={handleModuleChange}
				/>
				<input
					id={MaterialRequestFieldIds.referenceNo}
					type="text"
					value={referenceNo}
					disabled={!hasReferenceModule}
					readOnly={isReadonly || !hasReferenceModule}
					placeholder={hasReferenceModule ? "Reference number" : ""}
					aria-label="Reference number"
					onChange={(event) => onReferenceNoChange(event.target.value)}
					className={fieldClassName(
						"min-w-0 truncate rounded-l-none bg-white focus:z-10 disabled:cursor-not-allowed disabled:bg-offwhite/65 disabled:text-darknavy/45",
					)}
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
	const errorId = error ? `${MaterialRequestFieldIds.status}-error` : undefined;

	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel
				htmlFor={MaterialRequestFieldIds.status}
				isRequired={false}
			>
				Status
			</FieldLabel>
			<div>
				<input
					id={MaterialRequestFieldIds.status}
					type="text"
					value={status}
					readOnly
					className={fieldClassName()}
					aria-describedby={errorId}
					aria-invalid={Boolean(error)}
				/>
				{error ? <ErrorText id={errorId} message={error} /> : null}
			</div>
		</div>
	);
}

function Field({
	error,
	id,
	isRequired = false,
	label,
	onChange,
	readOnly,
	type = "text",
	value,
}: FieldProps) {
	const errorId = error ? `${id}-error` : undefined;

	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel htmlFor={id} isRequired={isRequired}>
				{label}
			</FieldLabel>
			<div>
				<input
					id={id}
					type={type}
					value={value}
					readOnly={readOnly}
					aria-describedby={errorId}
					aria-invalid={Boolean(error)}
					onChange={(event) => onChange(event.target.value)}
					className={fieldClassName()}
				/>
				{error ? <ErrorText id={errorId} message={error} /> : null}
			</div>
		</div>
	);
}

function FieldLabel({
	children,
	htmlFor,
	id,
	isRequired,
}: {
	children: string;
	htmlFor: string;
	id?: string;
	isRequired: boolean;
}) {
	return (
		<label
			id={id}
			htmlFor={htmlFor}
			className="pt-2 text-sm font-semibold text-darknavy"
		>
			{children}
			{isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
		</label>
	);
}

function fieldClassName(extraClassName?: string) {
	return joinClasses(
		"app-data-entry-field h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy",
		extraClassName,
	);
}

function ErrorText({ id, message }: { id?: string; message: string }) {
	return (
		<p id={id} className="mt-1.5 text-xs font-semibold text-coralpink">
			{message}
		</p>
	);
}

function includeCurrentWarehouseOptions(
	options: AppAdvancedDropdownOption[],
	values: string[],
) {
	const optionByValue = new Map(options.map((option) => [option.value, option]));

	values.forEach((value) => {
		const normalizedValue = value.trim();

		if (!normalizedValue || optionByValue.has(normalizedValue)) {
			return;
		}

		optionByValue.set(normalizedValue, {
			description: "Saved warehouse value",
			name: normalizedValue,
			value: normalizedValue,
		});
	});

	return Array.from(optionByValue.values());
}
