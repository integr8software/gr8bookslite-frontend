import type { ChangeEventHandler, ReactNode } from "react";
import {
	PartyClassificationOptions,
	VatRegistrationTypeOptions,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import type {
	PartyAddress,
	PartyAtcCodeOption,
	PartyInformationFormErrors,
	PartyInformationFormValues,
	PartyType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

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
	errors,
	isClassificationSelected,
	isReadonly,
	partyTypeOptions,
	values,
	onAddressInputChange,
	onInputChange,
	onPartyTypesChange,
	onSelectBarangay,
	onSelectAtcCode,
	onSelectCityMunicipality,
	onSelectProvince,
	onSelectRegion,
}: {
	addressOptions: PartyAddressOptionSet;
	atcOptions: PartyAtcCodeOption[];
	errors: PartyInformationFormErrors;
	isClassificationSelected: boolean;
	isReadonly: boolean;
	partyTypeOptions: readonly PartyType[];
	values: PartyInformationFormValues;
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
	onPartyTypesChange: (value: string | string[]) => void;
	onSelectAtcCode: (value: string | string[]) => void;
	onSelectBarangay: (value: string | string[]) => void;
	onSelectCityMunicipality: (value: string | string[]) => void;
	onSelectProvince: (value: string | string[]) => void;
	onSelectRegion: (value: string | string[]) => void;
}) {
	const isDetailsDisabled = isReadonly || !isClassificationSelected;
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
		<div className="grid gap-5">
			<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<div className="grid gap-4 lg:grid-cols-3">
					<Field label="Party Code Number">
						<input
							name="partyCodeNo"
							value={values.partyCodeNo}
							readOnly
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
							value={values.classification}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							<option value="">Select classification</option>
							{PartyClassificationOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</Field>
					<Field label="Party Type" error={errors.partyTypes} required>
						<AppAdvancedDropdown
							disabled={isDetailsDisabled}
							isSearchable={false}
							options={partyTypeSelectOptions}
							placeholder="Select party type"
							selectionMode="multiple"
							value={values.partyTypes}
							onChange={onPartyTypesChange}
						/>
					</Field>
				</div>
			</section>

			<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<SectionHeading
					description="Name fields change based on the selected party classification."
					title="Identity"
				/>
				{values.classification === "Non-Individual" ? (
					<div className="mt-4 grid gap-4 lg:grid-cols-2">
						<Field label="Party Name" error={errors.partyName} required>
							<input
								name="partyName"
								value={values.partyName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
								placeholder="Registered business name"
							/>
						</Field>
					</div>
				) : null}
				{values.classification === "Individual" ? (
					<div className="mt-4 grid gap-4 lg:grid-cols-4">
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
						<Field label="Suffix Name">
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
				{!values.classification ? (
					<div className="mt-4 rounded-md border border-dashed border-darknavy/15 bg-offwhite/50 p-4 text-sm text-darknavy/55">
						Select a party classification to continue.
					</div>
				) : null}
			</section>

			<AddressSection
				address={values.address}
				description="Address used for deliveries and shipping documents."
				disabled={isDetailsDisabled}
				options={addressOptions}
				title="Delivery Address"
				onAddressInputChange={onAddressInputChange}
				onSelectBarangay={onSelectBarangay}
				onSelectCityMunicipality={onSelectCityMunicipality}
				onSelectProvince={onSelectProvince}
				onSelectRegion={onSelectRegion}
			/>

			<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<SectionHeading
					description="Tax and contact details used in BIR forms and transaction documents."
					title="Tax & Contact"
				/>
				<div className="mt-4 grid gap-4 lg:grid-cols-2">
					<Field label="Tax Identification Number (TIN)">
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
							value={values.vatRegistrationType}
							onChange={onInputChange}
							disabled={isDetailsDisabled}
							className={fieldClassName}
						>
							<option value="">Select VAT type</option>
							{VatRegistrationTypeOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</Field>
					<Field label="BIR ATC Code" error={errors.atcCode} required>
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
					<Field label="Contact Number">
						<input
							name="contactNo"
							value={values.contactNo}
							onChange={onInputChange}
							readOnly={isReadonly}
							disabled={isDetailsDisabled}
							className={fieldClassName}
							placeholder="+63"
						/>
					</Field>
				</div>
			</section>
		</div>
	);
}

function AddressSection({
	address,
	description,
	disabled,
	options,
	title,
	onAddressInputChange,
	onSelectBarangay,
	onSelectCityMunicipality,
	onSelectProvince,
	onSelectRegion,
}: {
	address: PartyAddress;
	description: string;
	disabled: boolean;
	options: PartyAddressOptionSet;
	title: string;
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onSelectBarangay: (value: string | string[]) => void;
	onSelectCityMunicipality: (value: string | string[]) => void;
	onSelectProvince: (value: string | string[]) => void;
	onSelectRegion: (value: string | string[]) => void;
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
		<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<SectionHeading description={description} title={title} />
			<div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Field label="Region">
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
				<Field label="Province">
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
				<Field label="City or Municipality">
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
				<Field label="Barangay">
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
					label="Address Line 1"
					name="addressLine1"
					placeholder="Unit, building, block, or lot"
					value={address.addressLine1}
					onChange={onAddressInputChange}
				/>
				<AddressInput
					disabled={disabled}
					label="Address Line 2"
					name="addressLine2"
					placeholder="Street, subdivision, village, or phase"
					value={address.addressLine2}
					onChange={onAddressInputChange}
				/>
			</div>
		</section>
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
	description: string;
	title: string;
}) {
	return (
		<div>
			<h2 className="text-base font-semibold text-darknavy">{title}</h2>
			<p className="mt-1 text-sm text-darknavy/55">{description}</p>
		</div>
	);
}

function Field({
	children,
	error,
	label,
	required = false,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<div className="grid gap-2">
			<span className="text-xs font-semibold text-darknavy/60">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="text-xs font-medium text-coralpink">{error}</span>
			) : null}
		</div>
	);
}

const fieldClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-offwhite/70 disabled:text-darknavy/45";
