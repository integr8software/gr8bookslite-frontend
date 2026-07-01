import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MaterialRequestMain } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestMain";

const PageTitle = "Material Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryMaterialRequestPage() {
  return <MaterialRequestMain />;
}


