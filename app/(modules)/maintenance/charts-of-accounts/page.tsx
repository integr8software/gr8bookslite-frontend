import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ChartsOfAccountsMain } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsPage";

const PageTitle = "Charts Of Accounts";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function ChartsOfAccountsPage() {
	return <ChartsOfAccountsMain />;
}
