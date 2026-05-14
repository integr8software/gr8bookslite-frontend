import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemTypeAction } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-type/Action";

const PageTitle = "Edit Item Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemTypeEditPage() {
  return <InventoryWarehouseManagementItemTypeAction />;
}


