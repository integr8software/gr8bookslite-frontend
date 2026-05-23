import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ItemSubtypeFormPage } from "@/app/src/ui/modules/maintenance/item-management/item-subtype/ItemSubtypeFormPage";

const PageTitle = "Edit Item Subtype";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemSubtypeEditPage() {
  return <ItemSubtypeFormPage />;
}


