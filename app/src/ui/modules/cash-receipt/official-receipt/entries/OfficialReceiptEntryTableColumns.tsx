import {
  calculateOfficialReceiptCwtAmount,
  calculateOfficialReceiptNetOfVat,
  calculateOfficialReceiptTotalReceived,
  calculateOfficialReceiptVatAmount,
  OfficialReceiptCollectionTypeOptions,
  OfficialReceiptCwtCodeOptions,
  OfficialReceiptVatTypeOptions,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import type { OfficialReceiptLineEntry } from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import {
  OfficialReceiptAccountingProtectedColumnIds,
  OfficialReceiptCollectionProtectedColumnIds,
  type OfficialReceiptAccountingColumnId,
  type OfficialReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/official-receipt/OfficialReceiptEntryColumns";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  OfficialReceiptEntryAmountInput,
  OfficialReceiptEntryDropdown,
  OfficialReceiptEntryInput,
  OfficialReceiptEntryPercentInput,
  OfficialReceiptEntryReadOnlyAmount,
} from "@/app/src/ui/modules/cash-receipt/official-receipt/entries/OfficialReceiptEntryCellControls";

type UpdateOfficialReceiptEntry = (
  rowId: string,
  updates: Partial<OfficialReceiptLineEntry>,
) => void;

export function createOfficialReceiptCollectionColumns(
  isReadonly: boolean,
  onUpdateEntry: UpdateOfficialReceiptEntry,
  columnOrder: OfficialReceiptCollectionColumnId[],
  visibleColumnIds: readonly OfficialReceiptCollectionColumnId[],
  columnLabels: Record<OfficialReceiptCollectionColumnId, string>,
  columnWidths: Record<OfficialReceiptCollectionColumnId, number>,
): ModuleDataEntryColumn<OfficialReceiptLineEntry>[] {
  return columnOrder
    .filter((columnId) => visibleColumnIds.includes(columnId))
    .map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !OfficialReceiptCollectionProtectedColumnIds.has(columnId),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
      renderCell: (row) => renderCollectionCell(row, columnId, isReadonly, onUpdateEntry),
    }));
}

export function createOfficialReceiptAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: UpdateOfficialReceiptEntry,
  columnOrder: OfficialReceiptAccountingColumnId[],
  visibleColumnIds: readonly OfficialReceiptAccountingColumnId[],
  columnLabels: Record<OfficialReceiptAccountingColumnId, string>,
  columnWidths: Record<OfficialReceiptAccountingColumnId, number>,
): ModuleDataEntryColumn<OfficialReceiptLineEntry>[] {
  return columnOrder
    .filter((columnId) => visibleColumnIds.includes(columnId))
    .map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !OfficialReceiptAccountingProtectedColumnIds.has(columnId),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
      renderCell: (row) => renderAccountingCell(row, columnId, isReadonly, onUpdateEntry),
    }));
}

