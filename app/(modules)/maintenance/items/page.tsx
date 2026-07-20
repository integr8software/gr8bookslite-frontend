import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemsListPage } from "@/app/src/ui/modules/maintenance/items/ItemsListPage";

const PageTitle = "Items";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemsPage() {
  return <ItemsListPage />;
}


