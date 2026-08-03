import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ItemsFormPage } from "@/app/src/ui/modules/item-management/items/ItemsFormPage";

const PageTitle = "Add Item";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemsAddPage() {
  return <ItemsFormPage />;
}
