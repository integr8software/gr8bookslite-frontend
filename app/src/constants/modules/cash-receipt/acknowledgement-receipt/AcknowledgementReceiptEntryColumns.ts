import type { AcknowledgementReceiptEntryView } from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";

export const AcknowledgementReceiptCollectionColumnIds = [
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

export type AcknowledgementReceiptCollectionColumnId = (typeof AcknowledgementReceiptCollectionColumnIds)[number];

export const AcknowledgementReceiptCollectionProtectedColumnIds = new Set<AcknowledgementReceiptCollectionColumnId>([
  "collectionType",
  "grossReceipt",
  "netOfVat",
  "vatAmount",
  "cwtAmount",
]);

export const AcknowledgementReceiptCollectionDefaultVisibleColumnIds = [
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
] as const satisfies readonly AcknowledgementReceiptCollectionColumnId[];

export const AcknowledgementReceiptCollectionColumnLabels: Record<AcknowledgementReceiptCollectionColumnId, string> = {
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

export const AcknowledgementReceiptCollectionColumnWidths: Record<AcknowledgementReceiptCollectionColumnId, number> = {
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

export const AcknowledgementReceiptAccountingColumnIds = [
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

export type AcknowledgementReceiptAccountingColumnId = (typeof AcknowledgementReceiptAccountingColumnIds)[number];

export const AcknowledgementReceiptAccountingProtectedColumnIds = new Set<AcknowledgementReceiptAccountingColumnId>([
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "particulars",
]);

export const AcknowledgementReceiptAccountingDefaultVisibleColumnIds = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "particulars",
] as const satisfies readonly AcknowledgementReceiptAccountingColumnId[];

export const AcknowledgementReceiptAccountingColumnLabels: Record<AcknowledgementReceiptAccountingColumnId, string> = {
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

export const AcknowledgementReceiptAccountingColumnWidths: Record<AcknowledgementReceiptAccountingColumnId, number> = {
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

export const AcknowledgementReceiptCollectionEntryView: AcknowledgementReceiptEntryView = "collection";
export const AcknowledgementReceiptAccountingEntryView: AcknowledgementReceiptEntryView = "accounting";
