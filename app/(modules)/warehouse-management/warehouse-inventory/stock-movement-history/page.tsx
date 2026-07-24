import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseStockMovementHistoryListPage } from "@/app/src/ui/modules/warehouse-management/warehouse-inventory/stock-movement-history/WarehouseStockMovementHistoryListPage";

const PageTitle = "Stock Movement History";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseInventoryStockMovementHistoryPage() {
  return <WarehouseStockMovementHistoryListPage />;
}
