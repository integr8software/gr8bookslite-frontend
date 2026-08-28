import {
  calculateCollectionReceiptCwtAmount,
  calculateCollectionReceiptNetOfVat,
  calculateCollectionReceiptTotalReceived,
  calculateCollectionReceiptVatAmount,
  CollectionReceiptCollectionTypeOptions,
  CollectionReceiptCwtCodeOptions,
  CollectionReceiptVatTypeOptions,
} from "@/app/src/data/modules/cash-receipt/collection-receipt/CollectionReceiptData";
import type { CollectionReceiptLineEntry } from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";
import {
  CollectionReceiptAccountingProtectedColumnIds,
  CollectionReceiptCollectionProtectedColumnIds,
  type CollectionReceiptAccountingColumnId,
  type CollectionReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptEntryColumns";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  CollectionReceiptEntryAmountInput,
  CollectionReceiptEntryDropdown,
  CollectionReceiptEntryInput,
  CollectionReceiptEntryPercentInput,
  CollectionReceiptEntryReadOnlyAmount,
} from "@/app/src/ui/modules/cash-receipt/collection-receipt/entries/CollectionReceiptEntryCellControls";

type UpdateCollectionReceiptEntry = (rowId: string, updates: Partial<CollectionReceiptLineEntry>) => void;

export function createCollectionReceiptCollectionColumns(
  isReadonly: boolean,
  onUpdateEntry: UpdateCollectionReceiptEntry,
  columnOrder: CollectionReceiptCollectionColumnId[],
  visibleColumnIds: readonly CollectionReceiptCollectionColumnId[],
  columnLabels: Record<CollectionReceiptCollectionColumnId, string>,
  columnWidths: Record<CollectionReceiptCollectionColumnId, number>,
): ModuleDataEntryColumn<CollectionReceiptLineEntry>[] {
  return columnOrder
    .filter((columnId) => visibleColumnIds.includes(columnId))
    .map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !CollectionReceiptCollectionProtectedColumnIds.has(columnId),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
      renderCell: (row) => renderCollectionCell(row, columnId, isReadonly, onUpdateEntry),
    }));
}

export function createCollectionReceiptAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: UpdateCollectionReceiptEntry,
  columnOrder: CollectionReceiptAccountingColumnId[],
  visibleColumnIds: readonly CollectionReceiptAccountingColumnId[],
  columnLabels: Record<CollectionReceiptAccountingColumnId, string>,
  columnWidths: Record<CollectionReceiptAccountingColumnId, number>,
): ModuleDataEntryColumn<CollectionReceiptLineEntry>[] {
  return columnOrder
    .filter((columnId) => visibleColumnIds.includes(columnId))
    .map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !CollectionReceiptAccountingProtectedColumnIds.has(columnId),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
      renderCell: (row) => renderAccountingCell(row, columnId, isReadonly, onUpdateEntry),
    }));
}

