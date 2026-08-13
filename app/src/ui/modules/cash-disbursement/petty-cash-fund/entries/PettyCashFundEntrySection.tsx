import { useMemo, useState } from "react";
import {
  PettyCashFundDefaultItemColumnIds,
  PettyCashFundEntryInputClassName,
  PettyCashFundEntryTabs,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import {
  createBlankPettyCashFundItem,
  formatPettyCashFundAmount,
  PettyCashFundResponsibilityCenterOptions,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import type { PettyCashFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFund";
import type {
  PettyCashFundAccountingEntry,
  PettyCashFundEntryTab,
  PettyCashFundItem,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function PettyCashFundEntrySection({ page }: { page: PettyCashFundActionPageState }) {
  const [activeTab, setActiveTab] = useState<PettyCashFundEntryTab>("items");
  const columns = useMemo(() => createItemColumns(page), [page]);
  const accountingRows = useMemo<PettyCashFundAccountingEntry[]>(() => {
    const total = page.totals.grossAmount;
    return [
      {
        id: "pcf-accounting-debit",
        accountCode: page.values.accountCode,
        accountTitle: page.values.accountTitle,
        debit: formatPettyCashFundAmount(total),
        credit: "0.00",
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        particulars: page.values.remarks,
      },
      {
        id: "pcf-accounting-credit",
        accountCode: "101-100",
        accountTitle: "Cash in Bank",
        debit: "0.00",
        credit: formatPettyCashFundAmount(total),
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        particulars: page.values.remarks,
      },
    ];
  }, [
    page.totals.grossAmount,
    page.values.accountCode,
    page.values.accountTitle,
    page.values.partyCode,
    page.values.partyName,
    page.values.remarks,
  ]);
  const title = <EntryTabs activeTab={activeTab} onTabChange={setActiveTab} />;

  if (activeTab === "accounting") {
    return (
      <ModuleDataEntry
        title={title}
        description="Generated debit and credit entries for the fund."
        emptyRowLabel="accounting entry"
        columns={createAccountingColumns()}
        rows={accountingRows}
        isReadonly
        onAddRows={() => undefined}
        summaryRowHeader="Totals"
        summaryCells={{
          debit: formatPettyCashFundAmount(page.totals.grossAmount),
          credit: formatPettyCashFundAmount(page.totals.grossAmount),
        }}
      />
    );
  }

  const columnOptions: ModuleDataEntryColumnOption[] = columns.map((column) => ({
    id: column.id,
    label: column.header,
    isVisible: true,
    isHideable: !PettyCashFundDefaultItemColumnIds.includes(column.id),
    width: column.width,
  }));
  return (
    <ModuleDataEntry
      title={title}
      description="Record petty cash payees, receipts, tax treatment, and responsibility centers."
      emptyRowLabel="petty cash item"
      error={page.errors.items}
      columns={columns}
      columnOptions={columnOptions}
      rows={page.values.items}
      isReadonly={page.isReadonly}
      onAddRows={page.addItems}
      onClearRows={() => page.updateItems([createBlankPettyCashFundItem()])}
      onDuplicateRow={page.duplicateItem}
      onRemoveRow={page.removeItem}
      summaryRowHeader="Totals"
      summaryCells={{
        amount: formatPettyCashFundAmount(page.totals.amount),
        netAmount: formatPettyCashFundAmount(page.totals.netAmount),
        vatAmount: formatPettyCashFundAmount(page.totals.vatAmount),
        grossAmount: formatPettyCashFundAmount(page.totals.grossAmount),
      }}
    />
  );
}

function EntryTabs({ activeTab, onTabChange }: { activeTab: PettyCashFundEntryTab; onTabChange: (tab: PettyCashFundEntryTab) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Petty cash fund entry sections"
      className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {PettyCashFundEntryTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`h-8 rounded-md px-3 text-sm font-semibold transition ${activeTab === tab.id ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10" : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function createItemColumns(page: PettyCashFundActionPageState): ModuleDataEntryColumn<PettyCashFundItem>[] {
  const text = (
    header: string,
    id: keyof PettyCashFundItem & string,
    width: number,
    type: "text" | "date" = "text",
  ): ModuleDataEntryColumn<PettyCashFundItem> => ({
    header,
    id,
    width,
    renderCell: (row, _index, context) => (
      <input
        id={context.fieldId}
        name={context.fieldName}
        type={type}
        value={String(row[id])}
        readOnly={page.isReadonly}
        onChange={(event) => page.updateItem(row.id, { [id]: event.target.value })}
        className={PettyCashFundEntryInputClassName}
      />
    ),
  });
  const select = (
    header: string,
    id: keyof PettyCashFundItem & string,
    width: number,
    options: string[],
  ): ModuleDataEntryColumn<PettyCashFundItem> => ({
    header,
    id,
    width,
    renderCell: (row, _index, context) => (
      <select
        id={context.fieldId}
        name={context.fieldName}
        value={String(row[id])}
        disabled={page.isReadonly}
        onChange={(event) => page.updateItem(row.id, { [id]: event.target.value })}
        className={`${PettyCashFundEntryInputClassName} app-select-control`}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    ),
  });
  return [
    text("Date", "date", 145, "date"),
    text("Payee Code", "payeeCode", 140),
    text("Payee", "payeeName", 220),
    text("OR No.", "orNo", 135),
    text("TIN No.", "tinNo", 160),
    text("Particulars", "particulars", 260),
    text("Amount", "amount", 140),
    text("Net Amount", "netAmount", 140),
    text("VAT Amount", "vatAmount", 140),
    select("Type", "type", 150, ["Expense", "Asset", "Other"]),
    select("VAT Type", "vatType", 150, ["VAT 12%", "Zero Rated", "Exempt"]),
    select("VATable", "vatable", 125, ["False", "True"]),
    select("VAT Inc", "vatInclusive", 125, ["False", "True"]),
    text("Gross Amount", "grossAmount", 150),
    select("Responsibility Center", "responsibilityCenter", 210, PettyCashFundResponsibilityCenterOptions),
  ];
}

function createAccountingColumns(): ModuleDataEntryColumn<PettyCashFundAccountingEntry>[] {
  const column = (
    header: string,
    id: keyof PettyCashFundAccountingEntry & string,
    width: number,
  ): ModuleDataEntryColumn<PettyCashFundAccountingEntry> => ({
    header,
    id,
    width,
    renderCell: (row) => <span className={`block ${id === "debit" || id === "credit" ? "text-right tabular-nums" : ""}`}>{row[id]}</span>,
  });
  return [
    column("Account Code", "accountCode", 150),
    column("Account Title", "accountTitle", 240),
    column("Debit", "debit", 140),
    column("Credit", "credit", 140),
    column("Party Code", "partyCode", 150),
    column("Party Name", "partyName", 220),
    column("Particulars", "particulars", 260),
  ];
}
