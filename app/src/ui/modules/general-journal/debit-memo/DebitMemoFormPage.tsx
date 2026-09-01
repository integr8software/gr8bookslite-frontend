"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Ban, Save } from "lucide-react";
import {
  DebitMemoActionCopy,
  DebitMemoCurrencyOptions,
  DebitMemoHref,
} from "@/app/src/constants/modules/general-journal/debit-memo/DebitMemoConstants";
import { formatDebitMemoAmount } from "@/app/src/data/modules/general-journal/debit-memo/DebitMemoData";
import { useAccountsPayableVoucherPartyOptions } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
import { useDebitMemoFormPage } from "@/app/src/hooks/modules/general-journal/debit-memo/useDebitMemoFormPage";
import type { AccountsPayableVoucherLookupParty } from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { DebitMemoDataEntryTable } from "@/app/src/ui/modules/general-journal/debit-memo/DebitMemoDataEntryTable";
import { DebitMemoNotFound } from "@/app/src/ui/modules/general-journal/debit-memo/DebitMemoNotFound";
import { isActiveStatus } from "@/app/src/utils/status.util";

const fieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-white disabled:text-darknavy disabled:opacity-60";
const readOnlyFieldClassName = `${fieldClassName} !bg-darknavy/5 text-darknavy/60`;
const textareaClassName =
  "app-data-entry-field min-h-24 min-w-0 w-full resize-y rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm font-medium leading-6 text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-white disabled:text-darknavy disabled:opacity-60";
const errorClassName = "mt-1.5 block text-xs font-semibold text-coralpink";

