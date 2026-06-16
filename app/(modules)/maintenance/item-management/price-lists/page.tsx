import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PriceListsListPage } from "@/app/src/ui/modules/maintenance/item-management/shared/ItemManagementSupportPage";

const PageTitle = "Price Lists";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function PriceListsPage() {
	return <PriceListsListPage />;
}
