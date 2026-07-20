import type {
  BankDetails,
  ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";

export const EmptyBankDetails: BankDetails = {
  bankName: "",
  bankAccountNumber: "",
  branch: "",
  currency: "PHP",
  currencyExchangeRate: "",
  accountType: "Checking",
};

export const EmptyAccountFormValues: ChartAccountFormValues = {
  accountNumber: "",
  accountName: "",
  accountLevel: "SPECIFIC",
  parentId: null,
  accountType: "",
  statementGroup: "Balance Sheet",
  statementSection: "",
  reportAlias: "",
  normalBalance: "",
  description: "",
  status: "Active",
  showInReports: true,
  isPostingAccount: true,
  isBankLinked: false,
  bankDetails: EmptyBankDetails,
};
