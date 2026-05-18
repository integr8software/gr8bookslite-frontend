import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementWarehouseManagementAccessAction } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/warehouse-management/access/Action";

const PageTitle = "View Access";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementWarehouseManagementAccessViewPage() {
  return <InventoryWarehouseManagementWarehouseManagementAccessAction />;
}


