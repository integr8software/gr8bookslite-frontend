import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { MaterialRequestAction } from "@/app/src/ui/modules/inventory/material-request/Action";

const PageTitle = "Add Material Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryMaterialRequestAddPage() {
  return <MaterialRequestAction />;
}


