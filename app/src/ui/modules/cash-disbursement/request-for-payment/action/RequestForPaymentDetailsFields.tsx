import {
  RequestForPaymentBankOptions,
  RequestForPaymentPartyOptions,
  RequestForPaymentPaymentMethodOptions,
  RequestForPaymentProjectOptions,
  RequestForPaymentResponsibilityCenterLookupOptions,
} from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import type {
  RequestForPaymentActionPageState,
  RequestForPaymentPaymentMethod,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLookupDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppLookupDropdown";
import {
  TransactionField,
  TransactionFieldClassName,
  TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";

export function RequestForPaymentDetailsFields({
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onOpenResponsibilityCenterDrawer,
  page,
}: {
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onOpenResponsibilityCenterDrawer: () => void;
  page: RequestForPaymentActionPageState;
}) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Column 1: Names & Lookups */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Payee / Party Name" error={page.errors.partyName} isRequired>
            <AppLookupDropdown
              value={page.values.partyCode}
              options={RequestForPaymentPartyOptions}
              readOnly={page.isReadonly}
              placeholder="Select Payee"
              searchPlaceholder="Search Payee Name"
              addAction={!page.isReadonly ? { label: "Add Payee", onClick: onOpenPartyDrawer } : undefined}
              onChange={(code, name) => {
                page.updateField("partyCode", code);
                page.updateField("partyName", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Responsibility Center">
            <AppLookupDropdown
              value={page.values.responsibilityCenterCode}
              options={RequestForPaymentResponsibilityCenterLookupOptions}
              readOnly={page.isReadonly}
              placeholder="Select Responsibility Center"
              searchPlaceholder="Search Responsibility Center"
              addAction={
                !page.isReadonly
                  ? { label: "Add Responsibility Center", onClick: onOpenResponsibilityCenterDrawer }
                  : undefined
              }
              onChange={(code, name) => {
                page.updateField("responsibilityCenterCode", code);
                page.updateField("responsibilityCenter", name);
              }}
            />
          </TransactionField>

          <TransactionField label="Project Name">
            <AppLookupDropdown
              value={page.values.projectCode}
              options={RequestForPaymentProjectOptions}
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

          <TransactionField label="Remarks">
            <AppLimitedTextarea
              value={page.values.remarks}
              readOnly={page.isReadonly}
              onChange={(event) => page.updateField("remarks", event.target.value)}
              className={`${TransactionFieldClassName} min-h-28 max-w-full resize py-3`}
              counterMode="used"
              placeholder="Optional remarks or purpose of payment request"
            />
          </TransactionField>
        </div>

        {/* Column 2: Aligned Codes & Payment Details */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={page.values.partyCode}
            isReadonly
            isRequired
            label="Payee Code"
            error={page.errors.partyCode}
            onValueChange={(value) => page.updateField("partyCode", value)}
            placeholder="Payee Code"
          />

          <TransactionTextField
            value={page.values.responsibilityCenterCode}
            isReadonly
            label="Responsibility Center Code"
            onValueChange={(value) => page.updateField("responsibilityCenterCode", value)}
            placeholder="RC Code"
          />

          <TransactionTextField
            value={page.values.projectCode}
            isReadonly
            label="Project Code"
            onValueChange={(value) => page.updateField("projectCode", value)}
            placeholder="Project Code"
          />

          <TransactionField label="Payment Method" error={page.errors.paymentMethod} isRequired>
            <AppAdvancedDropdown
              id="rfp-payment-method"
              value={page.values.paymentMethod}
              readOnly={page.isReadonly}
              isClearable={false}
              options={RequestForPaymentPaymentMethodOptions}
              placeholder="Select Payment Method"
              searchPlaceholder="Search Payment Method"
              onChange={(value) => page.updateField("paymentMethod", String(value) as RequestForPaymentPaymentMethod)}
            />
          </TransactionField>

          {(page.values.paymentMethod === "Check" || page.values.paymentMethod === "Bank Transfer") ? (
            <TransactionField label="Bank Master / Account">
              <AppLookupDropdown
                value={page.values.bankAccountNo ?? ""}
                options={RequestForPaymentBankOptions}
                readOnly={page.isReadonly}
                placeholder="Select Bank Account"
                searchPlaceholder="Search Bank Account"
                onChange={(code, name) => {
                  page.updateField("bankAccountNo", code);
                  page.updateField("bankName", name);
                }}
              />
            </TransactionField>
          ) : null}

          <CurrencyExchangeRateRow
            currencyLabel="Currency"
            currencyControlId="rfp-currency"
            currencyError={page.errors.currency}
            exchangeRateControlId="rfp-exchange-rate"
            exchangeRateError={page.errors.exchangeRate}
            currencyControl={
              <AppAdvancedDropdown
                id="rfp-currency"
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
                id="rfp-exchange-rate"
                type="text"
                inputMode="decimal"
                value={page.values.exchangeRate}
                readOnly={page.isReadonly}
                disabled={page.isReadonly || page.isExchangeRateLoading}
                onChange={(event) => page.updateField("exchangeRate", formatExchangeRateInput(event.target.value))}
                className={`${TransactionFieldClassName} text-right tabular-nums${
                  page.isReadonly || page.isExchangeRateLoading ? " transaction-readonly-placeholder" : ""
                }`}
                placeholder="0.00"
              />
            }
          />
        </div>

        {/* Column 3: Transaction Number, Dates & Status */}
        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField
            value={page.values.transactionNo}
            isReadonly
            isRequired
            label="RFP No."
            error={page.errors.transactionNo}
            onValueChange={(value) => page.updateField("transactionNo", value)}
            placeholder="Auto Generated RFP Transaction Number"
          />

          <TransactionTextField
            value={page.values.documentDate}
            isReadonly={page.isReadonly}
            isRequired
            label="RFP Date"
            error={page.errors.documentDate}
            type="date"
            onValueChange={(value) => page.updateField("documentDate", value)}
          />

          <TransactionTextField
            value={page.values.dateNeeded}
            isReadonly={page.isReadonly}
            isRequired
            label="Date Needed"
            error={page.errors.dateNeeded}
            type="date"
            onValueChange={(value) => page.updateField("dateNeeded", value)}
          />

          <TransactionTextField value={page.values.status} isReadonly label="Status" onValueChange={() => undefined} />
        </div>
      </div>
    </section>
  );
}
