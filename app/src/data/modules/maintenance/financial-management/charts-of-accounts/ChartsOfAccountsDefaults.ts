import type {
  BankDetails,
  ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";

export const EmptyBankDetails: BankDetails = {
  bankName: "",
  bankAccountNumber: "",
  branch: "",
  swiftCode: "",
  currency: "PHP",
  accountType: "Checking",
  openingBalance: "0.00",
  openingBalanceDate: "2026-01-01",
  contactPerson: "",
  contactNumber: "",
};

export const EmptyAccountFormValues: ChartAccountFormValues = {
  accountNumber: "",
  accountName: "",
  accountLevel: "SPECIFIC",
  parentId: null,
  accountType: "",
  statementGroup: "Balance Sheet",
  statementSection: "",
  normalBalance: "",
  description: "",
  status: "Active",
  showInReports: true,
  isPostingAccount: true,
  bankDetails: EmptyBankDetails,
};
