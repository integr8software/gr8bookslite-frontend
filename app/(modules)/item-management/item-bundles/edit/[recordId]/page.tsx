import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemBundlesFormPage } from "@/app/src/ui/modules/item-management/item-bundles/ItemBundlesFormPage";

const PageTitle = "Edit Item Bundles";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemBundlesEditPage() {
    return <ItemBundlesFormPage />;
}
