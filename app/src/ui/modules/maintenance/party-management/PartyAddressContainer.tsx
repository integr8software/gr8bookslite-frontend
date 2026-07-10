import type { ChangeEventHandler, ReactNode } from "react";
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
	regionCode: string;
	regionName: string;
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
	options,
	partyTypes,
	onAddressInputChange,
	onSelectAutocompleteAddress,
	onSelectBarangay,
	onSelectCityMunicipality,
	onSelectProvince,
	onSyncAutocompleteAddressDetails,
	onUpdateAddressMeta,
}: {
	addresses: PartyAddress[];
	disabled: boolean;
	errors: PartyInformationFormErrors;
	options: PartyAddressOptionSet;
	partyTypes: PartyType[];
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onSelectAutocompleteAddress: (
		address: AddressAutocompleteItem,
		details?: AddressAutocompleteDetails,
		addressId?: string,
	) => void;
	onSelectBarangay: (value: string | string[], addressId?: string) => void;
	onSelectCityMunicipality: (value: string | string[], addressId?: string) => void;
	onSelectProvince: (value: string | string[], addressId?: string) => void;
	onSyncAutocompleteAddressDetails?: (
		details: AddressAutocompleteDetails,
		addressId?: string,
	) => void;
	onUpdateAddressMeta: (
		addressId: string,
		field:
			| "addressName"
			| "isBilling"
			| "isDelivery"
			| "isForeign"
			| "isHome",
		value: string | boolean,
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
				<section key={section.key} className="grid gap-4">
					<SectionHeading title={section.title} />
					<AddressFields
						address={section.address}
						disabled={disabled}
						errors={errors}
						options={options}
						sectionKey={section.key}
						onAddressInputChange={onAddressInputChange}
						onSelectAutocompleteAddress={onSelectAutocompleteAddress}
						onSelectBarangay={onSelectBarangay}
						onSelectCityMunicipality={onSelectCityMunicipality}
						onSelectProvince={onSelectProvince}
						onSyncAutocompleteAddressDetails={onSyncAutocompleteAddressDetails}
					/>
				</section>
			))}
		</div>
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
	onSelectBarangay: (value: string | string[], addressId?: string) => void;
	onSelectCityMunicipality: (value: string | string[], addressId?: string) => void;
	onSelectProvince: (value: string | string[], addressId?: string) => void;
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
					value={address.addressLine1}
					onChange={onAddressInputChange}
				/>
			) : (
				<AppAddressAutocomplete
					label="Full Address"
					disabled={disabled}
					id={`party-address-autocomplete-${sectionKey}-${address.id}`}
					placeholder="Search or enter full address"
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
						error={errors.provinceCode}
						label="Province"
						options={options.provinceOptions}
						placeholder={
							options.isProvincesLoading
								? "Loading provinces"
								: "Select province"
						}
						value={address.provinceCode}
						onChange={(value) => onSelectProvince(value, address.id)}
					/>
					<AddressSelectField
						disabled={
							disabled ||
							options.isCitiesMunicipalitiesLoading ||
							!address.provinceCode
						}
						error={errors.cityMunicipalityCode}
						label="City/Municipality"
						options={options.cityMunicipalityOptions}
						placeholder={
							!address.provinceCode
								? "Select province first"
								: options.isCitiesMunicipalitiesLoading
									? "Loading cities"
									: "Select city"
						}
						value={address.cityMunicipalityCode}
						onChange={(value) => onSelectCityMunicipality(value, address.id)}
					/>
					<AddressSelectField
						disabled={
							disabled ||
							options.isBarangaysLoading ||
							!address.cityMunicipalityCode
						}
						error={errors.barangayCode}
						label="Barangay"
						options={options.barangayOptions}
						placeholder={
							!address.cityMunicipalityCode
								? "Select city first"
								: options.isBarangaysLoading
									? "Loading barangays"
									: "Select barangay"
						}
						value={address.barangayCode}
						onChange={(value) => onSelectBarangay(value, address.id)}
					/>
					<AddressInput
						disabled={disabled}
						error={errors.addressLine1}
						label="Unit, Block, Lot, Building"
						name="addressLine1"
						placeholder="Unit 5B, Block 3, Lot 12"
						value={address.addressLine1}
						onChange={onAddressInputChange}
						addressId={address.id}
					/>
					<AddressInput
						disabled={disabled}
						error={errors.addressLine2}
						label="Street, Subdivision, Village"
						name="addressLine2"
						placeholder="Mabini St., Greenfield Village"
						value={address.addressLine2}
						onChange={onAddressInputChange}
						addressId={address.id}
					/>
				</div>
			) : null}
		</div>
	);
}

function AddressSelectField({
	disabled,
	error,
	label,
	options,
	placeholder,
	value,
	onChange,
}: {
	disabled: boolean;
	error?: string;
	label: string;
	options: AppAdvancedDropdownOption[];
	placeholder: string;
	value: string;
	onChange: (value: string | string[]) => void;
}) {
	return (
		<Field label={label} error={error}>
			<AppAdvancedDropdown
				disabled={disabled}
				options={options}
				placeholder={placeholder}
				searchPlaceholder={`Search ${label.toLowerCase()}`}
				value={value}
				onChange={onChange}
			/>
		</Field>
	);
}

function AddressInput({
	addressId,
	disabled,
	error,
	label,
	name,
	placeholder,
	value,
	onChange,
}: {
	addressId?: string;
	disabled: boolean;
	error?: string;
	label: string;
	name: string;
	placeholder?: string;
	value: string;
	onChange: ChangeEventHandler<HTMLInputElement>;
}) {
	return (
		<Field label={label} error={error}>
			<input
				name={name}
				data-address-id={addressId}
				value={value}
				onChange={onChange}
				autoComplete="off"
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
	label,
}: {
	children: ReactNode;
	error?: string;
	label: string;
}) {
	return (
		<div>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
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
