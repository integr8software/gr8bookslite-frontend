"use client";

import {
	useState,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
} from "react";
import {
	PartyClassificationOptions,
	PartyCivilStatusOptions,
	PartyDefaultNationality,
	PartyGenderOptions,
	PartyHonorificOptions,
	PartyAccountingAccountFieldLabels,
	PartyManagementFieldClassName,
	PartyManagementFieldControlSelector,
	PartyManagementSelectClassName,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
	DefaultPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/contact/ContactData";
import { formatAtcDisplayCode } from "@/app/src/data/shared/tax/AtcCode";
import type {
	PartyAccountingAccountOptions,
	PartyAccountingAccountField,
	PartyInformationFormErrors,
	PartyInformationDetailsFieldsProps,
	PartyInformationFieldUpdateHandler,
	PartyInformationTab,
	PartyInformationTabId,
	PartyInformationFormValues,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import {
	PartyAddressContainer,
} from "@/app/src/ui/modules/maintenance/party-management/PartyAddressContainer";
import {
	ModuleTabs,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/constants/modules/maintenance/MaintenanceStatusConstants";

export function PartyInformationDetailsFields({
	atcOptions,
	accountOptions,
	errors,
	isClassificationSelected,
	isPartyCodeReadonly = false,
	isReadonly,
	partyTypeOptions,
	taxMaintenanceOptions,
	termOptions,
	values,
	syncedAddressSources,
	canAddAccountTitle,
	canAddTaxRegistrationType,
	canAddTerm,
	onAddAccountTitle,
	onAddTaxRegistrationType,
	onAddTerm,
	onAddressInputChange,
	onCopyAddress,
	onInputChange,
	onPartyTypesChange,
	onSelectBarangay,
	onSelectAtcCode,
	onSelectVatRegistrationType,
	onSelectAutocompleteAddress,
	onSyncAutocompleteAddressDetails,
	onSelectCityMunicipality,
	onSelectProvince,
	onUpdateField,
	onSelectTerm,
}: PartyInformationDetailsFieldsProps) {
	const [activeTab, setActiveTab] =
		useState<PartyInformationTabId>("basic-information");
	const isPartyTypeSelected = values.partyTypes.length > 0;
	const isDetailsDisabled =
		isReadonly || !isClassificationSelected || !isPartyTypeSelected;
	const showBusinessNameFields = values.classification !== "Individual";
	const showPersonalInfoFields =
		values.partyTypes.includes("Employee") || values.partyTypes.includes("Member");
	const showMemberRegistrationDate = values.partyTypes.includes("Member");
	const isMember = values.partyTypes.includes("Member");
	const visiblePartyTypeOptions =
		values.classification === "Non-Individual"
			? partyTypeOptions.filter(
					(type) => type !== "Employee" && type !== "Member",
				)
			: partyTypeOptions;
	const partyTypeSelectOptions = visiblePartyTypeOptions.map((type) => ({
		name: type,
		value: type,
	}));
	const honorificOptions = PartyHonorificOptions.map((honorific) => ({
		description:
			"description" in honorific ? honorific.description : undefined,
		name: honorific.name,
		value: honorific.name,
	}));
	const atcSelectOptions = atcOptions.map((option) => ({
		description: `${option.category}. ${option.description}`,
		name: `${formatAtcDisplayCode(option.code)} (${option.label})`,
		value: option.code,
	}));
	const basicErrorCount = countErrors(errors, [
		"partyCodeNo",
		"classification",
		"partyTypes",
		"status",
		"partyName",
		"firstName",
		"lastName",
		"gender",
		"civilStatus",
		"nationality",
		"memberRegistrationDate",
	]);
	const contactErrorCount = countErrors(errors, [
		"email",
		"contactNo",
		"landline",
		"addresses",
		"addressLine1",
		"addressLine2",
		"regionCode",
		"provinceCode",
		"cityMunicipalityCode",
		"barangayCode",
	]);
	const taxErrorCount = countErrors(errors, ["tin", "atcCode"]);
	const accountingErrorCount = countErrors(errors, [
		"termId",
		"defaultReceivableAccount",
		"customerAdvanceAccount",
		"defaultPayableAccount",
		"vendorAdvanceAccount",
		"employeeAdvanceAccount",
		"employeePayableAccount",
	]);

	const tabs: PartyInformationTab[] = [
				{
					id: "basic-information",
					label: "Basic Information",
					badge: basicErrorCount,
					content: (
						<div className="grid gap-5">
							<div className="grid gap-4 lg:grid-cols-3">
								<Field label="Party Code" error={errors.partyCodeNo} required>
									<input
										name="partyCodeNo"
										value={values.partyCodeNo}
										onChange={onInputChange}
										readOnly={isReadonly || isPartyCodeReadonly}
										className={PartyManagementFieldClassName}
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
										className={PartyManagementSelectClassName}
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
												? "--Select Party Type--"
												: "--Select Classification First--"
										}
										removeSelectionOnSelectedOptionClick
										selectionMode="multiple"
										showSelectionRemoveButton={false}
										value={values.partyTypes}
										onChange={onPartyTypesChange}
									/>
								</Field>
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
											className={PartyManagementFieldClassName}
										/>
									</Field>
									<Field label="Trade Name">
										<input
											name="tradeName"
											value={values.tradeName}
											onChange={onInputChange}
											readOnly={isReadonly}
											disabled={isDetailsDisabled}
											className={PartyManagementFieldClassName}
										/>
									</Field>
								</div>
							) : null}

							{values.classification === "Individual" ? (
								<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)_minmax(0,1.15fr)_minmax(0,1.25fr)_minmax(0,0.85fr)]">
									<Field label="First Name" error={errors.firstName} required>
										<input
											name="firstName"
											value={values.firstName}
											onChange={onInputChange}
											readOnly={isReadonly}
											disabled={isDetailsDisabled}
											className={PartyManagementFieldClassName}
										/>
									</Field>
									<Field label="Middle Name">
										<input
											name="middleName"
											value={values.middleName}
											onChange={onInputChange}
											readOnly={isReadonly}
											disabled={isDetailsDisabled}
											className={PartyManagementFieldClassName}
										/>
									</Field>
									<Field label="Last Name" error={errors.lastName} required>
										<input
											name="lastName"
											value={values.lastName}
											onChange={onInputChange}
											readOnly={isReadonly}
											disabled={isDetailsDisabled}
											className={PartyManagementFieldClassName}
										/>
									</Field>
									<Field label="Suffix">
										<input
											name="suffixName"
											value={values.suffixName}
											onChange={onInputChange}
											readOnly={isReadonly}
											disabled={isDetailsDisabled}
											className={PartyManagementFieldClassName}
										/>
									</Field>
									<Field label="Honorific">
										<AppAdvancedDropdown
											disabled={isDetailsDisabled}
											isSearchable={false}
											options={honorificOptions}
											placeholder="--Select Honorific--"
											value={values.honorific}
											onChange={(value) =>
												onUpdateField(
													"honorific",
													getSingleSelectedValue(value),
												)
											}
											showSelectionIndicator={false}
											showSelectedDetails={false}
										/>
									</Field>
								</div>
							) : null}

							{showPersonalInfoFields ? (
								<div className="grid gap-4 lg:grid-cols-3">
									<Field label="Gender" error={errors.gender} required={isMember}>
										<select
											name="gender"
											value={values.gender}
											onChange={onInputChange}
											disabled={isDetailsDisabled}
											className={PartyManagementSelectClassName}
										>
											<option value="">--Select Gender--</option>
											{PartyGenderOptions.map((gender) => (
												<option key={gender} value={gender}>
													{gender}
												</option>
											))}
										</select>
									</Field>
									<Field
										label="Civil Status"
										error={errors.civilStatus}
										required={isMember}
									>
										<select
											name="civilStatus"
											value={values.civilStatus}
											onChange={onInputChange}
											disabled={isDetailsDisabled}
											className={PartyManagementSelectClassName}
										>
											<option value="">--Select Civil Status--</option>
											{PartyCivilStatusOptions.map((civilStatus) => (
												<option key={civilStatus} value={civilStatus}>
													{civilStatus}
												</option>
											))}
										</select>
									</Field>
									<Field
										label="Nationality"
										error={errors.nationality}
										required={isMember}
									>
										<input
											name="nationality"
											value={values.nationality || PartyDefaultNationality}
											onChange={onInputChange}
											readOnly={isReadonly}
											disabled={isDetailsDisabled}
											className={PartyManagementFieldClassName}
										/>
									</Field>
								</div>
							) : null}

							{showMemberRegistrationDate ? (
								<div className="grid gap-4 lg:grid-cols-3">
									<Field
										label="Member Registration Date"
										error={errors.memberRegistrationDate}
										required
									>
										<input
											name="memberRegistrationDate"
											type="date"
											value={values.memberRegistrationDate}
											onChange={onInputChange}
											readOnly={isReadonly}
											disabled={isDetailsDisabled}
											className={PartyManagementFieldClassName}
										/>
									</Field>
									<StatusField
										error={errors.status}
										isReadonly={isReadonly}
										value={values.status}
										onValueChange={(status) => onUpdateField("status", status)}
									/>
								</div>
							) : null}

							{showMemberRegistrationDate ? null : (
								<div className="grid gap-4 lg:grid-cols-3">
									<StatusField
										error={errors.status}
										isReadonly={isReadonly}
										value={values.status}
										onValueChange={(status) => onUpdateField("status", status)}
									/>
								</div>
							)}
						</div>
					),
				},
				{
					id: "contact-information",
					label: "Contact Information",
					badge: contactErrorCount,
					content: (
						<div className="grid gap-5">
							<div className="grid gap-4 lg:grid-cols-3">
								<Field label="Email Address" error={errors.email}>
									<input
										name="email"
										type="email"
										value={values.email}
										onChange={onInputChange}
										readOnly={isReadonly}
										disabled={isDetailsDisabled}
										className={PartyManagementFieldClassName}
										placeholder="name@example.com"
									/>
								</Field>
								<Field label="Mobile Number" error={errors.contactNo}>
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
										className={PartyManagementFieldClassName}
										placeholder={PhilippineContactNumberPlaceholder}
									/>
								</Field>
								<Field label="Landline" error={errors.landline}>
									<input
										name="landline"
										type="tel"
										value={values.landline}
										onChange={onInputChange}
										readOnly={isReadonly}
										disabled={isDetailsDisabled}
										maxLength={40}
										className={PartyManagementFieldClassName}
										placeholder="(02) 8123 4567"
									/>
								</Field>
							</div>
							<PartyAddressContainer
								addresses={values.addresses}
								disabled={isDetailsDisabled}
								errors={errors}
								partyTypes={values.partyTypes}
								syncedAddressSources={syncedAddressSources}
								onAddressInputChange={onAddressInputChange}
								onCopyAddress={onCopyAddress}
								onSelectBarangay={onSelectBarangay}
								onSelectAutocompleteAddress={onSelectAutocompleteAddress}
								onSyncAutocompleteAddressDetails={
									onSyncAutocompleteAddressDetails
								}
								onSelectCityMunicipality={onSelectCityMunicipality}
								onSelectProvince={onSelectProvince}
							/>
						</div>
					),
				},
				{
					id: "tax-information",
					label: "Tax Information",
					badge: taxErrorCount,
					content: (
						<div className="grid gap-5">
							<div className="grid gap-4 lg:grid-cols-2">
								<Field
									label="Tax Identification Number (TIN)"
									error={errors.tin}
								>
									<input
										name="tin"
										inputMode="numeric"
										maxLength={15}
										value={values.tin}
										onChange={onInputChange}
										readOnly={isReadonly}
										disabled={isDetailsDisabled}
										className={PartyManagementFieldClassName}
										placeholder="000-000-000-000"
									/>
								</Field>
								<Field label="VAT Registration Type">
									<AppAdvancedDropdown
										addAction={
											canAddTaxRegistrationType && onAddTaxRegistrationType
												? {
														disabled: isDetailsDisabled,
														label: "Add Tax Registration Type",
														onClick: onAddTaxRegistrationType,
													}
												: undefined
										}
										disabled={isDetailsDisabled}
										emptyMessage="No active tax maintenance records found."
										options={taxMaintenanceOptions}
										placeholder="--Select VAT Type--"
										searchPlaceholder="Search VAT type"
										showSelectedDetails
										value={values.vatRegistrationTypeId}
										onChange={onSelectVatRegistrationType}
									/>
								</Field>
								<Field label="BIR ATC Code" error={errors.atcCode}>
									<AppAdvancedDropdown
										disabled={isDetailsDisabled}
										emptyMessage="No ATC codes match the selected classification."
										optionViewToggle
										options={atcSelectOptions}
										placeholder="--Select BIR ATC Code--"
										searchPlaceholder="Search ATC code, label, or description"
										showSelectedDetails
										value={values.atcCode}
										onChange={onSelectAtcCode}
									/>
								</Field>
							</div>
						</div>
					),
				},
				{
					id: "accounting-information",
					label: "Accounting Information",
					badge: accountingErrorCount,
					content: (
						<div className="grid gap-5">
							<AccountFields
								accountOptions={accountOptions}
								canAddAccountTitle={canAddAccountTitle}
								canAddTerm={canAddTerm}
								disabled={isDetailsDisabled}
								errors={errors}
								termOptions={termOptions}
								values={values}
								onAddAccountTitle={onAddAccountTitle}
								onAddTerm={onAddTerm}
								onSelectTerm={onSelectTerm}
								onUpdateField={onUpdateField}
							/>
						</div>
					),
				},
			];
	const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

	return (
		<div className="grid gap-5">
			<ModuleTabs
				activeTab={activeTab}
				ariaLabel="Party information sections"
				tabs={tabs}
				onTabChange={setActiveTab}
			/>
			<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
				{activeTabContent}
			</section>
		</div>
	);
}

