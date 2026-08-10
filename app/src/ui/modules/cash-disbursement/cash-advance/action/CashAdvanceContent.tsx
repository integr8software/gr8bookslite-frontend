"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Eye, Plus } from "lucide-react";
import {
  createVoucherCurrencyOptions,
  getVoucherCurrencyExchangeRate,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import {
  CashAdvanceAccountOptions,
  CashAdvanceCostCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { useCashAdvanceActionForm } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import type { CashAdvanceActionMode } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { ModuleFieldsVisibilityDialog } from "@/app/src/ui/shared/module/ModuleFieldsVisibilityDialog";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTabs, type ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import {
  AppPartyDialog,
  mapPartyRecordToPartyValue,
} from "@/app/src/ui/shared/transaction-setup/AppPartyDialog";
import { AppTaxRateDialog } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";

export type CashAdvanceDetailsSection = "advance" | "attachment";
export type CashAdvanceFormController = ReturnType<typeof useCashAdvanceActionForm>;

export function CashAdvanceFormPanel({
  mode = "add",
  recordId,
  showToolbar = true,
  onSaved,
}: {
  mode?: CashAdvanceActionMode;
  onSaved?: () => void;
  recordId?: string;
  showToolbar?: boolean;
}) {
  const form = useCashAdvanceActionForm(mode, recordId, onSaved);

  return (
    <CashAdvanceDetailsForm
      form={form}
      mode={mode}
      showToolbar={showToolbar}
    />
  );
}

export function CashAdvanceDetailsForm({
  form,
  mode,
  showToolbar = true,
}: {
  form: CashAdvanceFormController;
  mode: CashAdvanceActionMode;
  showToolbar?: boolean;
}) {
  const currencyOptions = createCashAdvanceCurrencyDropdownOptions();
  const [activeTab, setActiveTab] = useState<CashAdvanceDetailsSection>("advance");
  const [isPartyDialogOpen, setIsPartyDialogOpen] = useState(false);
  const [isTaxDialogOpen, setIsTaxDialogOpen] = useState(false);
  const isReadonly = mode === "view";
  const taxSummary =
    form.values.taxValue.taxRate === "0%" && !form.values.taxValue.taxDetails.ewtCode
      ? "No VAT"
      : `${form.values.taxValue.taxRate}${
          form.values.taxValue.taxDetails.ewtCode
            ? ` / ${form.values.taxValue.taxDetails.ewtCode}`
            : ""
        }`;

  function updateCurrency(nextCurrency: string) {
    form.updateField("currency", nextCurrency);
    form.updateField("fxRate", getVoucherCurrencyExchangeRate(nextCurrency));
  }

  return (
    <>
      <section className="overflow-visible">
        {showToolbar ? (
          <div className="flex flex-col gap-3 border-b border-darknavy/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={moduleHeaderActionClassNames.secondary}>
                <Eye className="h-4 w-4" aria-hidden="true" />
                Preview
              </button>
            </div>
          </div>
        ) : null}

        <div className="border-b border-darknavy/10 px-6 pt-4">
          <ModuleTabs
            activeTab={activeTab}
            ariaLabel="Cash advance sections"
            tabs={CashAdvanceTabs}
            onTabChange={setActiveTab}
          />
        </div>

        {activeTab === "advance" ? (
          <form className="grid gap-6 px-6 py-6 xl:grid-cols-[1fr_0.72fr]">
            <div className="flex justify-end xl:col-span-2">
              <ModuleFieldsVisibilityDialog
                buttonLabel="Reference Fields"
                title="Reference fields visibility"
                fields={[
                  {
                    id: "container-no",
                    label: "Container No.",
                    isVisible: form.visibleReferenceFields.containerNo,
                    onVisibleChange: (isVisible) =>
                      form.updateReferenceFieldVisibility("containerNo", isVisible),
                  },
                  {
                    id: "ref-no",
                    label: "Ref No.",
                    isVisible: form.visibleReferenceFields.refNo,
                    onVisibleChange: (isVisible) =>
                      form.updateReferenceFieldVisibility("refNo", isVisible),
                  },
                  {
                    id: "project-ref",
                    label: "ProjectRef",
                    isVisible: form.visibleReferenceFields.projectRef,
                    onVisibleChange: (isVisible) =>
                      form.updateReferenceFieldVisibility("projectRef", isVisible),
                  },
                  {
                    id: "importation-ref-no",
                    label: "Importation Ref No",
                    isVisible: form.visibleReferenceFields.importationRefNo,
                    onVisibleChange: (isVisible) =>
                      form.updateReferenceFieldVisibility(
                        "importationRefNo",
                        isVisible,
                      ),
                  },
                ]}
              />
            </div>

            <div className="grid content-start gap-4">
              <FieldShell label="Party Code : *">
                <input
                  value={form.values.partyCode}
                  className={ReadOnlyFieldClassName}
                  readOnly
                />
              </FieldShell>
              <FieldShell label="Party Name : *">
                <ActionField
                  actionLabel="Add"
                  onAction={() => setIsPartyDialogOpen(true)}
                  control={
                    <input
                      value={form.values.partyName}
                      onChange={(event) =>
                        form.updateField("partyName", event.target.value)
                      }
                      readOnly={isReadonly}
                      className={FieldClassName}
                    />
                  }
                />
              </FieldShell>
              <FieldShell label="Account Code : *">
                <ActionField
                  actionLabel="Add"
                  control={
                    <select
                      value={form.values.accountCode}
                      disabled={isReadonly}
                      onChange={(event) =>
                        form.updateField("accountCode", event.target.value)
                      }
                      className={`${FieldClassName} app-select-control`}
                    >
                      {CashAdvanceAccountOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  }
                />
              </FieldShell>
              <FieldShell label="Cost Center :">
                <select
                  value={form.values.costCenter}
                  disabled={isReadonly}
                  onChange={(event) =>
                    form.updateField("costCenter", event.target.value)
                  }
                  className={`${FieldClassName} app-select-control`}
                >
                  {CashAdvanceCostCenterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Currency :">
                <CurrencyExchangeRateRow
                  currencyControl={
                    <AppAdvancedDropdown
                      id="cash-advance-currency"
                      className="w-full min-w-0"
                      value={form.values.currency}
                      readOnly={isReadonly}
                      isClearable={false}
                      options={currencyOptions}
                      placeholder="Currency"
                      searchPlaceholder="Search currency"
                      onChange={(value) => updateCurrency(String(value))}
                    />
                  }
                  exchangeRateControl={
                    <input
                      id="cash-advance-fx-rate"
                      type="text"
                      inputMode="decimal"
                      value={form.values.fxRate}
                      readOnly={isReadonly}
                      onChange={(event) =>
                        form.updateField(
                          "fxRate",
                          formatExchangeRateInput(event.target.value),
                        )
                      }
                      className={`${FieldClassName} text-right`}
                    />
                  }
                />
              </FieldShell>
              {form.visibleReferenceFields.containerNo ? (
                <FieldShell label="Container No. :">
                  <input
                    value={form.values.referenceFields.containerNo}
                    onChange={(event) =>
                      form.updateReferenceField("containerNo", event.target.value)
                    }
                    readOnly={isReadonly}
                    className={FieldClassName}
                  />
                </FieldShell>
              ) : null}
              <FieldShell label="Amount :">
                <ActionField
                  actionLabel="Tax"
                  onAction={() => setIsTaxDialogOpen(true)}
                  control={
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.values.amount}
                      onChange={(event) => form.updateAmount(event.target.value)}
                      readOnly={isReadonly}
                      className={`${FieldClassName} text-right`}
                    />
                  }
                />
              </FieldShell>
              <p className="-mt-2 text-xs font-medium text-darknavy/55">
                {taxSummary}
              </p>
              <FieldShell label="Remarks :">
                <textarea
                  value={form.values.remarks}
                  onChange={(event) => form.updateField("remarks", event.target.value)}
                  readOnly={isReadonly}
                  rows={4}
                  className={`${FieldClassName} min-h-24 py-3`}
                />
              </FieldShell>
            </div>

            <div className="grid content-start gap-4">
              <FieldShell label="Trans No. : *">
                <input readOnly value={form.values.transNo} className={ReadOnlyFieldClassName} />
              </FieldShell>
              <FieldShell label="Document Date :">
                <input
                  type="date"
                  readOnly={isReadonly}
                  value={form.values.documentDate}
                  onChange={(event) =>
                    form.updateField("documentDate", event.target.value)
                  }
                  className={FieldClassName}
                />
              </FieldShell>
              {form.visibleReferenceFields.refNo ? (
                <FieldShell label="Ref No. :">
                  <input
                    value={form.values.referenceFields.refNo}
                    onChange={(event) =>
                      form.updateReferenceField("refNo", event.target.value)
                    }
                    readOnly={isReadonly}
                    className={FieldClassName}
                  />
                </FieldShell>
              ) : null}
              <FieldShell label="Status :">
                <input readOnly value={form.values.status} className={ReadOnlyFieldClassName} />
              </FieldShell>
              {form.visibleReferenceFields.projectRef ? (
                <FieldShell label="ProjectRef :">
                  <input
                    value={form.values.referenceFields.projectRef}
                    onChange={(event) =>
                      form.updateReferenceField("projectRef", event.target.value)
                    }
                    readOnly={isReadonly}
                    className={FieldClassName}
                  />
                </FieldShell>
              ) : null}
              {form.visibleReferenceFields.importationRefNo ? (
                <FieldShell label="Importation Ref No :">
                  <input
                    value={form.values.referenceFields.importationRefNo}
                    onChange={(event) =>
                      form.updateReferenceField(
                        "importationRefNo",
                        event.target.value,
                      )
                    }
                    readOnly={isReadonly}
                    className={FieldClassName}
                  />
                </FieldShell>
              ) : null}
            </div>
          </form>
        ) : (
          <div className="px-6 py-6">
            <div className="rounded-lg border border-dashed border-darknavy/15 bg-offwhite/40 p-6 text-sm text-darknavy/60">
              File attachments can be added here when document upload storage is connected.
            </div>
          </div>
        )}
      </section>
      <AppPartyDialog
        isOpen={isPartyDialogOpen}
        suggestedPartyType="Employee"
        onClose={() => setIsPartyDialogOpen(false)}
        onSelect={(record) => {
          const partyValue = mapPartyRecordToPartyValue(record);

          form.updateField("partyCode", partyValue.partyCode);
          form.updateField("partyName", partyValue.partyName);
          setIsPartyDialogOpen(false);
        }}
      />
      <AppTaxRateDialog
        isOpen={isTaxDialogOpen}
        title="Cash Advance Tax"
        value={{
          taxRate: form.values.taxValue.taxRate,
          taxDetails: syncTaxDetailsAmount(
            form.values.taxValue.taxDetails,
            Number(form.values.amount || 0),
            form.values.taxValue.taxRate,
          ),
        }}
        onClose={() => setIsTaxDialogOpen(false)}
        onSave={(nextValue) => {
          form.updateTaxValue(nextValue);
          setIsTaxDialogOpen(false);
        }}
      />
    </>
  );
}

const CashAdvanceTabs = [
  { id: "advance", label: "Cash Advance" },
  { id: "attachment", label: "File Attachment" },
] satisfies ModuleTabItem<CashAdvanceDetailsSection>[];

function createCashAdvanceCurrencyDropdownOptions(): AppAdvancedDropdownOption[] {
  return createVoucherCurrencyOptions().map((currency) => ({
    label: currency.isDefault ? `${currency.name} | Default` : currency.name,
    name: currency.code,
    value: currency.code,
  }));
}

function FieldShell({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-darknavy/68">{label}</span>
      {children}
    </label>
  );
}

function ActionField({
  actionLabel,
  control,
  onAction,
}: {
  actionLabel: string;
  control: ReactNode;
  onAction?: () => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
      {control}
      <button
        type="button"
        onClick={onAction}
        className="theme-accent-contrast-text inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {actionLabel}
      </button>
    </div>
  );
}

const FieldClassName =
  "app-data-entry-field app-theme-field h-10 w-full rounded-md border px-3 text-sm outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/10";

const ReadOnlyFieldClassName =
  "app-data-entry-field app-theme-field-readonly h-10 w-full rounded-md border px-3 text-sm outline-none";
