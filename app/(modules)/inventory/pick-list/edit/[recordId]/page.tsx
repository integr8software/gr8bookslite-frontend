import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PickListActionPage } from "@/app/src/ui/modules/inventory/pick-list/PickListActionPage";

const PageTitle = "Edit Pick List";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryPickListEditPage() {
  return <PickListActionPage />;
}


