import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ItemPromotionsMain } from "@/app/src/ui/modules/maintenance/item-management/item-promotions/Main";

const PageTitle = "Item Promotions";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemPromotionsPage() {
    return <ItemPromotionsMain />;
}