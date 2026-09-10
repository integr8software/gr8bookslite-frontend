import type { JournalVoucherCopyFromCandidate } from "@/app/src/services/modules/general-journal/journal-voucher/JournalVoucherService";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";

export const JournalVoucherCopyFromSource = "Journal Voucher";
export const JournalVoucherCopySources = ["Cash Voucher", "Disbursement Voucher"];

export function buildJournalVoucherCopyFromRecords(candidates: JournalVoucherCopyFromCandidate[]): AppCopyFromRecord[] {
  return candidates.map((candidate) => ({
    amount: formatCopyFromAmount(candidate.availableAmount),
    documentDate: candidate.documentDate,
    id: candidate.id,
    partyName: candidate.partyName ?? undefined,
    remarks: [candidate.transactionNo, candidate.particulars].filter(Boolean).join(" | ") || undefined,
    source: JournalVoucherCopyFromSource,
    sourceNo: candidate.id,
  }));
}

export function formatCopyFromAmount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
