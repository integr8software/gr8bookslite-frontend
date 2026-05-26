import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { BirMain } from "@/app/src/ui/modules/reports/bir/Main";

const PageTitle = "BIR";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsBirPage() {
  return <BirMain />;
}


