"use client";

import {
  PartyManagementFieldClassName,
  PartyPurchaseTypeOptions,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import {
  createAccountAddAction,
  getSingleSelectedValue,
} from "@/app/src/data/modules/party-management/PartyInformationTabsData";
import type {
  PartyAccountingFieldsProps,
  PartyAccountingInformationTabProps,
} from "@/app/src/types/modules/party-management/PartyInformationTabsTypes";
import { Field } from "@/app/src/ui/modules/party-management/forms/PartyInformationField";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

export function PartyAccountingInformationTab({
  accountOptions,
  errors,
  termOptions,
  responsibilityCenterOptions,
  values,
  canAddAccountTitle,
  canAddTerm,
  canAddResponsibilityCenter,
  onAddAccountTitle,
  onAddTerm,
  onAddResponsibilityCenter,
  onUpdateField,
  onSelectTerm,
  onSelectResponsibilityCenter,
  isDetailsDisabled,
}: PartyAccountingInformationTabProps) {
  return (
    <div className="grid gap-5">
      <AccountFields
        accountOptions={accountOptions}
        canAddAccountTitle={canAddAccountTitle}
        canAddResponsibilityCenter={canAddResponsibilityCenter}
        canAddTerm={canAddTerm}
        disabled={isDetailsDisabled}
        errors={errors}
        responsibilityCenterOptions={responsibilityCenterOptions}
        termOptions={termOptions}
        values={values}
        onAddAccountTitle={onAddAccountTitle}
        onAddResponsibilityCenter={onAddResponsibilityCenter}
        onAddTerm={onAddTerm}
        onSelectResponsibilityCenter={onSelectResponsibilityCenter}
        onSelectTerm={onSelectTerm}
        onUpdateField={onUpdateField}
      />
    </div>
  );
}

function AccountFields({
  accountOptions,
  canAddAccountTitle,
  canAddResponsibilityCenter,
  canAddTerm,
  disabled,
  errors,
  responsibilityCenterOptions,
  termOptions,
  values,
  onAddAccountTitle,
  onAddResponsibilityCenter,
  onAddTerm,
  onSelectResponsibilityCenter,
  onSelectTerm,
  onUpdateField,
}: PartyAccountingFieldsProps) {
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
            onChange={(value) => onUpdateField("customerAdvanceAccount", value)}
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
            onChange={(value) => onUpdateField("defaultPayableAccount", value)}
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
      {isVendor ? (
        <Field label="Purchase Type" error={errors.purchaseType}>
          <AppAdvancedDropdown
            id="party-purchase-type"
            disabled={isAccountingDisabled}
            emptyMessage="No matching purchase type found."
            options={PartyPurchaseTypeOptions.map((option) => ({
              name: option,
              value: option,
            }))}
            placeholder="--Select Option--"
            searchPlaceholder="Search purchase type"
            value={values.purchaseType}
            onChange={(value) =>
              onUpdateField("purchaseType", getSingleSelectedValue(value))
            }
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
      <Field
        label="Default Responsibility Center"
        error={errors.defaultResponsibilityCenterId}
      >
        <AppAdvancedDropdown
          addAction={
            canAddResponsibilityCenter && onAddResponsibilityCenter
              ? {
                  disabled,
                  label: "Add Responsibility Center",
                  onClick: onAddResponsibilityCenter,
                }
              : undefined
          }
          disabled={disabled}
          emptyMessage="No matching responsibility center found."
          options={responsibilityCenterOptions ?? []}
          placeholder="--Select Responsibility Center--"
          searchPlaceholder="Search Responsibility Center"
          value={values.defaultResponsibilityCenterId}
          onChange={
            onSelectResponsibilityCenter ??
            ((val) =>
              onUpdateField(
                "defaultResponsibilityCenterId",
                getSingleSelectedValue(val),
              ))
          }
        />
      </Field>
    </div>
  );
}
