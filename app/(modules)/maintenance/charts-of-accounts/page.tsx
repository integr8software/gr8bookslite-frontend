import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ChartsOfAccountsListPage } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsListPage";

const PageTitle = "Charts Of Accounts";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function ChartsOfAccountsPage() {
	return <ChartsOfAccountsListPage />;
}
