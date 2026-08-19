"use client";

import { useMemo, useState } from "react";
import {
  AccountsPayableVoucherAccountingColumnIds,
  AccountsPayableVoucherAccountingDefaultVisibleColumnIds,
  AccountsPayableVoucherAccountingColumnLabels,
  AccountsPayableVoucherAccountingColumnWidths,
  AccountsPayableVoucherAccountingProtectedColumnIds,
  AccountsPayableVoucherPurchaseTransactionType,
} from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import {
  calculateAccountingColumnFitWidth,
  applyAccountingEntryPartyTaxDefaults,
  createPartyOptions,
  createResponsibilityCenterOptions,
  entryDropdownClassName,
  findPartyRecordByCode,
  isAccountingColumnId,
  isManualGeneratedTaxAccountingEntry,
  LineAmountInput,
  LineInput,
  moveColumnId,
  ParticularsEditorDialog,
  PartyDropdown,
  ParticularsCell,
  ResponsibilityCenterDropdown,
  updateVisibleColumnIds,
} from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherDataEntryTableHelpers";
import { formatAccountsPayableVoucherAmount } from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import {
  useAccountsPayableVoucherPartyOptions,
  useAccountsPayableVoucherPostingAccountOptions,
  useAccountsPayableVoucherResponsibilityCenterOptions,
} from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
import type { useAccountsPayableVoucherFormPage } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucherFormPage";
import { useTaxes } from "@/app/src/hooks/shared/tax/useTaxOptions";
import type {
  AccountsPayableVoucherAccountingColumnId,
  AccountsPayableVoucherAccountingEntry,
  AccountsPayableVoucherAccountingEntryField,
  AccountsPayableVoucherLookupAccount,
  AccountsPayableVoucherLookupParty,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { createEwtOptions, createVatOptions } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  createAccountingEntryLookupAccount,
  getLookupAccountEmptyMessage,
  getSelectableLookupAccountId,
  mergeLookupAccountOptions,
} from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherDataEntryTableLookups";
import type { AccountsPayableVoucherDataEntryPanelProps } from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherDataEntryTableTypes";

const PurchaseTaxCodeQuery = {
  transactionType: AccountsPayableVoucherPurchaseTransactionType,
} as const;

