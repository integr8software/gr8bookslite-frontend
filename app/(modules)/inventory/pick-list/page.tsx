import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PickListMain } from "@/app/src/ui/modules/inventory/pick-list/Main";

const PageTitle = "Pick List";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryPickListPage() {
  return <PickListMain />;
}


