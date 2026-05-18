import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementWarehouseManagementAction } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/warehouse-management/Action";

const PageTitle = "Edit Warehouse Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementWarehouseManagementEditPage() {
  return <InventoryWarehouseManagementWarehouseManagementAction />;
}


