import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CanvassFormActionPage } from "@/app/src/ui/modules/purchasing/canvass-form/action/CanvassFormActionPage";

const PageTitle = "Add Canvass Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingCanvassFormAddPage() {
  return <CanvassFormActionPage />;
}


