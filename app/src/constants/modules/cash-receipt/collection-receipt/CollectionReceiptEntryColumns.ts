import type { CollectionReceiptEntryView } from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";

export const CollectionReceiptCollectionColumnIds = [
  "collectionType",
  "grossReceipt",
  "netOfVat",
  "vatType",
  "vatPercent",
  "vatAmount",
  "cwtCode",
  "cwtPercent",
  "cwtAmount",
  "totalReceived",
  "partyCode",
  "partyName",
  "particulars",
  "responsibilityCenter",
  "referenceNo",
] as const;

export type CollectionReceiptCollectionColumnId = (typeof CollectionReceiptCollectionColumnIds)[number];

export const CollectionReceiptCollectionProtectedColumnIds = new Set<CollectionReceiptCollectionColumnId>([
  "collectionType",
  "grossReceipt",
  "netOfVat",
  "vatAmount",
  "cwtAmount",
]);

export const CollectionReceiptCollectionDefaultVisibleColumnIds = [
  "collectionType",
  "grossReceipt",
  "netOfVat",
  "vatAmount",
  "cwtAmount",
  "totalReceived",
  "partyName",
  "particulars",
  "responsibilityCenter",
  "referenceNo",
] as const satisfies readonly CollectionReceiptCollectionColumnId[];

export const CollectionReceiptCollectionColumnLabels: Record<CollectionReceiptCollectionColumnId, string> = {
  collectionType: "Collection Type",
  grossReceipt: "Gross Receipt",
  netOfVat: "Net of VAT",
  vatType: "VAT Type",
  vatPercent: "VAT %",
  vatAmount: "VAT Amount",
  cwtCode: "CWT Code",
  cwtPercent: "CWT %",
  cwtAmount: "CWT Amount",
  totalReceived: "Total Received",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Particulars",
  responsibilityCenter: "Responsibility Center",
  referenceNo: "Reference No",
};

export const CollectionReceiptCollectionColumnWidths: Record<CollectionReceiptCollectionColumnId, number> = {
  collectionType: 190,
  grossReceipt: 150,
  netOfVat: 150,
  vatType: 170,
  vatPercent: 120,
  vatAmount: 150,
  cwtCode: 140,
  cwtPercent: 120,
  cwtAmount: 150,
  totalReceived: 160,
  partyCode: 140,
  partyName: 190,
  particulars: 220,
  responsibilityCenter: 190,
  referenceNo: 160,
};

export const CollectionReceiptAccountingColumnIds = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
  "vatType",
  "cwtCode",
  "responsibilityCenter",
  "referenceNo",
] as const;

export type CollectionReceiptAccountingColumnId = (typeof CollectionReceiptAccountingColumnIds)[number];

export const CollectionReceiptAccountingProtectedColumnIds = new Set<CollectionReceiptAccountingColumnId>([
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "particulars",
]);

export const CollectionReceiptAccountingDefaultVisibleColumnIds = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "particulars",
] as const satisfies readonly CollectionReceiptAccountingColumnId[];

export const CollectionReceiptAccountingColumnLabels: Record<CollectionReceiptAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Particulars",
  vatType: "VAT Type",
  cwtCode: "CWT Code",
  responsibilityCenter: "Responsibility Center",
  referenceNo: "Reference No",
  debit: "Debit",
  credit: "Credit",
};

export const CollectionReceiptAccountingColumnWidths: Record<CollectionReceiptAccountingColumnId, number> = {
  accountCode: 160,
  accountTitle: 260,
  partyCode: 150,
  partyName: 190,
  particulars: 300,
  vatType: 170,
  cwtCode: 140,
  responsibilityCenter: 190,
  referenceNo: 160,
  debit: 160,
  credit: 160,
};

export const CollectionReceiptCollectionEntryView: CollectionReceiptEntryView = "collection";
export const CollectionReceiptAccountingEntryView: CollectionReceiptEntryView = "accounting";
