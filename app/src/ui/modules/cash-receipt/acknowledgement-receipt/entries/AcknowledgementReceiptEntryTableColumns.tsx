import {
  calculateAcknowledgementReceiptCwtAmount,
  calculateAcknowledgementReceiptNetOfVat,
  calculateAcknowledgementReceiptTotalReceived,
  calculateAcknowledgementReceiptVatAmount,
  AcknowledgementReceiptCollectionTypeOptions,
  AcknowledgementReceiptCwtCodeOptions,
  AcknowledgementReceiptVatTypeOptions,
} from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptData";
import type { AcknowledgementReceiptLineEntry } from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import {
  AcknowledgementReceiptAccountingProtectedColumnIds,
  AcknowledgementReceiptCollectionProtectedColumnIds,
  type AcknowledgementReceiptAccountingColumnId,
  type AcknowledgementReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptEntryColumns";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  AcknowledgementReceiptEntryAmountInput,
  AcknowledgementReceiptEntryDropdown,
  AcknowledgementReceiptEntryInput,
  AcknowledgementReceiptEntryPercentInput,
  AcknowledgementReceiptEntryReadOnlyAmount,
} from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/entries/AcknowledgementReceiptEntryCellControls";

type UpdateAcknowledgementReceiptEntry = (rowId: string, updates: Partial<AcknowledgementReceiptLineEntry>) => void;

export function createAcknowledgementReceiptCollectionColumns(
  isReadonly: boolean,
  onUpdateEntry: UpdateAcknowledgementReceiptEntry,
  columnOrder: AcknowledgementReceiptCollectionColumnId[],
  visibleColumnIds: readonly AcknowledgementReceiptCollectionColumnId[],
  columnLabels: Record<AcknowledgementReceiptCollectionColumnId, string>,
  columnWidths: Record<AcknowledgementReceiptCollectionColumnId, number>,
): ModuleDataEntryColumn<AcknowledgementReceiptLineEntry>[] {
  return columnOrder
    .filter((columnId) => visibleColumnIds.includes(columnId))
    .map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !AcknowledgementReceiptCollectionProtectedColumnIds.has(columnId),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
      renderCell: (row) => renderCollectionCell(row, columnId, isReadonly, onUpdateEntry),
    }));
}

export function createAcknowledgementReceiptAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: UpdateAcknowledgementReceiptEntry,
  columnOrder: AcknowledgementReceiptAccountingColumnId[],
  visibleColumnIds: readonly AcknowledgementReceiptAccountingColumnId[],
  columnLabels: Record<AcknowledgementReceiptAccountingColumnId, string>,
  columnWidths: Record<AcknowledgementReceiptAccountingColumnId, number>,
): ModuleDataEntryColumn<AcknowledgementReceiptLineEntry>[] {
  return columnOrder
    .filter((columnId) => visibleColumnIds.includes(columnId))
    .map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !AcknowledgementReceiptAccountingProtectedColumnIds.has(columnId),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
      renderCell: (row) => renderAccountingCell(row, columnId, isReadonly, onUpdateEntry),
    }));
}

