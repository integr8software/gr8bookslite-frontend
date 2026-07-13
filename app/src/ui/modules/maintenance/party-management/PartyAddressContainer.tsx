"use client";

import type {
	ChangeEventHandler,
	MouseEvent as ReactMouseEvent,
	ReactNode,
} from "react";
import { useAddressOptions } from "@/app/src/hooks/shared/address/useAddressOptions";
import type {
	PartyAddress,
	PartyInformationFormErrors,
	PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import type {
	AddressAutocompleteDetails,
	AddressAutocompleteItem,
} from "@/app/src/types/shared/address/AddressTypes";
import { AppAddressAutocomplete } from "@/app/src/ui/shared/address/AppAddressAutocomplete";

export type PartyProvinceOption = AppAdvancedDropdownOption & {
	regionCode?: string;
	regionName?: string;
};

export type PartyAddressOptionSet = {
	barangayOptions: AppAdvancedDropdownOption[];
	cityMunicipalityOptions: AppAdvancedDropdownOption[];
	isBarangaysLoading: boolean;
	isCitiesMunicipalitiesLoading: boolean;
	isProvincesLoading: boolean;
	provinceOptions: PartyProvinceOption[];
};

export function PartyAddressContainer({
	addresses,
	disabled,
	errors,
	partyTypes,
	onAddressInputChange,
	onSelectAutocompleteAddress,
	onSelectBarangay,
	onSelectCityMunicipality,
	onSelectProvince,
	onSyncAutocompleteAddressDetails,
}: {
	addresses: PartyAddress[];
	disabled: boolean;
	errors: PartyInformationFormErrors;
	partyTypes: PartyType[];
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onSelectAutocompleteAddress: (
		address: AddressAutocompleteItem,
		details?: AddressAutocompleteDetails,
		addressId?: string,
	) => void;
	onSelectBarangay: (
		value: string | string[],
		addressId?: string,
		option?: AppAdvancedDropdownOption,
	) => void;
	onSelectCityMunicipality: (
		value: string | string[],
		addressId?: string,
		option?: AppAdvancedDropdownOption,
	) => void;
	onSelectProvince: (
		value: string | string[],
		addressId?: string,
		option?: PartyProvinceOption,
	) => void;
	onSyncAutocompleteAddressDetails?: (
		details: AddressAutocompleteDetails,
		addressId?: string,
	) => void;
}) {
	const hasCustomerRole = partyTypes.includes("Customer");
	const hasVendorRole = partyTypes.includes("Vendor");
	const hasEmployeeRole = partyTypes.includes("Employee");
	const showHomeAddress = hasEmployeeRole;
	const showBillingAddress = hasCustomerRole || hasVendorRole;
	const showShippingAddress = hasCustomerRole;
	const addressSections = [
		showHomeAddress
			? {
					address: findAddressByRole(addresses, "home"),
					key: "home",
					title: "Home Address",
				}
			: null,
		showBillingAddress
			? {
					address: findAddressByRole(addresses, "billing"),
					key: "billing",
					title: "Billing Address",
				}
			: null,
		showShippingAddress
			? {
					address: findAddressByRole(addresses, "shipping"),
					key: "shipping",
					title: "Shipping Address",
				}
			: null,
	].filter(
		(
			section,
		): section is { address: PartyAddress; key: string; title: string } =>
			Boolean(section?.address),
	);
	const visibleAddressSections =
		addressSections.length > 0
			? addressSections
			: [{ address: addresses[0]!, key: "default", title: "Address" }];

	return (
		<div className="grid gap-6">
			{errors.addresses ? (
				<span className="text-xs font-medium text-coralpink">
					{errors.addresses}
				</span>
			) : null}
			{visibleAddressSections.map((section) => (
				<AddressSection
					key={section.key}
					address={section.address}
					disabled={disabled}
					errors={errors}
					sectionKey={section.key}
					title={section.title}
					onAddressInputChange={onAddressInputChange}
					onSelectAutocompleteAddress={onSelectAutocompleteAddress}
					onSelectBarangay={onSelectBarangay}
					onSelectCityMunicipality={onSelectCityMunicipality}
					onSelectProvince={onSelectProvince}
					onSyncAutocompleteAddressDetails={onSyncAutocompleteAddressDetails}
				/>
			))}
		</div>
	);
}

function AddressSection({
	address,
	disabled,
	errors,
	sectionKey,
	title,
	onAddressInputChange,
	onSelectAutocompleteAddress,
	onSelectBarangay,
	onSelectCityMunicipality,
	onSelectProvince,
	onSyncAutocompleteAddressDetails,
}: {
	address: PartyAddress;
	disabled: boolean;
	errors: PartyInformationFormErrors;
	sectionKey: string;
	title: string;
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onSelectAutocompleteAddress: (
		address: AddressAutocompleteItem,
		details?: AddressAutocompleteDetails,
		addressId?: string,
	) => void;
	onSelectBarangay: (
		value: string | string[],
		addressId?: string,
		option?: AppAdvancedDropdownOption,
	) => void;
	onSelectCityMunicipality: (
		value: string | string[],
		addressId?: string,
		option?: AppAdvancedDropdownOption,
	) => void;
	onSelectProvince: (
		value: string | string[],
		addressId?: string,
		option?: PartyProvinceOption,
	) => void;
	onSyncAutocompleteAddressDetails?: (
		details: AddressAutocompleteDetails,
		addressId?: string,
	) => void;
}) {
	const options = useAddressOptions({
		barangayCode: address.barangayCode,
		barangayName: address.barangay,
		cityMunicipalityCode: address.cityMunicipalityCode,
		cityMunicipalityName: address.cityMunicipality,
		provinceCode: address.provinceCode,
		provinceName: address.province,
		regionCode: address.regionCode,
		regionName: address.region,
	});

	return (
		<section className="grid gap-4">
			<SectionHeading title={title} />
			<AddressFields
				address={address}
				disabled={disabled}
				errors={errors}
				options={options}
				sectionKey={sectionKey}
				onAddressInputChange={onAddressInputChange}
				onSelectAutocompleteAddress={onSelectAutocompleteAddress}
				onSelectBarangay={onSelectBarangay}
				onSelectCityMunicipality={onSelectCityMunicipality}
				onSelectProvince={onSelectProvince}
				onSyncAutocompleteAddressDetails={onSyncAutocompleteAddressDetails}
			/>
		</section>
	);
}

function findAddressByRole(
	addresses: PartyAddress[],
	role: "billing" | "home" | "shipping",
) {
	return addresses.find((address) => {
		if (role === "billing") {
			return address.isBilling;
		}

		if (role === "home") {
			return address.isHome;
		}

		return address.isDelivery;
	});
}

function AddressFields({
	address,
	disabled,
	errors,
	options,
	sectionKey,
	onAddressInputChange,
	onSelectAutocompleteAddress,
	onSelectBarangay,
	onSelectCityMunicipality,
	onSelectProvince,
	onSyncAutocompleteAddressDetails,
}: {
	address: PartyAddress;
	disabled: boolean;
	errors: PartyInformationFormErrors;
	options: PartyAddressOptionSet;
	sectionKey: string;
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onSelectAutocompleteAddress: (
		address: AddressAutocompleteItem,
		details?: AddressAutocompleteDetails,
		addressId?: string,
	) => void;
	onSelectBarangay: (
		value: string | string[],
		addressId?: string,
		option?: AppAdvancedDropdownOption,
	) => void;
	onSelectCityMunicipality: (
		value: string | string[],
		addressId?: string,
		option?: AppAdvancedDropdownOption,
	) => void;
	onSelectProvince: (
		value: string | string[],
		addressId?: string,
		option?: PartyProvinceOption,
	) => void;
	onSyncAutocompleteAddressDetails?: (
		details: AddressAutocompleteDetails,
		addressId?: string,
	) => void;
}) {
	return (
		<div className="grid gap-4">
			{address.isForeign ? (
				<AddressInput
					addressId={address.id}
					disabled={disabled}
					error={errors.addressLine1}
					label="Full Address"
					name="addressLine1"
					placeholder="Enter the complete foreign address"
					required
					value={address.addressLine1}
					onChange={onAddressInputChange}
				/>
			) : (
				<AppAddressAutocomplete
					label="Full Address"
					disabled={disabled}
					id={`party-address-autocomplete-${sectionKey}-${address.id}`}
					placeholder="Search or enter full address"
					required
					syncDetailsOnQueryChange
					value={address}
					onDetailsChange={(details) =>
						onSyncAutocompleteAddressDetails?.(details, address.id)
					}
					onSelect={(selectedAddress, details) =>
						onSelectAutocompleteAddress(selectedAddress, details, address.id)
					}
				/>
			)}
			{!address.isForeign ? (
				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.25fr)]">
					<AddressSelectField
						disabled={disabled || options.isProvincesLoading}
						error={getRequiredAddressFieldError(
							errors.provinceCode,
							address.provinceCode,
						)}
						label="Province"
						id={getAddressControlId(sectionKey, address.id, "provinceCode")}
						options={options.provinceOptions}
						placeholder={
							options.isProvincesLoading
								? "Loading provinces"
								: "Select province"
						}
						required
						value={address.provinceCode}
						onChange={(value) => onSelectProvince(value, address.id)}
						onSelectOption={(option) =>
							onSelectProvince(option.value, address.id, option)
						}
					/>
					<AddressSelectField
						disabled={
							disabled ||
							options.isCitiesMunicipalitiesLoading ||
							!address.provinceCode
						}
						error={getRequiredAddressFieldError(
							errors.cityMunicipalityCode,
							address.cityMunicipalityCode,
						)}
						label="City/Municipality"
						id={getAddressControlId(
							sectionKey,
							address.id,
							"cityMunicipalityCode",
						)}
						options={options.cityMunicipalityOptions}
						placeholder={
							!address.provinceCode
								? "Select province first"
								: options.isCitiesMunicipalitiesLoading
									? "Loading cities"
									: "Select city"
						}
						required
						value={address.cityMunicipalityCode}
						onChange={(value) => onSelectCityMunicipality(value, address.id)}
						onSelectOption={(option) =>
							onSelectCityMunicipality(option.value, address.id, option)
						}
					/>
					<AddressSelectField
						disabled={
							disabled ||
							options.isBarangaysLoading ||
							!address.cityMunicipalityCode
						}
						error={getRequiredAddressFieldError(
							errors.barangayCode,
							address.barangayCode,
						)}
						label="Barangay"
						id={getAddressControlId(sectionKey, address.id, "barangayCode")}
						options={options.barangayOptions}
						placeholder={
							!address.cityMunicipalityCode
								? "Select city first"
								: options.isBarangaysLoading
									? "Loading barangays"
									: "Select barangay"
						}
						required
						value={address.barangayCode}
						onChange={(value) => onSelectBarangay(value, address.id)}
						onSelectOption={(option) =>
							onSelectBarangay(option.value, address.id, option)
						}
					/>
					<AddressInput
						addressId={address.id}
						disabled={disabled}
						error={errors.addressLine2}
						id={getAddressControlId(sectionKey, address.id, "addressLine2")}
						label="Street, Subdivision, Village"
						name="addressLine2"
						placeholder="Mabini St., Greenfield Village"
						value={address.addressLine2}
						onChange={onAddressInputChange}
					/>
					<AddressInput
						addressId={address.id}
						disabled={disabled}
						error={errors.addressLine1}
						id={getAddressControlId(sectionKey, address.id, "addressLine1")}
						label="Unit, Block, Lot, Building"
						name="addressLine1"
						placeholder="Unit 5B, Block 3, Lot 12"
						value={address.addressLine1}
						onChange={onAddressInputChange}
					/>
				</div>
			) : null}
		</div>
	);
}

