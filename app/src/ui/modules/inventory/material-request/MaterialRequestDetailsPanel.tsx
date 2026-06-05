"use client";

import {
	useMemo,
	useState,
	type ChangeEvent,
	type FormEvent,
} from "react";
import { Plus } from "lucide-react";
import { PartyTypeOptions } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
	PartyInformationInitialFormValues,
	createPartyInformationRecord,
	getPartyAtcCodeOptionsByClassification,
	getPartyDisplayName,
	isKnownPartyType,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import { usePhilippineAddressOptions } from "@/app/src/hooks/shared/address/ph/usePhilippineAddressOptions";
import { useWarehouseManagementStore } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseManagement";
import type {
	MaterialRequestFormErrors,
	MaterialRequestFormValues,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import type {
	PartyAddress,
	PartyInformationFormErrors,
	PartyInformationFormValues,
	PartyInformationRecord,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import type { WarehouseActionMode } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { validatePartyInformationForm } from "@/app/src/validations/modules/maintenance/party-management/PartyManagementValidation";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { PartyInformationDetailsFields } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationDetailsFields";
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
							onAddParty={openPartyDrawer}
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
			<MaterialRequestPartyDrawer
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

const ReferenceModuleOptions = [
	"",
	"Purchase Request",
	"Pick List",
	"Goods Issue",
	"Job Order",
	"Project",
] as const;
const RemarksLimit = 500;
const PartyDrawerFormId = "material-request-party-drawer-form";

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
				{error ? <ErrorText message={error} /> : null}
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

	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<FieldLabel isRequired>Party Member</FieldLabel>
			<div>
				<div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
					<AppAdvancedDropdown
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
				{errors.vceCode ? <ErrorText message={errors.vceCode} /> : null}
				{errors.vceName ? <ErrorText message={errors.vceName} /> : null}
			</div>
		</div>
	);
}

