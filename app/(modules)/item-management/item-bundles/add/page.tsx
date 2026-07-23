import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemBundlesFormPage } from "@/app/src/ui/modules/item-management/item-bundles/ItemBundlesFormPage";

const PageTitle = "Add Item Bundles";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemBundlesAddPage() {
    return <ItemBundlesFormPage />;
}
