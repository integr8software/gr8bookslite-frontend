import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Invoices | ${AppName}`,
	description: `Master invoices for ${AppName}.`,
};

export default function MasterInvoicesPage() {
	return <MasterPreviewPage pageKey="invoices" />;
}
