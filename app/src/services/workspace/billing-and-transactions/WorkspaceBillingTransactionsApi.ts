import { WorkspaceBillingTransactionsMockPayload } from "@/app/src/data/workspace/billing-and-transactions/WorkspaceBillingTransactionsData";

export async function GetWorkspaceBillingTransactions() {
	return Promise.resolve(WorkspaceBillingTransactionsMockPayload);
}
