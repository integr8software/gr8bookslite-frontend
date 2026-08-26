import { useMemo } from "react";
import { CashAdvanceMultipleEntryAccountOptions } from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  createCashAdvanceMultipleEntryPartyOptions,
  createCashAdvanceMultipleEntrySelectOptions,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import type {
  CashAdvanceMultipleEntryFormController,
  CashAdvanceMultipleEntryFormValues,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLookupDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppLookupDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import {
  TransactionField,
  TransactionFieldClassName,
  TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";

export function CashAdvanceMultipleEntryDetailsFields({
  currencyOptions,
  isExchangeRateLoading,
  isReadonly,
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onUpdateCurrency,
  onUpdateField,
  projectOptions,
  values,
}: {
  currencyOptions: AppAdvancedDropdownOption[];
  isExchangeRateLoading: boolean;
  isReadonly: boolean;
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onUpdateCurrency: (currencyCode: string) => void;
  values: CashAdvanceMultipleEntryFormValues;
  projectOptions: AppAdvancedDropdownOption[];
  onUpdateField: CashAdvanceMultipleEntryFormController["updateField"];
}) {
  const partyOptions = useMemo(
    () => createCashAdvanceMultipleEntryPartyOptions(values.partyCode, values.partyName),
    [values.partyCode, values.partyName],
  );
  const accountOptions = useMemo(() => createCashAdvanceMultipleEntrySelectOptions(CashAdvanceMultipleEntryAccountOptions), []);

  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Column 1: Name & Lookup Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Party Name" isRequired>
            <AppLookupDropdown
              value={values.partyCode}
              options={partyOptions}
              readOnly={isReadonly}
              placeholder="Select Party Name"
              searchPlaceholder="Search Party Name"
              addAction={!isReadonly ? { label: "Add Party Name", onClick: onOpenPartyDrawer } : undefined}
              onChange={(code, name) => {
                onUpdateField("partyCode", code);
                onUpdateField("partyName", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Project Name">
            <AppLookupDropdown
              value={values.projectRef}
              options={projectOptions}
              readOnly={isReadonly}
              placeholder="Select Project Name"
              searchPlaceholder="Search Project Name"
              addAction={!isReadonly ? { label: "Add Project Name", onClick: onOpenProjectDrawer } : undefined}
              onChange={(projectName) => {
                const project = projectOptions.find((option) => option.value === projectName);
                onUpdateField("projectRef", projectName);
                onUpdateField("projectCode", project?.label === projectName ? "" : (project?.label ?? ""));
              }}
            />
          </TransactionField>

          <TransactionField label="Default Account Title" isRequired>
            <AppLookupDropdown
              value={values.accountCode}
              options={accountOptions}
              readOnly={isReadonly}
              placeholder="Select Default Account Title"
              searchPlaceholder="Search Default Account"
              onChange={(code, name) => {
                onUpdateField("accountCode", code);
                onUpdateField("accountTitle", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Remarks">
            <AppLimitedTextarea
              value={values.remarks}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${TransactionFieldClassName} min-h-28 max-w-full resize py-3`}
              counterMode="used"
              placeholder="Optional Remarks"
            />
          </TransactionField>
        </div>

        {/* Column 2: Aligned Code & Currency Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={values.partyCode}
            isReadonly
            isRequired
            label="Party Code"
            onValueChange={(value) => onUpdateField("partyCode", value)}
            placeholder="Party Code"
          />

          <TransactionTextField
            value={values.projectCode}
            isReadonly
            label="Project Code"
            onValueChange={(value) => onUpdateField("projectCode", value)}
            placeholder="Project Code"
          />

          <TransactionTextField
            value={values.accountCode}
            isReadonly
            isRequired
            label="Default Account Code"
            onValueChange={(value) => onUpdateField("accountCode", value)}
            placeholder="Default Account Code"
          />

          <CurrencyExchangeRateRow
            currencyLabel="Currency"
            currencyControlId="came-currency"
            exchangeRateControlId="came-exchange-rate"
            currencyControl={
              <AppAdvancedDropdown
                id="came-currency"
                className="w-full min-w-0"
                value={values.currency}
                readOnly={isReadonly}
                isClearable={false}
                menuMinWidth={320}
                options={currencyOptions}
                placeholder="Currency"
                searchPlaceholder="Search Currency"
                onChange={(value) => onUpdateCurrency(String(value))}
              />
            }
            exchangeRateControl={
              <input
                id="came-exchange-rate"
                type="text"
                inputMode="decimal"
                value={values.exchangeRate}
                readOnly={isReadonly}
                disabled={isReadonly || isExchangeRateLoading}
                onChange={(event) => onUpdateField("exchangeRate", formatExchangeRateInput(event.target.value))}
                className={`${TransactionFieldClassName} text-right tabular-nums${isReadonly || isExchangeRateLoading ? " transaction-readonly-placeholder" : ""}`}
                placeholder="0.00"
              />
            }
          />
        </div>

        {/* Column 3: Transaction Identity & Status */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={values.transNo}
            isReadonly
            isRequired
            label="CAME No."
            onValueChange={(value) => onUpdateField("transNo", value)}
            placeholder="Auto Generated CAME Transaction Number"
          />

          <TransactionTextField
            value={values.documentDate}
            isReadonly={isReadonly}
            isRequired
            label="Document Date"
            type="date"
            onValueChange={(value) => onUpdateField("documentDate", value)}
          />

          <TransactionTextField value={values.status} isReadonly label="Status" onValueChange={() => undefined} />
        </div>
      </div>
    </section>
  );
}
