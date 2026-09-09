import type { AccountsPayableVoucherCopyFromCandidate } from "@/app/src/services/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherApi";
import type { AdvanceToSupplierCopyFromCandidate } from "@/app/src/services/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersApi";
import type { CashAdvanceCopyFromCandidate } from "@/app/src/services/modules/cash-disbursement/cash-advance/CashAdvanceApi";
import type { PettyCashReplenishmentCopyFromCandidate } from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentApi";
import type { RevolvingFundReplenishmentCopyFromCandidate } from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentApi";
import type { JournalVoucherCopyFromCandidate } from "@/app/src/services/modules/general-journal/journal-voucher/JournalVoucherService";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";

export const PaymentVoucherCopyPrefixes = {
  AccountsPayableVoucher: "APV",
  AdvancesToSuppliers: "ATS",
  CashAdvance: "CA",
  CashAdvanceMultipleEntry: "CAME",
  JournalVoucher: "JV",
  PettyCashFund: "PCF",
  PettyCashReplenishment: "PCR",
  PettyCashVoucher: "PCV",
  PurchaseOrder: "PO",
  RevolvingFund: "RF",
  RevolvingFundReplenishment: "RFR",
} as const;

type PaymentVoucherCopyCandidate = {
  amount?: number | string | null;
  availableGrossAmount?: number | string | null;
  currency?: string | null;
  documentDate?: string;
  id: string;
  partyCode?: string | null;
  partyName?: string | null;
  remarks?: string | null;
  transactionNo: string;
};

type PaymentVoucherCopyRecordOptions<TCandidate extends PaymentVoucherCopyCandidate> = {
  candidates: TCandidate[];
  copiedReferences: Set<string>;
  prefix: string;
  source: string;
  getReferencePrefix?: (candidate: TCandidate) => string;
  getRemarks?: (candidate: TCandidate) => string;
  isAlreadyAdded?: (candidate: TCandidate) => boolean;
};

export function buildPaymentVoucherCopyFromRecords({
  accountsPayableVouchers,
  advancesToSuppliers,
  cashAdvances,
  copiedReferences,
  journalVouchers = [],
  pettyCashReplenishments,
  revolvingFundReplenishments,
}: {
  accountsPayableVouchers: AccountsPayableVoucherCopyFromCandidate[];
  advancesToSuppliers: AdvanceToSupplierCopyFromCandidate[];
  cashAdvances: CashAdvanceCopyFromCandidate[];
  copiedReferences: Set<string>;
  journalVouchers?: JournalVoucherCopyFromCandidate[];
  pettyCashReplenishments: PettyCashReplenishmentCopyFromCandidate[];
  revolvingFundReplenishments: RevolvingFundReplenishmentCopyFromCandidate[];
}): AppCopyFromRecord[] {
  return [
    ...buildCashDisbursementCopyRecordSet({
      candidates: accountsPayableVouchers,
      copiedReferences,
      getRemarks: (apv) => apv.remarks || apv.referenceNo || "",
      prefix: PaymentVoucherCopyPrefixes.AccountsPayableVoucher,
      source: "Accounts Payable Voucher",
    }),
    ...buildCashDisbursementCopyRecordSet({
      candidates: advancesToSuppliers,
      copiedReferences,
      getRemarks: (ats) => ats.remarks || ats.poReference || "",
      prefix: PaymentVoucherCopyPrefixes.AdvancesToSuppliers,
      source: "Advances to Suppliers",
    }),
    ...buildCashDisbursementCopyRecordSet({
      candidates: cashAdvances,
      copiedReferences,
      getReferencePrefix: (advance) => advance.referencePrefix,
      getRemarks: (advance) => advance.remarks || "",
      prefix: PaymentVoucherCopyPrefixes.CashAdvance,
      source: "Employee Advance",
    }),
    ...journalVouchers.map((journalVoucher) => ({
      amount: formatPaymentVoucherCopyAmount(journalVoucher.availableAmount),
      disabled: copiedReferences.has(journalVoucher.id),
      disabledReason: copiedReferences.has(journalVoucher.id) ? "Already added" : undefined,
      documentDate: journalVoucher.documentDate,
      id: journalVoucher.id,
      partyName: journalVoucher.partyName ?? undefined,
      remarks: journalVoucher.particulars ?? journalVoucher.refNo ?? undefined,
      source: "Journal Voucher",
      sourceNo: journalVoucher.id,
    })),
    ...buildCashDisbursementCopyRecordSet({
      candidates: pettyCashReplenishments,
      copiedReferences,
      prefix: PaymentVoucherCopyPrefixes.PettyCashReplenishment,
      source: "Petty Cash Replenishment",
    }),
    ...buildCashDisbursementCopyRecordSet({
      candidates: revolvingFundReplenishments,
      copiedReferences,
      prefix: PaymentVoucherCopyPrefixes.RevolvingFundReplenishment,
      source: "Revolving Fund Replenishment",
    }),
  ];
}

