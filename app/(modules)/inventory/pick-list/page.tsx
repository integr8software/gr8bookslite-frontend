import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PickListListPage } from "@/app/src/ui/modules/inventory/pick-list/PickListListPage";

const PageTitle = "Pick List";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryPickListPage() {
  return <PickListListPage />;
}