function MaterialRequestPartyDrawer({
	isOpen,
	isPending,
	onAddRecord,
	onClose,
	onCreateParty,
	records,
}: {
	isOpen: boolean;
	isPending: boolean;
	onAddRecord: (record: PartyInformationRecord) => void;
	onClose: () => void;
	onCreateParty: (record: PartyInformationRecord) => void;
	records: PartyInformationRecord[];
}) {
	const [values, setValues] = useState<PartyInformationFormValues>(() =>
		createPartyDrawerInitialValues(records),
	);
	const [errors, setErrors] = useState<PartyInformationFormErrors>({});
	const addressOptions = usePhilippineAddressOptions({
		cityMunicipalityCode: values.address.cityMunicipalityCode,
		provinceCode: values.address.provinceCode,
		regionCode: values.address.regionCode,
	});
	const isClassificationSelected = Boolean(values.classification);
	const atcOptions = useMemo(
		() => getPartyAtcCodeOptionsByClassification(values.classification),
		[values.classification],
	);

	function updateField<TKey extends keyof PartyInformationFormValues>(
		field: TKey,
		value: PartyInformationFormValues[TKey],
	) {
		setValues((current) => {
			if (field === "classification") {
				return {
					...current,
					classification: value as PartyInformationFormValues["classification"],
					partyName: "",
					tradingName: "",
					firstName: "",
					middleName: "",
					lastName: "",
					suffixName: "",
					atcCode: "",
				};
			}

			return {
				...current,
				[field]: value,
			};
		});
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function updateAddressField(field: keyof PartyAddress, value: string) {
		if (!isClassificationSelected) {
			return;
		}

		setValues((current) => ({
			...current,
			address: {
				...current.address,
				[field]: value,
			},
		}));
	}

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) {
		const field = event.target.name as keyof PartyInformationFormValues;
		const value =
			field === "tin"
				? FormatTinNumber(event.target.value)
				: field === "contactNo"
					? FormatPhilippineContactNumber(event.target.value)
					: event.target.value;

		updateField(field, value as never);
	}

	function handleAddressInputChange(event: ChangeEvent<HTMLInputElement>) {
		updateAddressField(event.target.name as keyof PartyAddress, event.target.value);
	}

	function handlePartyTypesChange(value: string | string[]) {
		const selectedValues = Array.isArray(value) ? value : [value];
		const partyTypes = selectedValues.filter(isKnownPartyType);

		setValues((current) => ({
			...current,
			partyTypes,
		}));
		setErrors((current) => ({ ...current, partyTypes: undefined }));
	}

	function selectAtcCode(value: string | string[]) {
		if (!isClassificationSelected) {
			return;
		}

		setValues((current) => ({
			...current,
			atcCode: getSingleSelectedValue(value),
		}));
		setErrors((current) => ({ ...current, atcCode: undefined }));
	}

	function selectRegion(value: string | string[]) {
		if (!isClassificationSelected) {
			return;
		}

		const code = getSingleSelectedValue(value);
		const option = addressOptions.regionOptions.find(
			(region) => region.value === code,
		);

		setValues((current) => ({
			...current,
			address: {
				...current.address,
				barangay: "",
				barangayCode: "",
				cityMunicipality: "",
				cityMunicipalityCode: "",
				province: "",
				provinceCode: "",
				region: option?.name ?? "",
				regionCode: code,
			},
		}));
		clearAddressErrors([
			"regionCode",
			"provinceCode",
			"cityMunicipalityCode",
			"barangayCode",
		]);
	}

	function selectProvince(value: string | string[]) {
		if (!isClassificationSelected) {
			return;
		}

		const code = getSingleSelectedValue(value);
		const option = addressOptions.provinceOptions.find(
			(province) => province.value === code,
		);

		setValues((current) => ({
			...current,
			address: {
				...current.address,
				barangay: "",
				barangayCode: "",
				cityMunicipality: "",
				cityMunicipalityCode: "",
				province: option?.name ?? "",
				provinceCode: code,
			},
		}));
		clearAddressErrors(["provinceCode", "cityMunicipalityCode", "barangayCode"]);
	}

	function selectCityMunicipality(value: string | string[]) {
		if (!isClassificationSelected) {
			return;
		}

		const code = getSingleSelectedValue(value);
		const option = addressOptions.cityMunicipalityOptions.find(
			(cityMunicipality) => cityMunicipality.value === code,
		);

		setValues((current) => ({
			...current,
			address: {
				...current.address,
				barangay: "",
				barangayCode: "",
				cityMunicipality: option?.name ?? "",
				cityMunicipalityCode: code,
			},
		}));
		clearAddressErrors(["cityMunicipalityCode", "barangayCode"]);
	}

	function selectBarangay(value: string | string[]) {
		if (!isClassificationSelected) {
			return;
		}

		const code = getSingleSelectedValue(value);
		const option = addressOptions.barangayOptions.find(
			(barangay) => barangay.value === code,
		);

		setValues((current) => ({
			...current,
			address: {
				...current.address,
				barangay: option?.name ?? "",
				barangayCode: code,
			},
		}));
		clearAddressErrors(["barangayCode"]);
	}

	function clearAddressErrors(fields: (keyof PartyInformationFormErrors)[]) {
		setErrors((current) => {
			const nextErrors = { ...current };

			for (const field of fields) {
				nextErrors[field] = undefined;
			}

			return nextErrors;
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validatePartyInformationForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		const record = createPartyInformationRecord(values);

		onAddRecord(record);
		onCreateParty(record);
		onClose();
	}

	return (
		<ModuleDrawer
			description="Create a party code from the party-management fields, then use it on this material request."
			footer={
				<div className="flex flex-wrap justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						className={moduleDrawerSecondaryActionClassName}
					>
						Cancel
					</button>
					<button
						type="submit"
						form={PartyDrawerFormId}
						disabled={isPending}
						className={moduleDrawerPrimaryActionClassName}
					>
						Save Party
					</button>
				</div>
			}
			isOpen={isOpen}
			maxWidthClassName="max-w-5xl"
			onClose={onClose}
			title="Add Party Code"
		>
			<form
				id={PartyDrawerFormId}
				onSubmit={handleSubmit}
				noValidate
				className="px-6 py-5"
			>
				<PartyInformationDetailsFields
					addressOptions={addressOptions}
					atcOptions={atcOptions}
					errors={errors}
					isClassificationSelected={isClassificationSelected}
					isReadonly={false}
					partyTypeOptions={PartyTypeOptions}
					values={values}
					onAddressInputChange={handleAddressInputChange}
					onInputChange={handleInputChange}
					onPartyTypesChange={handlePartyTypesChange}
					onSelectBarangay={selectBarangay}
					onSelectAtcCode={selectAtcCode}
					onSelectCityMunicipality={selectCityMunicipality}
					onSelectProvince={selectProvince}
					onSelectRegion={selectRegion}
					onUpdateField={updateField}
				/>
			</form>
		</ModuleDrawer>
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
				<input
					type="text"
					value={status}
					readOnly
					className={fieldClassName()}
					aria-label="Status"
				/>
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
		"app-data-entry-field h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy",
		extraClassName,
	);
}

function ErrorText({ message }: { message: string }) {
	return <p className="mt-1.5 text-xs font-semibold text-coralpink">{message}</p>;
}

function createPartyDrawerInitialValues(
	records: PartyInformationRecord[],
): PartyInformationFormValues {
	return {
		...PartyInformationInitialFormValues,
		partyCodeNo: createNextPartyCode(records),
		status: "Active",
	};
}

function createNextPartyCode(records: PartyInformationRecord[]) {
	const nextNumber =
		records.reduce((highest, record) => {
			const match = record.partyCodeNo.match(/(\d+)$/);
			const number = match ? Number.parseInt(match[1], 10) : Number.NaN;

			return Number.isFinite(number) ? Math.max(highest, number) : highest;
		}, 0) + 1;

	return `PTY-${nextNumber.toString().padStart(4, "0")}`;
}

function getSingleSelectedValue(value: string | string[]) {
	return Array.isArray(value) ? (value[0] ?? "") : value;
}

const moduleDrawerSecondaryActionClassName =
	"inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15";

const moduleDrawerPrimaryActionClassName =
	"theme-accent-contrast-text inline-flex h-10 items-center justify-center rounded-md bg-skyblue px-4 text-sm font-semibold shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45";
