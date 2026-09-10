"use client";

import { AccountsPayableVoucherPurchaseTransactionType } from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import { calculateAccountsPayableVoucherDueDate } from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import { createProjectNameLookupOptions } from "@/app/src/data/modules/project-maintenance/ProjectMaintenanceLookupData";
import { useMemo, useState, type ChangeEventHandler, type ReactNode } from "react";

import {
  useAccountsPayableVoucherPartyOptions,
  useAccountsPayableVoucherPayableAccountOptions,
  useAccountsPayableVoucherTermOptions,
} from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
import { useAccountsPayableVoucherFormPage } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucherFormPage";
import { useTermsMaintenanceStore } from "@/app/src/hooks/modules/financial-maintenance/terms-maintenance/useTermsMaintenance";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useProjectMaintenanceLookup } from "@/app/src/hooks/modules/project-maintenance/useProjectMaintenance";
import { useModuleFieldVisibility } from "@/app/src/hooks/shared/field-management/useCurrentModuleFieldManagement";
import { useTaxes } from "@/app/src/hooks/shared/tax/useTaxOptions";
import type { AccountsPayableVoucherLookupParty } from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type { TermsMaintenance } from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { ProjectMaintenance } from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import {
  applyAccountingEntryPartyTaxDefaults,
  applyExpenseLinePartyTaxDefaults,
} from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/entries/AccountsPayableVoucherDataEntryTableHelpers";
import {
  AccountsPayableVoucherDataEntryTables,
  type AccountsPayableVoucherPartyAddTarget,
} from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/entries/AccountsPayableVoucherDataEntryTables";
import { AccountsPayableVoucherHeaderPage } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/form/AccountsPayableVoucherHeaderPage";
import { AccountsPayableVoucherNotFound } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/overview/AccountsPayableVoucherNotFound";
import { openAccountsPayableVoucherPdf } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/reports/AccountsPayableVoucherPdf";
import { AccountsPayableVoucherReportPreview } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/reports/AccountsPayableVoucherReportPreview";
import { TermsMaintenanceQuickAddDialog } from "@/app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceQuickAddDialog";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/dialogs/PartyManagementDrawer";
import { ProjectMaintenanceDrawer } from "@/app/src/ui/modules/project-maintenance/ProjectMaintenanceDrawer";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

const fieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-white disabled:text-darknavy disabled:opacity-60";
const readOnlyFieldClassName = `${fieldClassName} !bg-darknavy/5 text-darknavy/60`;
const textareaClassName =
  "app-data-entry-field min-h-24 min-w-0 w-full resize-y rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm font-medium leading-6 text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-white disabled:text-darknavy disabled:opacity-60";
const errorClassName = "mt-1.5 block text-xs font-semibold text-coralpink";
const AttachedDropdownClassName = "";
const RemarksMaxLength = 500;
const PurchaseTaxCodeQuery = {
  transactionType: AccountsPayableVoucherPurchaseTransactionType,
} as const;

import {
  createLookupTermOptions,
  createPartyOptions,
  createTermOptions,
  findPayableAccount,
  formatPartyAddress,
  getPartyDropdownEmptyMessage,
  getPartyPurchaseTaxDefaults,
  getProjectDropdownEmptyMessage,
  getTermDropdownEmptyMessage,
  isIndividualParty,
  mapLookupTermToMaintenanceTerm,
  mapPartyRecordToLookupParty,
  mergePayableAccountOptions,
  shouldApplyPartyDefaultsToLineParty,
} from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherFormData";

