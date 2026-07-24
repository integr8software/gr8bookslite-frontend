import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CanvassFormOverviewPage } from "@/app/src/ui/modules/purchasing/canvass-form/overview/CanvassFormOverviewPage";

const PageTitle = "Canvass Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingCanvassFormPage() {
  return <CanvassFormOverviewPage />;
}


