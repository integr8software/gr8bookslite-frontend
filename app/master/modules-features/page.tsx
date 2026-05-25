import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Modules & Features | ${AppName}`,
	description: `Master modules and features for ${AppName}.`,
};

export default function MasterModulesFeaturesPage() {
	return <MasterPreviewPage pageKey="modulesFeatures" />;
}