export function AccountsPayableVoucherFormPage() {
  const page = useAccountsPayableVoucherFormPage();
  const partyStore = usePartyManagementStore();
  const termsMaintenanceStore = useTermsMaintenanceStore();
  const partyOptionsQuery = useAccountsPayableVoucherPartyOptions();
  const payableAccountOptionsQuery = useAccountsPayableVoucherPayableAccountOptions();
  const projectOptionsQuery = useProjectMaintenanceLookup();
  const termOptionsQuery = useAccountsPayableVoucherTermOptions();
  const taxCodesQuery = useTaxes(PurchaseTaxCodeQuery);
  const [partyAddTarget, setPartyAddTarget] = useState<"header" | AccountsPayableVoucherPartyAddTarget | null>(null);
  const [isProjectNameDialogOpen, setIsProjectNameDialogOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);

  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const partyRecords = useMemo(() => partyOptionsQuery.data ?? [], [partyOptionsQuery.data]);
  const projectRecords = useMemo(() => projectOptionsQuery.data ?? [], [projectOptionsQuery.data]);
  const termRecords = useMemo(() => termOptionsQuery.data ?? [], [termOptionsQuery.data]);
  const defaultPayableAccounts = useMemo(
    () =>
      mergePayableAccountOptions(
        payableAccountOptionsQuery.data?.accountOptions.defaultPayableAccount ?? [],
        payableAccountOptionsQuery.data?.accountOptions.employeePayableAccount ?? [],
      ),
    [payableAccountOptionsQuery.data],
  );
  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(
    () => createPartyOptions(partyRecords, page.values.partyCode, page.values.partyName),
    [page.values.partyCode, page.values.partyName, partyRecords],
  );
  const projectOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      createProjectNameLookupOptions({
        currentProjectCode: page.values.projectCode,
        currentProjectName: page.values.projectName,
        options: projectRecords,
      }),
    [page.values.projectCode, page.values.projectName, projectRecords],
  );
  const termOptions = useMemo<AppAdvancedDropdownOption[]>(
    () => createTermOptions(createLookupTermOptions(termRecords), page.values.termId, page.values.terms),
    [page.values.termId, page.values.terms, termRecords],
  );
  if (page.needsRecord && page.isRecordLoading) {
    return (
      <section className="grid min-h-[22rem] place-items-center rounded-md border border-darknavy/10 bg-white p-8 text-center shadow-sm shadow-darknavy/5">
        <p className="text-sm font-semibold text-darknavy/65">Loading accounts payable voucher...</p>
      </section>
    );
  }

  if (page.needsRecord && !page.existingRecord) {
    return <AccountsPayableVoucherNotFound />;
  }

  function selectParty(record: AccountsPayableVoucherLookupParty | null, fallbackName = "") {
    const previousPartyCode = page.values.partyCode;
    const partyCode = record?.partyCodeNo ?? "";
    const partyName = record ? record.name : fallbackName;

    page.updateHeaderField("partyCode", partyCode);
    page.updateHeaderField("partyName", partyName);
    page.updateHeaderField("partyId", record?.id);
    page.updateHeaderField("address", record ? formatPartyAddress(record) : "");
    page.updateHeaderField("contactPerson", record?.contactPerson || (isIndividualParty(record) ? partyName : ""));
    page.updateHeaderField("contactNo", record?.contactNo ?? "");

    applyPartyPurchaseTaxDefaults(record, previousPartyCode, partyCode);

    if (record?.defaultPayableAccount) {
      const account = findPayableAccount(record.defaultPayableAccount, defaultPayableAccounts);

      if (account) {
        page.updateHeaderField("creditAccountCode", account.accountNumber);
        page.updateHeaderField("creditAccountTitle", account.accountName);
        page.updateHeaderField("creditAccountId", account.id);
      }
    }

    if (record?.termId || record?.termName) {
      const term = termRecords.find((currentTerm) => currentTerm.id === record.termId);

      page.updateHeaderField("termId", record.termId);
      page.updateHeaderField("terms", record.termName);
      page.updateHeaderField(
        "dueDate",
        calculateAccountsPayableVoucherDueDate(page.values.documentDate, mapLookupTermToMaintenanceTerm(term)),
      );
    }
  }

  function handleCreateParty(record: PartyInformationRecord) {
    const lookupParty = mapPartyRecordToLookupParty(record);

    void partyOptionsQuery.refetch();

    if (partyAddTarget === "header" || partyAddTarget === null) {
      selectParty(lookupParty);
    } else if (partyAddTarget.kind === "expense") {
      page.updateExpenseLine(partyAddTarget.id, "partyCode", lookupParty.partyCodeNo);
      page.updateExpenseLine(partyAddTarget.id, "partyName", lookupParty.name);
      applyExpenseLinePartyTaxDefaults(page, partyAddTarget.id, lookupParty, taxCodes);
    } else {
      page.updateAccountingEntry(partyAddTarget.id, "partyCode", lookupParty.partyCodeNo);
      page.updateAccountingEntry(partyAddTarget.id, "partyName", lookupParty.name);
      applyAccountingEntryPartyTaxDefaults(page, partyAddTarget.id, lookupParty, taxCodes);
    }

    setPartyAddTarget(null);
  }

  function handleCreateProject(project: ProjectMaintenance) {
    page.updateHeaderField("projectCode", project.projectCode);
    page.updateHeaderField("projectName", project.projectName);
    setIsProjectNameDialogOpen(false);
  }

  function handleCreateTerm(term: TermsMaintenance) {
    page.updateHeaderField("termId", term.id);
    page.updateHeaderField("terms", term.name);
    page.updateHeaderField("dueDate", calculateAccountsPayableVoucherDueDate(page.values.documentDate, term));
    setIsTermsDialogOpen(false);
  }

  function applyPartyPurchaseTaxDefaults(
    record: AccountsPayableVoucherLookupParty | null,
    previousPartyCode: string,
    nextPartyCode: string,
  ) {
    if (!record) {
      return;
    }

    const defaults = getPartyPurchaseTaxDefaults(record, taxCodes);
    const shouldApplyInputVat = !record.defaultPurchaseInputVatTaxSourceKey || defaults.inputVatCode;
    const shouldApplyEwt = !record.defaultPurchaseEwtTaxSourceKey || defaults.ewtCode;

    if (!shouldApplyInputVat && !shouldApplyEwt) {
      return;
    }

    page.values.expenseLines
      .filter((line) => shouldApplyPartyDefaultsToLineParty(line.partyCode, previousPartyCode, nextPartyCode))
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
      .filter((entry) => shouldApplyPartyDefaultsToLineParty(entry.partyCode, previousPartyCode, nextPartyCode))
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
    const term = termRecords.find((currentTerm) => currentTerm.id === termId);

    page.updateHeaderField("termId", termId);
    page.updateHeaderField("terms", term?.name ?? "");
    page.updateHeaderField(
      "dueDate",
      calculateAccountsPayableVoucherDueDate(page.values.documentDate, mapLookupTermToMaintenanceTerm(term)),
    );
  }

  function updateDocumentDate(documentDate: string) {
    const term = termRecords.find((currentTerm) => currentTerm.id === page.values.termId);

    page.updateHeaderField("documentDate", documentDate);
    page.updateHeaderField("dueDate", calculateAccountsPayableVoucherDueDate(documentDate, mapLookupTermToMaintenanceTerm(term)));
  }

  function selectProject(projectName: string) {
    const project = projectOptions.find((option) => option.value === projectName);

    page.updateHeaderField("projectName", projectName);
    page.updateHeaderField("projectCode", projectName ? (project?.label ?? page.values.projectCode) : "");
  }

  return (
    <>
      <form onSubmit={page.handleSubmit} className="grid gap-5">
        <AccountsPayableVoucherHeaderPage page={page} onPreview={() => setIsReportPreviewOpen(true)} />

        <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
          <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-2 2xl:grid-cols-3">
            <div className="grid min-w-0 gap-4">
              <FieldShell
                controlId="accounts-payable-voucher-party"
                label="Party Name"
                error={page.errors.partyName || page.errors.partyCode}
                isRequired
              >
                <div className="min-w-0">
                  <AppAdvancedDropdown
                    id="accounts-payable-voucher-party"
                    className={AttachedDropdownClassName}
                    value={page.values.partyCode}
                    readOnly={page.isReadonly}
                    addAction={
                      !page.isReadonly && partyStore.permissions.canCreate
                        ? {
                            label: "Add Party Name",
                            onClick: () => setPartyAddTarget("header"),
                          }
                        : undefined
                    }
                    options={partyOptions}
                    placeholder="Select Party Name"
                    searchPlaceholder="Search Party Name"
                    emptyMessage={getPartyDropdownEmptyMessage(partyOptionsQuery)}
                    showSelectedDetails
                    onOpen={() => {
                      void partyOptionsQuery.refetch();
                    }}
                    onChange={(value) => {
                      const code = String(value);
                      const party = partyRecords.find((record) => record.partyCodeNo === code);
                      const option = partyOptions.find((currentOption) => currentOption.value === code);

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
                maxLength={RemarksMaxLength}
                onChange={page.handleInputChange}
              />
            </div>

            <div className="grid min-w-0 content-start gap-4">
              <FieldShell
                controlId="accounts-payable-voucher-terms"
                label="Terms of Payment"
                error={page.errors.terms || page.errors.termId}
                isRequired
              >
                <AppAdvancedDropdown
                  id="accounts-payable-voucher-terms"
                  value={page.values.termId}
                  readOnly={page.isReadonly}
                  addAction={
                    !page.isReadonly && termsMaintenanceStore.permissions.canCreate
                      ? {
                          label: "Add Terms",
                          onClick: () => setIsTermsDialogOpen(true),
                        }
                      : undefined
                  }
                  options={termOptions}
                  placeholder="Select Terms of Payment"
                  searchPlaceholder="Search Terms of Payment"
                  emptyMessage={getTermDropdownEmptyMessage(termOptionsQuery)}
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

              <FieldShell controlId="accounts-payable-voucher-currency" label="Currency" error={page.errors.currency} isRequired>
                <CurrencyExchangeRateRow
                  exchangeRateControlId="accounts-payable-voucher-exchange-rate"
                  currencyControl={
                    <AppAdvancedDropdown
                      id="accounts-payable-voucher-currency"
                      className="w-full min-w-0"
                      value={page.values.currency}
                      readOnly={page.isReadonly}
                      isClearable={false}
                      options={page.currencyOptions}
                      placeholder="Currency"
                      searchPlaceholder="Search currency"
                      onChange={(value) => page.updateCurrency(String(value))}
                    />
                  }
                  exchangeRateControl={
                    <div className="min-w-0">
                      <input
                        id="accounts-payable-voucher-exchange-rate"
                        className={fieldClassName}
                        disabled={page.isReadonly || page.isExchangeRateLoading}
                        min="0"
                        name="exchangeRate"
                        onChange={page.handleInputChange}
                        step="0.000001"
                        type="number"
                        value={String(page.values.exchangeRate)}
                      />
                      {page.errors.exchangeRate ? <span className={errorClassName}>{page.errors.exchangeRate}</span> : null}
                    </div>
                  }
                />
              </FieldShell>

              <FieldShell
                controlId="accounts-payable-voucher-credit-account"
                label="Default Payable Account"
                error={page.errors.creditAccountTitle || page.errors.creditAccountCode}
                isRequired
              >
                <ChartAccountDropdown
                  id="accounts-payable-voucher-credit-account"
                  accounts={defaultPayableAccounts}
                  value={page.values.creditAccountTitle || page.values.creditAccountCode}
                  valueField="id"
                  readOnly={page.isReadonly || payableAccountOptionsQuery.isLoading}
                  isClearable
                  ariaInvalid={Boolean(page.errors.creditAccountTitle || page.errors.creditAccountCode)}
                  emptyMessage="No default payable accounts found."
                  placeholder="Select payable account"
                  searchPlaceholder="Search payable account"
                  showSelectedDetails
                  onChange={() => undefined}
                  onSelectAccount={(account) => {
                    page.updateHeaderField("creditAccountCode", account?.accountNumber ?? "");
                    page.updateHeaderField("creditAccountTitle", account?.accountName ?? "");
                    page.updateHeaderField("creditAccountId", account?.id);
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
              <FieldShell controlId="accounts-payable-voucher-projectName" label="Project Name" error={page.errors.projectName}>
                <AppAdvancedDropdown
                  id="accounts-payable-voucher-projectName"
                  className={AttachedDropdownClassName}
                  value={page.values.projectName}
                  readOnly={page.isReadonly}
                  addAction={
                    !page.isReadonly
                      ? {
                          label: "Add Project Name",
                          onClick: () => setIsProjectNameDialogOpen(true),
                        }
                      : undefined
                  }
                  options={projectOptions}
                  placeholder="Select Project Name"
                  searchPlaceholder="Search Project Name"
                  emptyMessage={getProjectDropdownEmptyMessage(projectOptionsQuery)}
                  onChange={(value) => selectProject(String(value))}
                />
              </FieldShell>
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

        <AccountsPayableVoucherDataEntryTables
          canAddPartyName={partyStore.permissions.canCreate}
          onAddPartyName={setPartyAddTarget}
          page={page}
        />
      </form>

      <AppDialog
        isOpen={page.isSaveDialogOpen}
        isPending={page.isMutating}
        title="Save accounts payable voucher?"
        description="Are you sure you want to save?"
        confirmLabel="Save"
        iconTone="save"
        tone="default"
        onCancel={page.handleCancelSaveVoucher}
        onConfirm={page.handleConfirmSaveVoucher}
      />

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
        isOpen={!page.isReadonly && partyAddTarget !== null}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        title="Add Party Name"
        onAddRecord={partyStore.addRecord}
        onClose={() => setPartyAddTarget(null)}
        onCreateParty={handleCreateParty}
      />

      <TermsMaintenanceQuickAddDialog
        isOpen={!page.isReadonly && isTermsDialogOpen}
        onClose={() => setIsTermsDialogOpen(false)}
        onSaved={handleCreateTerm}
      />

      <ProjectMaintenanceDrawer
        isOpen={!page.isReadonly && isProjectNameDialogOpen}
        mode="add"
        onClose={() => setIsProjectNameDialogOpen(false)}
        onSaved={handleCreateProject}
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
  const isVisible = useModuleFieldVisibility([label]);
  const labelContent = (
    <>
      {label}
      <ModuleFieldRequiredMark fallbackRequired={isRequired} label={label} />
    </>
  );

  if (!isVisible) {
    return null;
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
