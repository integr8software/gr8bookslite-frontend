import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MaterialRequestActionPage } from "@/app/src/ui/modules/inventory/material-request/action/MaterialRequestActionPage";

const PageTitle = "Add Material Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryMaterialRequestAddPage() {
  return <MaterialRequestActionPage />;
}


