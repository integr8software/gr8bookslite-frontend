import { useState } from "react";
import type {
	ChangeEventHandler,
	MouseEvent as ReactMouseEvent,
	ReactNode,
} from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { AppSearchSuggestions } from "@/app/src/ui/shared/search-suggestions/AppSearchSuggestions";

type PartyAddressOptionSet = {
	barangayOptions: AppAdvancedDropdownOption[];
	cityMunicipalityOptions: AppAdvancedDropdownOption[];
	isBarangaysLoading: boolean;
	isCitiesMunicipalitiesLoading: boolean;
	isProvincesLoading: boolean;
	isRegionsLoading: boolean;
	provinceOptions: AppAdvancedDropdownOption[];
	regionOptions: AppAdvancedDropdownOption[];
	requiresProvince: boolean;
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
	onSelectBarangay,
	onSelectAtcCode,
	onSelectCityMunicipality,
	onSelectProvince,
	onSelectRegion,
	onSelectAddress,
	onUpdateField,
	onSetDefaultAddress,
	onSelectTerm,
	onUpdateAddressMeta,
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
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onAddAddress: () => void;
	onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
	onPartyTypesChange: (value: string | string[]) => void;
	onRemoveAddress: (addressId: string) => void;
	onSelectAtcCode: (value: string | string[]) => void;
	onSelectBarangay: (value: string | string[]) => void;
	onSelectCityMunicipality: (value: string | string[]) => void;
	onSelectProvince: (value: string | string[]) => void;
	onSelectRegion: (value: string | string[]) => void;
	onSelectAddress: (addressId: string) => void;
	onUpdateField: <TKey extends keyof PartyInformationFormValues>(
		field: TKey,
		value: PartyInformationFormValues[TKey],
	) => void;
	onSetDefaultAddress: (addressId: string) => void;
	onSelectTerm: (value: string | string[]) => void;
	onUpdateAddressMeta: (
		addressId: string,
		field: "addressName" | "isBilling" | "isDelivery",
		value: string | boolean,
	) => void;
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
								removeSelectionOnSelectedOptionClick={false}
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
									onUpdateField(
										"contactNo",
										DefaultPhilippineContactNumber,
									);
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
					disabled={isDetailsDisabled}
					errors={errors}
					options={addressOptions}
					title="Address"
					onAddAddress={onAddAddress}
					onAddressInputChange={onAddressInputChange}
					onRemoveAddress={onRemoveAddress}
					onSelectBarangay={onSelectBarangay}
					onSelectCityMunicipality={onSelectCityMunicipality}
					onSelectProvince={onSelectProvince}
					onSelectRegion={onSelectRegion}
					onSelectAddress={onSelectAddress}
					onSetDefaultAddress={onSetDefaultAddress}
					onUpdateAddressMeta={onUpdateAddressMeta}
				/>

				<div className="grid gap-4">
					<SectionHeading title="Tax Information" />
					<div className="grid gap-4 lg:grid-cols-3">
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
						<Field label="Terms">
							<AppAdvancedDropdown
								disabled={isDetailsDisabled}
								emptyMessage="No active terms found."
								options={termOptions}
								placeholder="Select terms"
								searchPlaceholder="Search terms"
								value={values.termId}
								onChange={onSelectTerm}
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

	if (!isCustomer && !isVendor && !isEmployee) {
		return null;
	}

	return (
		<div className="grid gap-4 md:grid-cols-2">
			{isCustomer ? (
				<Field
					label="Default Receivable Account"
					error={errors.defaultReceivableAccount}
					required
				>
					<ChartAccountDropdown
						accounts={accountOptions}
						disabled={disabled}
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
					required
				>
					<ChartAccountDropdown
						accounts={accountOptions}
						disabled={disabled}
						value={values.defaultPayableAccount}
						onChange={(value) => onUpdateField("defaultPayableAccount", value)}
					/>
				</Field>
			) : null}
			{isEmployee ? (
				<>
					<Field
						label="Employee Receivable Account"
						error={errors.employeeReceivableAccount}
						required
					>
						<ChartAccountDropdown
							accounts={accountOptions}
							disabled={disabled}
							value={values.employeeReceivableAccount}
							onChange={(value) =>
								onUpdateField("employeeReceivableAccount", value)
							}
						/>
					</Field>
					<Field
						label="Employee Advance Account"
						error={errors.employeeAdvanceAccount}
						required
					>
						<ChartAccountDropdown
							accounts={accountOptions}
							disabled={disabled}
							value={values.employeeAdvanceAccount}
							onChange={(value) =>
								onUpdateField("employeeAdvanceAccount", value)
							}
						/>
					</Field>
				</>
			) : null}
		</div>
	);
}

