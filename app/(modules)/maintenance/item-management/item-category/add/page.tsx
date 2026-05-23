import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ItemCategoryFormPage } from "@/app/src/ui/modules/maintenance/item-management/item-category/ItemCategoryFormPage";

const PageTitle = "Add Item Category";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemCategoryAddPage() {
  return <ItemCategoryFormPage />;
}


