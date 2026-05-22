import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { DisbursementVoucherAction } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/Action";

const PageTitle = "View Disbursement Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementDisbursementVoucherViewPage() {
  return <DisbursementVoucherAction />;
}


