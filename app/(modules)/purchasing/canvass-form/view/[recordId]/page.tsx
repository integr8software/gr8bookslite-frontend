import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CanvassFormAction } from "@/app/src/ui/modules/purchasing/canvass-form/Action";

const PageTitle = "View Canvass Form";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingCanvassFormViewPage() {
  return <CanvassFormAction />;
}


