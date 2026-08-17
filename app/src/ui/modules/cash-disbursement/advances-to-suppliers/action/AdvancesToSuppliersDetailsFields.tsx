import {
  AdvancesToSuppliersAccountOptions,
  AdvancesToSuppliersPartyOptions,
  AdvancesToSuppliersProjectOptions,
  AdvancesToSuppliersResponsibilityCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import type { AdvancesToSuppliersActionPageState } from "@/app/src/hooks/modules/cash-disbursement/advances-to-suppliers/useAdvancesToSuppliersActionPage";
import { AdvancesToSuppliersLookupField } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersFieldControls";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  TransactionField,
  TransactionFieldClassName,
  TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export function AdvancesToSuppliersDetailsFields({
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onOpenResponsibilityCenterDrawer,
  page,
}: {
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onOpenResponsibilityCenterDrawer: () => void;
  page: AdvancesToSuppliersActionPageState;
}) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="grid min-w-0 content-start gap-5">
          <TransactionField label="Party Name" error={page.errors.partyName} isRequired>
            <AdvancesToSuppliersLookupField value={page.values.partyCode} options={withCurrentLookupOption(AdvancesToSuppliersPartyOptions, page.values.partyCode, page.values.partyName)} readOnly={page.isReadonly} placeholder="Select Party Name" searchPlaceholder="Search Party Name" addAction={!page.isReadonly ? { label: "Add Party Name", onClick: onOpenPartyDrawer } : undefined} onChange={(code, name) => { page.updateField("partyCode", code); page.updateField("partyName", name); }} />
          </TransactionField>
          <TransactionField label="Responsibility Center">
            <AdvancesToSuppliersLookupField value={page.values.responsibilityCenterCode} options={AdvancesToSuppliersResponsibilityCenterOptions} readOnly={page.isReadonly} placeholder="Select Responsibility Center" searchPlaceholder="Search Responsibility Center" addAction={!page.isReadonly ? { label: "Add Responsibility Center", onClick: onOpenResponsibilityCenterDrawer } : undefined} onChange={(code, name) => { page.updateField("responsibilityCenterCode", code); page.updateField("responsibilityCenter", name); }} />
          </TransactionField>
          <TransactionField label="Project Name">
            <AdvancesToSuppliersLookupField value={page.values.projectCode} options={withCurrentLookupOption(AdvancesToSuppliersProjectOptions, page.values.projectCode, page.values.projectName)} readOnly={page.isReadonly} placeholder="Select Project Name" searchPlaceholder="Search Project Name" addAction={!page.isReadonly ? { label: "Add Project Name", onClick: onOpenProjectDrawer } : undefined} onChange={(code, name) => { page.updateField("projectCode", code); page.updateField("projectName", name); }} />
          </TransactionField>
          <TransactionField label="Default Account Title" error={page.errors.accountTitle} isRequired>
            <AdvancesToSuppliersLookupField value={page.values.accountCode} options={AdvancesToSuppliersAccountOptions} readOnly={page.isReadonly} placeholder="Select Default Account Title" searchPlaceholder="Search Default Account" onChange={(code, name) => { page.updateField("accountCode", code); page.updateField("accountTitle", name); }} />
          </TransactionField>
          <TransactionField label="Remarks">
            <AppLimitedTextarea value={page.values.remarks} readOnly={page.isReadonly} onChange={(event) => page.updateField("remarks", event.target.value)} className={`${TransactionFieldClassName} min-h-28 max-w-full resize py-3`} counterMode="used" placeholder="Optional Remarks" />
          </TransactionField>
        </div>

        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField value={page.values.partyCode} isReadonly isRequired label="Party Code" error={page.errors.partyCode} onValueChange={(value) => page.updateField("partyCode", value)} placeholder="Party Code" />
          <TransactionTextField value={page.values.responsibilityCenterCode} isReadonly label="Responsibility Center Code" onValueChange={(value) => page.updateField("responsibilityCenterCode", value)} placeholder="Responsibility Center Code" />
          <TransactionTextField value={page.values.projectCode} isReadonly label="Project Code" onValueChange={(value) => page.updateField("projectCode", value)} placeholder="Project Code" />
          <TransactionTextField value={page.values.accountCode} isReadonly isRequired label="Default Account Code" error={page.errors.accountCode} onValueChange={(value) => page.updateField("accountCode", value)} placeholder="Default Account Code" />
          <CurrencyExchangeRateRow currencyControlId="ats-currency" currencyLabel="Currency" currencyControl={<AppAdvancedDropdown id="ats-currency" value={page.values.currency} readOnly={page.isReadonly} isClearable={false} options={page.currencyOptions} placeholder="Currency" searchPlaceholder="Search Currency" onChange={(value) => page.updateCurrency(String(value))} />} exchangeRateControlId="ats-exchange-rate" exchangeRateControl={<input id="ats-exchange-rate" type="text" inputMode="decimal" value={page.values.exchangeRate} readOnly={page.isReadonly} disabled={page.isReadonly || page.isExchangeRateLoading} onChange={(event) => page.updateField("exchangeRate", formatExchangeRateInput(event.target.value))} className={`${TransactionFieldClassName} text-right tabular-nums`} />} />
          <TransactionField label="Total Amount" error={page.errors.totalPoAmount} isRequired>
            <MoneyNumberField value={page.values.totalPoAmount} min="0" readOnly={page.isReadonly} onValueChange={(value) => page.updateField("totalPoAmount", value)} className={`${TransactionFieldClassName} text-right tabular-nums`} placeholder="0.00" />
          </TransactionField>
        </div>

        <div className="grid min-w-0 content-start gap-5">
          <TransactionTextField value={page.values.transactionNo} isReadonly isRequired label="Advances to Suppliers No." error={page.errors.transactionNo} onValueChange={(value) => page.updateField("transactionNo", value)} placeholder="Auto Generated Advances to Suppliers Transaction Number" />
          <TransactionTextField value={page.values.documentDate} isReadonly={page.isReadonly} isRequired label="Advances to Suppliers Date" error={page.errors.documentDate} type="date" onValueChange={(value) => page.updateField("documentDate", value)} />
          <TransactionTextField value={page.values.poReference} isReadonly={page.isReadonly} isRequired label="Purchase Order Reference" error={page.errors.poReference} onValueChange={(value) => page.updateField("poReference", value)} placeholder="Enter Purchase Order Reference" />
          <TransactionField label="Advance Payment (%)" error={page.errors.advancePaymentPercentage} isRequired>
            <MoneyNumberField value={page.values.advancePaymentPercentage} min="0" max="100" readOnly={page.isReadonly} onValueChange={(value) => page.updateField("advancePaymentPercentage", value)} className={`${TransactionFieldClassName} text-right tabular-nums`} placeholder="0.00" />
          </TransactionField>
          <TransactionField label="Amount of Advance Payment" error={page.errors.advancePaymentAmount} isRequired>
            <MoneyNumberField value={page.values.advancePaymentAmount} readOnly onValueChange={() => undefined} className={`${TransactionFieldClassName} text-right tabular-nums`} placeholder="0.00" />
          </TransactionField>
          <TransactionTextField value={page.values.status} isReadonly label="Status" onValueChange={() => undefined} />
        </div>
      </div>
    </section>
  );
}

function withCurrentLookupOption(
  options: AppAdvancedDropdownOption[],
  code: string,
  name: string,
) {
  if (!code.trim() || options.some((option) => option.value === code)) {
    return options;
  }

  return [
    ...options,
    {
      label: code,
      name: name || code,
      value: code,
    },
  ];
}
