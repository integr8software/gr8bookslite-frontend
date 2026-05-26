import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ItemCategoryFormPage } from "@/app/src/ui/modules/maintenance/item-management/item-category/ItemCategoryFormPage";

const PageTitle = "Edit Item Category";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemCategoryEditPage() {
  return <ItemCategoryFormPage />;
}


