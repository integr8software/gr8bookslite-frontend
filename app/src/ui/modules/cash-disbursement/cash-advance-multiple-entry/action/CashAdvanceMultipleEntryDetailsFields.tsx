import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCashAdvanceAccountOptions,
  fetchCashAdvancePartyOptions,
} from "@/app/src/services/modules/cash-disbursement/cash-advance/CashAdvanceApi";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/party-management/PartyManagementQueryKeys";
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
  const partyQuery = useQuery({
    queryKey: PartyManagementQueryKeys.cashAdvancePartyOptions(),
    queryFn: fetchCashAdvancePartyOptions,
  });
  const accountQuery = useQuery({
    queryKey: ["cash-disbursement", "cash-advance-multiple-entry", "account-options"],
    queryFn: fetchCashAdvanceAccountOptions,
  });
  const partyOptions = useMemo(() => {
    const options = (partyQuery.data ?? []).map((party) => ({
      ...party,
      label: party.partyCode || party.label || party.name,
      value: party.partyCode || party.label || party.name,
    }));

    if (values.partyCode && !options.some((option) => option.value === values.partyCode)) {
      options.unshift({
        name: values.partyName || values.partyCode,
        label: values.partyCode,
        value: values.partyCode,
        partyCode: values.partyCode,
        partyName: values.partyName,
      });
    }

    return options;
  }, [partyQuery.data, values.partyCode, values.partyName]);
  const accountOptions = useMemo(() => {
    const options = (accountQuery.data ?? []).map((account) => ({
      ...account,
      label: account.accountCode || account.label || account.name,
      value: account.accountCode || account.label || account.name,
    }));

    if (values.accountCode && !options.some((option) => option.value === values.accountCode)) {
      options.unshift({
        name: values.accountTitle || values.accountCode,
        label: values.accountCode,
        value: values.accountCode,
        accountCode: values.accountCode,
        accountTitle: values.accountTitle,
      });
    }

    return options;
  }, [accountQuery.data, values.accountCode, values.accountTitle]);

  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Column 1: Name & Lookup Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Employee Name" isRequired>
            <AppLookupDropdown
              value={values.partyCode}
              options={partyOptions}
              readOnly={isReadonly}
              placeholder="Select Employee Name"
              searchPlaceholder="Search Employee Name"
              addAction={!isReadonly ? { label: "Add Employee Name", onClick: onOpenPartyDrawer } : undefined}
              onChange={(code, name) => {
                const selectedParty = partyOptions.find((option) => option.value === code);
                onUpdateField("partyCode", selectedParty?.partyCode ?? code);
                onUpdateField("partyName", selectedParty?.partyName ?? name);
              }}
            />
          </TransactionField>

          <TransactionField label="Project Name">
            <AppLookupDropdown
              value={values.projectName}
              options={projectOptions}
              readOnly={isReadonly}
              placeholder="Select Project Name"
              searchPlaceholder="Search Project Name"
              addAction={!isReadonly ? { label: "Add Project Name", onClick: onOpenProjectDrawer } : undefined}
              onChange={(projectName) => {
                const project = projectOptions.find((option) => option.value === projectName);
                onUpdateField("projectName", projectName);
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
                const selectedAccount = accountOptions.find((option) => option.value === code);
                onUpdateField("accountCode", selectedAccount?.accountCode ?? code);
                onUpdateField("accountTitle", selectedAccount?.accountTitle ?? name);
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
            label="Employee Code"
            onValueChange={(value) => onUpdateField("partyCode", value)}
            placeholder="Employee Code"
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
            label="CAME Date"
            type="date"
            onValueChange={(value) => onUpdateField("documentDate", value)}
          />

          <TransactionTextField value={values.status} isReadonly label="Status" onValueChange={() => undefined} />
        </div>
      </div>
    </section>
  );
}