function renderCollectionCell(
  row: CollectionReceiptLineEntry,
  columnId: CollectionReceiptCollectionColumnId,
  isReadonly: boolean,
  onUpdateEntry: UpdateCollectionReceiptEntry,
) {
  switch (columnId) {
    case "collectionType":
      return (
        <CollectionReceiptEntryDropdown
          options={CollectionReceiptCollectionTypeOptions}
          placeholder="Enter collection type"
          readOnly={isReadonly}
          value={row.collectionType}
          onChange={(collectionType) => onUpdateEntry(row.id, { collectionType })}
        />
      );
    case "grossReceipt":
      return (
        <CollectionReceiptEntryAmountInput
          value={row.grossReceipt}
          readOnly={isReadonly}
          onValueChange={(grossReceipt) => onUpdateEntry(row.id, { grossReceipt })}
        />
      );
    case "netOfVat":
      return <CollectionReceiptEntryReadOnlyAmount value={calculateCollectionReceiptNetOfVat(row)} />;
    case "vatType":
      return (
        <CollectionReceiptEntryDropdown
          options={CollectionReceiptVatTypeOptions}
          placeholder="Select VAT type"
          readOnly={isReadonly}
          value={row.vatType}
          onChange={(vatType) => onUpdateEntry(row.id, { vatType })}
        />
      );
    case "vatPercent":
      return (
        <CollectionReceiptEntryPercentInput
          value={row.vatPercent}
          readOnly={isReadonly}
          onValueChange={(vatPercent) => onUpdateEntry(row.id, { vatPercent })}
        />
      );
    case "vatAmount":
      return <CollectionReceiptEntryReadOnlyAmount value={calculateCollectionReceiptVatAmount(row)} />;
    case "cwtCode":
      return (
        <CollectionReceiptEntryDropdown
          options={CollectionReceiptCwtCodeOptions}
          placeholder="Select CWT code"
          readOnly={isReadonly}
          value={row.cwtCode}
          onChange={(cwtCode) => onUpdateEntry(row.id, { cwtCode })}
        />
      );
    case "cwtPercent":
      return (
        <CollectionReceiptEntryPercentInput
          value={row.cwtPercent}
          readOnly={isReadonly}
          onValueChange={(cwtPercent) => onUpdateEntry(row.id, { cwtPercent })}
        />
      );
    case "cwtAmount":
      return <CollectionReceiptEntryReadOnlyAmount value={calculateCollectionReceiptCwtAmount(row)} />;
    case "totalReceived":
      return <CollectionReceiptEntryReadOnlyAmount value={calculateCollectionReceiptTotalReceived(row)} />;
    case "partyCode":
      return (
        <CollectionReceiptEntryInput
          value={row.partyCode}
          readOnly={isReadonly}
          onChange={(partyCode) => onUpdateEntry(row.id, { partyCode })}
        />
      );
    case "partyName":
      return (
        <CollectionReceiptEntryInput
          value={row.partyName || row.customerName}
          readOnly={isReadonly}
          onChange={(partyName) => onUpdateEntry(row.id, { partyName, customerName: partyName })}
        />
      );
    case "particulars":
      return (
        <CollectionReceiptEntryInput
          value={row.particulars}
          readOnly={isReadonly}
          onChange={(particulars) => onUpdateEntry(row.id, { particulars })}
        />
      );
    case "responsibilityCenter":
      return (
        <CollectionReceiptEntryInput
          value={row.responsibilityCenter}
          readOnly={isReadonly}
          onChange={(responsibilityCenter) => onUpdateEntry(row.id, { responsibilityCenter })}
        />
      );
    case "referenceNo":
      return (
        <CollectionReceiptEntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      );
  }
}

function renderAccountingCell(
  row: CollectionReceiptLineEntry,
  columnId: CollectionReceiptAccountingColumnId,
  isReadonly: boolean,
  onUpdateEntry: UpdateCollectionReceiptEntry,
) {
  switch (columnId) {
    case "accountCode":
      return (
        <CollectionReceiptEntryInput
          value={row.accountCode}
          readOnly={isReadonly}
          onChange={(accountCode) => onUpdateEntry(row.id, { accountCode })}
        />
      );
    case "accountTitle":
      return (
        <CollectionReceiptEntryInput
          value={row.accountTitle}
          readOnly={isReadonly}
          onChange={(accountTitle) => onUpdateEntry(row.id, { accountTitle })}
        />
      );
    case "partyCode":
      return (
        <CollectionReceiptEntryInput
          value={row.partyCode}
          readOnly={isReadonly}
          onChange={(partyCode) => onUpdateEntry(row.id, { partyCode })}
        />
      );
    case "partyName":
      return (
        <CollectionReceiptEntryInput
          value={row.partyName || row.customerName}
          readOnly={isReadonly}
          onChange={(partyName) => onUpdateEntry(row.id, { partyName, customerName: partyName })}
        />
      );
    case "particulars":
      return (
        <CollectionReceiptEntryInput
          value={row.particulars}
          readOnly={isReadonly}
          onChange={(particulars) => onUpdateEntry(row.id, { particulars })}
        />
      );
    case "vatType":
      return (
        <CollectionReceiptEntryInput value={row.vatType} readOnly={isReadonly} onChange={(vatType) => onUpdateEntry(row.id, { vatType })} />
      );
    case "cwtCode":
      return (
        <CollectionReceiptEntryInput value={row.cwtCode} readOnly={isReadonly} onChange={(cwtCode) => onUpdateEntry(row.id, { cwtCode })} />
      );
    case "responsibilityCenter":
      return (
        <CollectionReceiptEntryInput
          value={row.responsibilityCenter}
          readOnly={isReadonly}
          onChange={(responsibilityCenter) => onUpdateEntry(row.id, { responsibilityCenter })}
        />
      );
    case "referenceNo":
      return (
        <CollectionReceiptEntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      );
    case "debit":
      return <CollectionReceiptEntryReadOnlyAmount value={parseMoneyNumberInput(row.debit)} />;
    case "credit":
      return <CollectionReceiptEntryReadOnlyAmount value={parseMoneyNumberInput(row.credit)} />;
  }
}
