import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseFormPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseFormPage";

const PageTitle = "View Warehouse";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseViewPage() {
  return <WarehouseFormPage />;
}