function renderCollectionCell(
  row: OfficialReceiptLineEntry,
  columnId: OfficialReceiptCollectionColumnId,
  isReadonly: boolean,
  onUpdateEntry: UpdateOfficialReceiptEntry,
) {
  switch (columnId) {
    case "collectionType":
      return (
        <OfficialReceiptEntryDropdown
          options={OfficialReceiptCollectionTypeOptions}
          placeholder="Enter collection type"
          readOnly={isReadonly}
          value={row.collectionType}
          onChange={(collectionType) => onUpdateEntry(row.id, { collectionType })}
        />
      );
    case "grossReceipt":
      return (
        <OfficialReceiptEntryAmountInput
          value={row.grossReceipt}
          readOnly={isReadonly}
          onValueChange={(grossReceipt) => onUpdateEntry(row.id, { grossReceipt })}
        />
      );
    case "netOfVat":
      return <OfficialReceiptEntryReadOnlyAmount value={calculateOfficialReceiptNetOfVat(row)} />;
    case "vatType":
      return (
        <OfficialReceiptEntryDropdown
          options={OfficialReceiptVatTypeOptions}
          placeholder="Select VAT type"
          readOnly={isReadonly}
          value={row.vatType}
          onChange={(vatType) => onUpdateEntry(row.id, { vatType })}
        />
      );
    case "vatPercent":
      return (
        <OfficialReceiptEntryPercentInput
          value={row.vatPercent}
          readOnly={isReadonly}
          onValueChange={(vatPercent) => onUpdateEntry(row.id, { vatPercent })}
        />
      );
    case "vatAmount":
      return <OfficialReceiptEntryReadOnlyAmount value={calculateOfficialReceiptVatAmount(row)} />;
    case "cwtCode":
      return (
        <OfficialReceiptEntryDropdown
          options={OfficialReceiptCwtCodeOptions}
          placeholder="Select CWT code"
          readOnly={isReadonly}
          value={row.cwtCode}
          onChange={(cwtCode) => onUpdateEntry(row.id, { cwtCode })}
        />
      );
    case "cwtPercent":
      return (
        <OfficialReceiptEntryPercentInput
          value={row.cwtPercent}
          readOnly={isReadonly}
          onValueChange={(cwtPercent) => onUpdateEntry(row.id, { cwtPercent })}
        />
      );
    case "cwtAmount":
      return <OfficialReceiptEntryReadOnlyAmount value={calculateOfficialReceiptCwtAmount(row)} />;
    case "totalReceived":
      return <OfficialReceiptEntryReadOnlyAmount value={calculateOfficialReceiptTotalReceived(row)} />;
    case "partyCode":
      return (
        <OfficialReceiptEntryInput
          value={row.partyCode}
          readOnly={isReadonly}
          onChange={(partyCode) => onUpdateEntry(row.id, { partyCode })}
        />
      );
    case "partyName":
      return (
        <OfficialReceiptEntryInput
          value={row.partyName || row.customerName}
          readOnly={isReadonly}
          onChange={(partyName) => onUpdateEntry(row.id, { partyName, customerName: partyName })}
        />
      );
    case "particulars":
      return (
        <OfficialReceiptEntryInput
          value={row.particulars}
          readOnly={isReadonly}
          onChange={(particulars) => onUpdateEntry(row.id, { particulars })}
        />
      );
    case "responsibilityCenter":
      return (
        <OfficialReceiptEntryInput
          value={row.responsibilityCenter}
          readOnly={isReadonly}
          onChange={(responsibilityCenter) => onUpdateEntry(row.id, { responsibilityCenter })}
        />
      );
    case "referenceNo":
      return (
        <OfficialReceiptEntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      );
  }
}

function renderAccountingCell(
  row: OfficialReceiptLineEntry,
  columnId: OfficialReceiptAccountingColumnId,
  isReadonly: boolean,
  onUpdateEntry: UpdateOfficialReceiptEntry,
) {
  switch (columnId) {
    case "accountCode":
      return (
        <OfficialReceiptEntryInput
          value={row.accountCode}
          readOnly={isReadonly}
          onChange={(accountCode) => onUpdateEntry(row.id, { accountCode })}
        />
      );
    case "accountTitle":
      return (
        <OfficialReceiptEntryInput
          value={row.accountTitle}
          readOnly={isReadonly}
          onChange={(accountTitle) => onUpdateEntry(row.id, { accountTitle })}
        />
      );
    case "partyCode":
      return (
        <OfficialReceiptEntryInput
          value={row.partyCode}
          readOnly={isReadonly}
          onChange={(partyCode) => onUpdateEntry(row.id, { partyCode })}
        />
      );
    case "partyName":
      return (
        <OfficialReceiptEntryInput
          value={row.partyName || row.customerName}
          readOnly={isReadonly}
          onChange={(partyName) => onUpdateEntry(row.id, { partyName, customerName: partyName })}
        />
      );
    case "particulars":
      return (
        <OfficialReceiptEntryInput
          value={row.particulars}
          readOnly={isReadonly}
          onChange={(particulars) => onUpdateEntry(row.id, { particulars })}
        />
      );
    case "vatType":
      return (
        <OfficialReceiptEntryInput
          value={row.vatType}
          readOnly={isReadonly}
          onChange={(vatType) => onUpdateEntry(row.id, { vatType })}
        />
      );
    case "cwtCode":
      return (
        <OfficialReceiptEntryInput
          value={row.cwtCode}
          readOnly={isReadonly}
          onChange={(cwtCode) => onUpdateEntry(row.id, { cwtCode })}
        />
      );
    case "responsibilityCenter":
      return (
        <OfficialReceiptEntryInput
          value={row.responsibilityCenter}
          readOnly={isReadonly}
          onChange={(responsibilityCenter) => onUpdateEntry(row.id, { responsibilityCenter })}
        />
      );
    case "referenceNo":
      return (
        <OfficialReceiptEntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      );
    case "debit":
      return <OfficialReceiptEntryReadOnlyAmount value={parseMoneyNumberInput(row.debit)} />;
    case "credit":
      return <OfficialReceiptEntryReadOnlyAmount value={parseMoneyNumberInput(row.credit)} />;
  }
}
