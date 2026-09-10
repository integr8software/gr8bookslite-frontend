"use client";
import { PartyManagementFieldClassName } from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import { getSingleSelectedValue } from "@/app/src/data/modules/party-management/PartyInformationTabsData";
import type { PartyBankInformationTabProps } from "@/app/src/types/modules/party-management/PartyInformationTabsTypes";
import { Field } from "@/app/src/ui/modules/party-management/forms/PartyInformationField";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function PartyBankInformationTab({
  errors,
  isReadonly,
  paymentTypeOptions,
  bankOptions,
  values,
  canAddPaymentType,
  canAddBank,
  onAddPaymentType,
  onAddBank,
  onInputChange,
  onUpdateField,
  onSelectPaymentType,
  onSelectBank,
  isDetailsDisabled,
}: PartyBankInformationTabProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Default Payment Type" error={errors.defaultPaymentTypeId}>
          <AppAdvancedDropdown
            addAction={
              canAddPaymentType && onAddPaymentType
                ? {
                    disabled: isDetailsDisabled,
                    label: "Add Payment Type",
                    onClick: onAddPaymentType,
                  }
                : undefined
            }
            disabled={isDetailsDisabled}
            emptyMessage="No matching payment type found."
            options={paymentTypeOptions ?? []}
            placeholder="--Select Payment Type--"
            searchPlaceholder="Search Payment Type"
            value={values.defaultPaymentTypeId}
            onChange={
              onSelectPaymentType ??
              ((val) =>
                onUpdateField(
                  "defaultPaymentTypeId",
                  getSingleSelectedValue(val),
                ))
            }
          />
        </Field>
        <Field label="Default Bank" error={errors.defaultBank}>
          <AppAdvancedDropdown
            addAction={
              canAddBank && onAddBank
                ? {
                    disabled: isDetailsDisabled,
                    label: "Add Bank",
                    onClick: onAddBank,
                  }
                : undefined
            }
            disabled={isDetailsDisabled}
            emptyMessage="No matching bank found."
            options={bankOptions ?? []}
            placeholder="--Select Bank--"
            searchPlaceholder="Search Bank"
            value={values.defaultBank}
            onChange={
              onSelectBank ??
              ((val) =>
                onUpdateField("defaultBank", getSingleSelectedValue(val)))
            }
          />
        </Field>
        <Field
          label="Default Bank Account No."
          error={errors.defaultBankAccountNo}
        >
          <input
            name="defaultBankAccountNo"
            value={values.defaultBankAccountNo}
            onChange={onInputChange}
            readOnly={isReadonly}
            disabled={isDetailsDisabled}
            className={PartyManagementFieldClassName}
            placeholder="Enter bank account no."
          />
        </Field>
      </div>
    </div>
  );
}
