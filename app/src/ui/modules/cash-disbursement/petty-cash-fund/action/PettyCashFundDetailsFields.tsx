import {
  PettyCashFundAccountOptions,
  PettyCashFundPartyOptions,
  PettyCashFundProjectOptions,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import type { PettyCashFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFund";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import {
  TransactionField,
  TransactionFieldClassName,
  TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import { formatPettyCashFundAmount } from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";

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
          <TransactionField label="Custodian Name" error={page.errors.partyName} isRequired>
            <AppAdvancedDropdown
              value={page.values.partyCode}
              options={PettyCashFundPartyOptions}
              readOnly={page.isReadonly}
              placeholder="Select Custodian Name"
              searchPlaceholder="Search Custodian Name"
              addAction={!page.isReadonly ? { label: "Add Party Name", onClick: onOpenPartyDrawer } : undefined}
              onChange={(value) => {
                const option = PettyCashFundPartyOptions.find((item) => item.value === String(value));
                page.updateField("partyCode", String(value));
                page.updateField("partyName", option?.name ?? "");
              }}
            />
          </TransactionField>
          <TransactionField label="Cost Center">
            <select
              value={page.values.costCenter}
              disabled={page.isReadonly}
              onChange={(event) => page.updateField("costCenter", event.target.value)}
              className={`${TransactionFieldClassName} app-select-control`}
            >
              <option value="">Select Cost Center</option>
              <option>Main Office</option>
              <option>Branch Office</option>
            </select>
          </TransactionField>
          <CurrencyExchangeRateRow
            currencyLabel="Currency"
            currencyControl={
              <select
                aria-label="Currency"
                value={page.values.currency}
                disabled={page.isReadonly}
                onChange={(event) => page.updateField("currency", event.target.value)}
                className={`${TransactionFieldClassName} app-select-control`}
              >
                <option>PHP</option>
                <option>USD</option>
              </select>
            }
            exchangeRateControlId="pcf-exchange-rate"
            exchangeRateControl={
              <input
                id="pcf-exchange-rate"
                value={page.values.exchangeRate}
                readOnly={page.isReadonly || page.values.currency === "PHP"}
                onChange={(event) => page.updateField("exchangeRate", event.target.value)}
                className={`${TransactionFieldClassName} text-right tabular-nums`}
              />
            }
          />
          <TransactionField label="Default Account" error={page.errors.accountTitle} isRequired>
            <AppAdvancedDropdown
              value={page.values.accountCode}
              options={PettyCashFundAccountOptions}
              readOnly={page.isReadonly}
              placeholder="Select Default Account"
              searchPlaceholder="Search Account"
              onChange={(value) => {
                const option = PettyCashFundAccountOptions.find((item) => item.value === String(value));
                page.updateField("accountCode", String(value));
                page.updateField("accountTitle", option?.name ?? "");
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
            label="Custodian Code"
            error={page.errors.partyCode}
            onValueChange={(value) => page.updateField("partyCode", value)}
            placeholder="Custodian Code"
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
          <TransactionField label="Project Name">
            <AppAdvancedDropdown
              value={page.values.projectCode}
              options={PettyCashFundProjectOptions}
              readOnly={page.isReadonly}
              placeholder="Select Project Name"
              searchPlaceholder="Search Project"
              addAction={!page.isReadonly ? { label: "Add Project", onClick: onOpenProjectDrawer } : undefined}
              onChange={(value) => {
                const option = PettyCashFundProjectOptions.find((item) => item.value === String(value));
                page.updateField("projectCode", String(value));
                page.updateField("projectName", option?.name ?? "");
              }}
            />
          </TransactionField>
          <TransactionTextField
            value={page.values.projectCode}
            isReadonly
            label="Project Code"
            onValueChange={(value) => page.updateField("projectCode", value)}
            placeholder="Project Code"
          />
          <TransactionTextField
            value={formatPettyCashFundAmount(page.totals.amount)}
            isReadonly
            isMoney
            label="Amount"
            onValueChange={() => undefined}
          />
          <TransactionTextField
            value={formatPettyCashFundAmount(page.totals.vatAmount)}
            isReadonly
            isMoney
            label="VAT Amount"
            onValueChange={() => undefined}
          />
          <TransactionTextField
            value={formatPettyCashFundAmount(page.totals.netAmount)}
            isReadonly
            isMoney
            label="Net Amount"
            onValueChange={() => undefined}
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
          <TransactionTextField
            value={formatPettyCashFundAmount(page.totals.grossAmount)}
            isReadonly
            isMoney
            label="Petty Cash Fund"
            onValueChange={() => undefined}
          />
        </div>
      </div>
    </section>
  );
}
