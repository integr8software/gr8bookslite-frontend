import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Domains & Ports | ${AppName}`,
	description: `Master domains and ports for ${AppName}.`,
};

export default function MasterDomainsPortsPage() {
	return <MasterPreviewPage pageKey="domainsPorts" />;
}
