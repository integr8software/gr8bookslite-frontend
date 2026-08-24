"use client";

import { useMemo, useState, type ChangeEventHandler, type ReactNode } from "react";
import { MultiCurrencyCatalog } from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import { useJournalVoucherLookups } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucher";
import { useJournalVoucherFormPage } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucherFormPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import {
  applyJournalVoucherLinePartyTaxDefaults,
  JournalVoucherDataEntryTable,
} from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherDataEntryTable";
import { JournalVoucherHeaderPage } from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherHeaderPage";
import { JournalVoucherNotFound } from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherNotFound";
import { openJournalVoucherPdf } from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherPdf";
import { JournalVoucherReportPreview } from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherReportPreview";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";

const fieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-white disabled:text-darknavy disabled:opacity-60";
const readOnlyFieldClassName = `${fieldClassName} !bg-darknavy/5 text-darknavy/60`;
const textareaClassName =
  "app-data-entry-field min-h-24 min-w-0 w-full resize-y rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm font-medium leading-6 text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-white disabled:text-darknavy disabled:opacity-60";
const errorClassName = "mt-1.5 block text-xs font-semibold text-coralpink";

export function JournalVoucherFormPage() {
  const page = useJournalVoucherFormPage();
  const partyStore = usePartyManagementStore();
  const journalVoucherLookups = useJournalVoucherLookups();
  const [partyAddLineId, setPartyAddLineId] = useState<string | null>(null);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const currencyOptions = useMemo(() => createJournalVoucherCurrencyDropdownOptions(), []);
  const taxCodes = useMemo(() => journalVoucherLookups.data?.taxCodes ?? [], [journalVoucherLookups.data?.taxCodes]);

  if (page.isRecordLoading) {
    return (
      <section className="rounded-lg border border-darknavy/10 bg-white p-6 text-sm font-medium text-darknavy/60 shadow-sm">
        Loading journal voucher...
      </section>
    );
  }

  if (page.needsRecord && !page.existingRecord) {
    return <JournalVoucherNotFound />;
  }

  function handleCreateParty(record: PartyInformationRecord) {
    if (partyAddLineId) {
      page.updateLine(partyAddLineId, "partyCode", record.partyCodeNo);
      page.updateLine(partyAddLineId, "partyName", getPartyDisplayName(record));
      applyJournalVoucherLinePartyTaxDefaults(page, partyAddLineId, record, taxCodes);
    }

    setPartyAddLineId(null);
  }

  return (
    <>
      <form onSubmit={page.handleSubmit} className="grid gap-5">
        <JournalVoucherHeaderPage page={page} onPreview={() => setIsReportPreviewOpen(true)} />

        <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
          <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-2 2xl:grid-cols-3">
            <div className="grid min-w-0 gap-4">
              <FieldShell controlId="journal-voucher-currencyType" error={page.errors.currencyType} label="Currency">
                <CurrencyExchangeRateRow
                  exchangeRateControlId="journal-voucher-currencyRate"
                  currencyControl={
                    <AppAdvancedDropdown
                      id="journal-voucher-currencyType"
                      className="w-full min-w-0"
                      value={page.values.currencyType}
                      readOnly={page.isReadonly}
                      isClearable={false}
                      options={currencyOptions}
                      placeholder="Currency"
                      searchPlaceholder="Search currency"
                      onChange={(value) => page.updateCurrencyType(String(value))}
                    />
                  }
                  exchangeRateControl={
                    <div className="min-w-0">
                      <input
                        id="journal-voucher-currencyRate"
                        className={fieldClassName}
                        disabled={page.isReadonly || page.isExchangeRateLoading}
                        min="0"
                        name="currencyRate"
                        onChange={page.handleInputChange}
                        step="0.000001"
                        type="number"
                        value={String(page.values.currencyRate)}
                      />
                      {page.errors.currencyRate ? <span className={errorClassName}>{page.errors.currencyRate}</span> : null}
                    </div>
                  }
                />
              </FieldShell>
              <TextareaField
                label="Remarks"
                name="remarks"
                value={page.values.remarks}
                error={page.errors.remarks}
                disabled={page.isReadonly}
                maxLength={500}
                onChange={page.handleInputChange}
              />
            </div>

            <div className="hidden 2xl:block" aria-hidden="true" />

            <div className="grid min-w-0 content-start gap-4">
              <TextField
                label="JV No"
                name="transactionNo"
                value={page.values.transactionNo}
                error={page.errors.transactionNo}
                disabled={page.isReadonly}
                isRequired
                onChange={page.handleInputChange}
              />
              <TextField
                label="JV Date"
                name="documentDate"
                type="date"
                value={page.values.documentDate}
                error={page.errors.documentDate}
                disabled={page.isReadonly}
                isRequired
                onChange={page.handleInputChange}
              />
              <TextField
                label="Status"
                name="status"
                value={page.values.status}
                error={page.errors.status}
                disabled={page.isReadonly}
                readOnly
                onChange={page.handleInputChange}
              />
            </div>
          </div>
        </section>

        <JournalVoucherDataEntryTable canAddPartyName={partyStore.permissions.canCreate} onAddPartyName={setPartyAddLineId} page={page} />
      </form>

      <JournalVoucherReportPreview
        isOpen={isReportPreviewOpen}
        values={page.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openJournalVoucherPdf(page.values)}
      />

      <AppDialog
        isOpen={page.isCancelDialogOpen}
        isPending={page.isMutating}
        title="Cancel journal voucher?"
        description={`This will change ${page.existingRecord?.transactionNo ?? "the selected journal voucher"} status to Cancelled.`}
        confirmLabel="Cancel Journal Voucher"
        tone="danger"
        onCancel={() => page.setIsCancelDialogOpen(false)}
        onConfirm={page.handleConfirmCancelVoucher}
      />

      <PartyManagementDrawer
        isOpen={!page.isReadonly && partyAddLineId !== null}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        title="Add Party Name"
        onAddRecord={partyStore.addRecord}
        onClose={() => setPartyAddLineId(null)}
        onCreateParty={handleCreateParty}
      />
    </>
  );
}

