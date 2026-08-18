"use client";

import { useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import {
  PartyClassificationOptions,
  PartyCivilStatusOptions,
  PartyDefaultNationality,
  PartyEntityTypeOptions,
  PartyGenderOptions,
  PartyHonorificOptions,
  PartyAccountingAccountFieldLabels,
  PartyManagementFieldClassName,
  PartyManagementFieldControlSelector,
  PartyManagementSelectClassName,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import {
  DefaultPhilippineContactNumber,
  PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/contact/ContactData";
import type {
  PartyAccountingAccountOptions,
  PartyAccountingAccountField,
  PartyInformationFormErrors,
  PartyInformationDetailsFieldsProps,
  PartyInformationFieldUpdateHandler,
  PartyInformationTab,
  PartyInformationTabId,
  PartyInformationFormValues,
  PartyEntityType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { PartyTaxDefaultClassificationKey } from "@/app/src/types/shared/tax/TaxTypes";
import { isPartyEntityTypeWithholdingDefaultEnabled } from "@/app/src/data/modules/party-management/PartyManagementData";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { PartyAddressContainer } from "@/app/src/ui/modules/party-management/PartyAddressContainer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import {
  MaintenanceActiveStatusSwitchOption,
  MaintenanceInactiveStatusSwitchOption,
} from "@/app/src/utils/status.util";

export function PartyInformationDetailsFields({
  accountOptions,
  errors,
  isClassificationSelected,
  isPartyCodeReadonly = false,
  isReadonly,
  partyTypeOptions,
  taxDefaultOptionsError = false,
  taxDefaultOptionsLoading = false,
  taxDefaultOptions,
  termOptions,
  values,
  syncedAddressSources,
  canAddAccountTitle,
  canAddTerm,
  onAddAccountTitle,
  onAddTerm,
  onAddressInputChange,
  onCopyAddress,
  onInputChange,
  onPartyTypesChange,
  onSelectBarangay,
  onSelectAutocompleteAddress,
  onSyncAutocompleteAddressDetails,
  onSelectCityMunicipality,
  onSelectProvince,
  onUpdateField,
  onSelectTerm,
}: PartyInformationDetailsFieldsProps) {
  const [activeTab, setActiveTab] = useState<PartyInformationTabId>("basic-information");
  const isPartyTypeSelected = values.partyTypes.length > 0;
  const isDetailsDisabled = isReadonly || !isClassificationSelected || !isPartyTypeSelected;
  const showBusinessNameFields = values.classification !== "Individual";
  const showPersonalInfoFields =
    values.partyTypes.includes("Employee") || values.partyTypes.includes("Member");
  const showMemberRegistrationDate = values.partyTypes.includes("Member");
  const isMember = values.partyTypes.includes("Member");
  const showPartyEntityTypeField =
    values.classification === "Non-Individual" && isPartyTypeSelected;
  const showWithholdingDefaults =
    isPartyEntityTypeWithholdingDefaultEnabled(values.partyEntityType);
  const visiblePartyTypeOptions =
    values.classification === "Non-Individual"
      ? partyTypeOptions.filter((type) => type !== "Employee" && type !== "Member")
      : partyTypeOptions;
  const partyTypeSelectOptions = visiblePartyTypeOptions.map((type) => ({
    name: type,
    value: type,
  }));
  const partyEntityTypeSelectOptions = [...PartyEntityTypeOptions]
    .filter(
      (option) =>
        option.classificationScope === values.classification,
    )
    .sort((leftOption, rightOption) => leftOption.sortOrder - rightOption.sortOrder)
    .map((option) => ({
      description: option.description,
      name: option.name,
      value: option.name,
    }));
  const honorificOptions = PartyHonorificOptions.map((honorific) => ({
    description: "description" in honorific ? honorific.description : undefined,
    name: honorific.name,
    value: honorific.name,
  }));
  const basicErrorCount = countErrors(errors, [
    "partyCodeNo",
    "classification",
    "partyEntityType",
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
    "contactPerson",
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
  const taxErrorCount = countErrors(errors, [
    "tin",
    "defaultPurchaseInputVatTaxSourceKey",
    "defaultPurchaseEwtTaxSourceKey",
    "defaultPurchaseFwtTaxSourceKey",
    "defaultPurchaseWvatTaxSourceKey",
    "defaultSalesOutputVatTaxSourceKey",
    "defaultSalesCwtTaxSourceKey",
    "defaultSalesWvatTaxSourceKey",
  ]);
  const accountingErrorCount = countErrors(errors, [
    "termId",
    "defaultReceivableAccount",
    "customerAdvanceAccount",
    "defaultPayableAccount",
    "vendorAdvanceAccount",
    "employeeAdvanceAccount",
    "employeePayableAccount",
    "cashAdvanceLimit",
  ]);

  const tabs: PartyInformationTab[] = [
    {
      id: "basic-information",
      label: "Basic Information",
      badge: basicErrorCount,
      content: (
        <div className="grid gap-5">
          <div
            className={
              showPartyEntityTypeField
                ? "grid gap-4 lg:grid-cols-4"
                : "grid gap-4 lg:grid-cols-3"
            }
          >
            <Field label="Party Code" error={errors.partyCodeNo} required>
              <input
                name="partyCodeNo"
                value={values.partyCodeNo}
                onChange={onInputChange}
                readOnly={isReadonly || isPartyCodeReadonly}
                className={PartyManagementFieldClassName}
              />
            </Field>
            <Field label="Party Classification" error={errors.classification} required>
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
            {showPartyEntityTypeField ? (
              <Field label="Party Entity" error={errors.partyEntityType} required>
                <AppAdvancedDropdown
                  disabled={isDetailsDisabled}
                  emptyMessage="No matching entity type found."
                  options={partyEntityTypeSelectOptions}
                  placeholder="--Select Entity Type--"
                  searchPlaceholder="Search entity type"
                  value={values.partyEntityType}
                  onChange={(value) =>
                    onUpdateField(
                      "partyEntityType",
                      getSingleSelectedValue(value) as PartyEntityType | "",
                    )
                  }
                />
              </Field>
            ) : null}
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
                  onChange={(value) => onUpdateField("honorific", getSingleSelectedValue(value))}
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
              <Field label="Civil Status" error={errors.civilStatus} required={isMember}>
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
              <Field label="Nationality" error={errors.nationality} required={isMember}>
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Contact Person" error={errors.contactPerson}>
              <input
                name="contactPerson"
                value={values.contactPerson}
                onChange={onInputChange}
                readOnly={isReadonly}
                disabled={isDetailsDisabled}
                className={PartyManagementFieldClassName}
                placeholder="Contact person"
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
                    onUpdateField("contactNo", DefaultPhilippineContactNumber);
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
            onSyncAutocompleteAddressDetails={onSyncAutocompleteAddressDetails}
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
            <Field label="Tax Identification Number (TIN)" error={errors.tin}>
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
          </div>
          {values.partyTypes.includes("Vendor") ? (
            <TaxDefaultGroup title="Purchase Tax Defaults">
              <TaxDefaultField
                disabled={isDetailsDisabled}
                error={errors.defaultPurchaseInputVatTaxSourceKey}
                field="defaultPurchaseInputVatTaxSourceKey"
                label="Input VAT"
                loadState={getTaxDefaultLoadState(taxDefaultOptionsLoading, taxDefaultOptionsError)}
                options={taxDefaultOptions.defaultPurchaseInputVatTaxSourceKey ?? []}
                value={values.defaultPurchaseInputVatTaxSourceKey}
                onUpdateField={onUpdateField}
              />
              <TaxDefaultField
                disabled={isDetailsDisabled}
                error={errors.defaultPurchaseEwtTaxSourceKey}
                field="defaultPurchaseEwtTaxSourceKey"
                label="Expanded Withholding Tax"
                loadState={getTaxDefaultLoadState(taxDefaultOptionsLoading, taxDefaultOptionsError)}
                options={taxDefaultOptions.defaultPurchaseEwtTaxSourceKey ?? []}
                value={values.defaultPurchaseEwtTaxSourceKey}
                onUpdateField={onUpdateField}
              />
              {showWithholdingDefaults ? (
                <>
                  <TaxDefaultField
                    disabled={isDetailsDisabled}
                    error={errors.defaultPurchaseFwtTaxSourceKey}
                    field="defaultPurchaseFwtTaxSourceKey"
                    label="Final Withholding Tax"
                    loadState={getTaxDefaultLoadState(taxDefaultOptionsLoading, taxDefaultOptionsError)}
                    options={taxDefaultOptions.defaultPurchaseFwtTaxSourceKey ?? []}
                    value={values.defaultPurchaseFwtTaxSourceKey}
                    onUpdateField={onUpdateField}
                  />
                  <TaxDefaultField
                    disabled={isDetailsDisabled}
                    error={errors.defaultPurchaseWvatTaxSourceKey}
                    field="defaultPurchaseWvatTaxSourceKey"
                    label="VAT Withholding"
                    loadState={getTaxDefaultLoadState(taxDefaultOptionsLoading, taxDefaultOptionsError)}
                    options={taxDefaultOptions.defaultPurchaseWvatTaxSourceKey ?? []}
                    value={values.defaultPurchaseWvatTaxSourceKey}
                    onUpdateField={onUpdateField}
                  />
                </>
              ) : null}
            </TaxDefaultGroup>
          ) : null}
          {values.partyTypes.includes("Customer") ? (
            <TaxDefaultGroup title="Sales Tax Defaults">
              <TaxDefaultField
                disabled={isDetailsDisabled}
                error={errors.defaultSalesOutputVatTaxSourceKey}
                field="defaultSalesOutputVatTaxSourceKey"
                label="Output VAT"
                loadState={getTaxDefaultLoadState(taxDefaultOptionsLoading, taxDefaultOptionsError)}
                options={taxDefaultOptions.defaultSalesOutputVatTaxSourceKey ?? []}
                value={values.defaultSalesOutputVatTaxSourceKey}
                onUpdateField={onUpdateField}
              />
              <TaxDefaultField
                disabled={isDetailsDisabled}
                error={errors.defaultSalesCwtTaxSourceKey}
                field="defaultSalesCwtTaxSourceKey"
                label="Creditable Withholding Tax"
                loadState={getTaxDefaultLoadState(taxDefaultOptionsLoading, taxDefaultOptionsError)}
                options={taxDefaultOptions.defaultSalesCwtTaxSourceKey ?? []}
                value={values.defaultSalesCwtTaxSourceKey}
                onUpdateField={onUpdateField}
              />
              {showWithholdingDefaults ? (
                <TaxDefaultField
                  disabled={isDetailsDisabled}
                  error={errors.defaultSalesWvatTaxSourceKey}
                  field="defaultSalesWvatTaxSourceKey"
                  label="VAT Withholding"
                  loadState={getTaxDefaultLoadState(taxDefaultOptionsLoading, taxDefaultOptionsError)}
                  options={taxDefaultOptions.defaultSalesWvatTaxSourceKey ?? []}
                  value={values.defaultSalesWvatTaxSourceKey}
                  onUpdateField={onUpdateField}
                />
              ) : null}
            </TaxDefaultGroup>
          ) : null}
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

function TaxDefaultGroup({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="grid gap-3">
      <h3 className="text-sm font-semibold text-darknavy">{title}</h3>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </div>
  );
}

function TaxDefaultField({
  disabled,
  error,
  field,
  label,
  loadState,
  options,
  value,
  onUpdateField,
}: {
  disabled: boolean;
  error?: string;
  field: PartyTaxDefaultClassificationKey;
  label: string;
  loadState: TaxDefaultLoadState;
  options: PartyInformationDetailsFieldsProps["taxDefaultOptions"][PartyTaxDefaultClassificationKey];
  value: string;
  onUpdateField: PartyInformationFieldUpdateHandler;
}) {
  const showOptionViewToggle = ![
    "defaultPurchaseInputVatTaxSourceKey",
    "defaultSalesOutputVatTaxSourceKey",
  ].includes(field);

  return (
    <Field label={label} error={error}>
      <AppAdvancedDropdown
        disabled={disabled}
        emptyMessage={getTaxDefaultEmptyMessage(loadState)}
        optionViewToggle={showOptionViewToggle}
        options={options}
        placeholder={`--Select ${label}--`}
        searchPlaceholder="Search tax name, code, rate, or description"
        value={value}
        onChange={(nextValue) => onUpdateField(field, getSingleSelectedValue(nextValue))}
      />
    </Field>
  );
}

type TaxDefaultLoadState = "error" | "loading" | "ready";

function getTaxDefaultLoadState(isLoading: boolean, isError: boolean): TaxDefaultLoadState {
  if (isLoading) {
    return "loading";
  }

  if (isError) {
    return "error";
  }

  return "ready";
}

function getTaxDefaultEmptyMessage(loadState: TaxDefaultLoadState) {
  if (loadState === "loading") {
    return "Loading tax records...";
  }

  if (loadState === "error") {
    return "Unable to load tax records. Check your session and try again.";
  }

  return "No matching tax records found.";
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
        <Field label="Default Receivable Account" error={errors.defaultReceivableAccount} required>
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
            onChange={(value) => onUpdateField("defaultReceivableAccount", value)}
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
            onChange={(value) => onUpdateField("customerAdvanceAccount", value)}
          />
        </Field>
      ) : null}
      {isVendor ? (
        <Field label="Default Payable Account" error={errors.defaultPayableAccount} required>
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
            onChange={(value) => onUpdateField("defaultPayableAccount", value)}
          />
        </Field>
      ) : null}
      {isVendor ? (
        <Field label="Default Vendor Advance Account" error={errors.vendorAdvanceAccount} required>
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
            onChange={(value) => onUpdateField("employeeAdvanceAccount", value)}
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
            onChange={(value) => onUpdateField("employeePayableAccount", value)}
          />
        </Field>
      ) : null}
      {isEmployee ? (
        <Field label="Cash Advance Limit" error={errors.cashAdvanceLimit}>
          <MoneyNumberField
            name="cashAdvanceLimit"
            value={values.cashAdvanceLimit}
            onValueChange={(value) => onUpdateField("cashAdvanceLimit", value)}
            readOnly={disabled}
            className={`${PartyManagementFieldClassName} text-right tabular-nums`}
            placeholder="0.00"
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

    if (!(target instanceof Element) || target.closest(PartyManagementFieldControlSelector)) {
      return;
    }

    const control = event.currentTarget.querySelector<HTMLElement>(
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
        <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span>
      ) : null}
    </div>
  );
}