function AddressSection({
	address,
	addresses,
	disabled,
	errors,
	options,
	title,
	onAddAddress,
	onAddressInputChange,
	onRemoveAddress,
	onSelectBarangay,
	onSelectCityMunicipality,
	onSelectProvince,
	onSelectRegion,
	onSelectAddress,
	onSetDefaultAddress,
	onUpdateAddressMeta,
}: {
	address: PartyAddress;
	addresses: PartyAddress[];
	disabled: boolean;
	errors: PartyInformationFormErrors;
	options: PartyAddressOptionSet;
	title: string;
	onAddAddress: () => void;
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onRemoveAddress: (addressId: string) => void;
	onSelectBarangay: (value: string | string[]) => void;
	onSelectCityMunicipality: (value: string | string[]) => void;
	onSelectProvince: (value: string | string[]) => void;
	onSelectRegion: (value: string | string[]) => void;
	onSelectAddress: (addressId: string) => void;
	onSetDefaultAddress: (addressId: string) => void;
	onUpdateAddressMeta: (
		addressId: string,
		field: "addressName" | "isBilling" | "isDelivery",
		value: string | boolean,
	) => void;
}) {
	const isProvinceDisabled =
		disabled ||
		!address.regionCode ||
		options.isProvincesLoading ||
		(!options.requiresProvince && options.provinceOptions.length === 0);
	const isCityMunicipalityDisabled =
		disabled ||
		!address.regionCode ||
		options.isCitiesMunicipalitiesLoading ||
		(options.requiresProvince && !address.provinceCode);
	const isBarangayDisabled =
		disabled || !address.cityMunicipalityCode || options.isBarangaysLoading;

	return (
		<div className="grid gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<SectionHeading title={title} />
				<button
					type="button"
					disabled={disabled}
					onClick={onAddAddress}
					className="inline-flex h-10 items-center gap-2 rounded-md border border-darknavy/10 px-3 text-sm font-semibold text-darknavy transition hover:bg-skyblue/10 disabled:cursor-not-allowed disabled:opacity-45"
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add Address
				</button>
			</div>
			{errors.addresses ? (
				<span className="text-xs font-medium text-coralpink">
					{errors.addresses}
				</span>
			) : null}
			<AddressSelector
				activeAddressId={address.id}
				addresses={addresses}
				disabled={disabled}
				onRemoveAddress={onRemoveAddress}
				onSelectAddress={onSelectAddress}
			/>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<AddressInput
					disabled={disabled}
					label="Address Name"
					name="addressName"
					placeholder="Main office"
					value={address.addressName}
					onChange={onAddressInputChange}
				/>
				<div className="grid gap-2">
					<span className="mb-2 block text-sm font-semibold text-darknavy">
						Classifications
					</span>
					<div className="flex h-11 items-center gap-3 rounded-lg border border-darknavy/10 bg-white px-3">
						<label className="flex items-center gap-2 text-sm font-medium text-darknavy/75">
							<input
								type="checkbox"
								checked={address.isDefault}
								disabled={disabled || address.isDefault}
								onChange={() => onSetDefaultAddress(address.id)}
							/>
							Default
						</label>
						<label className="flex items-center gap-2 text-sm font-medium text-darknavy/75">
							<input
								type="checkbox"
								checked={address.isBilling}
								disabled={disabled}
								onChange={(event) =>
									onUpdateAddressMeta(
										address.id,
										"isBilling",
										event.target.checked,
									)
								}
							/>
							Billing
						</label>
						<label className="flex items-center gap-2 text-sm font-medium text-darknavy/75">
							<input
								type="checkbox"
								checked={address.isDelivery}
								disabled={disabled}
								onChange={(event) =>
									onUpdateAddressMeta(
										address.id,
										"isDelivery",
										event.target.checked,
									)
								}
							/>
							Delivery
						</label>
					</div>
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Field label="Region" error={errors.regionCode} required>
					<AppAdvancedDropdown
						disabled={disabled || options.isRegionsLoading}
						options={options.regionOptions}
						placeholder={
							options.isRegionsLoading ? "Loading regions" : "Select region"
						}
						searchPlaceholder="Search region"
						value={address.regionCode}
						onChange={onSelectRegion}
					/>
				</Field>
				<Field label="Province" error={errors.provinceCode} required>
					<AppAdvancedDropdown
						disabled={isProvinceDisabled}
						options={options.provinceOptions}
						placeholder={
							!address.regionCode
								? "Select region first"
								: options.isProvincesLoading
									? "Loading provinces"
									: options.requiresProvince
										? "Select province"
										: "No province required"
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
							!address.regionCode
								? "Select region first"
								: options.requiresProvince && !address.provinceCode
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

function AddressSelector({
	activeAddressId,
	addresses,
	disabled,
	onRemoveAddress,
	onSelectAddress,
}: {
	activeAddressId: string;
	addresses: PartyAddress[];
	disabled: boolean;
	onRemoveAddress: (addressId: string) => void;
	onSelectAddress: (addressId: string) => void;
}) {
	const [query, setQuery] = useState("");
	const activeAddress = addresses.find((address) => address.id === activeAddressId);
	const normalizedQuery = query.trim().toLowerCase();
	const filteredAddresses = normalizedQuery
		? addresses.filter((address) =>
				[
					address.addressName,
					address.addressLine1,
					address.addressLine2,
					address.barangay,
					address.cityMunicipality,
					address.province,
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery),
			)
		: addresses;

	if (addresses.length <= 1) {
		return (
			<div className="rounded-lg border border-darknavy/10 bg-darknavy/[0.025] px-3 py-2 text-sm font-medium text-darknavy/70">
				{activeAddress?.addressName || "Default Address"}
			</div>
		);
	}

	return (
		<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
			<AppSearchSuggestions
				className="max-w-2xl"
				emptyMessage="No address matches."
				getDescription={(address) =>
					[
						address.isDefault ? "Default" : "",
						address.isBilling ? "Billing" : "",
						address.isDelivery ? "Delivery" : "",
					]
						.filter(Boolean)
						.join(", ") || "Additional address"
				}
				getKey={(address) => address.id}
				getTitle={(address) => address.addressName || "Address"}
				inputLabel="Find address"
				items={filteredAddresses}
				maxVisibleItems={4}
				minQueryLength={0}
				placeholder="Find address"
				query={query}
				onQueryChange={setQuery}
				onSelect={(address) => {
					onSelectAddress(address.id);
					setQuery(address.addressName);
				}}
			/>
			<button
				type="button"
				disabled={disabled || addresses.length <= 1}
				onClick={() => onRemoveAddress(activeAddressId)}
				className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-coralpink/25 px-3 text-sm font-semibold text-coralpink transition hover:bg-coralpink/10 disabled:cursor-not-allowed disabled:opacity-45"
			>
				<Trash2 className="h-4 w-4" aria-hidden="true" />
				Remove
			</button>
		</div>
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

		if (
			!(target instanceof Element) ||
			target.closest(fieldControlSelector)
		) {
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
