import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemBundlesAction } from "@/app/src/ui/modules/maintenance/item-management/item-bundles/ItemBundlesAction";

const PageTitle = "Edit Item Bundles";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemBundlesEditPage() {
    return <ItemBundlesAction />;
}