function AccountFields({
	accountOptions,
	canAddAccountTitle,
	canAddTerm,
	disabled,
	errors,
	termOptions,
	values,
	onAddAccountTitle,
	onAddTerm,
	onSelectTerm,
	onUpdateField,
}: {
	accountOptions: PartyAccountingAccountOptions;
	canAddAccountTitle?: boolean;
	canAddTerm?: boolean;
	disabled: boolean;
	errors: PartyInformationFormErrors;
	termOptions: PartyInformationDetailsFieldsProps["termOptions"];
	values: PartyInformationFormValues;
	onAddAccountTitle?: PartyInformationDetailsFieldsProps["onAddAccountTitle"];
	onAddTerm?: PartyInformationDetailsFieldsProps["onAddTerm"];
	onSelectTerm: PartyInformationDetailsFieldsProps["onSelectTerm"];
	onUpdateField: PartyInformationFieldUpdateHandler;
}) {
	const isCustomer = values.partyTypes.includes("Customer");
	const isVendor = values.partyTypes.includes("Vendor");
	const isEmployee = values.partyTypes.includes("Employee");
	const hasAccountingFields = isCustomer || isVendor || isEmployee;
	const isAccountingDisabled = disabled || !hasAccountingFields;

	return (
		<div className="grid gap-4 md:grid-cols-2">
			{isCustomer ? (
				<Field
					label="Default Receivable Account"
					error={errors.defaultReceivableAccount}
					required
				>
					<ChartAccountDropdown
						addAction={createAccountAddAction(
							"defaultReceivableAccount",
							canAddAccountTitle,
							isAccountingDisabled,
							onAddAccountTitle,
						)}
						accounts={accountOptions.defaultReceivableAccount}
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
						addAction={createAccountAddAction(
							"customerAdvanceAccount",
							canAddAccountTitle,
							isAccountingDisabled,
							onAddAccountTitle,
						)}
						accounts={accountOptions.customerAdvanceAccount}
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
						addAction={createAccountAddAction(
							"defaultPayableAccount",
							canAddAccountTitle,
							isAccountingDisabled,
							onAddAccountTitle,
						)}
						accounts={accountOptions.defaultPayableAccount}
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
						addAction={createAccountAddAction(
							"vendorAdvanceAccount",
							canAddAccountTitle,
							isAccountingDisabled,
							onAddAccountTitle,
						)}
						accounts={accountOptions.vendorAdvanceAccount}
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
						addAction={createAccountAddAction(
							"employeeAdvanceAccount",
							canAddAccountTitle,
							isAccountingDisabled,
							onAddAccountTitle,
						)}
						accounts={accountOptions.employeeAdvanceAccount}
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
						addAction={createAccountAddAction(
							"employeePayableAccount",
							canAddAccountTitle,
							isAccountingDisabled,
							onAddAccountTitle,
						)}
						accounts={accountOptions.employeePayableAccount}
						disabled={isAccountingDisabled}
						valueField="id"
						value={values.employeePayableAccount}
						onChange={(value) =>
							onUpdateField("employeePayableAccount", value)
						}
					/>
				</Field>
			) : null}
			<Field label="Default Terms" error={errors.termId}>
				<AppAdvancedDropdown
					addAction={
						canAddTerm && onAddTerm
							? {
									disabled,
									label: "Add Terms",
									onClick: onAddTerm,
								}
							: undefined
					}
					disabled={disabled}
					emptyMessage="No Active Terms Found."
					options={termOptions}
					placeholder="--Select Terms--"
					searchPlaceholder="Search Terms"
					value={values.termId}
					onChange={onSelectTerm}
				/>
			</Field>
		</div>
	);
}

