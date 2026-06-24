import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { TransactionNumberSetupHref } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";

const PageTitle = "Edit Transaction Number Setup";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationTransactionNumberSetupEditPage() {
	redirect(TransactionNumberSetupHref);
}
