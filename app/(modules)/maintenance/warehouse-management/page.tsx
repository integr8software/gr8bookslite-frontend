import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { WarehouseListPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseListPage";

const PageTitle = "Warehouse Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehousePage() {
  return <WarehouseListPage />;
}


