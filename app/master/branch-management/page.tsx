import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Branch Management | ${AppName}`,
	description: `Master branch management for ${AppName}.`,
};

export default function MasterBranchesPage() {
	return <MasterPreviewPage pageKey="branches" />;
}
