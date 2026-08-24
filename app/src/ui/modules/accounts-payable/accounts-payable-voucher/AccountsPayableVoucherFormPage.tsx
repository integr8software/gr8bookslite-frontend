"use client";

import { useMemo, useState, type ChangeEventHandler, type ReactNode } from "react";
import { AccountsPayableVoucherPurchaseTransactionType } from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import { calculateAccountsPayableVoucherDueDate } from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import { createProjectResponsibilityCenterInitialValues } from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { findModuleChartAccount, getModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { useAccountsPayableVoucherFormPage } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucherFormPage";
import {
  useAccountsPayableVoucherPartyOptions,
  useAccountsPayableVoucherPayableAccountOptions,
  useAccountsPayableVoucherResponsibilityCenterOptions,
  useAccountsPayableVoucherTermOptions,
} from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { useTermsMaintenanceStore } from "@/app/src/hooks/modules/financial-maintenance/terms-maintenance/useTermsMaintenance";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useTaxes } from "@/app/src/hooks/shared/tax/useTaxOptions";
import type {
  AccountsPayableVoucherLookupAccount,
  AccountsPayableVoucherLookupParty,
  AccountsPayableVoucherLookupResponsibilityCenter,
  AccountsPayableVoucherLookupTerm,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { TermsMaintenance } from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { Tax } from "@/app/src/types/shared/tax/TaxTypes";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import {
  AccountsPayableVoucherDataEntryTables,
  type AccountsPayableVoucherPartyAddTarget,
} from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherDataEntryTables";
import {
  applyAccountingEntryPartyTaxDefaults,
  applyExpenseLinePartyTaxDefaults,
} from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherDataEntryTableHelpers";
import { AccountsPayableVoucherHeaderPage } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherHeaderPage";
import { AccountsPayableVoucherNotFound } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherNotFound";
import { openAccountsPayableVoucherPdf } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherPdf";
import { AccountsPayableVoucherReportPreview } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherReportPreview";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { TermsMaintenanceQuickAddDialog } from "@/app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceQuickAddDialog";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { getEwtPercentFromCode, getVatPercentFromRate, getVatRateFromCode } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import { isActiveStatus } from "@/app/src/utils/status.util";

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

export function AccountsPayableVoucherFormPage() {
  const page = useAccountsPayableVoucherFormPage();
  const partyStore = usePartyManagementStore();
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const termsMaintenanceStore = useTermsMaintenanceStore();
  const partyOptionsQuery = useAccountsPayableVoucherPartyOptions();
  const payableAccountOptionsQuery = useAccountsPayableVoucherPayableAccountOptions();
  const projectOptionsQuery = useAccountsPayableVoucherResponsibilityCenterOptions();
  const termOptionsQuery = useAccountsPayableVoucherTermOptions();
  const taxCodesQuery = useTaxes(PurchaseTaxCodeQuery);
  const [partyAddTarget, setPartyAddTarget] = useState<
    "header" | AccountsPayableVoucherPartyAddTarget | null
  >(null);
  const [isProjectNameDialogOpen, setIsProjectNameDialogOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const chartAccounts = useMemo(() => getModuleChartAccounts(), []);
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
    () => createProjectOptions(projectRecords, page.values.projectCode, page.values.projectName),
    [page.values.projectCode, page.values.projectName, projectRecords],
  );
  const termOptions = useMemo<AppAdvancedDropdownOption[]>(
    () => createTermOptions(createLookupTermOptions(termRecords), page.values.termId, page.values.terms),
    [page.values.termId, page.values.terms, termRecords],
  );
  const projectInitialValues = useMemo(
    () =>
      createProjectResponsibilityCenterInitialValues(
        responsibilityCenterStore.classifications,
        responsibilityCenterStore.types,
      ),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
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
    page.updateHeaderField("address", record ? formatPartyAddress(record) : "");
    page.updateHeaderField("contactPerson", record?.contactPerson || (isIndividualParty(record) ? partyName : ""));
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

  function handleCreateProject(project: ResponsibilityCenter) {
    page.updateHeaderField("projectCode", project.code);
    page.updateHeaderField("projectName", project.name);
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
              <FieldShell controlId="accounts-payable-voucher-party" label="Party Name" error={page.errors.partyName || page.errors.partyCode} isRequired>
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
                    !page.isReadonly && responsibilityCenterStore.permissions.canCreate
                      ? {
                          label: "Add Project",
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
        tone="question"
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

      <ResponsibilityCenterDrawer
        initialValues={projectInitialValues}
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
  const labelContent = (
    <>
      {label}
      {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
    </>
  );

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

function findPayableAccount(value: string, accounts: AccountsPayableVoucherLookupAccount[]) {
  return accounts.find((account) => account.id === value || account.accountNumber === value || account.accountName === value);
}

function getPartyPurchaseTaxDefaults(record: AccountsPayableVoucherLookupParty, taxCodes: Tax[]) {
  const inputVatCode = getTaxCodeBySourceKey(taxCodes, record.defaultPurchaseInputVatTaxSourceKey, "INPUT VAT");
  const ewtCode = getTaxCodeBySourceKey(taxCodes, record.defaultPurchaseEwtTaxSourceKey, "EWT");
  const inputVatRate = getVatRateFromCode(inputVatCode, taxCodes);

  return {
    ewtCode,
    ewtPercent: getEwtPercentFromCode(ewtCode, taxCodes),
    inputVatCode,
    inputVatPercent: getVatPercentFromRate(inputVatRate),
  };
}

function getTaxCodeBySourceKey(taxCodes: Tax[], sourceKey: string, taxType: "EWT" | "INPUT VAT") {
  if (!sourceKey) {
    return "";
  }

  return (
    taxCodes.find((taxCode) => taxCode.sourceKey === sourceKey && taxCode.transactionType === "Purchases" && taxCode.taxType === taxType)
      ?.taxCode ?? ""
  );
}

function shouldApplyPartyDefaultsToLineParty(linePartyCode: string, previousPartyCode: string, nextPartyCode: string) {
  return linePartyCode.trim() === "" || linePartyCode === previousPartyCode || linePartyCode === nextPartyCode;
}

function formatPartyAddress(record: AccountsPayableVoucherLookupParty) {
  const address = getPrimaryPartyAddress(record);

  return [address.addressLine1, address.addressLine2, address.barangay, address.cityMunicipality, address.province, address.region]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function getPrimaryPartyAddress(record: AccountsPayableVoucherLookupParty) {
  return record.addresses.find((address) => address.isDefault) ?? record.addresses[0] ?? record.address;
}

function mapPartyRecordToLookupParty(record: PartyInformationRecord): AccountsPayableVoucherLookupParty {
  return {
    id: record.id,
    address: record.address,
    addresses: record.addresses,
    classification: record.classification,
    contactNo: record.contactNo,
    contactPerson: record.contactPerson,
    defaultPayableAccount: record.defaultPayableAccount || record.employeePayableAccount,
    defaultPurchaseEwtTaxSourceKey: record.defaultPurchaseEwtTaxSourceKey,
    defaultPurchaseFwtTaxSourceKey: record.defaultPurchaseFwtTaxSourceKey,
    defaultPurchaseInputVatTaxSourceKey: record.defaultPurchaseInputVatTaxSourceKey,
    defaultPurchaseWvatTaxSourceKey: record.defaultPurchaseWvatTaxSourceKey,
    email: record.email,
    name: getPartyDisplayName(record),
    partyCodeNo: record.partyCodeNo,
    partyTypes: record.partyTypes,
    status: "Active",
    termId: record.termId,
    termName: record.termName,
  };
}

function createPartyOptions(
  partyRecords: AccountsPayableVoucherLookupParty[],
  currentPartyCode: string,
  currentPartyName: string,
): AppAdvancedDropdownOption[] {
  const options = partyRecords
    .filter((party) => isActiveStatus(party.status))
    .map((party) => ({
      description: party.partyTypes.join(", "),
      label: party.partyCodeNo,
      name: party.name || party.partyCodeNo,
      value: party.partyCodeNo,
    }));

  if (currentPartyCode.trim() && !options.some((option) => option.value === currentPartyCode)) {
    options.push({
      description: "Current voucher value",
      label: currentPartyCode,
      name: currentPartyName || currentPartyCode,
      value: currentPartyCode,
    });
  }

  return options;
}

function createProjectOptions(
  projectRecords: AccountsPayableVoucherLookupResponsibilityCenter[],
  currentProjectCode: string,
  currentProjectName: string,
): AppAdvancedDropdownOption[] {
  const options = projectRecords
    .filter((project) => isActiveStatus(project.status) && isProjectResponsibilityCenter(project))
    .map((project) => ({
      description: project.typeName,
      label: project.code,
      name: project.name,
      value: project.name,
    }));

  if (currentProjectName.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current voucher value",
      label: currentProjectCode || "Current project",
      name: currentProjectName,
      value: currentProjectName,
    });
  }

  return options;
}

function createTermOptions(options: AppAdvancedDropdownOption[], currentTermId: string, currentTerms: string): AppAdvancedDropdownOption[] {
  const nextOptions = [...options];

  if (currentTermId.trim() && !nextOptions.some((option) => option.value === currentTermId)) {
    nextOptions.push({
      description: "Current voucher value",
      name: currentTerms || currentTermId,
      value: currentTermId,
    });
  }

  return nextOptions;
}

function addUniqueDropdownOption(options: AppAdvancedDropdownOption[], option: AppAdvancedDropdownOption) {
  if (!option.value.trim()) {
    return;
  }

  if (options.some((currentOption) => currentOption.value === option.value)) {
    return;
  }

  options.push(option);
}

function createLookupTermOptions(terms: AccountsPayableVoucherLookupTerm[]): AppAdvancedDropdownOption[] {
  return terms.map((term) => ({
    description: formatLookupTermDuration(term),
    name: term.name,
    value: term.id,
  }));
}

function mapLookupTermToMaintenanceTerm(term?: AccountsPayableVoucherLookupTerm): Pick<TermsMaintenance, "datemode" | "period"> | null {
  if (!term) {
    return null;
  }

  return {
    datemode: mapLookupTermDateMode(term.dateMode),
    period: String(term.period),
  };
}

function mapLookupTermDateMode(dateMode: AccountsPayableVoucherLookupTerm["dateMode"]) {
  if (dateMode === "DAY") return "Day";
  if (dateMode === "MONTH") return "Month";
  return "Year";
}

function formatLookupTermDuration(term: AccountsPayableVoucherLookupTerm) {
  const unit = mapLookupTermDateMode(term.dateMode).toLowerCase();
  const suffix = Number(term.period) === 1 ? unit : `${unit}s`;

  return `${term.period} ${suffix}`;
}

function mergePayableAccountOptions(...groups: AccountsPayableVoucherLookupAccount[][]) {
  const accountsById = new Map<string, AccountsPayableVoucherLookupAccount>();

  groups.flat().forEach((account) => {
    accountsById.set(account.id, account);
  });

  return [...accountsById.values()];
}

function getPartyDropdownEmptyMessage(query: { isError: boolean; isFetching: boolean; isLoading: boolean }) {
  if (query.isLoading || query.isFetching) {
    return "Loading parties...";
  }

  if (query.isError) {
    return "Could not load parties.";
  }

  return "No active vendors or employees found.";
}

function getTermDropdownEmptyMessage(query: { isError: boolean; isFetching: boolean; isLoading: boolean }) {
  if (query.isLoading || query.isFetching) {
    return "Loading terms...";
  }

  if (query.isError) {
    return "Could not load terms.";
  }

  return "No active terms found.";
}

function getProjectDropdownEmptyMessage(query: { isError: boolean; isFetching: boolean; isLoading: boolean }) {
  if (query.isLoading || query.isFetching) {
    return "Loading projects...";
  }

  if (query.isError) {
    return "Could not load projects.";
  }

  return "No active projects found.";
}

function isProjectResponsibilityCenter(project: AccountsPayableVoucherLookupResponsibilityCenter) {
  return project.typeName.trim().toLowerCase() === "project";
}

function isIndividualParty(record: AccountsPayableVoucherLookupParty | null) {
  return record?.classification.trim().toUpperCase() === "INDIVIDUAL";
}
