import {
  PettyCashFundAccountOptions,
  PettyCashFundPartyOptions,
  PettyCashFundProjectOptions,
  PettyCashFundResponsibilityCenterLookupOptions,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type { PettyCashFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFundActionPage";
import { PettyCashFundLookupField } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundFieldControls";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
  TransactionField,
  TransactionFieldClassName,
  TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";

export function PettyCashFundDetailsFields({
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  page,
}: {
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  page: PettyCashFundActionPageState;
}) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Party Name" error={page.errors.partyName} isRequired>
            <PettyCashFundLookupField
              value={page.values.partyCode}
              options={PettyCashFundPartyOptions}
              readOnly={page.isReadonly}
              placeholder="Select Party Name"
              searchPlaceholder="Search Party Name"
              addAction={!page.isReadonly ? { label: "Add Party Name", onClick: onOpenPartyDrawer } : undefined}
              onChange={(code, name) => {
                page.updateField("partyCode", code);
                page.updateField("partyName", name);
              }}
            />
          </TransactionField>
          <TransactionField label="Responsibility Center">
            <PettyCashFundLookupField
              value={page.values.responsibilityCenterCode}
              options={PettyCashFundResponsibilityCenterLookupOptions}
              readOnly={page.isReadonly}
              placeholder="Select Responsibility Center"
              searchPlaceholder="Search Responsibility Center"
              onChange={(code, name) => {
                page.updateField("responsibilityCenterCode", code);
                page.updateField("responsibilityCenter", name);
              }}
            />
          </TransactionField>
          <TransactionField label="Project Name">
            <PettyCashFundLookupField
              value={page.values.projectCode}
              options={PettyCashFundProjectOptions}
              readOnly={page.isReadonly}
              placeholder="Select Project Name"
              searchPlaceholder="Search Project"
              addAction={!page.isReadonly ? { label: "Add Project", onClick: onOpenProjectDrawer } : undefined}
              onChange={(code, name) => {
                page.updateField("projectCode", code);
                page.updateField("projectName", name);
              }}
            />
          </TransactionField>
          <TransactionField label="Default Account Title" error={page.errors.accountTitle} isRequired>
            <PettyCashFundLookupField
              value={page.values.accountCode}
              options={PettyCashFundAccountOptions}
              readOnly={page.isReadonly}
              placeholder="Select Default Account"
              searchPlaceholder="Search Account"
              onChange={(code, name) => {
                page.updateField("accountCode", code);
                page.updateField("accountTitle", name);
              }}
            />
          </TransactionField>
          <TransactionField label="Remarks">
            <AppLimitedTextarea
              value={page.values.remarks}
              readOnly={page.isReadonly}
              onChange={(event) => page.updateField("remarks", event.target.value)}
              className={`${TransactionFieldClassName} min-h-28 max-w-full resize py-3`}
              counterMode="used"
              placeholder="Optional Remarks"
            />
          </TransactionField>
        </div>
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={page.values.partyCode}
            isReadonly
            isRequired
            label="Party Code"
            error={page.errors.partyCode}
            onValueChange={(value) => page.updateField("partyCode", value)}
            placeholder="Party Code"
          />
          <TransactionTextField
            value={page.values.responsibilityCenterCode}
            isReadonly
            label="Responsibility Center Code"
            onValueChange={(value) => page.updateField("responsibilityCenterCode", value)}
            placeholder="Responsibility Center Code"
          />
          <TransactionTextField
            value={page.values.projectCode}
            isReadonly
            label="Project Code"
            onValueChange={(value) => page.updateField("projectCode", value)}
            placeholder="Project Code"
          />
          <TransactionTextField
            value={page.values.accountCode}
            isReadonly
            isRequired
            label="Default Account Code"
            error={page.errors.accountCode}
            onValueChange={(value) => page.updateField("accountCode", value)}
            placeholder="Account Code"
          />
          <CurrencyExchangeRateRow
            currencyControlId="pcf-currency"
            currencyLabel="Currency"
            currencyControl={
              <AppAdvancedDropdown
                id="pcf-currency"
                value={page.values.currency}
                readOnly={page.isReadonly}
                isClearable={false}
                menuMinWidth={320}
                options={page.currencyOptions}
                placeholder="Currency"
                searchPlaceholder="Search Currency"
                onChange={(value) => page.updateCurrency(String(value))}
              />
            }
            exchangeRateControlId="pcf-exchange-rate"
            exchangeRateControl={
              <input
                id="pcf-exchange-rate"
                type="text"
                inputMode="decimal"
                value={page.values.exchangeRate}
                readOnly={page.isReadonly}
                disabled={page.isReadonly || page.isExchangeRateLoading}
                onChange={(event) => page.updateField("exchangeRate", formatExchangeRateInput(event.target.value))}
                className={`${TransactionFieldClassName} text-right tabular-nums`}
              />
            }
          />
        </div>
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={page.values.transactionNo}
            isReadonly
            isRequired
            label="Petty Cash Fund No."
            error={page.errors.transactionNo}
            onValueChange={(value) => page.updateField("transactionNo", value)}
            placeholder="Auto Generated Petty Cash Fund Transaction Number"
          />
          <TransactionTextField
            value={page.values.documentDate}
            isReadonly={page.isReadonly}
            label="Petty Cash Fund Date"
            error={page.errors.documentDate}
            type="date"
            onValueChange={(value) => page.updateField("documentDate", value)}
          />
          <TransactionTextField value={page.values.status} isReadonly label="Status" onValueChange={() => undefined} />
        </div>
      </div>
    </section>
  );
}
