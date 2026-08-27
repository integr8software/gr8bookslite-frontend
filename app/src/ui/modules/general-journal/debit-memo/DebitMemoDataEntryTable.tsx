"use client";

import { useMemo, useState } from "react";
import {
  DebitMemoAccountingColumnIds,
  DebitMemoAccountingColumnLabels,
  DebitMemoAccountingColumnWidths,
  DebitMemoAccountingDefaultVisibleColumnIds,
  DebitMemoAccountingProtectedColumnIds,
  DebitMemoPurchaseTaxCodeQuery,
} from "@/app/src/constants/modules/general-journal/debit-memo/DebitMemoConstants";
import { getModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { formatDebitMemoAmount } from "@/app/src/data/modules/general-journal/debit-memo/DebitMemoData";
import {
  useAccountsPayableVoucherPartyOptions,
  useAccountsPayableVoucherResponsibilityCenterOptions,
} from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
import type { useDebitMemoFormPage } from "@/app/src/hooks/modules/general-journal/debit-memo/useDebitMemoFormPage";
import { useTaxes } from "@/app/src/hooks/shared/tax/useTaxOptions";
import type {
  DebitMemoAccountingColumnId,
  DebitMemoAccountingEntry,
} from "@/app/src/types/modules/general-journal/debit-memo/DebitMemoTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import {
  createEwtOptions,
  createVatOptions,
} from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import {
  calculateAccountingColumnFitWidth,
  createPartyOptions,
  createResponsibilityCenterOptions,
  entryDropdownClassName,
  LineAmountInput,
  LineInput,
  moveColumnId,
  ParticularsCell,
  ParticularsEditorDialog,
  PartyDropdown,
  ResponsibilityCenterDropdown,
  updateVisibleColumnIds,
} from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherDataEntryTableHelpers";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type DebitMemoDataEntryTableProps = {
  page: ReturnType<typeof useDebitMemoFormPage>;
};

