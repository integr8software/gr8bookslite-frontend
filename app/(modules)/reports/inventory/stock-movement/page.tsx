import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { InventoryStockMovementMain } from "@/app/src/ui/modules/reports/inventory/stock-movement/Main";

const PageTitle = "Stock Movement";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsInventoryStockMovementPage() {
  return <InventoryStockMovementMain />;
}


