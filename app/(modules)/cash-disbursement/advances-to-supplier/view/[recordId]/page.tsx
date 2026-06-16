import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { AdvancesToSupplierActionPage } from "@/app/src/ui/modules/cash-disbursement/advances-to-supplier/AdvancesToSupplierActionPage";

const PageTitle = "View Advances To Supplier";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementAdvancesToSupplierViewPage() {
  return <AdvancesToSupplierActionPage />;
}


