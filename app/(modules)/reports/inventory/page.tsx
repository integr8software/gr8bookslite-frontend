import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryMain } from "@/app/src/ui/modules/reports/inventory/Main";

const PageTitle = "Inventory";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsInventoryPage() {
  return <InventoryMain />;
}


