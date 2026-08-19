import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { RevolvingFundActionPage } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundActionPage";

const PageTitle = "Edit Revolving Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRevolvingFundEditPage() {
  return <RevolvingFundActionPage mode="edit" />;
}
