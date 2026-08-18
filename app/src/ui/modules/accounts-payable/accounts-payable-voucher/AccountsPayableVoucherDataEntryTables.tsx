"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AccountsPayableVoucherAccountingColumnIds,
  AccountsPayableVoucherAccountingDefaultVisibleColumnIds,
  AccountsPayableVoucherAccountingColumnLabels,
  AccountsPayableVoucherAccountingColumnWidths,
  AccountsPayableVoucherAccountingProtectedColumnIds,
  AccountsPayableVoucherPurchaseTransactionType,
  AccountsPayableVoucherExpenseDefaultVisibleColumnIds,
  AccountsPayableVoucherExpenseColumnIds,
  AccountsPayableVoucherExpenseColumnLabels,
  AccountsPayableVoucherExpenseColumnWidths,
  AccountsPayableVoucherExpenseProtectedColumnIds,
} from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import {
  calculateAccountingColumnFitWidth,
  calculateExpenseColumnFitWidth,
  applyAccountingEntryPartyTaxDefaults,
  applyExpenseLinePartyTaxDefaults,
  createPartyOptions,
  createResponsibilityCenterOptions,
  entryDropdownClassName,
  findPartyRecordByCode,
  getExpenseColumnTotal,
  ExpenseDetailValue,
  isAccountingColumnId,
  isExpenseColumnId,
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
import type { useAccountsPayableVoucherFormPage } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucherFormPage";
import {
  useAccountsPayableVoucherPartyOptions,
  useAccountsPayableVoucherExpenseTypeOptions,
  useAccountsPayableVoucherPostingAccountOptions,
  useAccountsPayableVoucherResponsibilityCenterOptions,
} from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
import { useTaxes } from "@/app/src/hooks/shared/tax/useTaxOptions";
import type {
  AccountsPayableVoucherAccountingEntry,
  AccountsPayableVoucherAccountingColumnId,
  AccountsPayableVoucherAccountingEntryField,
  AccountsPayableVoucherExpenseColumnId,
  AccountsPayableVoucherExpenseLine,
  AccountsPayableVoucherExpenseLineField,
  AccountsPayableVoucherLookupAccount,
  AccountsPayableVoucherLookupParty,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import {
  createEwtOptions,
  createVatOptions,
  getEwtPercentFromCode,
  getVatPercentFromRate,
  getVatRateFromCode,
} from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type AccountsPayableVoucherDataEntryTablesProps = {
  canAddPartyName: boolean;
  onAddPartyName: (target: AccountsPayableVoucherPartyAddTarget) => void;
  page: ReturnType<typeof useAccountsPayableVoucherFormPage>;
};

export type AccountsPayableVoucherPartyAddTarget =
  | { kind: "expense"; id: string }
  | { kind: "accounting"; id: string };

type AccountsPayableVoucherDataEntryPanelProps = AccountsPayableVoucherDataEntryTablesProps & {
  title: ReactNode;
};

type AccountsPayableVoucherEntryView = "expense" | "accounting";

const PurchaseTaxCodeQuery = {
  transactionType: AccountsPayableVoucherPurchaseTransactionType,
} as const;

export function AccountsPayableVoucherDataEntryTables({
  canAddPartyName,
  onAddPartyName,
  page,
}: AccountsPayableVoucherDataEntryTablesProps) {
  const [entryView, setEntryView] = useState<AccountsPayableVoucherEntryView>("expense");
  const title = <EntryViewTabs entryView={entryView} onEntryViewChange={setEntryView} />;

  return entryView === "expense" ? (
    <AccountsPayableVoucherExpenseTable
      canAddPartyName={canAddPartyName}
      onAddPartyName={onAddPartyName}
      page={page}
      title={title}
    />
  ) : (
    <AccountsPayableVoucherAccountingTable
      canAddPartyName={canAddPartyName}
      onAddPartyName={onAddPartyName}
      page={page}
      title={title}
    />
  );
}

function EntryViewTabs({
  entryView,
  onEntryViewChange,
}: {
  entryView: AccountsPayableVoucherEntryView;
  onEntryViewChange: (entryView: AccountsPayableVoucherEntryView) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Entry view"
      className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {(
        [
          ["expense", "Payable Details"],
          ["accounting", "Accounting Entries"],
        ] as const
      ).map(([view, label]) => {
        const isActive = entryView === view;

        return (
          <button
            key={view}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onEntryViewChange(view)}
            className={joinClasses(
              "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
              isActive
                ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function AccountsPayableVoucherExpenseTable({
  canAddPartyName,
  onAddPartyName,
  page,
  title,
}: AccountsPayableVoucherDataEntryPanelProps) {
  const isReadonly = page.isExpenseDetailsReadonly;
  const [particularsEditorLineId, setParticularsEditorLineId] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<AccountsPayableVoucherExpenseColumnId[]>([
    ...AccountsPayableVoucherExpenseColumnIds,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<AccountsPayableVoucherExpenseColumnId[]>(
    [...AccountsPayableVoucherExpenseDefaultVisibleColumnIds],
  );
  const [columnLabels, setColumnLabels] = useState<
    Record<AccountsPayableVoucherExpenseColumnId, string>
  >({ ...AccountsPayableVoucherExpenseColumnLabels });
  const [columnWidths, setColumnWidths] = useState<
    Record<AccountsPayableVoucherExpenseColumnId, number>
  >({ ...AccountsPayableVoucherExpenseColumnWidths });
  const partyOptionsQuery = useAccountsPayableVoucherPartyOptions();
  const expenseTypeOptionsQuery = useAccountsPayableVoucherExpenseTypeOptions();
  const responsibilityCenterOptionsQuery = useAccountsPayableVoucherResponsibilityCenterOptions();
  const partyRecords = useMemo(() => partyOptionsQuery.data ?? [], [partyOptionsQuery.data]);
  const responsibilityCenters = useMemo(
    () => responsibilityCenterOptionsQuery.data ?? [],
    [responsibilityCenterOptionsQuery.data],
  );
  const expenseTypeAccounts = useMemo(
    () =>
      mergeLookupAccountOptions(
        expenseTypeOptionsQuery.data ?? [],
        page.values.expenseLines.map(createExpenseLineLookupAccount),
      ),
    [expenseTypeOptionsQuery.data, page.values.expenseLines],
  );
  const expenseTypeEmptyMessage = getLookupAccountEmptyMessage(
    expenseTypeOptionsQuery,
    "No default-account expense types found.",
  );
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
    [
      page.values.accountingEntries,
      page.values.expenseLines,
      page.values.partyCode,
      page.values.partyName,
      partyRecords,
    ],
  );
  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(
    () => createResponsibilityCenterOptions(responsibilityCenters, page.values.expenseLines),
    [page.values.expenseLines, responsibilityCenters],
  );
  const visibleColumnOrder = columnOrder.filter((columnId) => visibleColumnIds.includes(columnId));
  const particularsEditorLine =
    page.values.expenseLines.find((line) => line.id === particularsEditorLineId) ?? null;
  const columns: ModuleDataEntryColumn<AccountsPayableVoucherExpenseLine>[] =
    visibleColumnOrder.map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !AccountsPayableVoucherExpenseProtectedColumnIds.has(columnId),
      renderCell: (line) =>
        renderExpenseCell(
          page,
          line,
          columnId,
          expenseTypeAccounts,
          expenseTypeEmptyMessage,
          partyOptions,
          partyRecords,
          responsibilityCenterOptions,
          vatOptions,
          ewtOptions,
          taxCodes,
          canAddPartyName,
          (lineId) => onAddPartyName({ kind: "expense", id: lineId }),
          () => setParticularsEditorLineId(line.id),
        ),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
    }));
  const columnOptions: ModuleDataEntryColumnOption[] = columnOrder.map((columnId) => ({
    id: columnId,
    isHideable: !AccountsPayableVoucherExpenseProtectedColumnIds.has(columnId),
    isVisible: visibleColumnIds.includes(columnId),
    label: columnLabels[columnId],
    width: columnWidths[columnId],
    widthMode: "fixed",
  }));

  function updateColumnHeader(columnId: string, header: string) {
    if (!isExpenseColumnId(columnId)) {
      return;
    }

    setColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (!isExpenseColumnId(columnId)) {
      return;
    }

    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitColumnWidth(columnId: string) {
    if (!isExpenseColumnId(columnId)) {
      return;
    }

    updateColumnWidth(
      columnId,
      calculateExpenseColumnFitWidth({
        columnId,
        columnLabels,
        lines: page.values.expenseLines,
      }),
    );
  }

  function moveColumn(fromColumnId: string, toColumnId: string) {
    if (!isExpenseColumnId(fromColumnId) || !isExpenseColumnId(toColumnId)) {
      return;
    }

    setColumnOrder((currentOrder) => moveColumnId(currentOrder, fromColumnId, toColumnId));
  }

  function resetColumns() {
    setColumnOrder([...AccountsPayableVoucherExpenseColumnIds]);
    setVisibleColumnIds([...AccountsPayableVoucherExpenseDefaultVisibleColumnIds]);
    setColumnLabels({ ...AccountsPayableVoucherExpenseColumnLabels });
    setColumnWidths({ ...AccountsPayableVoucherExpenseColumnWidths });
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isExpenseColumnId(columnId)) {
      return;
    }

    if (!isVisible && AccountsPayableVoucherExpenseProtectedColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(currentVisibleIds, columnOrder, columnId, isVisible),
    );
  }

  return (
    <>
      <ModuleDataEntry
        columns={columns}
        columnResetLabel="Default"
        columnOptions={columnOptions}
        description=""
        emptyRowLabel="entry"
        error={page.errors.expenseLines}
        isDraggable
        isReadonly={isReadonly}
        rows={page.values.expenseLines}
        summaryCells={{
          amount: formatAccountsPayableVoucherAmount(
            getExpenseColumnTotal(page.values.expenseLines, "amount"),
          ),
          ewtAmount: formatAccountsPayableVoucherAmount(
            getExpenseColumnTotal(page.values.expenseLines, "ewtAmount"),
          ),
          netAmount: formatAccountsPayableVoucherAmount(
            getExpenseColumnTotal(page.values.expenseLines, "netAmount"),
          ),
          totalAmountDue: formatAccountsPayableVoucherAmount(
            getExpenseColumnTotal(page.values.expenseLines, "totalAmountDue"),
          ),
          vatAmount: formatAccountsPayableVoucherAmount(
            getExpenseColumnTotal(page.values.expenseLines, "vatAmount"),
          ),
        }}
        summaryRowHeader="Totals"
        title={title}
        onAddRows={page.addExpenseLines}
        onAutoColumnWidth={fitColumnWidth}
        onClearRows={page.clearExpenseLines}
        onDuplicateRow={page.duplicateExpenseLine}
        onFitColumnWidth={fitColumnWidth}
        onInsertRow={page.insertExpenseLine}
        onMoveColumn={moveColumn}
        onMoveRow={page.moveExpenseLine}
        onRemoveRow={page.removeExpenseLine}
        onResetColumns={resetColumns}
        onToggleColumnVisibility={toggleColumnVisibility}
        onUpdateColumnHeader={updateColumnHeader}
        onUpdateColumnWidth={updateColumnWidth}
      />
      <ParticularsEditorDialog
        key={particularsEditorLine?.id ?? "closed"}
        isOpen={Boolean(particularsEditorLine)}
        isReadonly={isReadonly}
        subtitle={particularsEditorLine?.expenseType || "Expense detail"}
        textareaId="accounts-payable-voucher-expense-particulars-dialog-text"
        value={particularsEditorLine?.particulars ?? ""}
        onClose={() => setParticularsEditorLineId(null)}
        onSave={(value) => {
          if (!particularsEditorLine || isReadonly) {
            setParticularsEditorLineId(null);
            return;
          }

          page.updateExpenseLine(particularsEditorLine.id, "particulars", value);
          setParticularsEditorLineId(null);
        }}
      />
    </>
  );
}

function AccountsPayableVoucherAccountingTable({
  canAddPartyName,
  onAddPartyName,
  page,
  title,
}: AccountsPayableVoucherDataEntryPanelProps) {
  const [particularsEditorEntryId, setParticularsEditorEntryId] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<AccountsPayableVoucherAccountingColumnId[]>([
    ...AccountsPayableVoucherAccountingColumnIds,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<
    AccountsPayableVoucherAccountingColumnId[]
  >([...AccountsPayableVoucherAccountingDefaultVisibleColumnIds]);
  const [columnLabels, setColumnLabels] = useState<
    Record<AccountsPayableVoucherAccountingColumnId, string>
  >({ ...AccountsPayableVoucherAccountingColumnLabels });
  const [columnWidths, setColumnWidths] = useState<
    Record<AccountsPayableVoucherAccountingColumnId, number>
  >({ ...AccountsPayableVoucherAccountingColumnWidths });
  const isReadonly = page.isAccountingEntriesReadonly;
  const partyOptionsQuery = useAccountsPayableVoucherPartyOptions();
  const postingAccountOptionsQuery = useAccountsPayableVoucherPostingAccountOptions();
  const responsibilityCenterOptionsQuery = useAccountsPayableVoucherResponsibilityCenterOptions();
  const partyRecords = useMemo(() => partyOptionsQuery.data ?? [], [partyOptionsQuery.data]);
  const responsibilityCenters = useMemo(
    () => responsibilityCenterOptionsQuery.data ?? [],
    [responsibilityCenterOptionsQuery.data],
  );
  const postingAccounts = useMemo(
    () =>
      mergeLookupAccountOptions(
        postingAccountOptionsQuery.data ?? [],
        page.values.accountingEntries.map(createAccountingEntryLookupAccount),
      ),
    [page.values.accountingEntries, postingAccountOptionsQuery.data],
  );
  const postingAccountEmptyMessage = getLookupAccountEmptyMessage(
    postingAccountOptionsQuery,
    "No posting accounts found.",
  );
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
    [
      page.values.accountingEntries,
      page.values.expenseLines,
      page.values.partyCode,
      page.values.partyName,
      partyRecords,
    ],
  );
  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      createResponsibilityCenterOptions(responsibilityCenters, [
        ...page.values.expenseLines,
        ...page.values.accountingEntries,
      ]),
    [page.values.accountingEntries, page.values.expenseLines, responsibilityCenters],
  );
  const visibleColumnOrder = columnOrder.filter((columnId) => visibleColumnIds.includes(columnId));
  const particularsEditorEntry =
    page.values.accountingEntries.find((entry) => entry.id === particularsEditorEntryId) ?? null;
  const columns: ModuleDataEntryColumn<AccountsPayableVoucherAccountingEntry>[] =
    visibleColumnOrder.map((columnId) => ({
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

    setVisibleColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(currentVisibleIds, columnOrder, columnId, isVisible),
    );
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
          <span
            className={joinClasses(
              "text-sm font-semibold",
              page.accountingTotals.isBalanced ? "text-emerald-700" : "text-coralpink",
            )}
          >
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

function mergeLookupAccountOptions(
  ...groups: Array<Array<AccountsPayableVoucherLookupAccount | null | undefined>>
) {
  const mergedAccounts: AccountsPayableVoucherLookupAccount[] = [];
  const seenKeys = new Set<string>();

  groups.forEach((accounts) => {
    accounts.forEach((account) => {
      if (!account) {
        return;
      }

      const keys = getLookupAccountKeys(account);

      if (keys.some((key) => seenKeys.has(key))) {
        return;
      }

      mergedAccounts.push(account);
      keys.forEach((key) => seenKeys.add(key));
    });
  });

  return mergedAccounts;
}

function getLookupAccountKeys(account: AccountsPayableVoucherLookupAccount) {
  return [account.id, account.accountNumber, account.accountName]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function createExpenseLineLookupAccount(
  line: AccountsPayableVoucherExpenseLine,
): AccountsPayableVoucherLookupAccount | null {
  return createFallbackLookupAccount({
    accountId: line.expenseAccountId,
    accountName: line.expenseType,
    accountNumber: line.expenseAccountCode,
    accountType: "Expenses",
    normalBalance: "Debit",
    statementGroup: "Income Statement",
    statementSection: "Expenses",
  });
}

function createAccountingEntryLookupAccount(
  entry: AccountsPayableVoucherAccountingEntry,
): AccountsPayableVoucherLookupAccount | null {
  return createFallbackLookupAccount({
    accountId: entry.accountId,
    accountName: entry.accountTitle,
    accountNumber: entry.accountCode,
    accountType: "",
    normalBalance: Number(entry.credit) > 0 ? "Credit" : "Debit",
    statementGroup: "",
    statementSection: "",
  });
}

function createFallbackLookupAccount({
  accountId,
  accountName,
  accountNumber,
  accountType,
  normalBalance,
  statementGroup,
  statementSection,
}: {
  accountId?: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  normalBalance: "Debit" | "Credit";
  statementGroup: string;
  statementSection: string;
}): AccountsPayableVoucherLookupAccount | null {
  const normalizedAccountId = accountId?.trim() ?? "";
  const normalizedAccountName = accountName.trim();
  const normalizedAccountNumber = accountNumber.trim();

  if (!normalizedAccountName && !normalizedAccountNumber) {
    return null;
  }

  const fallbackId = `fallback:${normalizedAccountNumber || normalizedAccountName}`;
  const normalizedStatementSection = statementSection.trim() || accountType.trim();

  return {
    id: normalizedAccountId || fallbackId,
    accountCategory: normalizedStatementSection || "Detail",
    accountName: normalizedAccountName || normalizedAccountNumber,
    accountNumber: normalizedAccountNumber,
    accountType,
    description: normalizedAccountName || normalizedAccountNumber,
    normalBalance,
    statementGroup,
    statementSection: normalizedStatementSection,
    status: "Active",
  };
}

function getSelectableLookupAccountId(account: AccountsPayableVoucherLookupAccount | null) {
  const accountId = account?.id.trim() ?? "";

  return accountId && !accountId.startsWith("fallback:") ? accountId : "";
}

function getLookupAccountEmptyMessage(
  query: { isError: boolean; isFetching: boolean; isLoading: boolean },
  emptyMessage: string,
) {
  if (query.isLoading || query.isFetching) {
    return "Loading accounts...";
  }

  if (query.isError) {
    return "Could not load accounts.";
  }

  return emptyMessage;
}

function renderExpenseCell(
  page: ReturnType<typeof useAccountsPayableVoucherFormPage>,
  line: AccountsPayableVoucherExpenseLine,
  columnId: AccountsPayableVoucherExpenseColumnId,
  expenseTypeAccounts: AccountsPayableVoucherLookupAccount[],
  expenseTypeEmptyMessage: string,
  partyOptions: AppAdvancedDropdownOption[],
  partyRecords: AccountsPayableVoucherLookupParty[],
  responsibilityCenterOptions: AppAdvancedDropdownOption[],
  vatOptions: AppAdvancedDropdownOption[],
  ewtOptions: AppAdvancedDropdownOption[],
  taxCodes: Parameters<typeof createVatOptions>[0],
  canAddPartyName: boolean,
  onAddPartyName: (lineId: string) => void,
  onOpenParticulars: () => void,
) {
  const lineErrors = page.errors.expenseLineErrors?.[line.id] ?? {};
  const isReadonly = page.isExpenseDetailsReadonly;

  switch (columnId) {
    case "expenseType":
      return (
        <ChartAccountDropdown
          accounts={expenseTypeAccounts}
          emptyMessage={expenseTypeEmptyMessage}
          value={line.expenseType}
          valueField="accountName"
          readOnly={isReadonly}
          isClearable
          className={entryDropdownClassName(lineErrors.expenseType)}
          ariaInvalid={Boolean(lineErrors.expenseType)}
          placeholder="Select payable type"
          searchPlaceholder="Search payable type"
          onChange={() => undefined}
          onSelectAccount={(account) => {
            page.updateExpenseLine(
              line.id,
              "expenseAccountId",
              getSelectableLookupAccountId(account),
            );
            page.updateExpenseLine(line.id, "expenseAccountCode", account?.accountNumber ?? "");
            page.updateExpenseLine(line.id, "expenseType", account?.accountName ?? "");
          }}
        />
      );
    case "amount":
      return (
        <LineAmountInput
          disabled={isReadonly}
          error={lineErrors.amount}
          value={line.amount}
          onChange={(value) => page.updateExpenseLine(line.id, "amount", value)}
        />
      );
    case "vatAmount":
    case "netAmount":
    case "ewtAmount":
    case "totalAmountDue":
      return <ExpenseDetailValue value={line[columnId]} />;
    case "partyCode":
      return <LineInput value={line.partyCode} onChange={() => undefined} readOnly />;
    case "vatPercent":
    case "ewtPercent":
      return <ExpenseDetailValue value={line[columnId]} suffix="%" />;
    case "vat":
      return (
        <AppAdvancedDropdown
          value={line.vat}
          readOnly={isReadonly}
          options={vatOptions}
          placeholder="Select VAT"
          searchPlaceholder="Search VAT rate or description"
          className={entryDropdownClassName()}
          onChange={(value) => {
            const vat = String(value);
            const taxRate = getVatRateFromCode(vat, taxCodes ?? []);

            page.updateExpenseLine(line.id, "vat", vat);
            page.updateExpenseLine(line.id, "vatPercent", getVatPercentFromRate(taxRate));
          }}
        />
      );
    case "ewt":
      return (
        <AppAdvancedDropdown
          value={line.ewt}
          readOnly={isReadonly}
          options={ewtOptions}
          placeholder="Select EWT"
          searchPlaceholder="Search EWT code, rate, or description"
          className={entryDropdownClassName()}
          onChange={(value) => {
            const ewt = String(value);

            page.updateExpenseLine(line.id, "ewt", ewt);
            page.updateExpenseLine(
              line.id,
              "ewtPercent",
              getEwtPercentFromCode(ewt, taxCodes ?? []),
            );
          }}
        />
      );
    case "partyName":
      return (
        <PartyDropdown
          canAddPartyName={canAddPartyName}
          isReadonly={isReadonly}
          options={partyOptions}
          partyCode={line.partyCode}
          partyName={line.partyName}
          onAddPartyName={() => onAddPartyName(line.id)}
          onSelect={(partyCode, partyName) => {
            page.updateExpenseLine(line.id, "partyCode", partyCode);
            page.updateExpenseLine(line.id, "partyName", partyName);
            applyExpenseLinePartyTaxDefaults(
              page,
              line.id,
              findPartyRecordByCode(partyRecords, partyCode),
              taxCodes,
            );
          }}
        />
      );
    case "particulars":
      return (
        <ParticularsCell
          error={lineErrors.particulars}
          isReadonly={isReadonly}
          value={line.particulars}
          onOpen={onOpenParticulars}
          onUpdate={(value) => page.updateExpenseLine(line.id, "particulars", value)}
        />
      );
    case "responsibilityCenter":
      return (
        <ResponsibilityCenterDropdown
          isReadonly={isReadonly}
          options={responsibilityCenterOptions}
          value={line.responsibilityCenter}
          onChange={(value) => page.updateExpenseLine(line.id, "responsibilityCenter", value)}
        />
      );
    default:
      return (
        <LineInput
          disabled={isReadonly}
          error={lineErrors[columnId as keyof typeof lineErrors]}
          value={String(line[columnId] ?? "")}
          onChange={(value) =>
            page.updateExpenseLine(
              line.id,
              columnId as AccountsPayableVoucherExpenseLineField,
              value,
            )
          }
        />
      );
  }
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
      return (
        <LineInput
          error={entryErrors.accountCode}
          value={entry.accountCode}
          onChange={() => undefined}
          readOnly
        />
      );
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
            page.updateAccountingEntry(
              entry.id,
              "accountId",
              getSelectableLookupAccountId(account),
            );
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
          disabled={
            isReadonly ||
            isGeneratedTaxEntry ||
            Number(entry[columnId === "debit" ? "credit" : "debit"] || 0) > 0
          }
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
            applyAccountingEntryPartyTaxDefaults(
              page,
              entry.id,
              findPartyRecordByCode(partyRecords, partyCode),
              taxCodes,
            );
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
          onChange={(value) =>
            page.updateAccountingEntry(
              entry.id,
              columnId as AccountsPayableVoucherAccountingEntryField,
              value,
            )
          }
        />
      );
  }
}
