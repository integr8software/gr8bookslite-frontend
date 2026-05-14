import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { SalesJournalAction } from "@/app/src/ui/modules/sales/sales-journal/Action";

const PageTitle = "Edit Sales Journal";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesJournalEditPage() {
  return <SalesJournalAction />;
}


