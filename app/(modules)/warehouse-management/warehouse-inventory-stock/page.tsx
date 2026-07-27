import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseInventoryStockListPage } from "@/app/src/ui/modules/warehouse-management/warehouse-inventory-stock/WarehouseInventoryStockListPage";

const PageTitle = "Warehouse Inventory Stock";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseInventoryStockPage() {
	return <WarehouseInventoryStockListPage />;
}
