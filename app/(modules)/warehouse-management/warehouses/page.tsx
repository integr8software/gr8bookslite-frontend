import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseListPage } from "@/app/src/ui/modules/warehouse-management/warehouses/WarehouseListPage";

const PageTitle = "Warehouse Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehousePage() {
  return <WarehouseListPage />;
}
