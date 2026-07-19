import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseItemsPage } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseItemsPage";

const PageTitle = "Warehouse Items";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseItemsRoutePage() {
  return <WarehouseItemsPage />;
}
