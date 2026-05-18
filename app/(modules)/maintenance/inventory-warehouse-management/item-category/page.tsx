import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemCategoryMain } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-category/Main";

const PageTitle = "Item Category";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemCategoryPage() {
  return <InventoryWarehouseManagementItemCategoryMain />;
}


