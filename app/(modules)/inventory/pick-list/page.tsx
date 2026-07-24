import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PickListOverviewPage } from "@/app/src/ui/modules/inventory/pick-list/overview/PickListOverviewPage";

const PageTitle = "Pick List";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryPickListPage() {
  return <PickListOverviewPage />;
}


