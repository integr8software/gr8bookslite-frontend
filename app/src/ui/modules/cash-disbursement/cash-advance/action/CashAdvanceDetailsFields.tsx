import { useCashAdvanceDetailsLookups } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvanceDetailsLookups";
import type {
  CashAdvanceFormErrors,
  CashAdvanceFormValues,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
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

export function CashAdvanceDetailsFields({
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
  errors?: CashAdvanceFormErrors;
  isExchangeRateLoading: boolean;
  isReadonly: boolean;
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onUpdateCurrency: (currencyCode: string) => void;
  projectOptions: AppAdvancedDropdownOption[];
  values: CashAdvanceFormValues;
  onUpdateField: <Key extends keyof CashAdvanceFormValues>(key: Key, value: CashAdvanceFormValues[Key]) => void;
}) {
  const { accountOptions, isAccountLookupLoading, isPartyLookupLoading, partyOptions } = useCashAdvanceDetailsLookups(values);

  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Column 1: Name & Lookup Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Party Name" error={errors.partyName} isRequired>
            <AppLookupDropdown
              value={values.partyCode}
              options={partyOptions}
              readOnly={isReadonly}
              placeholder="Select Party Name"
              searchPlaceholder="Search Party Name"
              emptyMessage={isPartyLookupLoading ? "Loading Party options..." : "No Party options found."}
              addAction={!isReadonly ? { label: "Add Party Name", onClick: onOpenPartyDrawer } : undefined}
              onChange={(code, name) => {
                const selectedParty = partyOptions.find((option) => option.value === code);
                onUpdateField("partyCode", String(selectedParty?.partyCode ?? code));
                onUpdateField("partyName", String(selectedParty?.partyName ?? name));

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

                const accountCode = String(
                  matchingAccount?.accountCode ||
                  matchingAccount?.label ||
                  selectedParty?.employeeAdvanceAccountCode ||
                  ""
                );
                const accountTitle = String(
                  matchingAccount?.accountTitle ||
                  matchingAccount?.name ||
                  selectedParty?.employeeAdvanceAccountTitle ||
                  ""
                );

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
                onUpdateField("projectCode", project?.label === projectName ? "" : String(project?.label ?? ""));
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
                onUpdateField("accountCode", String(selectedAccount?.accountCode ?? code));
                onUpdateField("accountTitle", String(selectedAccount?.accountTitle ?? name));
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
            currencyControlId="ca-currency"
            exchangeRateControlId="ca-exchange-rate"
            currencyControl={
              <AppAdvancedDropdown
                id="ca-currency"
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
                id="ca-exchange-rate"
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
            label="CA No."
            error={errors.transNo}
            onValueChange={(value) => onUpdateField("transNo", value)}
            placeholder="Auto Generated CA Transaction Number"
          />

          <TransactionTextField
            value={values.documentDate}
            isReadonly={isReadonly}
            isRequired
            label="CA Date"
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
