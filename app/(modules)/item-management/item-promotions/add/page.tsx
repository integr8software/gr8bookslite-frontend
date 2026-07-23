import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemPromotionsFormPage } from "@/app/src/ui/modules/item-management/item-promotions/ItemPromotionsFormPage";

const PageTitle = "Add Item Promotion";

export const metadata: Metadata = {
    title: `${PageTitle} | ${AppName}`,
    description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemPromotionAddPage() {
    return <ItemPromotionsFormPage />;
}
