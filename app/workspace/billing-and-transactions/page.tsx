import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WorkspaceBillingTransactionsPage } from "@/app/src/ui/workspace/billing-and-transactions/WorkspaceBillingTransactionsPage";

export const metadata: Metadata = {
	title: `Billing & Transactions | ${AppName}`,
	description: `Workspace billing summaries, invoices, payments, subscription renewals, and mock transaction history for ${AppName}.`,
};

export default function BillingAndTransactionsPage() {
	return <WorkspaceBillingTransactionsPage />;
}
