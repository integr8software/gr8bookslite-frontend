import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterInvoiceListPage } from "@/app/src/ui/master/invoices/MasterInvoiceListPage";

export const metadata: Metadata = {
	title: `Revenue & Transactions | ${AppName}`,
	description: `Master platform revenue and transactions ledger for ${AppName}.`,
};

export default function Page() {
	return <MasterInvoiceListPage />;
}

