import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ItemTypeFormPage } from "@/app/src/ui/modules/maintenance/item-management/item-type/ItemTypeFormPage";

const PageTitle = "View Item Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemTypeViewPage() {
  return <ItemTypeFormPage />;
}


