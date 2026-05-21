import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ChartsOfAccountsAction } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsAction";

const PageTitle = "Edit Charts Of Accounts";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function ChartsOfAccountsEditPage() {
	return <ChartsOfAccountsAction />;
}
