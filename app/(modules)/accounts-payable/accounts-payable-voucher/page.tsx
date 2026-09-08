import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { AccountsPayableVoucherListPage } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/overview/AccountsPayableVoucherListPage";
import type { Metadata } from "next";

const PageTitle = "Accounts Payable Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function AccountsPayableAccountsPayableVoucherPage() {
  return <AccountsPayableVoucherListPage />;
}


