import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { AccountsPayableVoucherFormPage } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/form/AccountsPayableVoucherFormPage";
import type { Metadata } from "next";

const PageTitle = "Add Accounts Payable Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function AccountsPayableAccountsPayableVoucherAddPage() {
  return <AccountsPayableVoucherFormPage />;
}


