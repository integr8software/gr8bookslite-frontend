import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ItemSubcategoryListPage } from "@/app/src/ui/modules/maintenance/item-management/item-subcategory/ItemSubcategoryListPage";

const PageTitle = "Item Subcategory";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemSubcategoryPage() {
  return <ItemSubcategoryListPage />;
}


