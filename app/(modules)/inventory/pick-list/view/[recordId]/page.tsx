import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PickListAction } from "@/app/src/ui/modules/inventory/pick-list/Action";

const PageTitle = "View Pick List";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryPickListViewPage() {
  return <PickListAction />;
}


