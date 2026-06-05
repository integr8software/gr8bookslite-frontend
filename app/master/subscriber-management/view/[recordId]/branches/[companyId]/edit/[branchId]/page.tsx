import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberManagementCompanyPage } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementCompanyPage";

export const metadata: Metadata = {
	title: `Edit Branch | ${AppName}`,
	description: `Edit a subscriber company branch for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ branchId: string; companyId: string; recordId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { branchId, companyId, recordId } = await params;

	return (
		<MasterSubscriberManagementCompanyPage
			branchDrawerMode="edit"
			branchId={branchId}
			companyId={companyId}
			recordId={recordId}
			section="branches"
		/>
	);
}