type FieldProps = {
  compact?: boolean;
  disabled: boolean;
  error?: string;
  label: string;
  name: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  value: string;
  type?: string;
  min?: string;
  isRequired?: boolean;
  maxLength?: number;
  readOnly?: boolean;
  step?: string;
};

function TextField({
  compact = false,
  disabled,
  error,
  label,
  name,
  onChange,
  value,
  type = "text",
  min,
  isRequired = false,
  maxLength,
  readOnly = false,
  step,
}: FieldProps) {
  const controlId = `journal-voucher-${name}`;

  return (
    <FieldShell controlId={controlId} compact={compact} error={error} isRequired={isRequired} label={label}>
      <input
        id={controlId}
        className={readOnly ? readOnlyFieldClassName : fieldClassName}
        disabled={disabled}
        min={min}
        maxLength={maxLength}
        name={name}
        onChange={onChange}
        readOnly={readOnly}
        step={step}
        type={type}
        value={value}
      />
    </FieldShell>
  );
}

function TextareaField({
  disabled,
  error,
  label,
  maxLength,
  name,
  onChange,
  value,
}: Omit<FieldProps, "onChange"> & {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
}) {
  const controlId = `journal-voucher-${name}`;

  return (
    <FieldShell controlId={controlId} error={error} isRequired={false} label={label}>
      <textarea
        id={controlId}
        className={textareaClassName}
        disabled={disabled}
        maxLength={maxLength}
        name={name}
        onChange={onChange}
        value={value}
      />
    </FieldShell>
  );
}

function createJournalVoucherCurrencyOptions() {
  return MultiCurrencyCatalog.filter((currency) => currency.isEnabled);
}

function createJournalVoucherCurrencyDropdownOptions(): AppAdvancedDropdownOption[] {
  return createJournalVoucherCurrencyOptions().map((currency) => ({
    label: currency.isDefault ? `${currency.name} | Default` : currency.name,
    name: currency.code,
    value: currency.code,
  }));
}

function FieldShell({
  children,
  compact = false,
  controlId,
  error,
  isRequired = false,
  label,
}: {
  children: ReactNode;
  compact?: boolean;
  controlId?: string;
  error?: string;
  isRequired?: boolean;
  label: string;
}) {
  const labelContent = (
    <>
      {label}
      {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
    </>
  );

  if (compact) {
    return (
      <div className="grid min-w-0 gap-2">
        {controlId ? (
          <label htmlFor={controlId} className="text-sm font-semibold text-darknavy">
            {labelContent}
          </label>
        ) : (
          <span className="text-sm font-semibold text-darknavy">{labelContent}</span>
        )}
        {children}
        {error ? <span className={errorClassName}>{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      {controlId ? (
        <label htmlFor={controlId} className="pt-2 text-sm font-semibold text-darknavy">
          {labelContent}
        </label>
      ) : (
        <span className="pt-2 text-sm font-semibold text-darknavy">{labelContent}</span>
      )}
      <div className="min-w-0">
        {children}
        {error ? <span className={errorClassName}>{error}</span> : null}
      </div>
    </div>
  );
}
