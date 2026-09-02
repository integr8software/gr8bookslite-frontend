import {
  calculateProvisionalReceiptCwtAmount,
  calculateProvisionalReceiptNetOfVat,
  calculateProvisionalReceiptTotalReceived,
  calculateProvisionalReceiptVatAmount,
  ProvisionalReceiptCollectionTypeOptions,
  ProvisionalReceiptCwtCodeOptions,
  ProvisionalReceiptVatTypeOptions,
} from "@/app/src/data/modules/cash-receipt/provisional-receipt/ProvisionalReceiptData";
import type { ProvisionalReceiptLineEntry } from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";
import {
  ProvisionalReceiptAccountingProtectedColumnIds,
  ProvisionalReceiptCollectionProtectedColumnIds,
  type ProvisionalReceiptAccountingColumnId,
  type ProvisionalReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptEntryColumns";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  ProvisionalReceiptEntryAmountInput,
  ProvisionalReceiptEntryDropdown,
  ProvisionalReceiptEntryInput,
  ProvisionalReceiptEntryPercentInput,
  ProvisionalReceiptEntryReadOnlyAmount,
} from "@/app/src/ui/modules/cash-receipt/provisional-receipt/entries/ProvisionalReceiptEntryCellControls";

type UpdateProvisionalReceiptEntry = (rowId: string, updates: Partial<ProvisionalReceiptLineEntry>) => void;

export function createProvisionalReceiptCollectionColumns(
  isReadonly: boolean,
  onUpdateEntry: UpdateProvisionalReceiptEntry,
  columnOrder: ProvisionalReceiptCollectionColumnId[],
  visibleColumnIds: readonly ProvisionalReceiptCollectionColumnId[],
  columnLabels: Record<ProvisionalReceiptCollectionColumnId, string>,
  columnWidths: Record<ProvisionalReceiptCollectionColumnId, number>,
): ModuleDataEntryColumn<ProvisionalReceiptLineEntry>[] {
  return columnOrder
    .filter((columnId) => visibleColumnIds.includes(columnId))
    .map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !ProvisionalReceiptCollectionProtectedColumnIds.has(columnId),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
      renderCell: (row) => renderCollectionCell(row, columnId, isReadonly, onUpdateEntry),
    }));
}

export function createProvisionalReceiptAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: UpdateProvisionalReceiptEntry,
  columnOrder: ProvisionalReceiptAccountingColumnId[],
  visibleColumnIds: readonly ProvisionalReceiptAccountingColumnId[],
  columnLabels: Record<ProvisionalReceiptAccountingColumnId, string>,
  columnWidths: Record<ProvisionalReceiptAccountingColumnId, number>,
): ModuleDataEntryColumn<ProvisionalReceiptLineEntry>[] {
  return columnOrder
    .filter((columnId) => visibleColumnIds.includes(columnId))
    .map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !ProvisionalReceiptAccountingProtectedColumnIds.has(columnId),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
      renderCell: (row) => renderAccountingCell(row, columnId, isReadonly, onUpdateEntry),
    }));
}

