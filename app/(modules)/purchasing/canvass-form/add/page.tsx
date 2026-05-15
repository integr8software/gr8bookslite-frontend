import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { CanvassFormAction } from "@/app/src/ui/modules/purchasing/canvass-form/Action";

const PageTitle = "Add Canvass Form";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingCanvassFormAddPage() {
  return <CanvassFormAction />;
}


