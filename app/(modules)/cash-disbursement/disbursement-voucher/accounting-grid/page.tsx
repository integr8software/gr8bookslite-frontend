import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DisbursementVoucherEntryImportPage } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/import/DisbursementVoucherEntryImportPage";

const PageTitle = "Accounting Grid View";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementDisbursementVoucherAccountingGridPage() {
  return <DisbursementVoucherEntryImportPage />;
}
