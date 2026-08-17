import { useMemo } from "react";
import {
  CashAdvanceMultipleEntryAccountOptions,
  CashAdvanceMultipleEntryFieldClassName,
  CashAdvanceMultipleEntryReadOnlyFieldClassName,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  createCashAdvanceMultipleEntryPartyOptions,
  createCashAdvanceMultipleEntrySelectOptions,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import { useCashAdvanceMultipleEntryActionForm } from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import type {
  CashAdvanceMultipleEntryFormValues,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { CashAdvanceMultipleEntryFieldShell } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/action/CashAdvanceMultipleEntryFieldControls";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";

export function CashAdvanceMultipleEntryDetailsFields({
  currencyOptions,
  isExchangeRateLoading,
  isReadonly,
  onOpenPartyDialog,
  onOpenProjectDrawer,
  onUpdateCurrency,
  onUpdateField,
  projectOptions,
  values,
}: {
  currencyOptions: AppAdvancedDropdownOption[];
  isExchangeRateLoading: boolean;
  isReadonly: boolean;
  onOpenPartyDialog: () => void;
  onOpenProjectDrawer: () => void;
  onUpdateCurrency: (currencyCode: string) => void;
  values: CashAdvanceMultipleEntryFormValues;
  projectOptions: AppAdvancedDropdownOption[];
  onUpdateField: ReturnType<typeof useCashAdvanceMultipleEntryActionForm>["updateField"];
}) {
  const partyOptions = useMemo(
    () => createCashAdvanceMultipleEntryPartyOptions(values.partyCode, values.partyName),
    [values.partyCode, values.partyName],
  );
  const accountOptions = useMemo(
    () => createCashAdvanceMultipleEntrySelectOptions(CashAdvanceMultipleEntryAccountOptions),
    [],
  );

  return (
    <form className="grid min-w-0 gap-5 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5 xl:grid-cols-3">
      <div className="grid min-w-0 content-start gap-4">
        <CashAdvanceMultipleEntryFieldShell controlId="came-party-name" label="Party Name" isRequired>
          <AppAdvancedDropdown
            id="came-party-name"
            addAction={
              !isReadonly
                ? {
                    label: "Add Party Name",
                    onClick: onOpenPartyDialog,
                  }
                : undefined
            }
            menuMinWidth={340}
            options={partyOptions}
            placeholder="Select Party Name"
            readOnly={isReadonly}
            searchPlaceholder="Search Party Name"
            value={values.partyCode}
            onChange={(value) => {
              const partyCode = String(value);
              const party = partyOptions.find((option) => option.value === partyCode);

              onUpdateField("partyCode", partyCode);
              onUpdateField("partyName", party?.name ?? "");
            }}
          />
        </CashAdvanceMultipleEntryFieldShell>
        <CashAdvanceMultipleEntryFieldShell controlId="came-project-name" label="Project Name">
          <AppAdvancedDropdown
            id="came-project-name"
            addAction={
              !isReadonly
                ? {
                    label: "Add Project",
                    onClick: onOpenProjectDrawer,
                  }
                : undefined
            }
            menuMinWidth={320}
            options={projectOptions}
            placeholder="Select Project Name"
            readOnly={isReadonly}
            searchPlaceholder="Search project name"
            value={values.projectRef}
            onChange={(value) => {
              const projectName = String(value);
              const project = projectOptions.find((option) => option.value === projectName);

              onUpdateField("projectRef", projectName);
              onUpdateField(
                "projectCode",
                project?.label === projectName ? "" : project?.label ?? "",
              );
            }}
          />
        </CashAdvanceMultipleEntryFieldShell>
        <CashAdvanceMultipleEntryFieldShell controlId="came-account" label="Default Account" isRequired>
          <AppAdvancedDropdown
            id="came-account"
            menuMinWidth={320}
            options={accountOptions}
            placeholder="Select Default Account"
            readOnly={isReadonly}
            value={values.accountCode}
            onChange={(value) => {
              const accountCode = String(value);
              const account = accountOptions.find((option) => option.value === accountCode);

              onUpdateField("accountCode", accountCode);
              onUpdateField("accountTitle", account?.name ?? "");
            }}
          />
        </CashAdvanceMultipleEntryFieldShell>
        <CashAdvanceMultipleEntryFieldShell controlId="came-remarks" label="Remarks">
          <AppLimitedTextarea
            id="came-remarks"
            className={`${CashAdvanceMultipleEntryFieldClassName} min-h-24 py-3`}
            counterMode="used"
            readOnly={isReadonly}
            value={values.remarks}
            onChange={(event) => onUpdateField("remarks", event.target.value)}
          />
        </CashAdvanceMultipleEntryFieldShell>
      </div>
      <div className="grid min-w-0 content-start gap-4">
        <CashAdvanceMultipleEntryFieldShell controlId="came-party-code" label="Party Code">
          <input
            id="came-party-code"
            readOnly
            value={values.partyCode}
            className={CashAdvanceMultipleEntryReadOnlyFieldClassName}
          />
        </CashAdvanceMultipleEntryFieldShell>
        <CashAdvanceMultipleEntryFieldShell controlId="came-project-code" label="Project Code">
          <input
            id="came-project-code"
            readOnly
            value={values.projectCode}
            className={CashAdvanceMultipleEntryReadOnlyFieldClassName}
          />
        </CashAdvanceMultipleEntryFieldShell>
        <CashAdvanceMultipleEntryFieldShell controlId="came-account-code" label="Default Account Code">
          <input
            id="came-account-code"
            readOnly
            value={values.accountCode}
            className={CashAdvanceMultipleEntryReadOnlyFieldClassName}
          />
        </CashAdvanceMultipleEntryFieldShell>
        <CashAdvanceMultipleEntryFieldShell controlId="came-currency" label="Currency" isRequired>
          <CurrencyExchangeRateRow
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
                searchPlaceholder="Search currency"
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
                className={`${CashAdvanceMultipleEntryFieldClassName} text-right tabular-nums`}
              />
            }
          />
        </CashAdvanceMultipleEntryFieldShell>
      </div>
      <div className="grid min-w-0 content-start gap-4">
        <CashAdvanceMultipleEntryFieldShell controlId="came-trans-no" label="Cash Advance Multiple Entry No." isRequired>
          <input
            id="came-trans-no"
            readOnly
            value={values.transNo}
            placeholder="Auto Generated Cash Advance Multiple Entry Transaction Number"
            className={CashAdvanceMultipleEntryReadOnlyFieldClassName}
          />
        </CashAdvanceMultipleEntryFieldShell>
        <CashAdvanceMultipleEntryFieldShell controlId="came-document-date" label="Cash Advance Multiple Entry Date">
          <input
            id="came-document-date"
            type="date"
            readOnly={isReadonly}
            value={values.documentDate}
            className={CashAdvanceMultipleEntryFieldClassName}
            onChange={(event) => onUpdateField("documentDate", event.target.value)}
          />
        </CashAdvanceMultipleEntryFieldShell>
        <CashAdvanceMultipleEntryFieldShell controlId="came-status" label="Status">
          <input
            id="came-status"
            readOnly
            value={values.status}
            className={CashAdvanceMultipleEntryReadOnlyFieldClassName}
          />
        </CashAdvanceMultipleEntryFieldShell>
      </div>
    </form>
  );
}