export function findPaymentVoucherCopyCandidates<TCandidate extends PaymentVoucherCopyCandidate>(
  candidates: TCandidate[],
  prefix: string,
  recordIds: string[],
) {
  return candidates.filter((record) => recordIds.includes(`${prefix}:${record.id}`));
}

export function validatePaymentVoucherCopySelection<TCandidate extends PaymentVoucherCopyCandidate>({
  copiedReferences,
  duplicateMessage,
  getReferencePrefix,
  mixedCurrencyMessage,
  mixedPartyMessage,
  prefix,
  records,
}: {
  copiedReferences: Set<string>;
  duplicateMessage: string;
  getReferencePrefix?: (candidate: TCandidate) => string;
  mixedCurrencyMessage: (currency: string) => string;
  mixedPartyMessage: (partyName: string) => string;
  prefix: string;
  records: TCandidate[];
}) {
  if (
    records.some((record) =>
      isPaymentVoucherCopyAlreadyAdded(record, getReferencePrefix ? getReferencePrefix(record) : prefix, copiedReferences),
    )
  ) {
    return duplicateMessage;
  }

  const firstPartyCode = records[0].partyCode?.trim() || records[0].partyName?.trim() || "";
  const hasMixedParties = records.some((record) => (record.partyCode?.trim() || record.partyName?.trim() || "") !== firstPartyCode);
  if (hasMixedParties) {
    return mixedPartyMessage(records[0].partyName || "");
  }

  const firstCurrency = (records[0].currency || "PHP").trim().toUpperCase();
  const hasMixedCurrencies = records.some((record) => (record.currency || "PHP").trim().toUpperCase() !== firstCurrency);
  if (hasMixedCurrencies) {
    return mixedCurrencyMessage(firstCurrency);
  }

  return null;
}

export function getPaymentVoucherCopyRatio(candidate: PaymentVoucherCopyCandidate) {
  const sourceAmount = Number(candidate.amount || 0);
  const availableAmount = Number(candidate.availableGrossAmount || 0);

  if (sourceAmount <= 0 || availableAmount <= 0) {
    return 1;
  }

  return Math.min(1, availableAmount / sourceAmount);
}

export function scalePaymentVoucherCopyAmount(
  value: number | string | null | undefined,
  ratio: number,
  roundAmount: (value: number) => number = roundCashDisbursementCopyAmount,
) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return roundAmount(amount * ratio);
}

export function roundCashDisbursementCopyAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatPaymentVoucherCopyAmount(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function getPaymentVoucherCopiedDisburseAmount<TEntry extends { debit?: number; taxDetails?: { amount?: number | string } }>(
  entries: TEntry[],
  isGeneratedEntry: (entry: TEntry) => boolean,
  roundAmount: (value: number) => number,
) {
  return roundAmount(
    entries
      .filter((entry) => !isGeneratedEntry(entry))
      .reduce((sum, entry) => sum + Number(entry.taxDetails?.amount ?? entry.debit ?? 0), 0),
  );
}

export function getEditablePaymentVoucherCopyEntries<TEntry extends { accountCode?: string; credit?: number; debit?: number }>(
  entries: TEntry[],
  isGeneratedEntry: (entry: TEntry) => boolean,
) {
  return entries.filter(
    (entry) => !isGeneratedEntry(entry) && (entry.accountCode || Number(entry.debit || 0) > 0 || Number(entry.credit || 0) > 0),
  );
}

export function buildCashDisbursementCopyRecordSet<TCandidate extends PaymentVoucherCopyCandidate>({
  candidates,
  copiedReferences,
  getReferencePrefix,
  getRemarks,
  isAlreadyAdded,
  prefix,
  source,
}: PaymentVoucherCopyRecordOptions<TCandidate>): AppCopyFromRecord[] {
  return candidates.map((candidate) => {
    const referencePrefix = getReferencePrefix ? getReferencePrefix(candidate) : prefix;
    const disabled = isAlreadyAdded
      ? isAlreadyAdded(candidate)
      : isPaymentVoucherCopyAlreadyAdded(candidate, referencePrefix, copiedReferences);

    return {
      amount: String(candidate.availableGrossAmount || 0),
      disabled,
      disabledReason: disabled ? "Already added" : undefined,
      documentDate: candidate.documentDate,
      id: `${prefix}:${candidate.id}`,
      partyName: candidate.partyName || "",
      remarks: getRemarks ? getRemarks(candidate) : candidate.remarks || "",
      source,
      sourceNo: candidate.transactionNo,
    };
  });
}

function isPaymentVoucherCopyAlreadyAdded(candidate: PaymentVoucherCopyCandidate, prefix: string, copiedReferences: Set<string>) {
  return (
    copiedReferences.has(`${prefix}:${candidate.transactionNo}`) ||
    copiedReferences.has(candidate.transactionNo) ||
    copiedReferences.has(candidate.id)
  );
}
