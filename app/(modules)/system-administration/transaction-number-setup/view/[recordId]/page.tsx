import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { TransactionNumberSetupFormPage } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupFormPage";

const PageTitle = "View Transaction Number Setup";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationTransactionNumberSetupViewPage() {
	return <TransactionNumberSetupFormPage />;
}