function getRequiredAddressFieldError(error: string | undefined, value: string) {
	return value.trim() ? undefined : error;
}

function AddressSelectField({
	disabled,
	error,
	id,
	label,
	options,
	placeholder,
	required,
	value,
	onChange,
	onSelectOption,
}: {
	disabled: boolean;
	error?: string;
	id: string;
	label: string;
	options: AppAdvancedDropdownOption[];
	placeholder: string;
	required?: boolean;
	value: string;
	onChange: (value: string | string[]) => void;
	onSelectOption?: (option: AppAdvancedDropdownOption) => void;
}) {
	const labelId = `${id}-label`;

	return (
		<Field label={label} labelId={labelId} error={error} required={required}>
			<AppAdvancedDropdown
				ariaLabelledBy={labelId}
				disabled={disabled}
				id={id}
				options={options}
				placeholder={placeholder}
				searchPlaceholder={`Search ${label.toLowerCase()}`}
				value={value}
				onChange={onChange}
				onSelectOption={onSelectOption}
			/>
		</Field>
	);
}

function AddressInput({
	addressId,
	disabled,
	error,
	id,
	label,
	name,
	placeholder,
	required,
	value,
	onChange,
}: {
	addressId?: string;
	disabled: boolean;
	error?: string;
	id?: string;
	label: string;
	name: string;
	placeholder?: string;
	required?: boolean;
	value: string;
	onChange: ChangeEventHandler<HTMLInputElement>;
}) {
	const controlId = id ?? (addressId ? `party-address-${addressId}-${name}` : name);

	return (
		<Field label={label} htmlFor={controlId} error={error} required={required}>
			<input
				id={controlId}
				name={name}
				data-address-id={addressId}
				value={value}
				onChange={onChange}
				autoComplete="new-password"
				data-form-type="other"
				disabled={disabled}
				className={fieldClassName}
				placeholder={placeholder}
			/>
		</Field>
	);
}

