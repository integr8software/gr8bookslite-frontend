import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ApprovalTransactions } from "@/app/src/ui/modules/approval-management/approval-transactions/ApprovalTransactions";

const PageTitle = "Approval Transactions";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ApprovalTransactionsPage() {
  return <ApprovalTransactions />;
}
