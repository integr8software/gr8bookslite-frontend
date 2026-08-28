"use client";

import { useMemo, useState } from "react";
import {
  CreditMemoAccountingColumnIds,
  CreditMemoAccountingColumnLabels,
  CreditMemoAccountingColumnWidths,
  CreditMemoAccountingDefaultVisibleColumnIds,
  CreditMemoAccountingProtectedColumnIds,
  CreditMemoPurchaseTaxCodeQuery,
} from "@/app/src/constants/modules/general-journal/credit-memo/CreditMemoConstants";
import { getModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { formatCreditMemoAmount } from "@/app/src/data/modules/general-journal/credit-memo/CreditMemoData";
import {
  useAccountsPayableVoucherPartyOptions,
  useAccountsPayableVoucherResponsibilityCenterOptions,
} from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
import type { useCreditMemoFormPage } from "@/app/src/hooks/modules/general-journal/credit-memo/useCreditMemoFormPage";
import { useTaxes } from "@/app/src/hooks/shared/tax/useTaxOptions";
import type {
  CreditMemoAccountingColumnId,
  CreditMemoAccountingEntry,
} from "@/app/src/types/modules/general-journal/credit-memo/CreditMemoTypes";
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

type CreditMemoDataEntryTableProps = {
  page: ReturnType<typeof useCreditMemoFormPage>;
};

export function CreditMemoDataEntryTable({ page }: CreditMemoDataEntryTableProps) {
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
  const taxCodesQuery = useTaxes(CreditMemoPurchaseTaxCodeQuery);
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);
  const [particularsEditorEntryId, setParticularsEditorEntryId] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<CreditMemoAccountingColumnId[]>([
    ...CreditMemoAccountingColumnIds,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<CreditMemoAccountingColumnId[]>([
    ...CreditMemoAccountingDefaultVisibleColumnIds,
  ]);
  const [columnLabels, setColumnLabels] = useState<
    Record<CreditMemoAccountingColumnId, string>
  >({ ...CreditMemoAccountingColumnLabels });
  const [columnWidths, setColumnWidths] = useState<
    Record<CreditMemoAccountingColumnId, number>
  >({ ...CreditMemoAccountingColumnWidths });
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
      isHideable: !CreditMemoAccountingProtectedColumnIds.has(columnId),
      isVisible: visibleColumnIds.includes(columnId),
      label: columnLabels[columnId],
      width: columnWidths[columnId],
    }));
  const columnById: Record<
    CreditMemoAccountingColumnId,
    ModuleDataEntryColumn<CreditMemoAccountingEntry>
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
    },
    partyCode: {
      header: columnLabels.partyCode,
      id: "partyCode",
      renderCell: (entry) => <LineInput value={entry.partyCode} onChange={() => undefined} readOnly />,
      width: columnWidths.partyCode,
      widthClassName: "",
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
    },
  };
  const columns = visibleColumnOrder.map((columnId) => columnById[columnId]);

  function updateColumnHeader(columnId: string, header: string) {
    if (!isCreditMemoAccountingColumnId(columnId)) {
      return;
    }

    setColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (!isCreditMemoAccountingColumnId(columnId)) {
      return;
    }

    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitColumnWidth(columnId: string) {
    if (!isCreditMemoAccountingColumnId(columnId)) {
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
      !isCreditMemoAccountingColumnId(fromColumnId) ||
      !isCreditMemoAccountingColumnId(toColumnId)
    ) {
      return;
    }

    setColumnOrder((currentOrder) =>
      moveColumnId(currentOrder, fromColumnId, toColumnId),
    );
  }

  function resetColumns() {
    setColumnOrder([...CreditMemoAccountingColumnIds]);
    setVisibleColumnIds([...CreditMemoAccountingDefaultVisibleColumnIds]);
    setColumnLabels({ ...CreditMemoAccountingColumnLabels });
    setColumnWidths({ ...CreditMemoAccountingColumnWidths });
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isCreditMemoAccountingColumnId(columnId)) {
      return;
    }

    if (!isVisible && CreditMemoAccountingProtectedColumnIds.has(columnId)) {
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
            Variance: {formatCreditMemoAmount(Math.abs(page.accountingTotals.variance))}
          </span>
        }
        isDraggable
        isReadonly={page.isAccountingEntriesReadonly}
        rows={page.values.accountingEntries}
        summaryCells={{
          credit: formatCreditMemoAmount(page.accountingTotals.totalCredit),
          debit: formatCreditMemoAmount(page.accountingTotals.totalDebit),
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
        textareaId="credit-memo-accounting-particulars-dialog-text"
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

function isCreditMemoAccountingColumnId(
  columnId: string,
): columnId is CreditMemoAccountingColumnId {
  return CreditMemoAccountingColumnIds.includes(
    columnId as CreditMemoAccountingColumnId,
  );
}

function clampColumnWidth(width: number) {
  if (!Number.isFinite(width)) {
    return 160;
  }

  return Math.min(Math.max(Math.round(width), 96), 640);
}
