import {
	type ChangeEventHandler,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
} from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { MaxPartyAddressCount } from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import {
	PartyClassificationOptions,
	PartyInformationStatusOptions,
	VatRegistrationTypeOptions,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
	DefaultPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/contact/ContactData";
import type {
	PartyAddress,
	PartyAtcCodeOption,
	PartyInformationFormErrors,
	PartyInformationFormValues,
	PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppCollapsibleSection } from "@/app/src/ui/shared/app/AppCollapsibleSection";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import type {
	AddressAutocompleteDetails,
	AddressAutocompleteItem,
} from "@/app/src/types/shared/address/AddressTypes";
import { AppAddressAutocomplete } from "@/app/src/ui/shared/address/AppAddressAutocomplete";

type PartyProvinceOption = AppAdvancedDropdownOption & {
	regionCode: string;
	regionName: string;
};

type PartyAddressOptionSet = {
	barangayOptions: AppAdvancedDropdownOption[];
	cityMunicipalityOptions: AppAdvancedDropdownOption[];
	isBarangaysLoading: boolean;
	isCitiesMunicipalitiesLoading: boolean;
	isProvincesLoading: boolean;
	provinceOptions: PartyProvinceOption[];
};

export function PartyInformationDetailsFields({
	atcOptions,
	addressOptions,
	accountOptions,
	errors,
	isClassificationSelected,
	isReadonly,
	partyTypeOptions,
	termOptions,
	values,
	onAddressInputChange,
	onAddAddress,
	onInputChange,
	onPartyTypesChange,
	onRemoveAddress,
	onSelectAddress,
	onSelectBarangay,
	onSelectAtcCode,
	onSelectAutocompleteAddress,
	onSyncAutocompleteAddressDetails,
	onSelectCityMunicipality,
	onSelectProvince,
	onSetDefaultAddress,
	onUpdateAddressMeta,
	onUpdateField,
	onSelectTerm,
}: {
	addressOptions: PartyAddressOptionSet;
	accountOptions: ModuleChartAccount[];
	atcOptions: PartyAtcCodeOption[];
	errors: PartyInformationFormErrors;
	isClassificationSelected: boolean;
	isReadonly: boolean;
	partyTypeOptions: readonly PartyType[];
	termOptions: AppAdvancedDropdownOption[];
	values: PartyInformationFormValues;
	onAddAddress: () => void;
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
	onPartyTypesChange: (value: string | string[]) => void;
	onRemoveAddress: (addressId: string) => void;
	onSelectAddress: (addressId: string) => void;
	onSelectAtcCode: (value: string | string[]) => void;
	onSelectAutocompleteAddress: (
		address: AddressAutocompleteItem,
		details?: AddressAutocompleteDetails,
	) => void;
	onSyncAutocompleteAddressDetails?: (
		details: AddressAutocompleteDetails,
	) => void;
	onSelectBarangay: (value: string | string[]) => void;
	onSelectCityMunicipality: (value: string | string[]) => void;
	onSelectProvince: (value: string | string[]) => void;
	onSetDefaultAddress: (addressId: string) => void;
	onUpdateAddressMeta: (
		addressId: string,
		field: "addressName" | "isBilling" | "isDelivery",
		value: string | boolean,
	) => void;
	onUpdateField: <TKey extends keyof PartyInformationFormValues>(
		field: TKey,
		value: PartyInformationFormValues[TKey],
	) => void;
	onSelectTerm: (value: string | string[]) => void;
}) {
	const isDetailsDisabled = isReadonly || !isClassificationSelected;
	const showBusinessNameFields = values.classification !== "Individual";
	const activeAddress =
		values.addresses.find((address) => address.id === values.activeAddressId) ??
		values.addresses[0] ??
		values.address;
	const partyTypeSelectOptions = partyTypeOptions.map((type) => ({
		name: type,
		value: type,
	}));
	const atcSelectOptions = atcOptions.map((option) => ({
		description: `${option.category}. ${option.description}`,
		label: option.label,
		name: option.code,
		value: option.code,
	}));

	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-6">
				<div className="grid gap-4">
					<SectionHeading title="Basic Information" />
					<div className="grid gap-4 lg:grid-cols-4">
						<Field label="Party Code" error={errors.partyCodeNo} required>
							<input
								name="partyCodeNo"
								value={values.partyCodeNo}
								onChange={onInputChange}
								readOnly={isReadonly}
								className={fieldClassName}
							/>
						</Field>
						<Field
							label="Party Classification"
							error={errors.classification}
							required
						>
							<select
								name="classification"
								disabled={isReadonly}
								value={values.classification}
								onChange={onInputChange}
								className={selectClassName}
							>
								<option value="">--Select Classification--</option>
								{PartyClassificationOptions.map((classification) => (
									<option key={classification} value={classification}>
										{classification}
									</option>
								))}
							</select>
						</Field>
						<Field label="Party Type" error={errors.partyTypes} required>
							<AppAdvancedDropdown
								disabled={isReadonly}
								isSearchable={false}
								options={partyTypeSelectOptions}
								placeholder="Select party type"
								removeSelectionOnSelectedOptionClick
								selectionMode="multiple"
								showSelectionRemoveButton={false}
								value={values.partyTypes}
								onChange={onPartyTypesChange}
							/>
						</Field>
						<Field label="Status" error={errors.status} required>
							<select
								name="status"
								disabled={isReadonly}
								value={values.status}
								onChange={onInputChange}
								className={selectClassName}
							>
								{PartyInformationStatusOptions.map((status) => (
									<option key={status} value={status}>
										{status}
									</option>
								))}
							</select>
						</Field>
					</div>
				</div>

				{showBusinessNameFields ? (
					<div className="grid gap-4 lg:grid-cols-2">
						<Field label="Party Name" error={errors.partyName} required>
							<input
								name="partyName"
								value={values.partyName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
							/>
						</Field>
						<Field label="Trade Name">
							<input
								name="tradeName"
								value={values.tradeName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
							/>
						</Field>
					</div>
				) : null}

				{values.classification === "Individual" ? (
					<div className="grid gap-4 lg:grid-cols-4">
						<Field label="First Name" error={errors.firstName} required>
							<input
								name="firstName"
								value={values.firstName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
							/>
						</Field>
						<Field label="Middle Name">
							<input
								name="middleName"
								value={values.middleName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
							/>
						</Field>
						<Field label="Last Name" error={errors.lastName} required>
							<input
								name="lastName"
								value={values.lastName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
							/>
						</Field>
						<Field label="Suffix">
							<input
								name="suffixName"
								value={values.suffixName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
							/>
						</Field>
					</div>
				) : null}

				<div className="grid gap-4 lg:grid-cols-2">
					<Field label="Email Address" error={errors.email}>
						<input
							name="email"
							type="email"
							value={values.email}
							onChange={onInputChange}
							readOnly={isReadonly}
							disabled={isDetailsDisabled}
							className={fieldClassName}
							placeholder="name@example.com"
						/>
					</Field>
					<Field label="Contact No." error={errors.contactNo}>
						<input
							name="contactNo"
							type="tel"
							inputMode="numeric"
							value={values.contactNo}
							onChange={onInputChange}
							onFocus={() => {
								if (!values.contactNo) {
									onUpdateField("contactNo", DefaultPhilippineContactNumber);
								}
							}}
							readOnly={isReadonly}
							disabled={isDetailsDisabled}
							maxLength={16}
							className={fieldClassName}
							placeholder={PhilippineContactNumberPlaceholder}
						/>
					</Field>
				</div>

				<AddressSection
					address={activeAddress}
					addresses={values.addresses}
					activeAddressId={values.activeAddressId}
					disabled={isDetailsDisabled}
					errors={errors}
					options={addressOptions}
					title="Addresses"
					onAddAddress={onAddAddress}
					onAddressInputChange={onAddressInputChange}
					onRemoveAddress={onRemoveAddress}
					onSelectAddress={onSelectAddress}
					onSelectBarangay={onSelectBarangay}
					onSelectAutocompleteAddress={onSelectAutocompleteAddress}
					onSyncAutocompleteAddressDetails={onSyncAutocompleteAddressDetails}
					onSelectCityMunicipality={onSelectCityMunicipality}
					onSelectProvince={onSelectProvince}
					onSetDefaultAddress={onSetDefaultAddress}
					onUpdateAddressMeta={onUpdateAddressMeta}
				/>

				<div className="grid gap-4">
					<SectionHeading title="Tax Information" />
					<div className="grid gap-4 lg:grid-cols-2">
						<Field label="Tax Identification Number (TIN)" error={errors.tin}>
							<input
								name="tin"
								inputMode="numeric"
								maxLength={15}
								value={values.tin}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
								placeholder="000-000-000-000"
							/>
						</Field>
						<Field label="Default Terms">
							<AppAdvancedDropdown
								disabled={isDetailsDisabled}
								emptyMessage="No Active Terms Found."
								options={termOptions}
								placeholder="Select terms"
								searchPlaceholder="Search Terms"
								value={values.termId}
								onChange={onSelectTerm}
							/>
						</Field>
						<Field label="VAT Registration Type">
							<select
								name="vatRegistrationType"
								disabled={isDetailsDisabled}
								value={values.vatRegistrationType}
								onChange={onInputChange}
								className={selectClassName}
							>
								<option value="">--Select VAT Type--</option>
								{VatRegistrationTypeOptions.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</Field>
						<Field label="BIR ATC Code" error={errors.atcCode}>
							<AppAdvancedDropdown
								disabled={isDetailsDisabled}
								emptyMessage="No ATC codes match the selected classification."
								options={atcSelectOptions}
								placeholder="Select BIR ATC code"
								searchPlaceholder="Search ATC code, label, or description"
								value={values.atcCode}
								onChange={onSelectAtcCode}
							/>
						</Field>
					</div>
					<AccountFields
						accountOptions={accountOptions}
						disabled={isDetailsDisabled}
						errors={errors}
						values={values}
						onUpdateField={onUpdateField}
					/>
				</div>
			</div>
		</section>
	);
}

function AccountFields({
	accountOptions,
	disabled,
	errors,
	values,
	onUpdateField,
}: {
	accountOptions: ModuleChartAccount[];
	disabled: boolean;
	errors: PartyInformationFormErrors;
	values: PartyInformationFormValues;
	onUpdateField: <TKey extends keyof PartyInformationFormValues>(
		field: TKey,
		value: PartyInformationFormValues[TKey],
	) => void;
}) {
	const isCustomer = values.partyTypes.includes("Customer");
	const isVendor = values.partyTypes.includes("Vendor");
	const isEmployee = values.partyTypes.includes("Employee");
	const hasAccountingFields = isCustomer || isVendor || isEmployee;
	const isAccountingDisabled = disabled || !hasAccountingFields;

	return (
		<div className="grid gap-4">
			<div className="h-px bg-darknavy/10" aria-hidden="true" />
			<AppCollapsibleSection
				badge="Advanced"
				description={
					hasAccountingFields
						? "Optional account defaults; system defaults are used when blank."
						: "Select a party type to enable account overrides."
				}
				disabled={isAccountingDisabled}
				title="Accounting"
				contentClassName="grid gap-4 md:grid-cols-2"
			>
				{isCustomer ? (
					<Field
						label="Default Receivable Account"
						error={errors.defaultReceivableAccount}
					>
						<ChartAccountDropdown
							accounts={accountOptions}
							disabled={isAccountingDisabled}
							value={values.defaultReceivableAccount}
							onChange={(value) =>
								onUpdateField("defaultReceivableAccount", value)
							}
						/>
					</Field>
				) : null}
				{isVendor ? (
					<Field
						label="Default Payable Account"
						error={errors.defaultPayableAccount}
					>
						<ChartAccountDropdown
							accounts={accountOptions}
							disabled={isAccountingDisabled}
							value={values.defaultPayableAccount}
							onChange={(value) =>
								onUpdateField("defaultPayableAccount", value)
							}
						/>
					</Field>
				) : null}
				{isEmployee ? (
					<Field label="Default Advance" error={errors.employeeAdvanceAccount}>
						<ChartAccountDropdown
							accounts={accountOptions}
							disabled={isAccountingDisabled}
							value={values.employeeAdvanceAccount}
							onChange={(value) =>
								onUpdateField("employeeAdvanceAccount", value)
							}
						/>
					</Field>
				) : null}
			</AppCollapsibleSection>
		</div>
	);
}

function AddressSection({
	address,
	addresses,
	activeAddressId,
	disabled,
	errors,
	options,
	title,
	onAddAddress,
	onAddressInputChange,
	onRemoveAddress,
	onSelectAddress,
	onSelectBarangay,
	onSelectAutocompleteAddress,
	onSyncAutocompleteAddressDetails,
	onSelectCityMunicipality,
	onSelectProvince,
	onSetDefaultAddress,
	onUpdateAddressMeta,
}: {
	address: PartyAddress;
	addresses: PartyAddress[];
	activeAddressId: string;
	disabled: boolean;
	errors: PartyInformationFormErrors;
	options: PartyAddressOptionSet;
	title: string;
	onAddAddress: () => void;
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onRemoveAddress: (addressId: string) => void;
	onSelectAddress: (addressId: string) => void;
	onSelectBarangay: (value: string | string[]) => void;
	onSelectAutocompleteAddress: (
		address: AddressAutocompleteItem,
		details?: AddressAutocompleteDetails,
	) => void;
	onSyncAutocompleteAddressDetails?: (
		details: AddressAutocompleteDetails,
	) => void;
	onSelectCityMunicipality: (value: string | string[]) => void;
	onSelectProvince: (value: string | string[]) => void;
	onSetDefaultAddress: (addressId: string) => void;
	onUpdateAddressMeta: (
		addressId: string,
		field: "addressName" | "isBilling" | "isDelivery",
		value: string | boolean,
	) => void;
}) {
	const isProvinceDisabled = disabled || options.isProvincesLoading;
	const isCityMunicipalityDisabled =
		disabled || options.isCitiesMunicipalitiesLoading || !address.provinceCode;
	const isBarangayDisabled =
		disabled || !address.cityMunicipalityCode || options.isBarangaysLoading;
	const hasReachedAddressLimit = addresses.length >= MaxPartyAddressCount;

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between gap-3">
				<SectionHeading title={title} />
				{!disabled ? (
					<button
						type="button"
						onClick={onAddAddress}
						disabled={hasReachedAddressLimit}
						title={
							hasReachedAddressLimit
								? `Maximum of ${MaxPartyAddressCount} addresses reached`
								: "Add address"
						}
						className="inline-flex h-9 items-center gap-2 rounded-md border border-darknavy/15 px-3 text-sm font-medium text-darknavy transition hover:border-skyblue hover:bg-skyblue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/30 disabled:cursor-not-allowed disabled:opacity-45"
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add address
					</button>
				) : null}
			</div>
			{errors.addresses ? (
				<span className="text-xs font-medium text-coralpink">
					{errors.addresses}
				</span>
			) : null}
			<div
				className="flex gap-2 overflow-x-auto pb-1"
				role="tablist"
				aria-label="Party addresses"
			>
				{addresses.map((item) => {
					const isActive = item.id === activeAddressId;

					return (
						<button
							key={item.id}
							type="button"
							role="tab"
							aria-selected={isActive}
							onClick={() => onSelectAddress(item.id)}
							className={
								isActive
									? "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-skyblue bg-skyblue/8 px-3 text-sm font-medium text-darknavy"
									: "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-darknavy/10 px-3 text-sm text-darknavy/70 transition hover:border-darknavy/25 hover:text-darknavy"
							}
						>
							<MapPin className="h-4 w-4" aria-hidden="true" />
							<span>{item.addressName}</span>
							<AddressTags address={item} />
						</button>
					);
				})}
			</div>
			<div className="grid gap-4 border-y border-darknavy/10 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
				<Field label="Address label" required>
					<input
						value={address.addressName}
						onChange={(event) =>
							onUpdateAddressMeta(address.id, "addressName", event.target.value)
						}
						readOnly={disabled || address.isDefault}
						className={fieldClassName}
						placeholder="e.g. Head Office"
					/>
				</Field>
				<div className="flex flex-wrap items-center gap-3">
					<label className="inline-flex h-9 min-w-24 items-center gap-2 text-sm text-darknavy">
						<input
							type="radio"
							name="defaultPartyAddress"
							checked={address.isDefault}
							disabled={disabled}
							onChange={() => onSetDefaultAddress(address.id)}
							className="h-4 w-4 accent-skyblue"
						/>
						Default
					</label>
					<AddressTagCheckbox
						checked={address.isBilling}
						disabled={disabled}
						label="Billing"
						onChange={(checked) =>
							onUpdateAddressMeta(address.id, "isBilling", checked)
						}
					/>
					<AddressTagCheckbox
						checked={address.isDelivery}
						disabled={disabled}
						label="Delivery"
						onChange={(checked) =>
							onUpdateAddressMeta(address.id, "isDelivery", checked)
						}
					/>
					{!disabled && addresses.length > 1 ? (
						<button
							type="button"
							onClick={() => onRemoveAddress(address.id)}
							aria-label={`Remove ${address.addressName}`}
							title="Remove address"
							className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
						>
							<Trash2 className="h-4 w-4" aria-hidden="true" />
						</button>
					) : null}
				</div>
			</div>
			<AppAddressAutocomplete
				disabled={disabled}
				id={`party-address-autocomplete-${address.id}`}
				syncDetailsOnQueryChange
				value={address}
				onDetailsChange={onSyncAutocompleteAddressDetails}
				onSelect={onSelectAutocompleteAddress}
			/>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Field label="Province" error={errors.provinceCode} required>
					<AppAdvancedDropdown
						disabled={isProvinceDisabled}
						options={options.provinceOptions}
						placeholder={
							options.isProvincesLoading
								? "Loading provinces"
								: "Select province"
						}
						searchPlaceholder="Search province"
						value={address.provinceCode}
						onChange={onSelectProvince}
					/>
				</Field>
				<Field
					label="City or Municipality"
					error={errors.cityMunicipalityCode}
					required
				>
					<AppAdvancedDropdown
						disabled={isCityMunicipalityDisabled}
						options={options.cityMunicipalityOptions}
						placeholder={
							!address.provinceCode
								? "Select province first"
								: options.isCitiesMunicipalitiesLoading
									? "Loading cities"
									: "Select city or municipality"
						}
						searchPlaceholder="Search city or municipality"
						value={address.cityMunicipalityCode}
						onChange={onSelectCityMunicipality}
					/>
				</Field>
				<Field label="Barangay" error={errors.barangayCode} required>
					<AppAdvancedDropdown
						disabled={isBarangayDisabled}
						options={options.barangayOptions}
						placeholder={
							!address.cityMunicipalityCode
								? "Select city first"
								: options.isBarangaysLoading
									? "Loading barangays"
									: "Select barangay"
						}
						searchPlaceholder="Search barangay"
						value={address.barangayCode}
						onChange={onSelectBarangay}
					/>
				</Field>
				<AddressInput
					disabled={disabled}
					label="Unit, Block, Lot, Building"
					name="addressLine1"
					placeholder="Unit 5B, Block 3, Lot 12"
					value={address.addressLine1}
					onChange={onAddressInputChange}
				/>
				<AddressInput
					disabled={disabled}
					label="Street, Subdivision, Village"
					name="addressLine2"
					placeholder="Mabini St., Greenfield Village"
					value={address.addressLine2}
					onChange={onAddressInputChange}
				/>
			</div>
		</div>
	);
}

function AddressTags({ address }: { address: PartyAddress }) {
	const tags = [
		address.isDefault ? "Default" : null,
		address.isBilling ? "Billing" : null,
		address.isDelivery ? "Delivery" : null,
	].filter(Boolean);

	return tags.length > 0 ? (
		<span className="flex items-center gap-1">
			{tags.map((tag) => (
				<span
					key={tag}
					className="rounded bg-darknavy/7 px-1.5 py-0.5 text-[10px] font-medium text-darknavy/70"
				>
					{tag}
				</span>
			))}
		</span>
	) : null;
}

function AddressTagCheckbox({
	checked,
	disabled,
	label,
	onChange,
}: {
	checked: boolean;
	disabled: boolean;
	label: string;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label className="inline-flex h-9 min-w-24 items-center gap-2 text-sm text-darknavy">
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				onChange={(event) => onChange(event.target.checked)}
				className="h-4 w-4 rounded accent-skyblue"
			/>
			{label}
		</label>
	);
}

function AddressInput({
	disabled,
	label,
	name,
	placeholder,
	value,
	onChange,
}: {
	disabled: boolean;
	label: string;
	name: string;
	placeholder?: string;
	value: string;
	onChange: ChangeEventHandler<HTMLInputElement>;
}) {
	return (
		<Field label={label}>
			<input
				name={name}
				value={value}
				onChange={onChange}
				disabled={disabled}
				className={fieldClassName}
				placeholder={placeholder}
			/>
		</Field>
	);
}

function SectionHeading({
	description,
	title,
}: {
	description?: string;
	title: string;
}) {
	return (
		<div>
			<div className="flex items-center gap-3">
				<h2 className="shrink-0 text-base font-semibold text-darknavy">
					{title}
				</h2>
				<div className="h-px flex-1 bg-darknavy/10" aria-hidden="true" />
			</div>
			{description ? (
				<p className="mt-1 text-sm text-darknavy/55">{description}</p>
			) : null}
		</div>
	);
}

function Field({
	children,
	error,
	label,
	required,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
}) {
	function handleFieldMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
		const target = event.target;

		if (!(target instanceof Element) || target.closest(fieldControlSelector)) {
			return;
		}

		const control =
			event.currentTarget.querySelector<HTMLElement>(fieldControlSelector);

		if (
			!control ||
			control.matches(":disabled") ||
			control.getAttribute("aria-disabled") === "true"
		) {
			return;
		}

		event.preventDefault();
		control.focus();

		if (control.getAttribute("role") === "combobox") {
			control.click();
		}
	}

	return (
		<div onMouseDown={handleFieldMouseDown}>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</div>
	);
}

const fieldClassName =
	"app-disabled-control h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.035] disabled:text-darknavy/35 disabled:placeholder:text-darknavy/32";

const selectClassName = `app-select-control ${fieldClassName}`;

const fieldControlSelector =
	'[role="combobox"], input:not([type="hidden"]), select, textarea, button';
