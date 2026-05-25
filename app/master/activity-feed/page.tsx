import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Activity Feed | ${AppName}`,
	description: `Master activity feed for ${AppName}.`,
};

export default function MasterActivityFeedPage() {
	return <MasterPreviewPage pageKey="activityFeed" />;
}
