import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { SalesJournalMain } from "@/app/src/ui/modules/sales/sales-journal/Main";

const PageTitle = "Sales Journal";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesJournalPage() {
  return <SalesJournalMain />;
}


