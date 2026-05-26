import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Security Center | ${AppName}`,
	description: `Master security center for ${AppName}.`,
};

export default function MasterSecurityCenterPage() {
	return <MasterPreviewPage pageKey="securityCenter" />;
}
