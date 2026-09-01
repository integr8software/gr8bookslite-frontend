import { z } from "zod";
import type {
  BankReconciliationFormErrors,
  BankReconciliationFormValues,
} from "@/app/src/types/modules/cash-receipt/bank-reconciliation/BankReconciliationTypes";

export const BankReconciliationCheckingItemSchema = z.object({
  id: z.string(),
  appDate: z.string().min(1, "Date is required"),
  vceName: z.string().min(1, "Party name is required"),
  refType: z.string().min(1, "Reference type is required"),
  transNo: z.string().min(1, "Transaction number is required"),
  checkNo: z.string().optional(),
  remarks: z.string().optional().default(""),
  amount: z.number(),
  transacted: z.string().optional().default(""),
  itemType: z.enum(["deposit", "check"]),
  isCleared: z.boolean().default(false),
  isAutoMatched: z.boolean().optional(),
});

export const BankReconciliationFormSchema = z.object({
  brNo: z.string().min(1, "BR No. is required"),
  status: z.enum([
    "Open",
    "Draft",
    "For Approval",
    "Posted",
    "Disapproved",
    "Cancelled",
  ]),
  bankId: z.string().min(1, "Please select a bank account"),
  bankName: z.string().min(1, "Bank name is required"),
  accountCode: z.string().min(1, "Account code is required"),
  accountTitle: z.string().min(1, "Account title is required"),
  currency: z.string().default("PHP"),
  bookBalance: z.number(),
  bankBalance: z.number(),
  endingDate: z.string().min(1, "Ending date is required"),
  outstandingCheck: z.number().default(0),
  depositInTransit: z.number().default(0),
  adjustedBookBalance: z.number().default(0),
  adjustedBankBalance: z.number().default(0),
  variance: z.number().default(0),
  bankTemplate: z.string().optional().default(""),
  statementFileName: z.string().optional(),
  checkingItems: z.array(BankReconciliationCheckingItemSchema).default([]),
  remarks: z.string().optional().default(""),
});

export function validateBankReconciliationForm(
  values: BankReconciliationFormValues,
): {
  errors: BankReconciliationFormErrors;
  isValid: boolean;
} {
  const result = BankReconciliationFormSchema.safeParse(values);

  if (result.success) {
    return { errors: {}, isValid: true };
  }

  const errors: BankReconciliationFormErrors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as keyof BankReconciliationFormValues;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  });

  return { errors, isValid: false };
}