function renderCollectionCell(
  row: ProvisionalReceiptLineEntry,
  columnId: ProvisionalReceiptCollectionColumnId,
  isReadonly: boolean,
  onUpdateEntry: UpdateProvisionalReceiptEntry,
) {
  switch (columnId) {
    case "collectionType":
      return (
        <ProvisionalReceiptEntryDropdown
          options={ProvisionalReceiptCollectionTypeOptions}
          placeholder="Enter collection type"
          readOnly={isReadonly}
          value={row.collectionType}
          onChange={(collectionType) => onUpdateEntry(row.id, { collectionType })}
        />
      );
    case "grossReceipt":
      return (
        <ProvisionalReceiptEntryAmountInput
          value={row.grossReceipt}
          readOnly={isReadonly}
          onValueChange={(grossReceipt) => onUpdateEntry(row.id, { grossReceipt })}
        />
      );
    case "netOfVat":
      return <ProvisionalReceiptEntryReadOnlyAmount value={calculateProvisionalReceiptNetOfVat(row)} />;
    case "vatType":
      return (
        <ProvisionalReceiptEntryDropdown
          options={ProvisionalReceiptVatTypeOptions}
          placeholder="Select VAT type"
          readOnly={isReadonly}
          value={row.vatType}
          onChange={(vatType) => onUpdateEntry(row.id, { vatType })}
        />
      );
    case "vatPercent":
      return (
        <ProvisionalReceiptEntryPercentInput
          value={row.vatPercent}
          readOnly={isReadonly}
          onValueChange={(vatPercent) => onUpdateEntry(row.id, { vatPercent })}
        />
      );
    case "vatAmount":
      return <ProvisionalReceiptEntryReadOnlyAmount value={calculateProvisionalReceiptVatAmount(row)} />;
    case "cwtCode":
      return (
        <ProvisionalReceiptEntryDropdown
          options={ProvisionalReceiptCwtCodeOptions}
          placeholder="Select CWT code"
          readOnly={isReadonly}
          value={row.cwtCode}
          onChange={(cwtCode) => onUpdateEntry(row.id, { cwtCode })}
        />
      );
    case "cwtPercent":
      return (
        <ProvisionalReceiptEntryPercentInput
          value={row.cwtPercent}
          readOnly={isReadonly}
          onValueChange={(cwtPercent) => onUpdateEntry(row.id, { cwtPercent })}
        />
      );
    case "cwtAmount":
      return <ProvisionalReceiptEntryReadOnlyAmount value={calculateProvisionalReceiptCwtAmount(row)} />;
    case "totalReceived":
      return <ProvisionalReceiptEntryReadOnlyAmount value={calculateProvisionalReceiptTotalReceived(row)} />;
    case "partyCode":
      return (
        <ProvisionalReceiptEntryInput
          value={row.partyCode}
          readOnly={isReadonly}
          onChange={(partyCode) => onUpdateEntry(row.id, { partyCode })}
        />
      );
    case "partyName":
      return (
        <ProvisionalReceiptEntryInput
          value={row.partyName || row.customerName}
          readOnly={isReadonly}
          onChange={(partyName) => onUpdateEntry(row.id, { partyName, customerName: partyName })}
        />
      );
    case "particulars":
      return (
        <ProvisionalReceiptEntryInput
          value={row.particulars}
          readOnly={isReadonly}
          onChange={(particulars) => onUpdateEntry(row.id, { particulars })}
        />
      );
    case "responsibilityCenter":
      return (
        <ProvisionalReceiptEntryInput
          value={row.responsibilityCenter}
          readOnly={isReadonly}
          onChange={(responsibilityCenter) => onUpdateEntry(row.id, { responsibilityCenter })}
        />
      );
    case "referenceNo":
      return (
        <ProvisionalReceiptEntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      );
  }
}

function renderAccountingCell(
  row: ProvisionalReceiptLineEntry,
  columnId: ProvisionalReceiptAccountingColumnId,
  isReadonly: boolean,
  onUpdateEntry: UpdateProvisionalReceiptEntry,
) {
  switch (columnId) {
    case "accountCode":
      return (
        <ProvisionalReceiptEntryInput
          value={row.accountCode}
          readOnly={isReadonly}
          onChange={(accountCode) => onUpdateEntry(row.id, { accountCode })}
        />
      );
    case "accountTitle":
      return (
        <ProvisionalReceiptEntryInput
          value={row.accountTitle}
          readOnly={isReadonly}
          onChange={(accountTitle) => onUpdateEntry(row.id, { accountTitle })}
        />
      );
    case "partyCode":
      return (
        <ProvisionalReceiptEntryInput
          value={row.partyCode}
          readOnly={isReadonly}
          onChange={(partyCode) => onUpdateEntry(row.id, { partyCode })}
        />
      );
    case "partyName":
      return (
        <ProvisionalReceiptEntryInput
          value={row.partyName || row.customerName}
          readOnly={isReadonly}
          onChange={(partyName) => onUpdateEntry(row.id, { partyName, customerName: partyName })}
        />
      );
    case "particulars":
      return (
        <ProvisionalReceiptEntryInput
          value={row.particulars}
          readOnly={isReadonly}
          onChange={(particulars) => onUpdateEntry(row.id, { particulars })}
        />
      );
    case "vatType":
      return (
        <ProvisionalReceiptEntryInput
          value={row.vatType}
          readOnly={isReadonly}
          onChange={(vatType) => onUpdateEntry(row.id, { vatType })}
        />
      );
    case "cwtCode":
      return (
        <ProvisionalReceiptEntryInput
          value={row.cwtCode}
          readOnly={isReadonly}
          onChange={(cwtCode) => onUpdateEntry(row.id, { cwtCode })}
        />
      );
    case "responsibilityCenter":
      return (
        <ProvisionalReceiptEntryInput
          value={row.responsibilityCenter}
          readOnly={isReadonly}
          onChange={(responsibilityCenter) => onUpdateEntry(row.id, { responsibilityCenter })}
        />
      );
    case "referenceNo":
      return (
        <ProvisionalReceiptEntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      );
    case "debit":
      return <ProvisionalReceiptEntryReadOnlyAmount value={parseMoneyNumberInput(row.debit)} />;
    case "credit":
      return <ProvisionalReceiptEntryReadOnlyAmount value={parseMoneyNumberInput(row.credit)} />;
  }
}
