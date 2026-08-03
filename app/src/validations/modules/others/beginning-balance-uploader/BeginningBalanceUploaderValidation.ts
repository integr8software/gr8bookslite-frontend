import { z } from "zod";
import type { BeginningBalanceUploaderRow } from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const BeginningBalanceUploaderEntrySchema = z.object({
  accntCode: requiredText("Enter an account code."),
  accntTitle: requiredText("Enter an account title."),
  partyCode: requiredText("Enter a party code."),
  partyName: requiredText("Enter a party name."),
  particulars: requiredText("Enter particulars."),
});

export function validateBeginningBalanceUploader(
  documentDate: string,
  currencyType: string,
  currencyRate: string,
  rows: BeginningBalanceUploaderRow[],
) {
  if (!documentDate) return "Select a document date.";
  if (!currencyType) return "Select a currency type.";

  const parsedCurrencyRate = Number.parseFloat(currencyRate.replace(/,/g, ""));
  if (!Number.isFinite(parsedCurrencyRate) || parsedCurrencyRate <= 0) {
    return "Enter a currency rate greater than zero.";
  }

  const populatedRows = rows.filter((row) =>
    Object.entries(row).some(([key, value]) => key !== "id" && value.trim() !== ""),
  );
  if (!populatedRows.length) return "Add at least one beginning-balance entry.";

  for (const row of populatedRows) {
    const result = BeginningBalanceUploaderEntrySchema.safeParse(row);
    if (!result.success) return `Row ${row.id}: ${result.error.issues[0]?.message}`;
    const debit = toAmount(row.debit);
    const credit = toAmount(row.credit);
    if (debit < 0 || credit < 0 || (debit > 0 && credit > 0) || (debit === 0 && credit === 0)) {
      return `Row ${row.id}: enter either a debit or a credit amount.`;
    }
  }

  const debit = populatedRows.reduce((total, row) => total + toAmount(row.debit), 0);
  const credit = populatedRows.reduce((total, row) => total + toAmount(row.credit), 0);
  return Math.abs(debit - credit) < 0.001 ? undefined : "Debit and credit totals must balance.";
}

function toAmount(value: string) {
  const amount = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}
