import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemAttributesListPage } from "@/app/src/ui/modules/maintenance/item-attributes/ItemAttributesListPage";

const PageTitle = "Item Attributes";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemAttributesPage() {
	return <ItemAttributesListPage />;
}
