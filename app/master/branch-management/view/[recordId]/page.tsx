import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterTenantAccessActionPage } from "@/app/src/ui/master/tenant-access/MasterTenantAccessActionPage";

export const metadata: Metadata = {
	title: `View Branch | ${AppName}`,
	description: `View a master branch record for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { recordId } = await params;

	return (
		<MasterTenantAccessActionPage
			entity="branch"
			mode="view"
			recordId={recordId}
		/>
	);
}
