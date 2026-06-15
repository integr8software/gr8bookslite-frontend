import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { DisbursementVoucherListPage } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherListPage";

const PageTitle = "Disbursement Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementDisbursementVoucherPage() {
  return <DisbursementVoucherListPage />;
}