function Field({
	children,
	error,
	htmlFor,
	label,
	labelId,
	required,
}: {
	children: ReactNode;
	error?: string;
	htmlFor?: string;
	label: string;
	labelId?: string;
	required?: boolean;
}) {
	const labelContent = (
		<>
			{label}
			{required ? <span className="text-coralpink"> *</span> : null}
		</>
	);

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
			{htmlFor ? (
				<label
					htmlFor={htmlFor}
					className="mb-2 block text-sm font-semibold text-darknavy"
				>
					{labelContent}
				</label>
			) : (
				<span
					id={labelId}
					className="mb-2 block text-sm font-semibold text-darknavy"
				>
					{labelContent}
				</span>
			)}
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</div>
	);
}

function getAddressControlId(
	sectionKey: string,
	addressId: string,
	fieldName: string,
) {
	return `party-address-${sectionKey}-${addressId}-${fieldName}`;
}

function SectionHeading({ title }: { title: string }) {
	return (
		<div className="flex items-center gap-3">
			<h2 className="shrink-0 text-base font-semibold text-darknavy">
				{title}
			</h2>
			<div className="h-px flex-1 bg-darknavy/10" aria-hidden="true" />
		</div>
	);
}

const fieldClassName =
	"app-disabled-control h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.035] disabled:text-darknavy/35 disabled:placeholder:text-darknavy/32";

const fieldControlSelector =
	'[role="combobox"], input:not([type="hidden"]), select, textarea, button';
