import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Maintenance | ${AppName}`,
	description: `Master maintenance for ${AppName}.`,
};

export default function MasterMaintenancePage() {
	return <MasterPreviewPage pageKey="maintenance" />;
}
