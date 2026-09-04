import { useMemo } from "react";
import { usePartyLookup } from "@/app/src/hooks/modules/party-management/usePartyLookup";
import { usePostingAccountLookup } from "@/app/src/hooks/modules/financial-maintenance/charts-of-accounts/useChartOfAccountsLookup";
import { ensureDropdownOption } from "@/app/src/utils/dropdown.util";
import type {
  CashAdvanceMultipleEntryFormController,
  CashAdvanceMultipleEntryFormErrors,
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
  errors = {},
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
  errors?: CashAdvanceMultipleEntryFormErrors;
  isExchangeRateLoading: boolean;
  isReadonly: boolean;
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onUpdateCurrency: (currencyCode: string) => void;
  values: CashAdvanceMultipleEntryFormValues;
  projectOptions: AppAdvancedDropdownOption[];
  onUpdateField: CashAdvanceMultipleEntryFormController["updateField"];
}) {
  const partyQuery = usePartyLookup();
  const accountQuery = usePostingAccountLookup();

  const partyOptions = useMemo(() => {
    return ensureDropdownOption(partyQuery.data ?? [], {
      value: values.partyCode,
      label: values.partyCode,
      name: values.partyName,
      description: values.partyName,
    });
  }, [partyQuery.data, values.partyCode, values.partyName]);

  const accountOptions = useMemo(() => {
    return ensureDropdownOption(accountQuery.data ?? [], {
      value: values.accountCode,
      label: values.accountCode,
      name: values.accountTitle,
      description: values.accountTitle,
    });
  }, [accountQuery.data, values.accountCode, values.accountTitle]);

  const isPartyLookupLoading = partyQuery.isLoading;
  const isAccountLookupLoading = accountQuery.isLoading;

  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Column 1: Name & Lookup Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Employee Name" error={errors.partyName} isRequired>
            <AppLookupDropdown
              value={values.partyCode}
              options={partyOptions}
              readOnly={isReadonly}
              placeholder="Select Employee Name"
              searchPlaceholder="Search Employee Name"
              emptyMessage={isPartyLookupLoading ? "Loading Employee options..." : "No Employee options found."}
              addAction={!isReadonly ? { label: "Add Employee Name", onClick: onOpenPartyDrawer } : undefined}
              onChange={(code, name) => {
                const selectedParty = partyOptions.find((option) => option.value === code);
                onUpdateField("partyCode", selectedParty?.partyCode ?? code);
                onUpdateField("partyName", selectedParty?.partyName ?? name);

                const matchingAccount = accountOptions.find(
                  (account) =>
                    (selectedParty?.employeeAdvanceAccountId &&
                      (account.accountId === selectedParty.employeeAdvanceAccountId ||
                        account.value === selectedParty.employeeAdvanceAccountId)) ||
                    (selectedParty?.employeeAdvanceAccountCode &&
                      (account.accountCode === selectedParty.employeeAdvanceAccountCode ||
                        account.label === selectedParty.employeeAdvanceAccountCode ||
                        account.value === selectedParty.employeeAdvanceAccountCode)) ||
                    (selectedParty?.employeeAdvanceAccountTitle &&
                      (account.accountTitle === selectedParty.employeeAdvanceAccountTitle ||
                        account.name === selectedParty.employeeAdvanceAccountTitle)),
                );

                const accountCode =
                  matchingAccount?.accountCode ||
                  matchingAccount?.label ||
                  selectedParty?.employeeAdvanceAccountCode ||
                  "";
                const accountTitle =
                  matchingAccount?.accountTitle ||
                  matchingAccount?.name ||
                  selectedParty?.employeeAdvanceAccountTitle ||
                  "";

                if (accountCode || accountTitle) {
                  onUpdateField("accountCode", accountCode);
                  onUpdateField("accountTitle", accountTitle);
                }
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

          <TransactionField label="Default Account Title" error={errors.accountTitle} isRequired>
            <AppLookupDropdown
              value={values.accountCode}
              options={accountOptions}
              readOnly={isReadonly}
              placeholder="Select Default Account Title"
              searchPlaceholder="Search Default Account"
              emptyMessage={isAccountLookupLoading ? "Loading Default Account options..." : "No Default Account options found."}
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
            error={errors.partyCode}
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
            error={errors.accountCode}
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
            error={errors.transNo}
            onValueChange={(value) => onUpdateField("transNo", value)}
            placeholder="Auto Generated CAME Transaction Number"
          />

          <TransactionTextField
            value={values.documentDate}
            isReadonly={isReadonly}
            isRequired
            label="CAME Date"
            error={errors.documentDate}
            type="date"
            onValueChange={(value) => onUpdateField("documentDate", value)}
          />

          <TransactionTextField value={values.status} isReadonly label="Status" onValueChange={() => undefined} />
        </div>
      </div>
    </section>
  );
}
