import type { Metadata } from "next";
import { CashVoucherOverviewPage } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/overview/CashVoucherOverviewPage";

const PageTitle = "Cash Voucher";

export const metadata: Metadata = { title: PageTitle };

export default function Page() {
  return <CashVoucherOverviewPage />;
}
