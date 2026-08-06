import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesJournalListPage } from "@/app/src/ui/modules/sales/sales-journal/overview/SalesJournalListPage";

const PageTitle = "Sales Journal";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesJournalPage() {
  return <SalesJournalListPage />;
}


