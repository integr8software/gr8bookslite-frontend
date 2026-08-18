import type { Metadata } from "next";
import { CashVoucherActionPage } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherActionPage";

const PageTitle = "Edit Cash Voucher";

export const metadata: Metadata = { title: PageTitle };

export default function Page() {
  return <CashVoucherActionPage />;
}
