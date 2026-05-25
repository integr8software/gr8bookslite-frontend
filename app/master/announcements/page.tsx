import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Announcements | ${AppName}`,
	description: `Master announcements for ${AppName}.`,
};

export default function MasterAnnouncementsPage() {
	return <MasterPreviewPage pageKey="announcements" />;
}
