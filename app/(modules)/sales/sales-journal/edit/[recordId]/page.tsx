import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesJournalFormPage } from "@/app/src/ui/modules/sales/sales-journal/SalesJournalFormPage";

const PageTitle = "Edit Sales Journal";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesJournalEditPage() {
  return <SalesJournalFormPage />;
}


