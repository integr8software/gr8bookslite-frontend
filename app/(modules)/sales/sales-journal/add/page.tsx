import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesJournalAction } from "@/app/src/ui/modules/sales/sales-journal/Action";

const PageTitle = "Add Sales Journal";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesJournalAddPage() {
  return <SalesJournalAction />;
}


