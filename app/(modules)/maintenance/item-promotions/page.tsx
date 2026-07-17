import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemPromotionsListPage } from "@/app/src/ui/modules/maintenance/item-promotions/ItemPromotionsListPage";

const PageTitle = "Item Promotions";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemPromotionsPage() {
    return <ItemPromotionsListPage />;
}
