import {
  createPettyCashVoucherAccountOptions,
  createPettyCashVoucherPartyOptions,
  createPettyCashVoucherResponsibilityCenterOptions,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import type { PettyCashVoucherActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLookupDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppLookupDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  TransactionField,
  TransactionFieldClassName,
  TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";

export function PettyCashVoucherDetailsFields({
  canAddParty = true,
  canAddResponsibilityCenter = true,
  onOpenPartyDrawer,
  onOpenResponsibilityCenterDrawer,
  page,
}: {
  canAddParty?: boolean;
  canAddResponsibilityCenter?: boolean;
  onOpenPartyDrawer?: () => void;
  onOpenResponsibilityCenterDrawer?: () => void;
  page: PettyCashVoucherActionPageState;
}) {
  const accountOptions = createPettyCashVoucherAccountOptions(page.values);
  const partyOptions = createPettyCashVoucherPartyOptions(page.values);
  const responsibilityCenterOptions = createPettyCashVoucherResponsibilityCenterOptions(page.values);

  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Column 1: Name & Lookup Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Party Name" error={page.errors.partyName} isRequired>
            <AppLookupDropdown
              value={page.values.partyCode}
              readOnly={page.isReadonly}
              options={partyOptions}
              placeholder="Select Party Name"
              searchPlaceholder="Search Party Name"
              addAction={
                !page.isReadonly && canAddParty && onOpenPartyDrawer
                  ? {
                      label: "Add Party Name",
                      onClick: onOpenPartyDrawer,
                    }
                  : undefined
              }
              onChange={(code, name) => {
                page.updateField("partyCode", code);
                page.updateField("partyName", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Responsibility Center">
            <AppLookupDropdown
              value={page.values.responsibilityCenterCode}
              readOnly={page.isReadonly}
              options={responsibilityCenterOptions}
              placeholder="Select Responsibility Center"
              searchPlaceholder="Search Responsibility Center"
              addAction={
                !page.isReadonly && canAddResponsibilityCenter && onOpenResponsibilityCenterDrawer
                  ? {
                      label: "Add Responsibility Center",
                      onClick: onOpenResponsibilityCenterDrawer,
                    }
                  : undefined
              }
              onChange={(code, name) => {
                page.updateField("responsibilityCenterCode", code);
                page.updateField("responsibilityCenter", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Default Account Title" error={page.errors.accountTitle} isRequired>
            <AppLookupDropdown
              value={page.values.accountCode}
              readOnly={page.isReadonly}
              options={accountOptions}
              placeholder="Select Default Account Title"
              searchPlaceholder="Search Default Account Title"
              onChange={(code, name) => {
                page.updateField("accountCode", code);
                page.updateField("accountTitle", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Remarks" error={page.errors.remarks}>
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

        {/* Column 2: Aligned Code & Financial Fields */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={page.values.partyCode}
            error={page.errors.partyCode}
            isRequired
            isReadonly
            label="Party Code"
            onValueChange={(value) => page.updateField("partyCode", value)}
            placeholder="Party Code"
          />

          <TransactionTextField
            value={page.values.responsibilityCenterCode}
            error={page.errors.responsibilityCenterCode}
            isReadonly
            label="Responsibility Center Code"
            onValueChange={(value) => page.updateField("responsibilityCenterCode", value)}
            placeholder="Responsibility Center Code"
          />

          <TransactionTextField
            value={page.values.accountCode}
            error={page.errors.accountCode}
            isRequired
            isReadonly
            label="Default Account Code"
            onValueChange={(value) => page.updateField("accountCode", value)}
            placeholder="Default Account Code"
          />

          <CurrencyExchangeRateRow
            currencyLabel="Currency"
            currencyControlId="petty-cash-voucher-currency"
            currencyError={page.errors.currency}
            exchangeRateControlId="petty-cash-voucher-exchange-rate"
            exchangeRateError={page.errors.exchangeRate}
            currencyControl={
              <AppAdvancedDropdown
                id="petty-cash-voucher-currency"
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
                id="petty-cash-voucher-exchange-rate"
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

          <TransactionField label="Amount" error={page.errors.amount} isRequired>
            <MoneyNumberField
              value={page.values.amount}
              min="0"
              readOnly={page.isReadonly}
              onValueChange={page.updateAmount}
              className={`${TransactionFieldClassName} text-right tabular-nums`}
              placeholder="0.00"
            />
          </TransactionField>
        </div>

        {/* Column 3: Transaction Identity & Status */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={page.values.transactionNo}
            error={page.errors.transactionNo}
            isRequired
            isReadonly
            label="PCV No."
            onValueChange={(value) => page.updateField("transactionNo", value)}
            placeholder="Auto Generated PCV Transaction Number"
          />

          <TransactionTextField
            value={page.values.documentDate}
            error={page.errors.documentDate}
            isReadonly={page.isReadonly}
            isRequired
            label="PCV Date"
            onValueChange={(value) => page.updateField("documentDate", value)}
            type="date"
          />

          <TransactionTextField
            value={page.values.status}
            error={page.errors.status}
            isReadonly
            label="Status"
            onValueChange={() => undefined}
          />
        </div>
      </div>
    </section>
  );
}
