import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemManagementAction } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-management/Action";

const PageTitle = "View Item Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemManagementViewPage() {
  return <InventoryWarehouseManagementItemManagementAction />;
}


