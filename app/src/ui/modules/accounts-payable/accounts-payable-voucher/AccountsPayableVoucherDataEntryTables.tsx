"use client";

import { useMemo, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  AccountsPayableVoucherAccountingColumnIds,
  AccountsPayableVoucherAccountingDefaultVisibleColumnIds,
  AccountsPayableVoucherAccountingColumnLabels,
  AccountsPayableVoucherAccountingColumnWidths,
  AccountsPayableVoucherAccountingProtectedColumnIds,
  AccountsPayableVoucherExpenseDefaultVisibleColumnIds,
  AccountsPayableVoucherExpenseColumnIds,
  AccountsPayableVoucherExpenseColumnLabels,
  AccountsPayableVoucherExpenseColumnWidths,
  AccountsPayableVoucherExpenseProtectedColumnIds,
  type AccountsPayableVoucherAccountingColumnId,
  type AccountsPayableVoucherExpenseColumnId,
} from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import { formatAccountsPayableVoucherAmount } from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { getModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { useAccountsPayableVoucherFormPage } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucherFormPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { useTaxes } from "@/app/src/hooks/shared/tax/useTaxOptions";
import type {
  AccountsPayableVoucherAccountingEntry,
  AccountsPayableVoucherAccountingEntryField,
  AccountsPayableVoucherExpenseLine,
  AccountsPayableVoucherExpenseLineField,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
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
import { ModuleTextareaDialog } from "@/app/src/ui/shared/module/ModuleTextareaDialog";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  MoneyNumberField,
  formatMoneyNumberInput,
  parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";

type AccountsPayableVoucherDataEntryTablesProps = {
  page: ReturnType<typeof useAccountsPayableVoucherFormPage>;
};

type AccountsPayableVoucherDataEntryPanelProps =
  AccountsPayableVoucherDataEntryTablesProps & {
    title: ReactNode;
  };

type AccountsPayableVoucherEntryView = "expense" | "accounting";

type PartyBearingRow = {
  partyCode: string;
  partyName: string;
};

const ManualInputVatAccountingEntryIdPrefix = "apv-entry-manual-input-vat-";
const ManualEwtAccountingEntryIdPrefix = "apv-entry-manual-ewt-";
const ManualDefaultPayableAccountingEntryId =
  "apv-entry-manual-default-payable";
const PurchaseTaxCodeQuery = {
  transactionType: "Purchases",
} as const;

export function AccountsPayableVoucherDataEntryTables({
  page,
}: AccountsPayableVoucherDataEntryTablesProps) {
  const [entryView, setEntryView] =
    useState<AccountsPayableVoucherEntryView>("expense");
  const title = (
    <EntryViewTabs entryView={entryView} onEntryViewChange={setEntryView} />
  );

  return entryView === "expense" ? (
    <AccountsPayableVoucherExpenseTable page={page} title={title} />
  ) : (
    <AccountsPayableVoucherAccountingTable page={page} title={title} />
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
      {([
        ["expense", "Payable Details"],
        ["accounting", "Accounting Entries"],
      ] as const).map(([view, label]) => {
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
  page,
  title,
}: AccountsPayableVoucherDataEntryPanelProps) {
  const isReadonly = page.isExpenseDetailsReadonly;
  const [particularsEditorLineId, setParticularsEditorLineId] = useState<
    string | null
  >(null);
  const [columnOrder, setColumnOrder] = useState<
    AccountsPayableVoucherExpenseColumnId[]
  >([...AccountsPayableVoucherExpenseColumnIds]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<
    AccountsPayableVoucherExpenseColumnId[]
  >([...AccountsPayableVoucherExpenseDefaultVisibleColumnIds]);
  const [columnLabels, setColumnLabels] = useState<
    Record<AccountsPayableVoucherExpenseColumnId, string>
  >({ ...AccountsPayableVoucherExpenseColumnLabels });
  const [columnWidths, setColumnWidths] = useState<
    Record<AccountsPayableVoucherExpenseColumnId, number>
  >({ ...AccountsPayableVoucherExpenseColumnWidths });
  const partyRecords = usePartyManagementStore((state) => state.records);
  const responsibilityCenters = useResponsibilityCenterStore(
    (state) => state.centers,
  );
  const chartAccounts = useMemo(() => getModuleChartAccounts(), []);
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
      createResponsibilityCenterOptions(
        responsibilityCenters,
        page.values.expenseLines,
      ),
    [page.values.expenseLines, responsibilityCenters],
  );
  const visibleColumnOrder = columnOrder.filter((columnId) =>
    visibleColumnIds.includes(columnId),
  );
  const particularsEditorLine =
    page.values.expenseLines.find((line) => line.id === particularsEditorLineId) ??
    null;
  const columns: ModuleDataEntryColumn<AccountsPayableVoucherExpenseLine>[] =
    visibleColumnOrder.map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !AccountsPayableVoucherExpenseProtectedColumnIds.has(
        columnId,
      ),
      renderCell: (line) =>
        renderExpenseCell(
          page,
          line,
          columnId,
          chartAccounts,
          partyOptions,
          partyRecords,
          responsibilityCenterOptions,
          vatOptions,
          ewtOptions,
          taxCodes,
          () => setParticularsEditorLineId(line.id),
        ),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
    }));
  const columnOptions: ModuleDataEntryColumnOption[] = columnOrder.map(
    (columnId) => ({
      id: columnId,
      isHideable: !AccountsPayableVoucherExpenseProtectedColumnIds.has(
        columnId,
      ),
      isVisible: visibleColumnIds.includes(columnId),
      label: columnLabels[columnId],
      width: columnWidths[columnId],
      widthMode: "fixed",
    }),
  );

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

    setColumnOrder((currentOrder) =>
      moveColumnId(currentOrder, fromColumnId, toColumnId),
    );
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isExpenseColumnId(columnId)) {
      return;
    }

    if (
      !isVisible &&
      AccountsPayableVoucherExpenseProtectedColumnIds.has(columnId)
    ) {
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
        columnOptions={columnOptions}
        description=""
        emptyRowLabel="entry"
        error={page.errors.expenseLines}
        footerDetails={
          <span className="text-sm font-semibold text-darknavy">
            Total Amount Due:{" "}
            {formatAccountsPayableVoucherAmount(page.expenseTotal)}
          </span>
        }
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
  page,
  title,
}: AccountsPayableVoucherDataEntryPanelProps) {
  const [particularsEditorEntryId, setParticularsEditorEntryId] = useState<
    string | null
  >(null);
  const [columnOrder, setColumnOrder] = useState<
    AccountsPayableVoucherAccountingColumnId[]
  >([...AccountsPayableVoucherAccountingColumnIds]);
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
  const partyRecords = usePartyManagementStore((state) => state.records);
  const responsibilityCenters = useResponsibilityCenterStore(
    (state) => state.centers,
  );
  const chartAccounts = useMemo(() => getModuleChartAccounts(), []);
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
  const visibleColumnOrder = columnOrder.filter((columnId) =>
    visibleColumnIds.includes(columnId),
  );
  const particularsEditorEntry =
    page.values.accountingEntries.find(
      (entry) => entry.id === particularsEditorEntryId,
    ) ?? null;
  const columns: ModuleDataEntryColumn<AccountsPayableVoucherAccountingEntry>[] =
    visibleColumnOrder.map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !AccountsPayableVoucherAccountingProtectedColumnIds.has(
        columnId,
      ),
      renderCell: (entry) =>
        renderAccountingCell(
          page,
          entry,
          columnId,
          chartAccounts,
          partyOptions,
          partyRecords,
          responsibilityCenterOptions,
          vatOptions,
          ewtOptions,
          taxCodes,
          () => setParticularsEditorEntryId(entry.id),
        ),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
    }));
  const columnOptions: ModuleDataEntryColumnOption[] = columnOrder.map(
    (columnId) => ({
      id: columnId,
      isHideable: !AccountsPayableVoucherAccountingProtectedColumnIds.has(
        columnId,
      ),
      isVisible: visibleColumnIds.includes(columnId),
      label: columnLabels[columnId],
      width: columnWidths[columnId],
      widthMode: "fixed",
    }),
  );

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
    if (
      !isAccountingColumnId(fromColumnId) ||
      !isAccountingColumnId(toColumnId)
    ) {
      return;
    }

    setColumnOrder((currentOrder) =>
      moveColumnId(currentOrder, fromColumnId, toColumnId),
    );
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isAccountingColumnId(columnId)) {
      return;
    }

    if (
      !isVisible &&
      AccountsPayableVoucherAccountingProtectedColumnIds.has(columnId)
    ) {
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
        columnOptions={columnOptions}
        description=""
        emptyRowLabel="entry"
        error={page.errors.accountingEntries ?? page.errors.balance}
        canConfigureColumnsWhenReadonly
        footerDetails={
          <span
            className={joinClasses(
              "text-sm font-semibold",
              page.accountingTotals.isBalanced
                ? "text-emerald-700"
                : "text-coralpink",
            )}
          >
            Variance:{" "}
            {formatAccountsPayableVoucherAmount(
              Math.abs(page.accountingTotals.variance),
            )}
          </span>
        }
        isDraggable
        isReadonly={isReadonly}
        rows={page.values.accountingEntries}
        summaryCells={{
          credit: formatAccountsPayableVoucherAmount(
            page.accountingTotals.totalCredit,
          ),
          debit: formatAccountsPayableVoucherAmount(
            page.accountingTotals.totalDebit,
          ),
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

function renderExpenseCell(
  page: ReturnType<typeof useAccountsPayableVoucherFormPage>,
  line: AccountsPayableVoucherExpenseLine,
  columnId: AccountsPayableVoucherExpenseColumnId,
  chartAccounts: ReturnType<typeof getModuleChartAccounts>,
  partyOptions: AppAdvancedDropdownOption[],
  partyRecords: PartyInformationRecord[],
  responsibilityCenterOptions: AppAdvancedDropdownOption[],
  vatOptions: AppAdvancedDropdownOption[],
  ewtOptions: AppAdvancedDropdownOption[],
  taxCodes: Parameters<typeof createVatOptions>[0],
  onOpenParticulars: () => void,
) {
  const lineErrors = page.errors.expenseLineErrors?.[line.id] ?? {};
  const isReadonly = page.isExpenseDetailsReadonly;

  switch (columnId) {
    case "expenseType":
      return (
        <ChartAccountDropdown
          accounts={chartAccounts}
          value={line.expenseType}
          valueField="accountName"
          readOnly={isReadonly}
          isClearable
          className={entryDropdownClassName(lineErrors.expenseType)}
          ariaInvalid={Boolean(lineErrors.expenseType)}
          placeholder="Enter payable type"
          searchPlaceholder="Search payable type"
          onChange={() => undefined}
          onSelectAccount={(account) => {
            page.updateExpenseLine(
              line.id,
              "expenseAccountCode",
              account?.accountNumber ?? "",
            );
            page.updateExpenseLine(
              line.id,
              "expenseType",
              account?.accountName ?? "",
            );
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
      return (
        <LineInput
          value={line.partyCode}
          onChange={() => undefined}
          readOnly
        />
      );
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
            page.updateExpenseLine(
              line.id,
              "vatPercent",
              getVatPercentFromRate(taxRate),
            );
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
          isReadonly={isReadonly}
          options={partyOptions}
          partyCode={line.partyCode}
          partyName={line.partyName}
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
          onUpdate={(value) =>
            page.updateExpenseLine(line.id, "particulars", value)
          }
        />
      );
    case "responsibilityCenter":
      return (
        <ResponsibilityCenterDropdown
          isReadonly={isReadonly}
          options={responsibilityCenterOptions}
          value={line.responsibilityCenter}
          onChange={(value) =>
            page.updateExpenseLine(line.id, "responsibilityCenter", value)
          }
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
  chartAccounts: ReturnType<typeof getModuleChartAccounts>,
  partyOptions: AppAdvancedDropdownOption[],
  partyRecords: PartyInformationRecord[],
  responsibilityCenterOptions: AppAdvancedDropdownOption[],
  vatOptions: AppAdvancedDropdownOption[],
  ewtOptions: AppAdvancedDropdownOption[],
  taxCodes: Parameters<typeof createVatOptions>[0],
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
          accounts={chartAccounts}
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
              "accountCode",
              account?.accountNumber ?? "",
            );
            page.updateAccountingEntry(
              entry.id,
              "accountTitle",
              account?.accountName ?? "",
            );
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
      return (
        <LineInput
          value={entry.partyCode}
          onChange={() => undefined}
          readOnly
        />
      );
    case "partyName":
      return (
        <PartyDropdown
          isReadonly={isReadonly || isGeneratedTaxEntry}
          options={partyOptions}
          partyCode={entry.partyCode}
          partyName={entry.partyName}
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
          onUpdate={(value) =>
            page.updateAccountingEntry(entry.id, "particulars", value)
          }
        />
      );
    case "responsibilityCenter":
      return (
        <ResponsibilityCenterDropdown
          isReadonly={isReadonly || isGeneratedTaxEntry}
          options={responsibilityCenterOptions}
          value={entry.responsibilityCenter}
          onChange={(value) =>
            page.updateAccountingEntry(entry.id, "responsibilityCenter", value)
          }
        />
      );
    case "vatType":
      if (
        entry.vatType &&
        !vatOptions.some((option) => option.value === entry.vatType)
      ) {
        return (
          <LineInput
            disabled={isReadonly}
            readOnly={isGeneratedTaxEntry}
            value={entry.vatType}
            onChange={(value) =>
              page.updateAccountingEntry(entry.id, "vatType", value)
            }
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
          onChange={(value) =>
            page.updateAccountingEntry(entry.id, "vatType", String(value))
          }
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
          onChange={(value) =>
            page.updateAccountingEntry(entry.id, "atcCode", String(value))
          }
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

function isManualGeneratedTaxAccountingEntry(
  entry: AccountsPayableVoucherAccountingEntry,
) {
  return (
    entry.id.startsWith(ManualInputVatAccountingEntryIdPrefix) ||
    entry.id.startsWith(ManualEwtAccountingEntryIdPrefix) ||
    entry.id === ManualDefaultPayableAccountingEntryId
  );
}

function applyExpenseLinePartyTaxDefaults(
  page: ReturnType<typeof useAccountsPayableVoucherFormPage>,
  lineId: string,
  party: PartyInformationRecord | undefined,
  taxCodes: Parameters<typeof createVatOptions>[0],
) {
  if (!party) {
    return;
  }

  const defaults = getPartyPurchaseTaxDefaults(party, taxCodes);

  if (!party.defaultPurchaseInputVatTaxSourceKey || defaults.inputVatCode) {
    page.updateExpenseLine(lineId, "vat", defaults.inputVatCode);
    page.updateExpenseLine(lineId, "vatPercent", defaults.inputVatPercent);
  }

  if (!party.defaultPurchaseEwtTaxSourceKey || defaults.ewtCode) {
    page.updateExpenseLine(lineId, "ewt", defaults.ewtCode);
    page.updateExpenseLine(lineId, "ewtPercent", defaults.ewtPercent);
  }
}

function applyAccountingEntryPartyTaxDefaults(
  page: ReturnType<typeof useAccountsPayableVoucherFormPage>,
  entryId: string,
  party: PartyInformationRecord | undefined,
  taxCodes: Parameters<typeof createVatOptions>[0],
) {
  if (!party) {
    return;
  }

  const defaults = getPartyPurchaseTaxDefaults(party, taxCodes);

  if (!party.defaultPurchaseInputVatTaxSourceKey || defaults.inputVatCode) {
    page.updateAccountingEntry(entryId, "vatType", defaults.inputVatCode);
  }

  if (!party.defaultPurchaseEwtTaxSourceKey || defaults.ewtCode) {
    page.updateAccountingEntry(entryId, "atcCode", defaults.ewtCode);
  }
}

function getPartyPurchaseTaxDefaults(
  party: PartyInformationRecord,
  taxCodes: Parameters<typeof createVatOptions>[0],
) {
  const inputVatCode = getTaxCodeBySourceKey(
    taxCodes,
    party.defaultPurchaseInputVatTaxSourceKey,
    "INPUT VAT",
  );
  const ewtCode = getTaxCodeBySourceKey(
    taxCodes,
    party.defaultPurchaseEwtTaxSourceKey,
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
  taxCodes: Parameters<typeof createVatOptions>[0],
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

function findPartyRecordByCode(
  partyRecords: PartyInformationRecord[],
  partyCode: string,
) {
  return partyRecords.find((record) => record.partyCodeNo === partyCode);
}

function PartyDropdown({
  isReadonly,
  onSelect,
  options,
  partyCode,
  partyName,
}: {
  isReadonly: boolean;
  onSelect: (partyCode: string, partyName: string) => void;
  options: AppAdvancedDropdownOption[];
  partyCode: string;
  partyName: string;
}) {
  return (
    <AppAdvancedDropdown
      value={partyCode || getPartyFallbackValue(partyName)}
      readOnly={isReadonly}
      options={options}
      placeholder="Select Party Name"
      searchPlaceholder="Search Party Name"
      className={entryDropdownClassName()}
      onChange={(value) => {
        const selectedValue = String(value);
        const party = options.find((option) => option.value === selectedValue);
        const isFallbackValue = selectedValue.startsWith(
          PartyFallbackValuePrefix,
        );

        onSelect(
          isFallbackValue ? "" : party?.value ?? "",
          party?.name ?? (isFallbackValue ? selectedValue : ""),
        );
      }}
    />
  );
}

function ParticularsCell({
  error,
  isReadonly,
  onOpen,
  onUpdate,
  value,
}: {
  error?: string;
  isReadonly: boolean;
  onOpen: () => void;
  onUpdate: (value: string) => void;
  value: string;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.5rem]">
      <LineInput
        error={error}
        value={value}
        onChange={onUpdate}
        readOnly={isReadonly}
      />
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex h-10 items-center justify-center border-l border-darknavy/10 bg-white text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy focus:outline-none focus:ring-2 focus:ring-inset focus:ring-skyblue/35"
        aria-label="Open particulars"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function ResponsibilityCenterDropdown({
  isReadonly,
  onChange,
  options,
  value,
}: {
  isReadonly: boolean;
  onChange: (value: string) => void;
  options: AppAdvancedDropdownOption[];
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      value={value}
      readOnly={isReadonly}
      options={options}
      placeholder="Select responsibility center"
      searchPlaceholder="Search responsibility center"
      className={entryDropdownClassName()}
      onChange={(nextValue) => onChange(String(nextValue))}
    />
  );
}

function LineInput({
  disabled = false,
  error,
  onChange,
  readOnly = false,
  value,
}: {
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  value: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      title={error}
      className={entryCellControlClassName(
        error ? "ring-2 ring-inset ring-red-500/45" : "",
      )}
    />
  );
}

function LineAmountInput({
  allowNegative = true,
  disabled,
  error,
  onChange,
  value,
}: {
  allowNegative?: boolean;
  disabled: boolean;
  error?: string;
  onChange: (value: number) => void;
  value: number;
}) {
  const [draftValue, setDraftValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const displayValue = isEditing
    ? draftValue
    : value !== 0
      ? formatMoneyNumberInput(value.toFixed(2), true)
      : "";

  function handleValueChange(nextValue: string) {
    setDraftValue(nextValue);
    onChange(parseMoneyNumberInput(nextValue));
  }

  return (
    <MoneyNumberField
      allowNegative={allowNegative}
      value={displayValue}
      onValueChange={handleValueChange}
      onFocus={() => {
        setDraftValue(displayValue);
        setIsEditing(true);
      }}
      onBlur={() => {
        setDraftValue("");
        setIsEditing(false);
      }}
      disabled={disabled}
      title={error}
      className={entryCellControlClassName(
        joinClasses(
          "text-right tabular-nums",
          error ? "ring-2 ring-inset ring-red-500/45" : "",
        ),
      )}
    />
  );
}

function ExpenseDetailValue({
  suffix = "",
  value,
}: {
  suffix?: string;
  value: number;
}) {
  return (
    <div className="flex h-10 w-full items-center justify-end bg-offwhite/45 px-3 text-sm font-medium tabular-nums text-darknavy/70">
      {formatAccountsPayableVoucherAmount(value)}
      {suffix}
    </div>
  );
}

function ParticularsEditorDialog({
  isOpen,
  isReadonly,
  onClose,
  onSave,
  subtitle,
  textareaId,
  value,
}: {
  isOpen: boolean;
  isReadonly: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  subtitle: string;
  textareaId: string;
  value: string;
}) {
  return (
    <ModuleTextareaDialog
      isOpen={isOpen}
      isReadonly={isReadonly}
      title="Particulars"
      subtitle={subtitle}
      textareaId={textareaId}
      value={value}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

const EntryDropdownBaseClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function entryDropdownClassName(error?: string) {
  return joinClasses(
    EntryDropdownBaseClassName,
    error &&
      "[&_.app-advanced-dropdown-control]:ring-2 [&_.app-advanced-dropdown-control]:ring-inset [&_.app-advanced-dropdown-control]:ring-red-500/45",
  );
}

function entryCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

const PartyFallbackValuePrefix = "apv-party:";

function getPartyFallbackValue(partyName: string) {
  const normalizedPartyName = partyName.trim().toLowerCase();

  return normalizedPartyName ? `${PartyFallbackValuePrefix}${normalizedPartyName}` : "";
}

function createPartyOptions(
  partyRecords: PartyInformationRecord[],
  rows: PartyBearingRow[],
): AppAdvancedDropdownOption[] {
  const options = partyRecords.map((party) => ({
    description: party.partyTypes.join(", "),
    label: party.partyCodeNo,
    name: getPartyDisplayName(party),
    value: party.partyCodeNo,
  }));
  const optionNames = new Set(
    options.map((option) => option.name.toLowerCase()),
  );
  const optionValues = new Set(options.map((option) => option.value));
  const customOptions: AppAdvancedDropdownOption[] = [];

  rows.forEach((row) => {
    const partyName = row.partyName.trim();
    const value = row.partyCode || getPartyFallbackValue(partyName);

    if (
      !partyName ||
      optionNames.has(partyName.toLowerCase()) ||
      optionValues.has(value)
    ) {
      return;
    }

    optionValues.add(value);
    customOptions.push({
      description: "Copied entry party",
      label: row.partyCode,
      name: partyName,
      value,
    });
  });

  return [...options, ...customOptions];
}

function createResponsibilityCenterOptions(
  responsibilityCenters: ResponsibilityCenter[],
  rows: Array<{ responsibilityCenter: string }>,
): AppAdvancedDropdownOption[] {
  const options = responsibilityCenters
    .filter((center) => center.status === "Active")
    .map((center) => ({
      description: `${center.category} / ${center.financialType}`,
      label: center.code,
      name: center.name,
      value: center.name,
    }));
  const optionValues = new Set(options.map((option) => option.value));
  const customOptions: AppAdvancedDropdownOption[] = [];

  rows.forEach((row) => {
    const responsibilityCenter = row.responsibilityCenter.trim();

    if (!responsibilityCenter || optionValues.has(responsibilityCenter)) {
      return;
    }

    optionValues.add(responsibilityCenter);
    customOptions.push({
      description: "Copied responsibility center",
      label: responsibilityCenter,
      name: responsibilityCenter,
      value: responsibilityCenter,
    });
  });

  return [...options, ...customOptions];
}

function isExpenseColumnId(
  columnId: string,
): columnId is AccountsPayableVoucherExpenseColumnId {
  return AccountsPayableVoucherExpenseColumnIds.includes(
    columnId as AccountsPayableVoucherExpenseColumnId,
  );
}

function isAccountingColumnId(
  columnId: string,
): columnId is AccountsPayableVoucherAccountingColumnId {
  return AccountsPayableVoucherAccountingColumnIds.includes(
    columnId as AccountsPayableVoucherAccountingColumnId,
  );
}

function getExpenseExportCell(
  line: AccountsPayableVoucherExpenseLine,
  columnId: AccountsPayableVoucherExpenseColumnId,
) {
  if (isExpenseAmountColumn(columnId)) {
    return Number(line[columnId] || 0) > 0
      ? Number(line[columnId] || 0).toFixed(2)
      : "";
  }

  return String(line[columnId] ?? "");
}

function isExpenseAmountColumn(
  columnId: AccountsPayableVoucherExpenseColumnId,
) {
  return (
    columnId === "amount" ||
    columnId === "netAmount" ||
    columnId === "vatPercent" ||
    columnId === "vatAmount" ||
    columnId === "ewtPercent" ||
    columnId === "ewtAmount" ||
    columnId === "totalAmountDue"
  );
}

function getExpenseColumnTotal(
  lines: AccountsPayableVoucherExpenseLine[],
  columnId: "amount" | "ewtAmount" | "netAmount" | "totalAmountDue" | "vatAmount",
) {
  return lines.reduce((sum, line) => sum + Number(line[columnId] || 0), 0);
}

function getAccountingExportCell(
  entry: AccountsPayableVoucherAccountingEntry,
  columnId: AccountsPayableVoucherAccountingColumnId,
) {
  switch (columnId) {
    case "debit":
    case "credit":
      return entry[columnId] > 0 ? entry[columnId].toFixed(2) : "";
    default:
      return String(entry[columnId] ?? "");
  }
}

function calculateExpenseColumnFitWidth({
  columnId,
  columnLabels,
  lines,
}: {
  columnId: AccountsPayableVoucherExpenseColumnId;
  columnLabels: Record<AccountsPayableVoucherExpenseColumnId, string>;
  lines: AccountsPayableVoucherExpenseLine[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = lines.reduce(
    (currentWidth, line) =>
      Math.max(
        currentWidth,
        estimateTextWidth(String(getExpenseExportCell(line, columnId)), 24),
      ),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

function calculateAccountingColumnFitWidth({
  columnId,
  columnLabels,
  entries,
}: {
  columnId: AccountsPayableVoucherAccountingColumnId;
  columnLabels: Record<AccountsPayableVoucherAccountingColumnId, string>;
  entries: AccountsPayableVoucherAccountingEntry[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = entries.reduce(
    (currentWidth, entry) =>
      Math.max(
        currentWidth,
        estimateTextWidth(String(getAccountingExportCell(entry, columnId)), 24),
      ),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

function estimateTextWidth(value: string, padding: number) {
  return clampColumnWidth(value.trim().length * 7.5 + padding);
}

function moveColumnId<TColumnId extends string>(
  columnOrder: TColumnId[],
  fromColumnId: TColumnId,
  toColumnId: TColumnId,
) {
  const fromIndex = columnOrder.indexOf(fromColumnId);
  const toIndex = columnOrder.indexOf(toColumnId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return columnOrder;
  }

  const nextOrder = [...columnOrder];
  const [movedColumn] = nextOrder.splice(fromIndex, 1);

  nextOrder.splice(toIndex, 0, movedColumn);
  return nextOrder;
}

function updateVisibleColumnIds<TColumnId extends string>(
  visibleColumnIds: TColumnId[],
  columnOrder: TColumnId[],
  columnId: TColumnId,
  isVisible: boolean,
) {
  if (isVisible) {
    const nextVisibleIds = new Set([...visibleColumnIds, columnId]);

    return columnOrder.filter((currentColumnId) =>
      nextVisibleIds.has(currentColumnId),
    );
  }

  if (visibleColumnIds.length <= 1) {
    return visibleColumnIds;
  }

  return visibleColumnIds.filter((currentColumnId) => currentColumnId !== columnId);
}
