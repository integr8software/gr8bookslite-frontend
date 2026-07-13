import {
	type ChangeEventHandler,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
} from "react";
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
import {
	PartyAddressContainer,
} from "@/app/src/ui/modules/maintenance/party-management/PartyAddressContainer";

export function PartyInformationDetailsFields({
	atcOptions,
	accountOptions,
	errors,
	isClassificationSelected,
	isPartyCodeReadonly = false,
	isReadonly,
	partyTypeOptions,
	termOptions,
	values,
	onAddressInputChange,
	onInputChange,
	onPartyTypesChange,
	onSelectBarangay,
	onSelectAtcCode,
	onSelectAutocompleteAddress,
	onSyncAutocompleteAddressDetails,
	onSelectCityMunicipality,
	onSelectProvince,
	onUpdateField,
	onSelectTerm,
}: {
	accountOptions: ModuleChartAccount[];
	atcOptions: PartyAtcCodeOption[];
	errors: PartyInformationFormErrors;
	isClassificationSelected: boolean;
	isPartyCodeReadonly?: boolean;
	isReadonly: boolean;
	partyTypeOptions: readonly PartyType[];
	termOptions: AppAdvancedDropdownOption[];
	values: PartyInformationFormValues;
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
	onPartyTypesChange: (value: string | string[]) => void;
	onSelectAtcCode: (value: string | string[]) => void;
	onSelectAutocompleteAddress: (
		address: AddressAutocompleteItem,
		details?: AddressAutocompleteDetails,
		addressId?: string,
	) => void;
	onSyncAutocompleteAddressDetails?: (
		details: AddressAutocompleteDetails,
		addressId?: string,
	) => void;
	onSelectBarangay: (value: string | string[], addressId?: string) => void;
	onSelectCityMunicipality: (value: string | string[], addressId?: string) => void;
	onSelectProvince: (value: string | string[], addressId?: string) => void;
	onUpdateField: <TKey extends keyof PartyInformationFormValues>(
		field: TKey,
		value: PartyInformationFormValues[TKey],
	) => void;
	onSelectTerm: (value: string | string[]) => void;
}) {
	const isPartyTypeSelected = values.partyTypes.length > 0;
	const isDetailsDisabled =
		isReadonly || !isClassificationSelected || !isPartyTypeSelected;
	const showBusinessNameFields = values.classification !== "Individual";
	const activeAddress =
		values.addresses.find((address) => address.id === values.activeAddressId) ??
		values.addresses[0] ??
		values.address;
	const visiblePartyTypeOptions =
		values.classification === "Non-Individual"
			? partyTypeOptions.filter((type) => type !== "Employee")
			: partyTypeOptions;
	const partyTypeSelectOptions = visiblePartyTypeOptions.map((type) => ({
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
								readOnly={isReadonly || isPartyCodeReadonly}
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
								disabled={isReadonly || !isClassificationSelected}
								isSearchable={false}
								options={partyTypeSelectOptions}
								placeholder={
									isClassificationSelected
										? "Select party type"
										: "Select classification first"
								}
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

				<PartyAddressContainer
					addresses={values.addresses}
					disabled={isDetailsDisabled}
					errors={errors}
					partyTypes={values.partyTypes}
					onAddressInputChange={onAddressInputChange}
					onSelectBarangay={onSelectBarangay}
					onSelectAutocompleteAddress={onSelectAutocompleteAddress}
					onSyncAutocompleteAddressDetails={onSyncAutocompleteAddressDetails}
					onSelectCityMunicipality={onSelectCityMunicipality}
					onSelectProvince={onSelectProvince}
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
	const receivableAccountOptions = getPartyAccountOptions(
		accountOptions,
		"customerReceivable",
	);
	const customerAdvanceAccountOptions = getPartyAccountOptions(
		accountOptions,
		"customerAdvance",
	);
	const payableAccountOptions = getPartyAccountOptions(
		accountOptions,
		"vendorPayable",
	);
	const vendorAdvanceAccountOptions = getPartyAccountOptions(
		accountOptions,
		"vendorAdvance",
	);
	const employeeAdvanceAccountOptions = getPartyAccountOptions(
		accountOptions,
		"employeeAdvance",
	);
	const employeePayableAccountOptions = getPartyAccountOptions(
		accountOptions,
		"employeePayable",
	);

	return (
		<div className="grid gap-4">
			<div className="h-px bg-darknavy/10" aria-hidden="true" />
			<AppCollapsibleSection
				badge="Advanced"
				description={
					hasAccountingFields
						? "Required account defaults are prefilled and can be configured."
						: "Select a party type to enable account overrides."
				}
				disabled={isAccountingDisabled}
				required={hasAccountingFields}
				title="Accounting"
				contentClassName="grid gap-4 md:grid-cols-2"
			>
				{isCustomer ? (
					<Field
						label="Default Receivable Account"
						error={errors.defaultReceivableAccount}
						required
					>
						<ChartAccountDropdown
							accounts={receivableAccountOptions}
							disabled={isAccountingDisabled}
							valueField="id"
							value={values.defaultReceivableAccount}
							onChange={(value) =>
								onUpdateField("defaultReceivableAccount", value)
							}
						/>
					</Field>
				) : null}
				{isCustomer ? (
					<Field
						label="Default Customer Advance Account"
						error={errors.customerAdvanceAccount}
						required
					>
						<ChartAccountDropdown
							accounts={customerAdvanceAccountOptions}
							disabled={isAccountingDisabled}
							valueField="id"
							value={values.customerAdvanceAccount}
							onChange={(value) =>
								onUpdateField("customerAdvanceAccount", value)
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
							accounts={payableAccountOptions}
							disabled={isAccountingDisabled}
							valueField="id"
							value={values.defaultPayableAccount}
							onChange={(value) =>
								onUpdateField("defaultPayableAccount", value)
							}
						/>
					</Field>
				) : null}
				{isVendor ? (
					<Field
						label="Default Vendor Advance Account"
						error={errors.vendorAdvanceAccount}
						required
					>
						<ChartAccountDropdown
							accounts={vendorAdvanceAccountOptions}
							disabled={isAccountingDisabled}
							valueField="id"
							value={values.vendorAdvanceAccount}
							onChange={(value) => onUpdateField("vendorAdvanceAccount", value)}
						/>
					</Field>
				) : null}
				{isEmployee ? (
					<Field
						label="Default Employee Advance Account"
						error={errors.employeeAdvanceAccount}
						required
					>
						<ChartAccountDropdown
							accounts={employeeAdvanceAccountOptions}
							disabled={isAccountingDisabled}
							valueField="id"
							value={values.employeeAdvanceAccount}
							onChange={(value) =>
								onUpdateField("employeeAdvanceAccount", value)
							}
						/>
					</Field>
				) : null}
				{isEmployee ? (
					<Field
						label="Default Employee Payable Account"
						error={errors.employeePayableAccount}
						required
					>
						<ChartAccountDropdown
							accounts={employeePayableAccountOptions}
							disabled={isAccountingDisabled}
							valueField="id"
							value={values.employeePayableAccount}
							onChange={(value) =>
								onUpdateField("employeePayableAccount", value)
							}
						/>
					</Field>
				) : null}
			</AppCollapsibleSection>
		</div>
	);
}

type PartyAccountPurpose =
	| "customerAdvance"
	| "customerReceivable"
	| "employeeAdvance"
	| "employeePayable"
	| "vendorAdvance"
	| "vendorPayable";

function getPartyAccountOptions(
	accounts: ModuleChartAccount[],
	purpose: PartyAccountPurpose,
) {
	return accounts.filter((account) => {
		const accountName = account.accountName.toLowerCase();

		switch (purpose) {
			case "customerReceivable":
				return (
					account.accountCategory === "Accounts Receivables" &&
					accountName.includes("receivable")
				);
			case "customerAdvance":
				return account.accountCategory === "Other Current Liabilities";
			case "vendorPayable":
				return account.accountCategory === "Accounts Payables";
			case "vendorAdvance":
				return (
					account.accountCategory === "Accounts Receivables" &&
					accountName.includes("supplier")
				);
			case "employeeAdvance":
				return (
					account.accountCategory === "Accounts Receivables" &&
					(accountName.includes("employee") ||
						(accountName.includes("advance") &&
							!accountName.includes("supplier")))
				);
			case "employeePayable":
				return account.accountCategory === "Other Current Liabilities";
		}
	});
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
