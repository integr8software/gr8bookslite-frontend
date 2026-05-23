import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { WarehouseFormPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseFormPage";

const PageTitle = "Add Warehouse";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseAddPage() {
  return <WarehouseFormPage />;
}


