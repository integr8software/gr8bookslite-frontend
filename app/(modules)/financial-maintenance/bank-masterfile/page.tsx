import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BankMasterfileListPage } from "@/app/src/ui/modules/financial-maintenance/bank-masterfile/BankMasterfileListPage";

const PageTitle = "Bank Masterfile";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceBankMasterfilePage() {
  return <BankMasterfileListPage />;
}
