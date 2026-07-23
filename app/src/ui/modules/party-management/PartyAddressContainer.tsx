"use client";

import type {
	ChangeEventHandler,
	MouseEvent as ReactMouseEvent,
	ReactNode,
} from "react";
import {
	PartyManagementFieldClassName,
	PartyManagementFieldControlSelector,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import { useAddressOptions } from "@/app/src/hooks/shared/address/useAddressOptions";
import type {
	PartyAddressContainerProps,
	PartyAddressOptionSet,
	PartyAddress,
	PartyInformationFormErrors,
	PartyProvinceOption,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import type {
	AddressAutocompleteDetails,
	AddressAutocompleteItem,
} from "@/app/src/types/shared/address/AddressTypes";
import { AppAddressAutocomplete } from "@/app/src/ui/shared/address/AppAddressAutocomplete";

export function PartyAddressContainer({
	addresses,
	disabled,
	errors,
	partyTypes,
	syncedAddressSources = {},
	onAddressInputChange,
	onCopyAddress,
	onSelectAutocompleteAddress,
	onSelectBarangay,
	onSelectCityMunicipality,
	onSelectProvince,
	onSyncAutocompleteAddressDetails,
}: PartyAddressContainerProps) {
	const hasCustomerRole = partyTypes.includes("Customer");
	const hasVendorRole = partyTypes.includes("Vendor");
	const hasEmployeeRole = partyTypes.includes("Employee");
	const hasMemberRole = partyTypes.includes("Member");
	const showHomeAddress = hasEmployeeRole || hasMemberRole;
	const showBillingAddress = hasCustomerRole || hasVendorRole;
	const showDeliveryAddress = hasCustomerRole;
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
		showDeliveryAddress
			? {
					address: findAddressByRole(addresses, "delivery"),
					key: "delivery",
					title: "Delivery Address",
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
					sameAsOptions={getSameAsAddressOptions(
						visibleAddressSections,
						section.address.id,
					)}
					syncedSourceAddressId={syncedAddressSources[section.address.id] ?? ""}
					sectionKey={section.key}
					title={section.title}
					onAddressInputChange={onAddressInputChange}
					onCopyAddress={onCopyAddress}
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
	sameAsOptions,
	syncedSourceAddressId,
	sectionKey,
	title,
	onAddressInputChange,
	onCopyAddress,
	onSelectAutocompleteAddress,
	onSelectBarangay,
	onSelectCityMunicipality,
	onSelectProvince,
	onSyncAutocompleteAddressDetails,
}: {
	address: PartyAddress;
	disabled: boolean;
	errors: PartyInformationFormErrors;
	sameAsOptions: AppAdvancedDropdownOption[];
	syncedSourceAddressId: string;
	sectionKey: string;
	title: string;
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onCopyAddress: (sourceAddressId: string, targetAddressId: string) => void;
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
	const isSyncedAddress = Boolean(syncedSourceAddressId);
	const areAddressFieldsDisabled = disabled || isSyncedAddress;

	return (
		<section className="grid gap-4">
			<SectionHeading
				addressId={address.id}
				disabled={disabled}
				sameAsOptions={sameAsOptions}
				syncedSourceAddressId={syncedSourceAddressId}
				title={title}
				onCopyAddress={onCopyAddress}
			/>
			<AddressFields
				address={address}
				disabled={areAddressFieldsDisabled}
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
	role: "billing" | "delivery" | "home",
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
			{disabled ? (
				<ReadOnlyAddressDisplay address={address} />
			) : address.isForeign ? (
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
								: "--Select Province--"
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
								? "--Select Province First--"
								: options.isCitiesMunicipalitiesLoading
									? "Loading cities"
									: "--Select City--"
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
								? "--Select City First--"
								: options.isBarangaysLoading
									? "Loading barangays"
									: "--Select Barangay--"
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
						value={address.addressLine1}
						onChange={onAddressInputChange}
					/>
				</div>
			) : null}
		</div>
	);
}

function getSameAsAddressOptions(
	sections: Array<{ address: PartyAddress; key: string; title: string }>,
	currentAddressId: string,
): AppAdvancedDropdownOption[] {
	return sections
		.filter((section) => section.address.id !== currentAddressId)
		.map((section) => ({
			description: formatFullAddress(section.address),
			name: `Same As ${section.title}`,
			value: section.address.id,
		}));
}

function ReadOnlyAddressDisplay({ address }: { address: PartyAddress }) {
	return (
		<Field label="Full Address">
			<input
				value={formatFullAddress(address)}
				readOnly
				disabled
				className={PartyManagementFieldClassName}
			/>
		</Field>
	);
}

function formatFullAddress(address: PartyAddress) {
	return (
		[
			address.addressLine1,
			address.addressLine2,
			address.barangay,
			address.cityMunicipality,
			address.province,
		]
			.map((part) => part.trim())
			.filter(Boolean)
			.join(", ") || "-"
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
				className={PartyManagementFieldClassName}
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

		if (
			!(target instanceof Element) ||
			target.closest(PartyManagementFieldControlSelector)
		) {
			return;
		}

		const control =
			event.currentTarget.querySelector<HTMLElement>(
				PartyManagementFieldControlSelector,
			);

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

function SectionHeading({
	addressId,
	disabled,
	sameAsOptions,
	syncedSourceAddressId,
	title,
	onCopyAddress,
}: {
	addressId: string;
	disabled: boolean;
	sameAsOptions: AppAdvancedDropdownOption[];
	syncedSourceAddressId: string;
	title: string;
	onCopyAddress: (sourceAddressId: string, targetAddressId: string) => void;
}) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<h2 className="shrink-0 text-base font-semibold text-darknavy">
					{title}
				</h2>
				<div className="h-px flex-1 bg-darknavy/10" aria-hidden="true" />
			</div>
			{sameAsOptions.length > 0 ? (
				<div className="w-full sm:w-64">
					<AppAdvancedDropdown
						disabled={disabled}
						isSearchable={false}
						options={sameAsOptions}
						placeholder="Same As Address"
						showSelectionIndicator={false}
						value={syncedSourceAddressId}
						onChange={(value) => {
							const sourceAddressId = getSingleSelectedValue(value);
							onCopyAddress(sourceAddressId, addressId);
						}}
					/>
				</div>
			) : null}
		</div>
	);
}

function getSingleSelectedValue(value: string | string[]) {
	return Array.isArray(value) ? (value[0] ?? "") : value;
}

