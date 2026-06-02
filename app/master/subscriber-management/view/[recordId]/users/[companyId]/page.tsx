import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberManagementCompanyPage } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementCompanyPage";

export const metadata: Metadata = {
	title: `Users | ${AppName}`,
	description: `View subscriber company users for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ companyId: string; recordId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { companyId, recordId } = await params;

	return (
		<MasterSubscriberManagementCompanyPage
			companyId={companyId}
			recordId={recordId}
			section="users"
		/>
	);
}
