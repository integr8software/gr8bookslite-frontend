import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ItemPromotionsAction } from "@/app/src/ui/modules/maintenance/item-management/item-promotions/ItemPromotionsAction";

const PageTitle = "View Item Promotion";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemPromotionViewPage() {
    return <ItemPromotionsAction />;
}
