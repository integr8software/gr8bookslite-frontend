import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Backups | ${AppName}`,
	description: `Master backups for ${AppName}.`,
};

export default function MasterBackupsPage() {
	return <MasterPreviewPage pageKey="backups" />;
}
