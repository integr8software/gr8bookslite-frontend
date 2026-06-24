import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemCategoryListPage } from "@/app/src/ui/modules/maintenance/item-management/item-category/ItemCategoryListPage";

const PageTitle = "Item Category";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemCategoryPage() {
  return <ItemCategoryListPage />;
}


