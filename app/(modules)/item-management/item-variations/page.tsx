import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemVariationsListPage } from "@/app/src/ui/modules/item-management/item-variations/ItemVariationsListPage";

const PageTitle = "Item Variations";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemVariationsPage() {
  return <ItemVariationsListPage />;
}
