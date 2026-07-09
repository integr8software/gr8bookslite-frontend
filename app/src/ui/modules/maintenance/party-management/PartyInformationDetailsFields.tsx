import {
	type ChangeEventHandler,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	useState,
} from "react";
import { ChevronRight, MapPin, Plus, Search, Trash2 } from "lucide-react";
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
		field: "addressName" | "isBilling" | "isDelivery" | "isForeign",
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
		field: "addressName" | "isBilling" | "isDelivery" | "isForeign",
		value: string | boolean,
	) => void;
}) {
	void options;
	void onSelectBarangay;
	void onSelectCityMunicipality;
	void onSelectProvince;
	const hasReachedAddressLimit = addresses.length >= MaxPartyAddressCount;
	const [addressSearch, setAddressSearch] = useState("");
	const normalizedAddressSearch = addressSearch.trim().toLocaleLowerCase();
	const visibleAddresses = [...addresses]
		.sort((first, second) => Number(second.isDefault) - Number(first.isDefault))
		.filter((item) =>
			`${item.addressName} ${formatPartyAddress(item)}`
				.toLocaleLowerCase()
				.includes(normalizedAddressSearch),
		);

	return (
		<div className="grid gap-3">
			{errors.addresses ? (
				<span className="text-xs font-medium text-coralpink">
					{errors.addresses}
				</span>
			) : null}
			<div className="overflow-hidden rounded-lg border border-darknavy/10 lg:grid lg:h-[clamp(30rem,60vh,36rem)] lg:grid-cols-[clamp(17rem,24vw,20rem)_minmax(0,1fr)]">
				<aside className="flex max-h-[22rem] min-h-0 flex-col border-b border-darknavy/10 bg-offwhite/45 lg:max-h-none lg:border-r lg:border-b-0">
					<div className="flex min-h-[4.75rem] items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-3">
						<div>
							<h3 className="text-sm font-semibold text-darknavy">Multiple Addresses</h3>
							<p className="mt-1 text-xs text-darknavy/50">
								Select an address to view or edit details.
							</p>
						</div>
					</div>
					<div className="border-b border-darknavy/10 p-3">
						<label className="relative block">
							<Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-darknavy/40" aria-hidden="true" />
							<span className="sr-only">Search addresses</span>
							<input
								type="search"
								value={addressSearch}
								onChange={(event) => setAddressSearch(event.target.value)}
								placeholder="Search addresses"
								className="h-9 w-full rounded-md border border-darknavy/10 bg-white pr-3 pl-9 text-xs text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/15"
							/>
						</label>
					</div>
					<div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3" role="tablist" aria-label="Party addresses">
						{visibleAddresses.map((item) => {
							const isActive = item.id === activeAddressId;
							return (
								<button
									key={item.id}
									type="button"
									role="tab"
									aria-selected={isActive}
									onClick={() => onSelectAddress(item.id)}
									className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition ${
										isActive
											? "border-skyblue bg-skyblue/10 shadow-sm"
											: "border-transparent hover:border-darknavy/10 hover:bg-white"
									}`}
								>
									<span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isActive ? "bg-skyblue/15 text-skyblue" : "bg-darknavy/7 text-darknavy/45"}`}>
										<MapPin className="h-4 w-4" aria-hidden="true" />
									</span>
									<span className="min-w-0 flex-1">
										<span className="flex flex-wrap items-center gap-1.5">
											<span className="truncate text-xs font-semibold text-darknavy">{item.addressName}</span>
											<AddressTags address={item} />
										</span>
										<span className="mt-1 block truncate text-[11px] text-darknavy/55">{formatPartyAddress(item)}</span>
									</span>
									<ChevronRight className="h-4 w-4 shrink-0 text-darknavy/40" aria-hidden="true" />
								</button>
							);
						})}
						{visibleAddresses.length === 0 ? (
							<p className="px-2 py-8 text-center text-xs text-darknavy/45">No matching addresses.</p>
						) : null}
					</div>
				</aside>
				<div className="flex min-h-0 flex-col overflow-y-auto">
					<div className="flex min-h-[4.75rem] flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-3 sm:px-5">
						<h3 className="text-sm font-semibold text-darknavy">Address Details</h3>
						<div className="ml-auto flex flex-wrap items-center justify-end gap-2">
							{!disabled && !address.isDefault && addresses.length > 1 ? (
								<button
									type="button"
									onClick={() => onRemoveAddress(address.id)}
									className="inline-flex h-8 items-center gap-1.5 rounded-md border border-coralpink/25 px-2.5 text-xs font-semibold text-coralpink transition hover:bg-coralpink/10"
								>
									<Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
								</button>
							) : null}
							{!disabled ? (
								<button
									type="button"
									onClick={onAddAddress}
									disabled={hasReachedAddressLimit}
									title={hasReachedAddressLimit ? `Maximum of ${MaxPartyAddressCount} addresses reached` : "Add address"}
									className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md bg-skyblue px-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/30 disabled:cursor-not-allowed disabled:opacity-45"
								>
									<Plus className="h-3.5 w-3.5" aria-hidden="true" />
									Add Address
								</button>
							) : null}
						</div>
					</div>
					<div className="grid content-start gap-5 p-4 sm:p-5">
					<div className="grid items-start gap-4 md:grid-cols-2">
						<Field label="Address label" required>
							<input value={address.addressName} onChange={(event) => onUpdateAddressMeta(address.id, "addressName", event.target.value)} readOnly={disabled} className={fieldClassName} placeholder="e.g. Head Office" />
						</Field>
						{address.isForeign ? (
							<AddressInput disabled={disabled} label="Full Address" name="addressLine1" placeholder="Enter the complete foreign address" value={address.addressLine1} onChange={onAddressInputChange} />
						) : (
							<AppAddressAutocomplete label="Full Address" disabled={disabled} id={`party-address-autocomplete-${address.id}`} syncDetailsOnQueryChange value={address} onDetailsChange={onSyncAutocompleteAddressDetails} onSelect={onSelectAutocompleteAddress} />
						)}
					</div>
					{!address.isDefault ? (
					<div className="border-t border-darknavy/10 pt-4">
						<p className="mb-2 text-xs font-semibold text-darknavy">Address Types</p>
						<div className="flex flex-wrap gap-x-5 gap-y-1">
							<label className="inline-flex h-9 items-center gap-2 text-sm text-darknavy">
								<input type="radio" name="defaultPartyAddress" checked={address.isDefault} disabled={disabled} onChange={() => onSetDefaultAddress(address.id)} className="h-4 w-4 accent-skyblue" />
								Default
							</label>
							<AddressTagCheckbox checked={address.isBilling} disabled={disabled} label="Billing" onChange={(checked) => onUpdateAddressMeta(address.id, "isBilling", checked)} />
							<AddressTagCheckbox checked={address.isDelivery} disabled={disabled} label="Delivery" onChange={(checked) => onUpdateAddressMeta(address.id, "isDelivery", checked)} />
							<AddressTagCheckbox checked={Boolean(address.isForeign)} disabled={disabled || addresses.some((item) => item.id !== address.id && item.isForeign)} label="Foreign Address" onChange={(checked) => onUpdateAddressMeta(address.id, "isForeign", checked)} />
						</div>
					</div>
					) : null}
					</div>
				</div>
			</div>
		</div>
	);
}

function formatPartyAddress(address: PartyAddress) {
	return [
		address.addressLine1,
		address.addressLine2,
		address.barangay,
		address.cityMunicipality,
		address.province,
	].filter(Boolean).join(", ") || "No address details yet";
}

function AddressTags({ address }: { address: PartyAddress }) {
	const tags = [
		address.isDefault ? "Default" : null,
		!address.isDefault && address.isBilling ? "Billing" : null,
		!address.isDefault && address.isDelivery ? "Delivery" : null,
		!address.isDefault && address.isForeign ? "Foreign" : null,
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
