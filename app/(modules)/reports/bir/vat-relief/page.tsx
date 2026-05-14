import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { BirVatReliefMain } from "@/app/src/ui/modules/reports/bir/vat-relief/Main";

const PageTitle = "Vat Relief";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsBirVatReliefPage() {
  return <BirVatReliefMain />;
}


