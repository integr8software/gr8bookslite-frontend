import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { TransactionNumberSetupListPage } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupListPage";

const PageTitle = "Transaction Number Setup";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationTransactionNumberSetupPage() {
	return <TransactionNumberSetupListPage />;
}


