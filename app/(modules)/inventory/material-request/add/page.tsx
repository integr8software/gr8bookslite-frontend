import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { MaterialRequestActionPage } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestActionPage";

const PageTitle = "Add Material Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryMaterialRequestAddPage() {
  return <MaterialRequestActionPage />;
}


