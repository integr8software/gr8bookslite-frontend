import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ItemBundleAction } from "@/app/src/ui/modules/maintenance/item-management/item-bundle/Action";

const PageTitle = "Add Item Bundle";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemBundleAddPage() {
    return <ItemBundleAction />;
}
