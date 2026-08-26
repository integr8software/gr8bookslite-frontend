import {
  RevolvingFundReplenishmentAccountOptions,
  RevolvingFundReplenishmentPartyOptions,
  RevolvingFundReplenishmentProjectOptions,
  RevolvingFundReplenishmentResponsibilityCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import type { RevolvingFundReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
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

export function RevolvingFundReplenishmentDetailsFields({
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onOpenResponsibilityCenterDrawer,
  page,
}: {
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onOpenResponsibilityCenterDrawer: () => void;
  page: RevolvingFundReplenishmentActionPageState;
}) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Party Name" error={page.errors.partyName} isRequired>
            <AppLookupDropdown
              value={page.values.partyCode}
              options={RevolvingFundReplenishmentPartyOptions}
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
            <AppLookupDropdown
              value={page.values.responsibilityCenterCode}
              options={RevolvingFundReplenishmentResponsibilityCenterOptions}
              readOnly={page.isReadonly}
              placeholder="Select Responsibility Center"
              searchPlaceholder="Search Responsibility Center"
              addAction={!page.isReadonly ? { label: "Add Responsibility Center", onClick: onOpenResponsibilityCenterDrawer } : undefined}
              onChange={(code, name) => {
                page.updateField("responsibilityCenterCode", code);
                page.updateField("responsibilityCenter", name);
              }}
            />
          </TransactionField>
          <TransactionField label="Project Name">
            <AppLookupDropdown
              value={page.values.projectCode}
              options={RevolvingFundReplenishmentProjectOptions}
              readOnly={page.isReadonly}
              placeholder="Select Project Name"
              searchPlaceholder="Search Project Name"
              addAction={!page.isReadonly ? { label: "Add Project Name", onClick: onOpenProjectDrawer } : undefined}
              onChange={(code, name) => {
                page.updateField("projectCode", code);
                page.updateField("projectName", name);
              }}
            />
          </TransactionField>
          <TransactionField label="Default Account Title" error={page.errors.accountTitle} isRequired>
            <AppLookupDropdown
              value={page.values.accountCode}
              options={RevolvingFundReplenishmentAccountOptions}
              readOnly={page.isReadonly}
              placeholder="Select Default Account Title"
              searchPlaceholder="Search Default Account"
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
            placeholder="Default Account Code"
          />
          <CurrencyExchangeRateRow
            currencyLabel="Currency"
            currencyControlId="rfr-currency"
            currencyError={page.errors.currency}
            exchangeRateControlId="rfr-exchange-rate"
            exchangeRateError={page.errors.exchangeRate}
            currencyControl={
              <AppAdvancedDropdown
                id="rfr-currency"
                className="w-full min-w-0"
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
            exchangeRateControl={
              <input
                id="rfr-exchange-rate"
                type="text"
                inputMode="decimal"
                value={page.values.exchangeRate}
                readOnly={page.isReadonly}
                disabled={page.isReadonly || page.isExchangeRateLoading}
                onChange={(event) => page.updateField("exchangeRate", formatExchangeRateInput(event.target.value))}
                className={`${TransactionFieldClassName} text-right tabular-nums${page.isReadonly || page.isExchangeRateLoading ? " transaction-readonly-placeholder" : ""}`}
                placeholder="0.00"
              />
            }
          />
        </div>
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={page.values.transactionNo}
            isReadonly
            isRequired
            label="RFR No."
            error={page.errors.transactionNo}
            onValueChange={(value) => page.updateField("transactionNo", value)}
            placeholder="Auto Generated RFR Transaction Number"
          />
          <TransactionTextField
            value={page.values.documentDate}
            isReadonly={page.isReadonly}
            isRequired
            label="Document Date"
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
