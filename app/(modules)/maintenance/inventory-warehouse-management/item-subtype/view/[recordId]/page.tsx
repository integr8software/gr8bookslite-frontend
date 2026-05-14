import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemSubtypeAction } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-subtype/Action";

const PageTitle = "View Item Subtype";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemSubtypeViewPage() {
  return <InventoryWarehouseManagementItemSubtypeAction />;
}


