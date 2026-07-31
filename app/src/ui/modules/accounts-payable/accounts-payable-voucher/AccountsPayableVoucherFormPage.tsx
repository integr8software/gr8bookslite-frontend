"use client";

import { useMemo, useState, type ChangeEventHandler, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { MultiCurrencyCatalog } from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import {
  calculateAccountsPayableVoucherDueDate,
} from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import {
  findModuleChartAccount,
  getModuleChartAccounts,
} from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { useAccountsPayableVoucherFormPage } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucherFormPage";
import { usePartyManagementAccountOptions } from "@/app/src/hooks/modules/party-management/usePartyManagementAccountOptions";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useTermDropdownOptions } from "@/app/src/hooks/modules/financial-maintenance/terms-maintenance/useTermDropdownOptions";
import { useTaxes } from "@/app/src/hooks/shared/tax/useTaxOptions";
import type {
  PartyAccountingAccountOption,
  PartyInformationRecord,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { Tax } from "@/app/src/types/shared/tax/TaxTypes";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { AccountsPayableVoucherDataEntryTables } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherDataEntryTables";
import { AccountsPayableVoucherHeaderPage } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherHeaderPage";
import { AccountsPayableVoucherNotFound } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherNotFound";
import { openAccountsPayableVoucherPdf } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherPdf";
import { AccountsPayableVoucherReportPreview } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherReportPreview";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
  getEwtPercentFromCode,
  getVatPercentFromRate,
  getVatRateFromCode,
} from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";

const fieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-white disabled:text-darknavy disabled:opacity-60";
const readOnlyFieldClassName =
  `${fieldClassName} !bg-darknavy/5 text-darknavy/60`;
const textareaClassName =
  "app-data-entry-field min-h-24 min-w-0 w-full resize-y rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm font-medium leading-6 text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-white disabled:text-darknavy disabled:opacity-60";
const errorClassName = "mt-1.5 block text-xs font-semibold text-coralpink";
const AttachedDropdownClassName =
  "sm:[&_.app-advanced-dropdown-control]:rounded-r-none";
const AttachedAddButtonClassName =
  "inline-flex h-11 w-20 shrink-0 items-center justify-center gap-2 rounded-lg border border-darknavy/10 border-l-darknavy/20 bg-skyblue/8 px-3 text-sm font-semibold text-skyblue transition hover:border-skyblue/25 hover:bg-skyblue/12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15 disabled:cursor-not-allowed disabled:opacity-45 sm:rounded-l-none";
const RemarksMaxLength = 500;
const PurchaseTaxCodeQuery = {
  transactionType: "Purchases",
} as const;

