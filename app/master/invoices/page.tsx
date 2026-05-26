import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterInvoiceListPage } from "@/app/src/ui/master/invoices/MasterInvoiceListPage";

export const metadata: Metadata = {
	title: `Invoices | ${AppName}`,
	description: `Master invoices for ${AppName}.`,
};

export default function Page() {
	return <MasterInvoiceListPage />;
}
