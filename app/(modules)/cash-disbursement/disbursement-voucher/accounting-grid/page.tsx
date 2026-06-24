import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DisbursementVoucherAccountingGridPage } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingGridPage";

const PageTitle = "Accounting Grid View";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementDisbursementVoucherAccountingGridPage() {
  return <DisbursementVoucherAccountingGridPage />;
}
