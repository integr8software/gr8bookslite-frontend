import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { MaterialRequestListPage } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestListPage";

const PageTitle = "Material Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryMaterialRequestPage() {
  return <MaterialRequestListPage />;
}


