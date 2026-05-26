import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { InventoryItemQueryGeneratorMain } from "@/app/src/ui/modules/reports/inventory/item-query-generator/Main";

const PageTitle = "Item Query Generator";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsInventoryItemQueryGeneratorPage() {
  return <InventoryItemQueryGeneratorMain />;
}


