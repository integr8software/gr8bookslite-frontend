import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { CanvassFormAction } from "@/app/src/ui/modules/purchasing/canvass-form/Action";

const PageTitle = "Edit Canvass Form";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingCanvassFormEditPage() {
  return <CanvassFormAction />;
}