export function DebitMemoDataEntryTable({ page }: DebitMemoDataEntryTableProps) {
  const partyOptionsQuery = useAccountsPayableVoucherPartyOptions();
  const responsibilityCenterOptionsQuery =
    useAccountsPayableVoucherResponsibilityCenterOptions();
  const partyRecords = useMemo(
    () => partyOptionsQuery.data ?? [],
    [partyOptionsQuery.data],
  );
  const responsibilityCenters = useMemo(
    () => responsibilityCenterOptionsQuery.data ?? [],
    [responsibilityCenterOptionsQuery.data],
  );
  const partyOptions = useMemo(
    () => createPartyOptions(partyRecords, page.values.accountingEntries),
    [page.values.accountingEntries, partyRecords],
  );
  const responsibilityCenterOptions = useMemo(
    () =>
      createResponsibilityCenterOptions(
        responsibilityCenters,
        page.values.accountingEntries,
      ),
    [page.values.accountingEntries, responsibilityCenters],
  );
  const chartAccounts = useMemo(() => getModuleChartAccounts(), []);
  const taxCodesQuery = useTaxes(DebitMemoPurchaseTaxCodeQuery);
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);
  const [particularsEditorEntryId, setParticularsEditorEntryId] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<DebitMemoAccountingColumnId[]>([
    ...DebitMemoAccountingColumnIds,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<DebitMemoAccountingColumnId[]>([
    ...DebitMemoAccountingDefaultVisibleColumnIds,
  ]);
  const [columnLabels, setColumnLabels] = useState<
    Record<DebitMemoAccountingColumnId, string>
  >({ ...DebitMemoAccountingColumnLabels });
  const [columnWidths, setColumnWidths] = useState<
    Record<DebitMemoAccountingColumnId, number>
  >({ ...DebitMemoAccountingColumnWidths });
  const visibleColumnOrder = columnOrder.filter((columnId) =>
    visibleColumnIds.includes(columnId),
  );
  const particularsEditorEntry =
    page.values.accountingEntries.find((entry) => entry.id === particularsEditorEntryId) ?? null;
  const title = (
    <div
      role="tablist"
      aria-label="Entry view"
      className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      <span
        role="tab"
        aria-selected
        className="h-8 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-coralpink shadow-sm ring-1 ring-darknavy/10"
      >
        Accounting Entries
      </span>
    </div>
  );
  const columnOptions: ModuleDataEntryColumnOption[] =
    columnOrder.map((columnId) => ({
      id: columnId,
      isHideable: !DebitMemoAccountingProtectedColumnIds.has(columnId),
      isVisible: visibleColumnIds.includes(columnId),
      label: columnLabels[columnId],
      width: columnWidths[columnId],
      widthMode: "fixed",
    }));
  const columnById: Record<
    DebitMemoAccountingColumnId,
    ModuleDataEntryColumn<DebitMemoAccountingEntry>
  > = {
    accountCode: {
      header: columnLabels.accountCode,
      id: "accountCode",
      renderCell: (entry) => (
        <LineInput
          error={page.errors.accountingEntryErrors?.[entry.id]?.accountCode}
          value={entry.accountCode}
          onChange={() => undefined}
          readOnly
        />
      ),
      width: columnWidths.accountCode,
      widthClassName: "",
      widthMode: "fixed",
    },
    accountTitle: {
      header: columnLabels.accountTitle,
      id: "accountTitle",
      renderCell: (entry) => (
        <ChartAccountDropdown
          accounts={chartAccounts}
          value={entry.accountTitle}
          valueField="accountName"
          readOnly={page.isAccountingEntriesReadonly}
          isClearable
          className={entryDropdownClassName(
            page.errors.accountingEntryErrors?.[entry.id]?.accountTitle,
          )}
          ariaInvalid={Boolean(page.errors.accountingEntryErrors?.[entry.id]?.accountTitle)}
          placeholder="Select account title"
          searchPlaceholder="Search account title"
          onChange={() => undefined}
          onSelectAccount={(account) => {
            page.updateAccountingEntry(entry.id, "accountCode", account?.accountNumber ?? "");
            page.updateAccountingEntry(entry.id, "accountTitle", account?.accountName ?? "");
          }}
        />
      ),
      width: columnWidths.accountTitle,
      widthClassName: "",
      widthMode: "fixed",
    },
    particulars: {
      header: columnLabels.particulars,
      id: "particulars",
      renderCell: (entry) => (
        <ParticularsCell
          isReadonly={page.isAccountingEntriesReadonly}
          value={entry.particulars}
          onOpen={() => setParticularsEditorEntryId(entry.id)}
          onUpdate={(value) => page.updateAccountingEntry(entry.id, "particulars", value)}
        />
      ),
      width: columnWidths.particulars,
      widthClassName: "",
      widthMode: "fixed",
    },
    debit: {
      header: columnLabels.debit,
      id: "debit",
      renderCell: (entry) => (
        <LineAmountInput
          allowNegative={false}
          disabled={page.isAccountingEntriesReadonly || Number(entry.credit || 0) > 0}
          error={page.errors.accountingEntryErrors?.[entry.id]?.debit}
          value={entry.debit}
          onChange={(value) => page.updateAccountingEntry(entry.id, "debit", value)}
        />
      ),
      width: columnWidths.debit,
      widthClassName: "",
      widthMode: "fixed",
    },
    credit: {
      header: columnLabels.credit,
      id: "credit",
      renderCell: (entry) => (
        <LineAmountInput
          allowNegative={false}
          disabled={page.isAccountingEntriesReadonly || Number(entry.debit || 0) > 0}
          error={page.errors.accountingEntryErrors?.[entry.id]?.credit}
          value={entry.credit}
          onChange={(value) => page.updateAccountingEntry(entry.id, "credit", value)}
        />
      ),
      width: columnWidths.credit,
      widthClassName: "",
      widthMode: "fixed",
    },
    vatType: {
      header: columnLabels.vatType,
      id: "vatType",
      renderCell: (entry) => (
        <AppAdvancedDropdown
          value={entry.vatType}
          readOnly={page.isAccountingEntriesReadonly}
          isClearable
          options={vatOptions}
          placeholder="Select VAT"
          searchPlaceholder="Search VAT rate or description"
          className={entryDropdownClassName()}
          onChange={(value) => page.updateAccountingEntry(entry.id, "vatType", String(value))}
        />
      ),
      width: columnWidths.vatType,
      widthClassName: "",
      widthMode: "fixed",
    },
    atcCode: {
      header: columnLabels.atcCode,
      id: "atcCode",
      renderCell: (entry) => (
        <AppAdvancedDropdown
          value={entry.atcCode}
          readOnly={page.isAccountingEntriesReadonly}
          isClearable
          options={ewtOptions}
          placeholder="Select EWT"
          searchPlaceholder="Search EWT code, rate, or description"
          className={entryDropdownClassName(
            page.errors.accountingEntryErrors?.[entry.id]?.atcCode,
          )}
          ariaInvalid={Boolean(page.errors.accountingEntryErrors?.[entry.id]?.atcCode)}
          onChange={(value) => page.updateAccountingEntry(entry.id, "atcCode", String(value))}
        />
      ),
      width: columnWidths.atcCode,
      widthClassName: "",
      widthMode: "fixed",
    },
    partyCode: {
      header: columnLabels.partyCode,
      id: "partyCode",
      renderCell: (entry) => <LineInput value={entry.partyCode} onChange={() => undefined} readOnly />,
      width: columnWidths.partyCode,
      widthClassName: "",
      widthMode: "fixed",
    },
    partyName: {
      header: columnLabels.partyName,
      id: "partyName",
      renderCell: (entry) => (
        <PartyDropdown
          isReadonly={page.isAccountingEntriesReadonly}
          options={partyOptions}
          partyCode={entry.partyCode}
          partyName={entry.partyName}
          onSelect={(partyCode, partyName) => {
            page.updateAccountingEntry(entry.id, "partyCode", partyCode);
            page.updateAccountingEntry(entry.id, "partyName", partyName);
          }}
        />
      ),
      width: columnWidths.partyName,
      widthClassName: "",
      widthMode: "fixed",
    },
    responsibilityCenter: {
      header: columnLabels.responsibilityCenter,
      id: "responsibilityCenter",
      renderCell: (entry) => (
        <ResponsibilityCenterDropdown
          isReadonly={page.isAccountingEntriesReadonly}
          options={responsibilityCenterOptions}
          value={entry.responsibilityCenter}
          onChange={(value) => page.updateAccountingEntry(entry.id, "responsibilityCenter", value)}
        />
      ),
      width: columnWidths.responsibilityCenter,
      widthClassName: "",
      widthMode: "fixed",
    },
    refNo: {
      header: columnLabels.refNo,
      id: "refNo",
      renderCell: (entry) => (
        <LineInput
          disabled={page.isAccountingEntriesReadonly}
          value={entry.refNo}
          onChange={(value) => page.updateAccountingEntry(entry.id, "refNo", value)}
        />
      ),
      width: columnWidths.refNo,
      widthClassName: "",
      widthMode: "fixed",
    },
  };
  const columns = visibleColumnOrder.map((columnId) => columnById[columnId]);

  function updateColumnHeader(columnId: string, header: string) {
    if (!isDebitMemoAccountingColumnId(columnId)) {
      return;
    }

    setColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (!isDebitMemoAccountingColumnId(columnId)) {
      return;
    }

    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitColumnWidth(columnId: string) {
    if (!isDebitMemoAccountingColumnId(columnId)) {
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
      !isDebitMemoAccountingColumnId(fromColumnId) ||
      !isDebitMemoAccountingColumnId(toColumnId)
    ) {
      return;
    }

    setColumnOrder((currentOrder) =>
      moveColumnId(currentOrder, fromColumnId, toColumnId),
    );
  }

  function resetColumns() {
    setColumnOrder([...DebitMemoAccountingColumnIds]);
    setVisibleColumnIds([...DebitMemoAccountingDefaultVisibleColumnIds]);
    setColumnLabels({ ...DebitMemoAccountingColumnLabels });
    setColumnWidths({ ...DebitMemoAccountingColumnWidths });
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isDebitMemoAccountingColumnId(columnId)) {
      return;
    }

    if (!isVisible && DebitMemoAccountingProtectedColumnIds.has(columnId)) {
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
        columnResetLabel="Default"
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
            Variance: {formatDebitMemoAmount(Math.abs(page.accountingTotals.variance))}
          </span>
        }
        isDraggable
        isReadonly={page.isAccountingEntriesReadonly}
        rows={page.values.accountingEntries}
        summaryCells={{
          credit: formatDebitMemoAmount(page.accountingTotals.totalCredit),
          debit: formatDebitMemoAmount(page.accountingTotals.totalDebit),
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
        isReadonly={page.isAccountingEntriesReadonly}
        subtitle={particularsEditorEntry?.accountTitle || "Accounting entry"}
        textareaId="debit-memo-accounting-particulars-dialog-text"
        value={particularsEditorEntry?.particulars ?? ""}
        onClose={() => setParticularsEditorEntryId(null)}
        onSave={(value) => {
          if (!particularsEditorEntry || page.isAccountingEntriesReadonly) {
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

function isDebitMemoAccountingColumnId(
  columnId: string,
): columnId is DebitMemoAccountingColumnId {
  return DebitMemoAccountingColumnIds.includes(
    columnId as DebitMemoAccountingColumnId,
  );
}

function clampColumnWidth(width: number) {
  if (!Number.isFinite(width)) {
    return 160;
  }

  return Math.min(Math.max(Math.round(width), 96), 640);
}
