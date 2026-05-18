import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementWarehouseManagementAccessMain } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/warehouse-management/access/Main";

const PageTitle = "Access";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementWarehouseManagementAccessPage() {
  return <InventoryWarehouseManagementWarehouseManagementAccessMain />;
}


