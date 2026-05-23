import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ItemsListPage } from "@/app/src/ui/modules/maintenance/item-management/items/ItemsListPage";

const PageTitle = "Items";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemsPage() {
  return <ItemsListPage />;
}