export function AccountsPayableVoucherFormPage() {
  const page = useAccountsPayableVoucherFormPage();
  const partyAccountOptions = usePartyManagementAccountOptions();
  const partyStore = usePartyManagementStore();
  const termDropdown = useTermDropdownOptions();
  const taxCodesQuery = useTaxes(PurchaseTaxCodeQuery);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const chartAccounts = useMemo(() => getModuleChartAccounts(), []);
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const defaultPayableAccounts =
    partyAccountOptions.accountOptions.defaultPayableAccount;
  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      createPartyOptions(
        partyStore.records,
        page.values.partyCode,
        page.values.partyName,
      ),
    [page.values.partyCode, page.values.partyName, partyStore.records],
  );
  const termOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      createTermOptions(
        termDropdown.options,
        page.values.termId,
        page.values.terms,
      ),
    [page.values.termId, page.values.terms, termDropdown.options],
  );
  const currencyOptions = useMemo(
    () => createAccountsPayableVoucherCurrencyDropdownOptions(),
    [],
  );

  if (page.needsRecord && page.isRecordLoading) {
    return (
      <section className="grid min-h-[22rem] place-items-center rounded-md border border-darknavy/10 bg-white p-8 text-center shadow-sm shadow-darknavy/5">
        <p className="text-sm font-semibold text-darknavy/65">
          Loading accounts payable voucher...
        </p>
      </section>
    );
  }

  if (page.needsRecord && !page.existingRecord) {
    return <AccountsPayableVoucherNotFound />;
  }

  function selectParty(record: PartyInformationRecord | null, fallbackName = "") {
    const previousPartyCode = page.values.partyCode;
    const partyCode = record?.partyCodeNo ?? "";
    const partyName = record ? getPartyDisplayName(record) : fallbackName;

    page.updateHeaderField("partyCode", partyCode);
    page.updateHeaderField("partyName", partyName);
    page.updateHeaderField("address", record ? formatPartyAddress(record) : "");
    page.updateHeaderField(
      "contactPerson",
      record?.classification === "Individual" ? partyName : "",
    );
    page.updateHeaderField("contactNo", record?.contactNo ?? "");

    applyPartyPurchaseTaxDefaults(record, previousPartyCode, partyCode);

    if (record?.defaultPayableAccount) {
      const account =
        findPayableAccount(record.defaultPayableAccount, defaultPayableAccounts) ??
        findModuleChartAccount(record.defaultPayableAccount, chartAccounts);

      if (account) {
        page.updateHeaderField("creditAccountCode", account.accountNumber);
        page.updateHeaderField("creditAccountTitle", account.accountName);
      }
    }

    if (record?.termId || record?.termName) {
      const term = termDropdown.terms.find(
        (currentTerm) => currentTerm.id === record.termId,
      );

      page.updateHeaderField("termId", record.termId);
      page.updateHeaderField("terms", record.termName);
      page.updateHeaderField(
        "dueDate",
        calculateAccountsPayableVoucherDueDate(page.values.documentDate, term),
      );
    }
  }

  function applyPartyPurchaseTaxDefaults(
    record: PartyInformationRecord | null,
    previousPartyCode: string,
    nextPartyCode: string,
  ) {
    if (!record) {
      return;
    }

    const defaults = getPartyPurchaseTaxDefaults(record, taxCodes);
    const shouldApplyInputVat =
      !record.defaultPurchaseInputVatTaxSourceKey || defaults.inputVatCode;
    const shouldApplyEwt =
      !record.defaultPurchaseEwtTaxSourceKey || defaults.ewtCode;

    if (!shouldApplyInputVat && !shouldApplyEwt) {
      return;
    }

    page.values.expenseLines
      .filter((line) =>
        shouldApplyPartyDefaultsToLineParty(
          line.partyCode,
          previousPartyCode,
          nextPartyCode,
        ),
      )
      .forEach((line) => {
        if (shouldApplyInputVat) {
          page.updateExpenseLine(line.id, "vat", defaults.inputVatCode);
          page.updateExpenseLine(line.id, "vatPercent", defaults.inputVatPercent);
        }

        if (shouldApplyEwt) {
          page.updateExpenseLine(line.id, "ewt", defaults.ewtCode);
          page.updateExpenseLine(line.id, "ewtPercent", defaults.ewtPercent);
        }
      });

    page.values.accountingEntries
      .filter((entry) =>
        shouldApplyPartyDefaultsToLineParty(
          entry.partyCode,
          previousPartyCode,
          nextPartyCode,
        ),
      )
      .forEach((entry) => {
        if (shouldApplyInputVat) {
          page.updateAccountingEntry(entry.id, "vatType", defaults.inputVatCode);
        }

        if (shouldApplyEwt) {
          page.updateAccountingEntry(entry.id, "atcCode", defaults.ewtCode);
        }
      });
  }

  function selectTerm(termId: string) {
    const term = termDropdown.terms.find(
      (currentTerm) => currentTerm.id === termId,
    );

    page.updateHeaderField("termId", termId);
    page.updateHeaderField("terms", term?.name ?? "");
    page.updateHeaderField(
      "dueDate",
      calculateAccountsPayableVoucherDueDate(page.values.documentDate, term),
    );
  }

  function updateDocumentDate(documentDate: string) {
    const term = termDropdown.terms.find(
      (currentTerm) => currentTerm.id === page.values.termId,
    );

    page.updateHeaderField("documentDate", documentDate);
    page.updateHeaderField(
      "dueDate",
      calculateAccountsPayableVoucherDueDate(documentDate, term),
    );
  }

  return (
    <>
      <form onSubmit={page.handleSubmit} className="grid gap-5">
        <AccountsPayableVoucherHeaderPage
          page={page}
          onPreview={() => setIsReportPreviewOpen(true)}
        />

        <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
          <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-3">
            <div className="grid min-w-0 gap-4">
              <FieldShell
                controlId="accounts-payable-voucher-party"
                label="Party Name"
                error={page.errors.partyCode || page.errors.partyName}
                isRequired
              >
                <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
                  <AppAdvancedDropdown
                    id="accounts-payable-voucher-party"
                    className={AttachedDropdownClassName}
                    value={page.values.partyCode}
                    readOnly={page.isReadonly}
                    options={partyOptions}
                    placeholder="Select Party Name"
                    searchPlaceholder="Search Party Name"
                    showSelectedDetails
                    onChange={(value) => {
                      const code = String(value);
                      const party = partyStore.records.find(
                        (record) => record.partyCodeNo === code,
                      );
                      const option = partyOptions.find(
                        (currentOption) => currentOption.value === code,
                      );

                      selectParty(party ?? null, option?.name ?? "");
                    }}
                  />
                  <button
                    type="button"
                    disabled={page.isReadonly}
                    onClick={() => setIsPartyDrawerOpen(true)}
                    className={AttachedAddButtonClassName}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add
                  </button>
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

              <TextField
                label="Project Name"
                name="projectName"
                value={page.values.projectName}
                error={page.errors.projectName}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
              />

              <TextareaField
                label="Remarks"
                name="remarks"
                value={page.values.remarks}
                error={page.errors.remarks}
                disabled={page.isReadonly}
                maxLength={RemarksMaxLength}
                onChange={page.handleInputChange}
              />
            </div>

            <div className="grid min-w-0 content-start gap-4">
              <FieldShell
                controlId="accounts-payable-voucher-terms"
                label="Terms"
                error={page.errors.terms || page.errors.termId}
                isRequired
              >
                <AppAdvancedDropdown
                  id="accounts-payable-voucher-terms"
                  value={page.values.termId}
                  readOnly={page.isReadonly}
                  options={termOptions}
                  placeholder="Select Terms"
                  searchPlaceholder="Search Terms"
                  showSelectedDetails
                  onChange={(value) => selectTerm(String(value))}
                />
              </FieldShell>

              <TextField
                label="Due Date"
                name="dueDate"
                type="date"
                value={page.values.dueDate}
                error={page.errors.dueDate}
                disabled={page.isReadonly}
                readOnly
                onChange={page.handleInputChange}
              />

              <FieldShell
                controlId="accounts-payable-voucher-currency"
                label="Currency"
                error={page.errors.currency}
                isRequired
              >
                <AppAdvancedDropdown
                  id="accounts-payable-voucher-currency"
                  value={page.values.currency}
                  readOnly={page.isReadonly}
                  isClearable={false}
                  options={currencyOptions}
                  placeholder="Currency"
                  searchPlaceholder="Search currency"
                  onChange={(value) => page.updateCurrency(String(value))}
                />
              </FieldShell>

              <TextField
                label="Exchange Rate"
                name="exchangeRate"
                type="number"
                min="0"
                step="0.000001"
                value={String(page.values.exchangeRate)}
                error={page.errors.exchangeRate}
                disabled={page.isReadonly || page.isExchangeRateLoading}
                onChange={page.handleInputChange}
              />

              <FieldShell
                controlId="accounts-payable-voucher-credit-account"
                label="Default Payable Account"
                error={
                  page.errors.creditAccountTitle ||
                  page.errors.creditAccountCode
                }
                isRequired
              >
                <ChartAccountDropdown
                  id="accounts-payable-voucher-credit-account"
                  accounts={defaultPayableAccounts}
                  value={
                    page.values.creditAccountTitle ||
                    page.values.creditAccountCode
                  }
                  valueField="id"
                  readOnly={page.isReadonly || partyAccountOptions.isLoading}
                  isClearable
                  ariaInvalid={Boolean(
                    page.errors.creditAccountTitle ||
                      page.errors.creditAccountCode,
                  )}
                  emptyMessage="No default payable accounts found."
                  placeholder="Select payable account"
                  searchPlaceholder="Search payable account"
                  showSelectedDetails
                  onChange={() => undefined}
                  onSelectAccount={(account) => {
                    page.updateHeaderField(
                      "creditAccountCode",
                      account?.accountNumber ?? "",
                    );
                    page.updateHeaderField(
                      "creditAccountTitle",
                      account?.accountName ?? "",
                    );
                  }}
                />
              </FieldShell>
            </div>

            <div className="grid min-w-0 content-start gap-4">
              <TextField
                label="APV No."
                name="transactionNo"
                value={page.values.transactionNo}
                error={page.errors.transactionNo}
                disabled={page.isReadonly}
                isRequired
                onChange={page.handleInputChange}
              />
              <TextField
                label="APV Date"
                name="documentDate"
                type="date"
                value={page.values.documentDate}
                error={page.errors.documentDate}
                disabled={page.isReadonly}
                isRequired
                onChange={(event) => updateDocumentDate(event.target.value)}
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

        <AccountsPayableVoucherDataEntryTables page={page} />
      </form>

      <AppDialog
        isOpen={page.isCancelDialogOpen}
        isPending={page.isMutating}
        title="Cancel accounts payable voucher?"
        description={`This will change ${page.existingRecord?.transactionNo ?? "the selected accounts payable voucher"} status to Cancelled.`}
        confirmLabel="Cancel Accounts Payable Voucher"
        tone="danger"
        onCancel={() => page.setIsCancelDialogOpen(false)}
        onConfirm={page.handleConfirmCancelVoucher}
      />

      <AccountsPayableVoucherReportPreview
        isOpen={isReportPreviewOpen}
        values={page.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openAccountsPayableVoucherPdf(page.values)}
      />

      <PartyManagementDrawer
        isOpen={!page.isReadonly && isPartyDrawerOpen}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        onAddRecord={partyStore.addRecord}
        onClose={() => setIsPartyDrawerOpen(false)}
        onCreateParty={(record) => {
          selectParty(record);
          setIsPartyDrawerOpen(false);
        }}
      />
    </>
  );
}

