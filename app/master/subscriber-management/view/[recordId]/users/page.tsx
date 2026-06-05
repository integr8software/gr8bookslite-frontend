import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberManagementUsersPage } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementUsersPage";

export const metadata: Metadata = {
	title: `Users | ${AppName}`,
	description: `View all subscriber users for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { recordId } = await params;

	return <MasterSubscriberManagementUsersPage recordId={recordId} />;
}