export function AccountsPayableVoucherAccountingTable({
  canAddPartyName,
  onAddPartyName,
  page,
  title,
}: AccountsPayableVoucherDataEntryPanelProps) {
  const [particularsEditorEntryId, setParticularsEditorEntryId] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<AccountsPayableVoucherAccountingColumnId[]>([
    ...AccountsPayableVoucherAccountingColumnIds,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<AccountsPayableVoucherAccountingColumnId[]>([
    ...AccountsPayableVoucherAccountingDefaultVisibleColumnIds,
  ]);
  const [columnLabels, setColumnLabels] = useState<Record<AccountsPayableVoucherAccountingColumnId, string>>({
    ...AccountsPayableVoucherAccountingColumnLabels,
  });
  const [columnWidths, setColumnWidths] = useState<Record<AccountsPayableVoucherAccountingColumnId, number>>({
    ...AccountsPayableVoucherAccountingColumnWidths,
  });
  const isReadonly = page.isAccountingEntriesReadonly;
  const partyOptionsQuery = useAccountsPayableVoucherPartyOptions();
  const postingAccountOptionsQuery = useAccountsPayableVoucherPostingAccountOptions();
  const responsibilityCenterOptionsQuery = useAccountsPayableVoucherResponsibilityCenterOptions();
  const partyRecords = useMemo(() => partyOptionsQuery.data ?? [], [partyOptionsQuery.data]);
  const responsibilityCenters = useMemo(() => responsibilityCenterOptionsQuery.data ?? [], [responsibilityCenterOptionsQuery.data]);
  const postingAccounts = useMemo(
    () =>
      mergeLookupAccountOptions(
        postingAccountOptionsQuery.data ?? [],
        page.values.accountingEntries.map(createAccountingEntryLookupAccount),
      ),
    [page.values.accountingEntries, postingAccountOptionsQuery.data],
  );
  const postingAccountEmptyMessage = getLookupAccountEmptyMessage(postingAccountOptionsQuery, "No posting accounts found.");
  const taxCodesQuery = useTaxes(PurchaseTaxCodeQuery);
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);
  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      createPartyOptions(partyRecords, [
        ...page.values.expenseLines,
        ...page.values.accountingEntries,
        {
          partyCode: page.values.partyCode,
          partyName: page.values.partyName,
        },
      ]),
    [page.values.accountingEntries, page.values.expenseLines, page.values.partyCode, page.values.partyName, partyRecords],
  );
  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(
    () => createResponsibilityCenterOptions(responsibilityCenters, [...page.values.expenseLines, ...page.values.accountingEntries]),
    [page.values.accountingEntries, page.values.expenseLines, responsibilityCenters],
  );
  const visibleColumnOrder = columnOrder.filter((columnId) => visibleColumnIds.includes(columnId));
  const particularsEditorEntry = page.values.accountingEntries.find((entry) => entry.id === particularsEditorEntryId) ?? null;
  const columns: ModuleDataEntryColumn<AccountsPayableVoucherAccountingEntry>[] = visibleColumnOrder.map((columnId) => ({
    header: columnLabels[columnId],
    id: columnId,
    isRemovable: !AccountsPayableVoucherAccountingProtectedColumnIds.has(columnId),
    renderCell: (entry) =>
      renderAccountingCell(
        page,
        entry,
        columnId,
        postingAccounts,
        postingAccountEmptyMessage,
        partyOptions,
        partyRecords,
        responsibilityCenterOptions,
        vatOptions,
        ewtOptions,
        taxCodes,
        canAddPartyName,
        (entryId) => onAddPartyName({ kind: "accounting", id: entryId }),
        () => setParticularsEditorEntryId(entry.id),
      ),
    width: columnWidths[columnId],
    widthClassName: "",
    widthMode: "fixed",
  }));
  const columnOptions: ModuleDataEntryColumnOption[] = columnOrder.map((columnId) => ({
    id: columnId,
    isHideable: !AccountsPayableVoucherAccountingProtectedColumnIds.has(columnId),
    isVisible: visibleColumnIds.includes(columnId),
    label: columnLabels[columnId],
    width: columnWidths[columnId],
    widthMode: "fixed",
  }));

  function updateColumnHeader(columnId: string, header: string) {
    if (!isAccountingColumnId(columnId)) {
      return;
    }

    setColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (!isAccountingColumnId(columnId)) {
      return;
    }

    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitColumnWidth(columnId: string) {
    if (!isAccountingColumnId(columnId)) {
      return;
    }

    updateColumnWidth(
      columnId,
      calculateAccountingColumnFitWidth({
        columnId,
        columnLabels,
        entries: page.values.accountingEntries,
      }),
    );
  }

  function moveColumn(fromColumnId: string, toColumnId: string) {
    if (!isAccountingColumnId(fromColumnId) || !isAccountingColumnId(toColumnId)) {
      return;
    }

    setColumnOrder((currentOrder) => moveColumnId(currentOrder, fromColumnId, toColumnId));
  }

  function resetColumns() {
    setColumnOrder([...AccountsPayableVoucherAccountingColumnIds]);
    setVisibleColumnIds([...AccountsPayableVoucherAccountingDefaultVisibleColumnIds]);
    setColumnLabels({ ...AccountsPayableVoucherAccountingColumnLabels });
    setColumnWidths({ ...AccountsPayableVoucherAccountingColumnWidths });
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isAccountingColumnId(columnId)) {
      return;
    }

    if (!isVisible && AccountsPayableVoucherAccountingProtectedColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) => updateVisibleColumnIds(currentVisibleIds, columnOrder, columnId, isVisible));
  }

  return (
    <>
      <ModuleDataEntry
        columns={columns}
        columnResetLabel="Default"
        columnOptions={columnOptions}
        description=""
        emptyRowLabel="entry"
        error={page.errors.accountingEntries ?? page.errors.balance}
        canConfigureColumnsWhenReadonly
        footerDetails={
          <span className={joinClasses("text-sm font-semibold", page.accountingTotals.isBalanced ? "text-emerald-700" : "text-coralpink")}>
            Variance: {formatAccountsPayableVoucherAmount(Math.abs(page.accountingTotals.variance))}
          </span>
        }
        isDraggable
        isReadonly={isReadonly}
        rows={page.values.accountingEntries}
        summaryCells={{
          credit: formatAccountsPayableVoucherAmount(page.accountingTotals.totalCredit),
          debit: formatAccountsPayableVoucherAmount(page.accountingTotals.totalDebit),
        }}
        summaryRowHeader="Totals"
        title={title}
        onAddRows={page.addAccountingEntries}
        onAutoColumnWidth={fitColumnWidth}
        onClearRows={page.clearAccountingEntries}
        onDuplicateRow={page.duplicateAccountingEntry}
        onFitColumnWidth={fitColumnWidth}
        onInsertRow={page.insertAccountingEntry}
        onMoveColumn={moveColumn}
        onMoveRow={page.moveAccountingEntry}
        onRemoveRow={page.removeAccountingEntry}
        onResetColumns={resetColumns}
        onToggleColumnVisibility={toggleColumnVisibility}
        onUpdateColumnHeader={updateColumnHeader}
        onUpdateColumnWidth={updateColumnWidth}
      />
      <ParticularsEditorDialog
        key={particularsEditorEntry?.id ?? "closed"}
        isOpen={Boolean(particularsEditorEntry)}
        isReadonly={isReadonly}
        subtitle={particularsEditorEntry?.accountTitle || "Accounting entry"}
        textareaId="accounts-payable-voucher-accounting-particulars-dialog-text"
        value={particularsEditorEntry?.particulars ?? ""}
        onClose={() => setParticularsEditorEntryId(null)}
        onSave={(value) => {
          if (!particularsEditorEntry || isReadonly) {
            setParticularsEditorEntryId(null);
            return;
          }

          page.updateAccountingEntry(particularsEditorEntry.id, "particulars", value);
          setParticularsEditorEntryId(null);
        }}
      />
    </>
  );
}