function createAccountAddAction(
	field: PartyAccountingAccountField,
	canAddAccountTitle?: boolean,
	disabled?: boolean,
	onAddAccountTitle?: PartyInformationDetailsFieldsProps["onAddAccountTitle"],
) {
	return canAddAccountTitle && onAddAccountTitle
		? {
				disabled,
				label: `Add ${PartyAccountingAccountFieldLabels[field]} Title`,
				onClick: () => onAddAccountTitle(field),
			}
		: undefined;
}

function countErrors(
	errors: PartyInformationFormErrors,
	fields: Array<keyof PartyInformationFormErrors>,
) {
	return fields.filter((field) => Boolean(errors[field])).length;
}

function getSingleSelectedValue(value: string | string[]) {
	return Array.isArray(value) ? (value[0] ?? "") : value;
}

function StatusField({
	error,
	isReadonly,
	value,
	onValueChange,
}: {
	error?: string;
	isReadonly: boolean;
	value: PartyInformationFormValues["status"];
	onValueChange: (value: PartyInformationFormValues["status"]) => void;
}) {
	return (
		<Field label="Status" error={error} required>
			<AppSwitch
				falseOption={MaintenanceInactiveStatusSwitchOption}
				value={value}
				onChange={onValueChange}
				readOnly={isReadonly}
				trueOption={MaintenanceActiveStatusSwitchOption}
			/>
		</Field>
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