function renderCollectionCell(
  row: AcknowledgementReceiptLineEntry,
  columnId: AcknowledgementReceiptCollectionColumnId,
  isReadonly: boolean,
  onUpdateEntry: UpdateAcknowledgementReceiptEntry,
) {
  switch (columnId) {
    case "collectionType":
      return (
        <AcknowledgementReceiptEntryDropdown
          options={AcknowledgementReceiptCollectionTypeOptions}
          placeholder="Enter collection type"
          readOnly={isReadonly}
          value={row.collectionType}
          onChange={(collectionType) => onUpdateEntry(row.id, { collectionType })}
        />
      );
    case "grossReceipt":
      return (
        <AcknowledgementReceiptEntryAmountInput
          value={row.grossReceipt}
          readOnly={isReadonly}
          onValueChange={(grossReceipt) => onUpdateEntry(row.id, { grossReceipt })}
        />
      );
    case "netOfVat":
      return <AcknowledgementReceiptEntryReadOnlyAmount value={calculateAcknowledgementReceiptNetOfVat(row)} />;
    case "vatType":
      return (
        <AcknowledgementReceiptEntryDropdown
          options={AcknowledgementReceiptVatTypeOptions}
          placeholder="Select VAT type"
          readOnly={isReadonly}
          value={row.vatType}
          onChange={(vatType) => onUpdateEntry(row.id, { vatType })}
        />
      );
    case "vatPercent":
      return (
        <AcknowledgementReceiptEntryPercentInput
          value={row.vatPercent}
          readOnly={isReadonly}
          onValueChange={(vatPercent) => onUpdateEntry(row.id, { vatPercent })}
        />
      );
    case "vatAmount":
      return <AcknowledgementReceiptEntryReadOnlyAmount value={calculateAcknowledgementReceiptVatAmount(row)} />;
    case "cwtCode":
      return (
        <AcknowledgementReceiptEntryDropdown
          options={AcknowledgementReceiptCwtCodeOptions}
          placeholder="Select CWT code"
          readOnly={isReadonly}
          value={row.cwtCode}
          onChange={(cwtCode) => onUpdateEntry(row.id, { cwtCode })}
        />
      );
    case "cwtPercent":
      return (
        <AcknowledgementReceiptEntryPercentInput
          value={row.cwtPercent}
          readOnly={isReadonly}
          onValueChange={(cwtPercent) => onUpdateEntry(row.id, { cwtPercent })}
        />
      );
    case "cwtAmount":
      return <AcknowledgementReceiptEntryReadOnlyAmount value={calculateAcknowledgementReceiptCwtAmount(row)} />;
    case "totalReceived":
      return <AcknowledgementReceiptEntryReadOnlyAmount value={calculateAcknowledgementReceiptTotalReceived(row)} />;
    case "partyCode":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.partyCode}
          readOnly={isReadonly}
          onChange={(partyCode) => onUpdateEntry(row.id, { partyCode })}
        />
      );
    case "partyName":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.partyName || row.customerName}
          readOnly={isReadonly}
          onChange={(partyName) => onUpdateEntry(row.id, { partyName, customerName: partyName })}
        />
      );
    case "particulars":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.particulars}
          readOnly={isReadonly}
          onChange={(particulars) => onUpdateEntry(row.id, { particulars })}
        />
      );
    case "responsibilityCenter":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.responsibilityCenter}
          readOnly={isReadonly}
          onChange={(responsibilityCenter) => onUpdateEntry(row.id, { responsibilityCenter })}
        />
      );
    case "referenceNo":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      );
  }
}

function renderAccountingCell(
  row: AcknowledgementReceiptLineEntry,
  columnId: AcknowledgementReceiptAccountingColumnId,
  isReadonly: boolean,
  onUpdateEntry: UpdateAcknowledgementReceiptEntry,
) {
  switch (columnId) {
    case "accountCode":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.accountCode}
          readOnly={isReadonly}
          onChange={(accountCode) => onUpdateEntry(row.id, { accountCode })}
        />
      );
    case "accountTitle":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.accountTitle}
          readOnly={isReadonly}
          onChange={(accountTitle) => onUpdateEntry(row.id, { accountTitle })}
        />
      );
    case "partyCode":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.partyCode}
          readOnly={isReadonly}
          onChange={(partyCode) => onUpdateEntry(row.id, { partyCode })}
        />
      );
    case "partyName":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.partyName || row.customerName}
          readOnly={isReadonly}
          onChange={(partyName) => onUpdateEntry(row.id, { partyName, customerName: partyName })}
        />
      );
    case "particulars":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.particulars}
          readOnly={isReadonly}
          onChange={(particulars) => onUpdateEntry(row.id, { particulars })}
        />
      );
    case "vatType":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.vatType}
          readOnly={isReadonly}
          onChange={(vatType) => onUpdateEntry(row.id, { vatType })}
        />
      );
    case "cwtCode":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.cwtCode}
          readOnly={isReadonly}
          onChange={(cwtCode) => onUpdateEntry(row.id, { cwtCode })}
        />
      );
    case "responsibilityCenter":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.responsibilityCenter}
          readOnly={isReadonly}
          onChange={(responsibilityCenter) => onUpdateEntry(row.id, { responsibilityCenter })}
        />
      );
    case "referenceNo":
      return (
        <AcknowledgementReceiptEntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      );
    case "debit":
      return <AcknowledgementReceiptEntryReadOnlyAmount value={parseMoneyNumberInput(row.debit)} />;
    case "credit":
      return <AcknowledgementReceiptEntryReadOnlyAmount value={parseMoneyNumberInput(row.credit)} />;
  }
}