export function DebitMemoFormPage() {
  const page = useDebitMemoFormPage();
  const partyOptionsQuery = useAccountsPayableVoucherPartyOptions();
  const partyRecords = useMemo(
    () => partyOptionsQuery.data ?? [],
    [partyOptionsQuery.data],
  );
  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(
    () => createPartyOptions(partyRecords, page.values.partyCode, page.values.partyName),
    [page.values.partyCode, page.values.partyName, partyRecords],
  );

  const copy = DebitMemoActionCopy[page.mode];
  const title =
    page.mode === "view" && page.existingRecord
      ? `View Debit Memo | ${page.existingRecord.transactionNo}`
      : page.mode === "edit" && page.existingRecord
        ? `Edit Debit Memo | ${page.existingRecord.transactionNo}`
        : copy.title;

  if (page.needsRecord && !page.existingRecord) {
    return <DebitMemoNotFound />;
  }

  function selectParty(
    record: AccountsPayableVoucherLookupParty | null,
    fallbackName = "",
  ) {
    const partyCode = record?.partyCodeNo ?? "";
    const partyName = record ? record.name : fallbackName;

    page.updateHeaderField("partyCode", partyCode);
    page.updateHeaderField("partyName", partyName);
    if (record) {
      page.updateHeaderField("address", formatPartyAddress(record));
      page.updateHeaderField(
        "contactPerson",
        record.contactPerson || (isIndividualParty(record) ? partyName : ""),
      );
      page.updateHeaderField("contactNo", record.contactNo ?? "");
    }
  }

  return (
    <>
      <form onSubmit={page.handleSubmit} className="grid gap-5">
        <ModuleHeader
          variant="panel"
          titleAs="h1"
          title={title}
          description={copy.description}
          eyebrow={page.values.transactionNo || "Debit Memo"}
          actionsClassName="items-center gap-1"
          actions={
            <>
              <Link href={DebitMemoHref} className={moduleHeaderActionClassNames.secondary}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Link>
              {page.mode === "view" && page.existingRecord ? (
                <Link
                  href={`${DebitMemoHref}/edit/${page.existingRecord.id}`}
                  className={moduleHeaderActionClassNames.primary}
                >
                  Edit
                </Link>
              ) : null}
              {!page.isReadonly && page.mode !== "view" ? (
                <>
                  {page.mode === "edit" ? (
                    <button
                      type="button"
                      className={moduleHeaderActionClassNames.danger}
                      onClick={() => page.setIsCancelDialogOpen(true)}
                    >
                      <Ban className="h-4 w-4" aria-hidden="true" />
                      Cancel
                    </button>
                  ) : null}
                  <button type="submit" className={moduleHeaderActionClassNames.primary}>
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Save
                  </button>
                </>
              ) : null}
            </>
          }
        />

        <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
          <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-2 2xl:grid-cols-3">
            <div className="grid min-w-0 content-start gap-4">
              <FieldShell
                controlId="debit-memo-party"
                label="Party Name"
                error={page.errors.partyName || page.errors.partyCode}
                isRequired
              >
                <div className="min-w-0">
                  <AppAdvancedDropdown
                    id="debit-memo-party"
                    value={page.values.partyCode}
                    readOnly={page.isReadonly}
                    options={partyOptions}
                    placeholder="Select Party Name"
                    searchPlaceholder="Search Party Name"
                    emptyMessage={getPartyDropdownEmptyMessage(partyOptionsQuery)}
                    showSelectedDetails
                    onChange={(value) => {
                      const code = String(value);
                      const party = partyRecords.find((r) => r.partyCodeNo === code);
                      const option = partyOptions.find((o) => o.value === code);

                      selectParty(party ?? null, option?.name ?? "");
                    }}
                  />
                </div>
              </FieldShell>
              <TextField
                label="Address"
                name="address"
                value={page.values.address}
                error={page.errors.address}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
              />
              <TextField
                label="Contact Person"
                name="contactPerson"
                value={page.values.contactPerson}
                error={page.errors.contactPerson}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
              />
              <TextField
                label="Contact No"
                name="contactNo"
                value={page.values.contactNo}
                error={page.errors.contactNo}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
              />
              <TextareaField
                label="Remarks"
                name="remarks"
                value={page.values.remarks}
                error={page.errors.remarks}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
              />
            </div>

            <div className="grid min-w-0 content-start gap-4">
              <TextField
                label="Party Code"
                name="partyCode"
                value={page.values.partyCode}
                error={page.errors.partyCode}
                disabled={page.isReadonly}
                readOnly
                isRequired
                onChange={page.handleInputChange}
              />
              <TextField
                label="Reference No."
                name="referenceNo"
                value={page.values.referenceNo}
                error={page.errors.referenceNo}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
              />
              <FieldShell label="Currency" controlId="debit-memo-currency" error={page.errors.currency} isRequired>
                <select
                  id="debit-memo-currency"
                  name="currency"
                  className={fieldClassName}
                  disabled={page.isReadonly}
                  value={page.values.currency}
                  onChange={page.handleInputChange}
                >
                  {DebitMemoCurrencyOptions.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <TextField
                label="Exchange Rate"
                name="exchangeRate"
                type="number"
                min="0"
                step="0.000001"
                value={String(page.values.exchangeRate)}
                error={page.errors.exchangeRate}
                disabled={page.isReadonly}
                isRequired
                onChange={page.handleInputChange}
              />
            </div>

            <div className="grid min-w-0 content-start gap-4">
              <TextField
                label="Debit Memo No."
                name="transactionNo"
                value={page.values.transactionNo}
                error={page.errors.transactionNo}
                disabled={page.isReadonly}
                isRequired
                onChange={page.handleInputChange}
              />
              <TextField
                label="Debit Memo Date"
                name="documentDate"
                type="date"
                value={page.values.documentDate}
                error={page.errors.documentDate}
                disabled={page.isReadonly}
                isRequired
                onChange={page.handleInputChange}
              />
              <TextField
                label="Amount"
                name="amount"
                value={formatDebitMemoAmount(page.accountingTotals.totalDebit)}
                error={page.errors.amount}
                disabled={page.isReadonly}
                readOnly
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

        <DebitMemoDataEntryTable page={page} />
      </form>

      <AppDialog
        isOpen={page.isSaveDialogOpen}
        isPending={page.isMutating}
        title="Save Debit Memo?"
        description="Are you sure you want to save this Debit Memo?"
        confirmLabel="Save"
        tone="question"
        onCancel={page.handleCancelSaveVoucher}
        onConfirm={page.handleConfirmSaveVoucher}
      />

      <AppDialog
        isOpen={page.isCancelDialogOpen}
        isPending={page.isMutating}
        title="Cancel Debit Memo?"
        description={`This will change ${page.existingRecord?.transactionNo ?? "the selected Debit Memo"} status to Cancelled.`}
        confirmLabel="Cancel Debit Memo"
        tone="danger"
        onCancel={() => page.setIsCancelDialogOpen(false)}
        onConfirm={page.handleConfirmCancelVoucher}
      />
    </>
  );
}

function createPartyOptions(
  partyRecords: AccountsPayableVoucherLookupParty[],
  currentPartyCode: string,
  currentPartyName: string,
): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = partyRecords
    .filter((party) => isActiveStatus(party.status))
    .map((party) => ({
      description: party.partyTypes.join(", "),
      label: party.partyCodeNo,
      name: party.name || party.partyCodeNo,
      value: party.partyCodeNo,
    }));

  if (
    currentPartyCode.trim() &&
    !options.some((option) => option.value === currentPartyCode)
  ) {
    options.push({
      description: "Current voucher value",
      label: currentPartyCode,
      name: currentPartyName || currentPartyCode,
      value: currentPartyCode,
    });
  }

  return options;
}

