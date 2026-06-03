import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterTenantAccessActionPage } from "@/app/src/ui/master/tenant-access/MasterTenantAccessActionPage";

export const metadata: Metadata = {
	title: `Edit User | ${AppName}`,
	description: `Edit a master user record for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
	searchParams: Promise<{ from?: string | string[] }>;
};

export default async function Page({ params, searchParams }: PageProps) {
	const { recordId } = await params;
	const { from } = await searchParams;

	return (
		<MasterTenantAccessActionPage
			entity="user"
			mode="edit"
			recordId={recordId}
			returnSource={from === "view" ? "view" : "list"}
		/>
	);
}
