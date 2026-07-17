import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemBundlesFormPage } from "@/app/src/ui/modules/maintenance/item-bundles/ItemBundlesFormPage";

const PageTitle = "View Item Bundles";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemBundlesViewPage() {
    return <ItemBundlesFormPage />;
}