function formatPartyAddress(record: AccountsPayableVoucherLookupParty) {
  const address = getPrimaryPartyAddress(record);

  return [
    address.addressLine1,
    address.addressLine2,
    address.barangay,
    address.cityMunicipality,
    address.province,
    address.region,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function getPrimaryPartyAddress(record: AccountsPayableVoucherLookupParty) {
  return (
    record.addresses?.find((address) => address.isDefault) ??
    record.addresses?.[0] ??
    record.address ?? {
      addressLine1: "",
      addressLine2: "",
      barangay: "",
      cityMunicipality: "",
      province: "",
      region: "",
    }
  );
}

function isIndividualParty(record: AccountsPayableVoucherLookupParty | null) {
  return record?.classification?.trim()?.toUpperCase() === "INDIVIDUAL";
}

function getPartyDropdownEmptyMessage(query: {
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
}) {
  if (query.isLoading || query.isFetching) {
    return "Loading parties...";
  }

  if (query.isError) {
    return "Could not load parties.";
  }

  return "No active parties found.";
}

type TextFieldProps = {
  disabled: boolean;
  error?: string;
  isRequired?: boolean;
  label: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
  type?: string;
  min?: string;
  readOnly?: boolean;
  step?: string;
};

function TextField({
  disabled,
  error,
  isRequired = false,
  label,
  min,
  name,
  onChange,
  readOnly = false,
  step,
  type = "text",
  value,
}: TextFieldProps) {
  const controlId = `debit-memo-${name}`;

  return (
    <FieldShell controlId={controlId} error={error} isRequired={isRequired} label={label}>
      <input
        id={controlId}
        className={readOnly ? readOnlyFieldClassName : fieldClassName}
        disabled={disabled}
        min={min}
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
  name,
  onChange,
  value,
}: Omit<TextFieldProps, "onChange"> & {
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}) {
  const controlId = `debit-memo-${name}`;

  return (
    <FieldShell controlId={controlId} error={error} label={label}>
      <AppLimitedTextarea
        id={controlId}
        className={textareaClassName}
        disabled={disabled}
        maxLength={500}
        name={name}
        onChange={onChange}
        value={value}
      />
    </FieldShell>
  );
}

function FieldShell({
  children,
  controlId,
  error,
  isRequired = false,
  label,
}: {
  children: React.ReactNode;
  controlId?: string;
  error?: string;
  isRequired?: boolean;
  label: string;
}) {
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      {controlId ? (
        <label htmlFor={controlId} className="pt-2 text-sm font-semibold text-darknavy">
          {label}
          {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
        </label>
      ) : (
        <span className="pt-2 text-sm font-semibold text-darknavy">
          {label}
          {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
        </span>
      )}
      <div className="min-w-0">
        {children}
        {error ? <span className={errorClassName}>{error}</span> : null}
      </div>
    </div>
  );
}
