import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ItemSubcategoryFormPage } from "@/app/src/ui/modules/maintenance/item-management/item-subcategory/ItemSubcategoryFormPage";

const PageTitle = "Edit Item Subcategory";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemSubcategoryEditPage() {
  return <ItemSubcategoryFormPage />;
}


