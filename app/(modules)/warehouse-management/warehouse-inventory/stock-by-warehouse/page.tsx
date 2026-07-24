import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseStockByWarehouseListPage } from "@/app/src/ui/modules/warehouse-management/warehouse-inventory/stock-by-warehouse/WarehouseStockByWarehouseListPage";

const PageTitle = "Stock by Warehouse";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseInventoryStockByWarehousePage() {
  return <WarehouseStockByWarehouseListPage />;
}
