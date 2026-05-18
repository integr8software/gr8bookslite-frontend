import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { SalesJournalAction } from "@/app/src/ui/modules/sales/sales-journal/Action";

const PageTitle = "View Sales Journal";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesJournalViewPage() {
  return <SalesJournalAction />;
}


