import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ItemTypeListPage } from "@/app/src/ui/modules/maintenance/item-management/item-type/ItemTypeListPage";

const PageTitle = "Item Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ItemTypePage() {
  return <ItemTypeListPage />;
}


