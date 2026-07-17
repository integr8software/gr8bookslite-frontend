"use client";

import {
	useMemo,
	useState,
} from "react";
import { Plus } from "lucide-react";
import {
	getPartyDisplayName,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import { useWarehousesStore } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouses";
import type {
	MaterialRequestFormErrors,
	MaterialRequestFormValues,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import type { WarehouseActionMode } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { PartyManagementDrawer } from "@/app/src/ui/modules/maintenance/party-management/PartyManagementDrawer";
import { WarehouseDrawer } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseDrawer";

type MaterialRequestDetailsPanelProps = {
	errors: MaterialRequestFormErrors;
	isReadonly: boolean;
	section: MaterialRequestDetailsSection;
	updateField: <TKey extends keyof MaterialRequestFormValues>(
		field: TKey,
		value: MaterialRequestFormValues[TKey],
	) => void;
	values: MaterialRequestFormValues;
};

export type MaterialRequestDetailsSection = "references" | "request" | "vendor";

export function MaterialRequestDetailsPanel({
	errors,
	isReadonly,
	section,
	updateField,
	values,
}: MaterialRequestDetailsPanelProps) {
	const { warehouses } = useWarehousesStore();
	const {
		addRecord: addPartyRecord,
		isMutating: isPartyMutating,
		records: partyRecords,
	} = usePartyManagementStore();
	const [isWarehouseDrawerOpen, setIsWarehouseDrawerOpen] = useState(false);
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
				[values.toWarehouse],
			),
		[values.toWarehouse, warehouses],
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
				{section === "request" ? (
					<div className="grid gap-x-10 gap-y-5 xl:grid-cols-2">
						<div className="grid content-start gap-4">
							<WarehouseDropdownField
								error={errors.toWarehouse}
								id={MaterialRequestFieldIds.toWarehouse}
								isReadonly={isReadonly}
								isRequired
								label="Warehouse"
								value={values.toWarehouse}
								options={warehouseOptions}
								onAddWarehouse={() => setIsWarehouseDrawerOpen(true)}
								onChange={(value) => updateField("toWarehouse", value)}
							/>
							<Field
								error={errors.department}
								id={MaterialRequestFieldIds.department}
								isRequired
								label="Requestor"
								value={values.department}
								readOnly={isReadonly}
								onChange={(value) => updateField("department", value)}
							/>
						</div>
						<div className="grid content-start gap-4">
							<Field
								error={errors.requestNo}
								id={MaterialRequestFieldIds.requestNo}
								isRequired
								label="MR No."
								value={values.requestNo}
								readOnly={isReadonly}
								onChange={(value) => updateField("requestNo", value)}
							/>
							<Field
								error={errors.documentDate}
								id={MaterialRequestFieldIds.documentDate}
								label="Document Date"
								isRequired
								type="date"
								value={values.documentDate}
								readOnly={isReadonly}
								onChange={(value) => updateField("documentDate", value)}
							/>
							<StatusField error={errors.status} status={values.status} />
						</div>
					</div>
				) : null}

				{section === "vendor" ? (
					<div className="grid gap-x-10 gap-y-5 xl:grid-cols-2">
						<div className="grid content-start gap-4">
							<PartyNameField
								errors={errors}
								isReadonly={isReadonly}
								options={partyOptions}
								values={values}
								onAddParty={openPartyDrawer}
								updateField={updateField}
							/>
							<Field
								error={errors.vceCode}
								id={MaterialRequestFieldIds.vceCode}
								isRequired
								label="Party Code"
								value={values.vceCode}
								readOnly={isReadonly}
								onChange={(value) => updateField("vceCode", value)}
							/>
							<Field
								error={errors.vceName}
								id={MaterialRequestFieldIds.vceName}
								isRequired
								label="Party Name"
								value={values.vceName}
								readOnly={isReadonly}
								onChange={(value) => updateField("vceName", value)}
							/>
						</div>
						<div className="grid content-start gap-4">
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
					</div>
				) : null}

				{section === "references" ? (
					<div className="grid gap-x-10 gap-y-5 xl:grid-cols-2">
						<div className="grid content-start gap-4">
							<Field
								error={errors.referenceNo}
								id={MaterialRequestFieldIds.referenceNo}
								label="Reference No"
								value={values.referenceNo}
								readOnly={isReadonly}
								onChange={(value) => updateField("referenceNo", value)}
							/>
							<Field
								error={errors.requiredDate}
								id={MaterialRequestFieldIds.requiredDate}
								label="Required Date"
								type="date"
								value={values.requiredDate}
								readOnly={isReadonly}
								onChange={(value) => updateField("requiredDate", value)}
							/>
						</div>
						<div className="grid content-start gap-4">
							<Field
								error={errors.projectRef}
								id={MaterialRequestFieldIds.projectRef}
								label="ProjectRef."
								value={values.projectRef}
								readOnly={isReadonly}
								onChange={(value) => updateField("projectRef", value)}
							/>
							<Field
								error={errors.projectName}
								id={MaterialRequestFieldIds.projectName}
								label="ProjectName"
								value={values.projectName}
								readOnly={isReadonly}
								onChange={(value) => updateField("projectName", value)}
							/>
						</div>
					</div>
				) : null}
			</div>

			<WarehouseDrawer
				isOpen={isWarehouseDrawerOpen}
				mode={"add" satisfies WarehouseActionMode}
				onClose={() => setIsWarehouseDrawerOpen(false)}
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
const AttachedDropdownClassName =
	"sm:[&_.app-advanced-dropdown-control]:rounded-r-none";
const AttachedAddButtonClassName =
	"inline-flex h-11 w-20 shrink-0 items-center justify-center gap-2 rounded-lg border border-darknavy/10 border-l-darknavy/20 bg-skyblue/8 px-3 text-sm font-semibold text-skyblue transition hover:border-skyblue/25 hover:bg-skyblue/12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15 disabled:cursor-not-allowed disabled:opacity-45 sm:rounded-l-none";
const MaterialRequestFieldIds = {
	department: "material-request-department",
	documentDate: "material-request-document-date",
	partyName: "material-request-party-member",
	projectName: "material-request-project-name",
	projectRef: "material-request-project-ref",
	referenceNo: "material-request-reference-no",
	remarks: "material-request-remarks",
	requestNo: "material-request-request-no",
	requiredDate: "material-request-required-date",
	status: "material-request-status",
	toWarehouse: "material-request-to-warehouse",
	vceCode: "material-request-vce-code",
	vceName: "material-request-vce-name",
} as const;

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
				<div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
					<AppAdvancedDropdown
						aria-describedby={errorId}
						aria-invalid={Boolean(error)}
						aria-labelledby={labelId}
						className={AttachedDropdownClassName}
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
						className={AttachedAddButtonClassName}
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
			? `${MaterialRequestFieldIds.partyName}-error`
			: undefined;
	const labelId = `${MaterialRequestFieldIds.partyName}-label`;

	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel
				id={labelId}
				htmlFor={MaterialRequestFieldIds.partyName}
				isRequired
			>
				Requestor
			</FieldLabel>
			<div>
				<div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
					<AppAdvancedDropdown
						aria-describedby={errorId}
						aria-invalid={Boolean(errorId)}
						aria-labelledby={labelId}
						className={AttachedDropdownClassName}
						id={MaterialRequestFieldIds.partyName}
						options={options}
						placeholder="Select Party Name"
						readOnly={isReadonly}
						searchPlaceholder="Search Party Name"
						showSelectedDetails
						value={values.vceCode}
						onChange={(value) => applyParty(String(value))}
					/>
					<button
						type="button"
						disabled={isReadonly}
						onClick={onAddParty}
						className={AttachedAddButtonClassName}
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
