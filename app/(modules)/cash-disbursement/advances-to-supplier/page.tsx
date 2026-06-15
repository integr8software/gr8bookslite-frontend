import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { AdvancesToSupplierListPage } from "@/app/src/ui/modules/cash-disbursement/advances-to-supplier/AdvancesToSupplierListPage";

const PageTitle = "Advances To Supplier";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementAdvancesToSupplierPage() {
  return <AdvancesToSupplierListPage />;
}


