import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberManagementCompanyPage } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementCompanyPage";

export const metadata: Metadata = {
	title: `Billing & Invoices | ${AppName}`,
	description: `View subscriber company billing and invoices for ${AppName}.`,
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
			section="billing-and-invoices"
		/>
	);
}
