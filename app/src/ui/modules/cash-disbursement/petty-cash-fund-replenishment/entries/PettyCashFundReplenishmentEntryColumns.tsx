import type {
  PettyCashFundReplenishmentAccountingEntryColumnsParams,
  PettyCashFundReplenishmentAccountingColumnId,
  PettyCashFundReplenishmentAccountingEntry,
  PettyCashFundReplenishmentDetailEntryColumnsParams,
  PettyCashFundReplenishmentEntry,
  PettyCashFundReplenishmentEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import {
  PettyCashFundReplenishmentEntryEwtCodeOptions,
  PettyCashFundReplenishmentEntryVatTypeOptions,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import { calculatePettyCashFundReplenishmentEntryTaxFields } from "@/app/src/data/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentData";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryDropdownCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryDropdownCell";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";
import { ModuleDataEntryReadonlyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryReadonlyCell";
import { ModuleDataEntryRemarksCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRemarksCell";

export function createPettyCashFundReplenishmentLineColumns({
  columnLabels,
  columnWidths,
  page,
}: PettyCashFundReplenishmentDetailEntryColumnsParams): Record<
  PettyCashFundReplenishmentEntryColumnId,
  ModuleDataEntryColumn<PettyCashFundReplenishmentEntry>
> {
  const text = (
    id: PettyCashFundReplenishmentEntryColumnId,
    type: "text" | "date" = "text",
  ): ModuleDataEntryColumn<PettyCashFundReplenishmentEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    widthMode: "fixed",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryInputCell
        id={context.fieldId}
        name={context.fieldName}
        type={type}
        value={String(row[id])}
        readOnly={page.isReadonly}
        placeholder={`Enter ${columnLabels[id]}`}
        onChange={(value) => page.updateEntry(row.id, { [id]: value })}
      />
    ),
  });

  const money = (
    id: "amount",
    onChange?: (row: PettyCashFundReplenishmentEntry, value: string) => void,
  ): ModuleDataEntryColumn<PettyCashFundReplenishmentEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    widthMode: "fixed",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryMoneyCell
        id={context.fieldId}
        name={context.fieldName}
        value={row[id]}
        readOnly={page.isReadonly}
        onChange={(value) => (onChange ? onChange(row, value) : page.updateEntry(row.id, { [id]: value }))}
      />
    ),
  });

  const dropdown = (
    id: "vatType" | "ewtCode",
    options: Parameters<typeof ModuleDataEntryDropdownCell>[0]["options"],
  ): ModuleDataEntryColumn<PettyCashFundReplenishmentEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    widthMode: "fixed",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryDropdownCell
        id={context.fieldId}
        name={context.fieldName}
        value={row[id]}
        readOnly={page.isReadonly}
        options={options}
        placeholder={`Select ${columnLabels[id]}`}
        searchPlaceholder={`Search ${columnLabels[id]}`}
        onChange={(value) => {
          const vatType = id === "vatType" ? value : row.vatType;
          const ewtCode = id === "ewtCode" ? value : row.ewtCode;
          page.updateEntry(row.id, {
            [id]: value,
            ...calculatePettyCashFundReplenishmentEntryTaxFields(row.amount, vatType, ewtCode),
          });
        }}
      />
    ),
  });

  const calculatedMoney = (
    id: "netAmount" | "vatPercent" | "vatAmount" | "ewtPercent" | "ewtAmount" | "totalAmountDue",
  ): ModuleDataEntryColumn<PettyCashFundReplenishmentEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    widthMode: "fixed",
    renderCell: (row) => <ModuleDataEntryReadonlyCell align="right" value={row[id]} />,
  });

  return {
    pettyCashDate: text("pettyCashDate", "date"),
    pettyCashNo: text("pettyCashNo"),
    supplierCode: text("supplierCode"),
    supplierName: text("supplierName"),
    amount: money("amount", (row, value) =>
      page.updateEntry(row.id, {
        amount: value,
        ...calculatePettyCashFundReplenishmentEntryTaxFields(value, row.vatType, row.ewtCode),
      }),
    ),
    netAmount: calculatedMoney("netAmount"),
    vatType: dropdown("vatType", PettyCashFundReplenishmentEntryVatTypeOptions),
    vatPercent: calculatedMoney("vatPercent"),
    vatAmount: calculatedMoney("vatAmount"),
    ewtCode: dropdown("ewtCode", PettyCashFundReplenishmentEntryEwtCodeOptions),
    ewtPercent: calculatedMoney("ewtPercent"),
    ewtAmount: calculatedMoney("ewtAmount"),
    totalAmountDue: calculatedMoney("totalAmountDue"),
    remarks: {
      header: columnLabels.remarks,
      id: "remarks",
      width: columnWidths.remarks,
      widthClassName: "w-auto",
      widthMode: "fixed",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryRemarksCell
          inputId={context.fieldId}
          inputName={context.fieldName}
          isReadonly={page.isReadonly}
          value={row.remarks}
          textareaId={`${context.fieldId}-dialog`}
          onChange={(value) => page.updateEntry(row.id, { remarks: value })}
        />
      ),
    },
  };
}

export function createPettyCashFundReplenishmentAccountingColumns({
  columnLabels,
  columnWidths,
}: PettyCashFundReplenishmentAccountingEntryColumnsParams): Record<
  PettyCashFundReplenishmentAccountingColumnId,
  ModuleDataEntryColumn<PettyCashFundReplenishmentAccountingEntry>
> {
  const column = (id: PettyCashFundReplenishmentAccountingColumnId): ModuleDataEntryColumn<PettyCashFundReplenishmentAccountingEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    widthMode: "fixed",
    renderCell: (row) => (
      <span className={`block px-3 ${id === "debit" || id === "credit" ? "text-right tabular-nums" : ""}`}>{row[id]}</span>
    ),
  });

  return {
    accountCode: column("accountCode"),
    accountTitle: column("accountTitle"),
    debit: column("debit"),
    credit: column("credit"),
    partyCode: column("partyCode"),
    partyName: column("partyName"),
    remarks: column("remarks"),
  };
}
