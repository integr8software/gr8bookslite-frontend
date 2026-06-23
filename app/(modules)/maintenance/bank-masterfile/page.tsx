import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { BankMasterfileListPage } from "@/app/src/ui/modules/maintenance/financial-management/bank-masterfile/BankMasterfileListPage";

const PageTitle = "Bank Masterfile";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceBankMasterfilePage() {
  return <BankMasterfileListPage />;
}
