import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemBundlesListPage } from "@/app/src/ui/modules/maintenance/item-management/item-bundles/ItemBundlesListPage";

const PageTitle = "Item Bundles";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemBundlesPage() {
    return <ItemBundlesListPage />;
}
