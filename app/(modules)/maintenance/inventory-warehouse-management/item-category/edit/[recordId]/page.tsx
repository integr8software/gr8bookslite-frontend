import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemCategoryAction } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-category/Action";

const PageTitle = "Edit Item Category";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemCategoryEditPage() {
  return <InventoryWarehouseManagementItemCategoryAction />;
}


