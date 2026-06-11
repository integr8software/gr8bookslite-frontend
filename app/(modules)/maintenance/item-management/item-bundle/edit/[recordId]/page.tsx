import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ItemBundleAction } from "@/app/src/ui/modules/maintenance/item-management/item-bundle/Action";

const PageTitle = "Edit Item Bundle";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemBundleEditPage() {
    return <ItemBundleAction />;
}
