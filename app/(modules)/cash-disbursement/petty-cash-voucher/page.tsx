import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PettyCashVoucherListPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherListPage";

const PageTitle = "Petty Cash Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashVoucherPage() {
  return <PettyCashVoucherListPage />;
}


