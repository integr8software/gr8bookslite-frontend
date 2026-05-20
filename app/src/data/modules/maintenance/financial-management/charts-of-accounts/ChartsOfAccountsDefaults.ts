import type {
	BankDetails,
	ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";

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
	parentId: null,
	accountType: "Asset",
	statementGroup: "Balance Sheet",
	statementSection: "Current Assets",
	normalBalance: "Debit",
	accountCategory: "Other",
	description: "",
	status: "Active",
	showInReports: true,
	bankDetails: EmptyBankDetails,
};
