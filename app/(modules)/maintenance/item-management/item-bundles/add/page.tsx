import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ItemBundlesAction } from "@/app/src/ui/modules/maintenance/item-management/item-bundles/ItemBundlesAction";

const PageTitle = "Add Item Bundles";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemBundlesAddPage() {
    return <ItemBundlesAction />;
}
