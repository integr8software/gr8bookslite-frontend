import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DisbursementVoucherOverviewPage } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherOverviewPage";

const PageTitle = "Disbursement Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementDisbursementVoucherPage() {
  return <DisbursementVoucherOverviewPage />;
}


