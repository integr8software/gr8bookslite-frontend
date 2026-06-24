import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { TransactionNumberSetupHref } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";

const PageTitle = "View Transaction Number Setup";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationTransactionNumberSetupViewPage() {
	redirect(TransactionNumberSetupHref);
}
