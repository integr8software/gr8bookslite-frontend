import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberManagementCompanyPage } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementCompanyPage";

export const metadata: Metadata = {
	title: `View User | ${AppName}`,
	description: `View a subscriber company user for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ companyId: string; recordId: string; userId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { companyId, recordId, userId } = await params;

	return (
		<MasterSubscriberManagementCompanyPage
			companyId={companyId}
			recordId={recordId}
			section="users"
			userDrawerMode="view"
			userId={userId}
		/>
	);
}
