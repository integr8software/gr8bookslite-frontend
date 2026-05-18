import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { AdvancesToSupplierAction } from "@/app/src/ui/modules/cash-disbursement/advances-to-supplier/Action";

const PageTitle = "Edit Advances To Supplier";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementAdvancesToSupplierEditPage() {
  return <AdvancesToSupplierAction />;
}


