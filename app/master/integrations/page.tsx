import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Integrations | ${AppName}`,
	description: `Master integrations for ${AppName}.`,
};

export default function MasterIntegrationsPage() {
	return <MasterPreviewPage pageKey="integrations" />;
}
