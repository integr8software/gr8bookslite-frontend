import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberManagementDetailsPage } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementDetailsPage";

export const metadata: Metadata = {
	title: `View Subscriber | ${AppName}`,
	description: `View a master subscriber record for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { recordId } = await params;

	return <MasterSubscriberManagementDetailsPage recordId={recordId} />;
}
