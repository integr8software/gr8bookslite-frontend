import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { CanvassFormMain } from "@/app/src/ui/modules/purchasing/canvass-form/Main";

const PageTitle = "Canvass Form";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingCanvassFormPage() {
  return <CanvassFormMain />;
}