type FieldProps = {
  disabled: boolean;
  error?: string;
  isRequired?: boolean;
  label: string;
  name: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
  type?: string;
  min?: string;
  maxLength?: number;
  readOnly?: boolean;
  step?: string;
};

function TextField({
  disabled,
  error,
  label,
  name,
  onChange,
  value,
  type = "text",
  min,
  isRequired = false,
  readOnly = false,
  step,
}: FieldProps) {
  const controlId = `accounts-payable-voucher-${name}`;

  return (
    <FieldShell
      controlId={controlId}
      error={error}
      isRequired={isRequired}
      label={label}
    >
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
  maxLength,
  name,
  onChange,
  value,
}: Omit<FieldProps, "onChange"> & {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
}) {
  const controlId = `accounts-payable-voucher-${name}`;

  return (
    <FieldShell controlId={controlId} error={error} label={label}>
      <AppLimitedTextarea
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

function FieldShell({
  children,
  controlId,
  error,
  isRequired = false,
  label,
}: {
  children: ReactNode;
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

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      {controlId ? (
        <label
          htmlFor={controlId}
          className="pt-2 text-sm font-semibold text-darknavy"
        >
          {labelContent}
        </label>
      ) : (
        <span className="pt-2 text-sm font-semibold text-darknavy">
          {labelContent}
        </span>
      )}
      <div className="min-w-0">
        {children}
        {error ? <span className={errorClassName}>{error}</span> : null}
      </div>
    </div>
  );
}

function createAccountsPayableVoucherCurrencyOptions() {
  return MultiCurrencyCatalog.filter((currency) => currency.isEnabled);
}

function createAccountsPayableVoucherCurrencyDropdownOptions(): AppAdvancedDropdownOption[] {
  return createAccountsPayableVoucherCurrencyOptions().map((currency) => ({
    label: currency.isDefault ? `${currency.name} | Default` : currency.name,
    name: currency.code,
    value: currency.code,
  }));
}

function findPayableAccount(
  value: string,
  accounts: PartyAccountingAccountOption[],
) {
  return accounts.find(
    (account) =>
      account.id === value ||
      account.accountNumber === value ||
      account.accountName === value,
  );
}

function getPartyPurchaseTaxDefaults(
  record: PartyInformationRecord,
  taxCodes: Tax[],
) {
  const inputVatCode = getTaxCodeBySourceKey(
    taxCodes,
    record.defaultPurchaseInputVatTaxSourceKey,
    "INPUT VAT",
  );
  const ewtCode = getTaxCodeBySourceKey(
    taxCodes,
    record.defaultPurchaseEwtTaxSourceKey,
    "EWT",
  );
  const inputVatRate = getVatRateFromCode(inputVatCode, taxCodes);

  return {
    ewtCode,
    ewtPercent: getEwtPercentFromCode(ewtCode, taxCodes),
    inputVatCode,
    inputVatPercent: getVatPercentFromRate(inputVatRate),
  };
}

function getTaxCodeBySourceKey(
  taxCodes: Tax[],
  sourceKey: string,
  taxType: "EWT" | "INPUT VAT",
) {
  if (!sourceKey) {
    return "";
  }

  return (
    taxCodes.find(
      (taxCode) =>
        taxCode.sourceKey === sourceKey &&
        taxCode.transactionType === "Purchases" &&
        taxCode.taxType === taxType,
    )?.taxCode ?? ""
  );
}

function shouldApplyPartyDefaultsToLineParty(
  linePartyCode: string,
  previousPartyCode: string,
  nextPartyCode: string,
) {
  return (
    linePartyCode.trim() === "" ||
    linePartyCode === previousPartyCode ||
    linePartyCode === nextPartyCode
  );
}

function formatPartyAddress(record: PartyInformationRecord) {
  const address = record.address;

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

function createPartyOptions(
  partyRecords: PartyInformationRecord[],
  currentPartyCode: string,
  currentPartyName: string,
): AppAdvancedDropdownOption[] {
  const options = partyRecords
    .filter((party) => party.status === "Active")
    .map((party) => ({
      description: party.partyTypes.join(", "),
      label: party.partyCodeNo,
      name: getPartyDisplayName(party),
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

function createTermOptions(
  options: AppAdvancedDropdownOption[],
  currentTermId: string,
  currentTerms: string,
): AppAdvancedDropdownOption[] {
  const nextOptions = [...options];

  if (
    currentTermId.trim() &&
    !nextOptions.some((option) => option.value === currentTermId)
  ) {
    nextOptions.push({
      description: "Current voucher value",
      name: currentTerms || currentTermId,
      value: currentTermId,
    });
  }

  return nextOptions;
}
