import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ItemsFormPage } from "@/app/src/ui/modules/maintenance/item-management/items/ItemsFormPage";

const PageTitle = "View Item";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemsViewPage() {
  return <ItemsFormPage />;
}


