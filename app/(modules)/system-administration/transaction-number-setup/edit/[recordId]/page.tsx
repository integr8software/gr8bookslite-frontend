import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { TransactionNumberSetupFormPage } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupFormPage";

const PageTitle = "Edit Transaction Number Setup";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationTransactionNumberSetupEditPage() {
	return <TransactionNumberSetupFormPage />;
}
