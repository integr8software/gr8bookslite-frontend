import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemManagementAction } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-management/Action";

const PageTitle = "Add Item Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemManagementAddPage() {
  return <InventoryWarehouseManagementItemManagementAction />;
}


