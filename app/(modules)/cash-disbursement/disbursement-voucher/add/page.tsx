import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DisbursementVoucherActionPage } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherActionPage";

const PageTitle = "Add Disbursement Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementDisbursementVoucherAddPage() {
  return <DisbursementVoucherActionPage />;
}