function renderAccountingCell(
  page: ReturnType<typeof useAccountsPayableVoucherFormPage>,
  entry: AccountsPayableVoucherAccountingEntry,
  columnId: AccountsPayableVoucherAccountingColumnId,
  postingAccounts: AccountsPayableVoucherLookupAccount[],
  postingAccountEmptyMessage: string,
  partyOptions: AppAdvancedDropdownOption[],
  partyRecords: AccountsPayableVoucherLookupParty[],
  responsibilityCenterOptions: AppAdvancedDropdownOption[],
  vatOptions: AppAdvancedDropdownOption[],
  ewtOptions: AppAdvancedDropdownOption[],
  taxCodes: Parameters<typeof createVatOptions>[0],
  canAddPartyName: boolean,
  onAddPartyName: (entryId: string) => void,
  onOpenParticulars: () => void,
) {
  const entryErrors = page.errors.accountingEntryErrors?.[entry.id] ?? {};
  const isReadonly = page.isAccountingEntriesReadonly;
  const isGeneratedTaxEntry = isManualGeneratedTaxAccountingEntry(entry);

  switch (columnId) {
    case "accountCode":
      return <LineInput error={entryErrors.accountCode} value={entry.accountCode} onChange={() => undefined} readOnly />;
    case "accountTitle":
      return (
        <ChartAccountDropdown
          accounts={postingAccounts}
          emptyMessage={postingAccountEmptyMessage}
          value={entry.accountTitle}
          valueField="accountName"
          readOnly={isReadonly || isGeneratedTaxEntry}
          isClearable
          className={entryDropdownClassName(entryErrors.accountTitle)}
          ariaInvalid={Boolean(entryErrors.accountTitle)}
          placeholder="Select account title"
          searchPlaceholder="Search account title"
          onChange={() => undefined}
          onSelectAccount={(account) => {
            page.updateAccountingEntry(entry.id, "accountId", getSelectableLookupAccountId(account));
            page.updateAccountingEntry(entry.id, "accountCode", account?.accountNumber ?? "");
            page.updateAccountingEntry(entry.id, "accountTitle", account?.accountName ?? "");
          }}
        />
      );
    case "debit":
    case "credit":
      return (
        <LineAmountInput
          allowNegative={false}
          disabled={isReadonly || isGeneratedTaxEntry || Number(entry[columnId === "debit" ? "credit" : "debit"] || 0) > 0}
          error={entryErrors[columnId]}
          value={entry[columnId]}
          onChange={(value) => page.updateAccountingEntry(entry.id, columnId, value)}
        />
      );
    case "partyCode":
      return <LineInput value={entry.partyCode} onChange={() => undefined} readOnly />;
    case "partyName":
      return (
        <PartyDropdown
          canAddPartyName={canAddPartyName}
          isReadonly={isReadonly || isGeneratedTaxEntry}
          options={partyOptions}
          partyCode={entry.partyCode}
          partyName={entry.partyName}
          onAddPartyName={() => onAddPartyName(entry.id)}
          onSelect={(partyCode, partyName) => {
            page.updateAccountingEntry(entry.id, "partyCode", partyCode);
            page.updateAccountingEntry(entry.id, "partyName", partyName);
            applyAccountingEntryPartyTaxDefaults(page, entry.id, findPartyRecordByCode(partyRecords, partyCode), taxCodes);
          }}
        />
      );
    case "particulars":
      return (
        <ParticularsCell
          isReadonly={isReadonly || isGeneratedTaxEntry}
          value={entry.particulars}
          onOpen={onOpenParticulars}
          onUpdate={(value) => page.updateAccountingEntry(entry.id, "particulars", value)}
        />
      );
    case "responsibilityCenter":
      return (
        <ResponsibilityCenterDropdown
          isReadonly={isReadonly || isGeneratedTaxEntry}
          options={responsibilityCenterOptions}
          value={entry.responsibilityCenter}
          onChange={(value) => page.updateAccountingEntry(entry.id, "responsibilityCenter", value)}
        />
      );
    case "vatType":
      if (entry.vatType && !vatOptions.some((option) => option.value === entry.vatType)) {
        return (
          <LineInput
            disabled={isReadonly}
            readOnly={isGeneratedTaxEntry}
            value={entry.vatType}
            onChange={(value) => page.updateAccountingEntry(entry.id, "vatType", value)}
          />
        );
      }

      return (
        <AppAdvancedDropdown
          value={entry.vatType}
          readOnly={isReadonly || isGeneratedTaxEntry}
          isClearable
          options={vatOptions}
          placeholder="Select VAT"
          searchPlaceholder="Search VAT rate or description"
          className={entryDropdownClassName()}
          onChange={(value) => page.updateAccountingEntry(entry.id, "vatType", String(value))}
        />
      );
    case "atcCode":
      return (
        <AppAdvancedDropdown
          value={entry.atcCode}
          readOnly={isReadonly || isGeneratedTaxEntry}
          isClearable
          options={ewtOptions}
          placeholder="Select EWT"
          searchPlaceholder="Search EWT code, rate, or description"
          className={entryDropdownClassName(entryErrors.atcCode)}
          ariaInvalid={Boolean(entryErrors.atcCode)}
          onChange={(value) => page.updateAccountingEntry(entry.id, "atcCode", String(value))}
        />
      );
    default:
      return (
        <LineInput
          disabled={isReadonly || isGeneratedTaxEntry}
          error={entryErrors[columnId as keyof typeof entryErrors]}
          value={String(entry[columnId] ?? "")}
          onChange={(value) => page.updateAccountingEntry(entry.id, columnId as AccountsPayableVoucherAccountingEntryField, value)}
        />
      );
  }
}
