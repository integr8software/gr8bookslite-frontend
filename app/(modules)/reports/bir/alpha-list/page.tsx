import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { BirAlphaListMain } from "@/app/src/ui/modules/reports/bir/alpha-list/Main";

const PageTitle = "Alpha List";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsBirAlphaListPage() {
  return <BirAlphaListMain />;
}


