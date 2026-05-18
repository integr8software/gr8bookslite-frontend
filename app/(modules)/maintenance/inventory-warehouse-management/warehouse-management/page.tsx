import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementWarehouseManagementMain } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/warehouse-management/Main";

const PageTitle = "Warehouse Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementWarehouseManagementPage() {
  return <InventoryWarehouseManagementWarehouseManagementMain />;
}


