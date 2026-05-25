import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Support Tickets | ${AppName}`,
	description: `Master support tickets for ${AppName}.`,
};

export default function MasterSupportTicketsPage() {
	return <MasterPreviewPage pageKey="supportTickets" />;
}
