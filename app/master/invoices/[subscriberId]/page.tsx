import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterInvoiceSubscriberPage } from "@/app/src/ui/master/invoices/MasterInvoiceSubscriberPage";

export const metadata: Metadata = {
	title: `Subscriber Ledger | ${AppName}`,
	description: `Master subscriber revenue and transaction ledger for ${AppName}.`,
};

export default async function Page({
	params,
}: {
	params: Promise<{ subscriberId: string }>;
}) {
	const resolvedParams = await params;
	return <MasterInvoiceSubscriberPage subscriberId={resolvedParams.subscriberId} />;
}
