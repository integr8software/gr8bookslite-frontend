import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberManagementCompanyPage } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementCompanyPage";

export const metadata: Metadata = {
	title: `Billing & Invoices | ${AppName}`,
	description: `View subscriber company billing and invoices for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
	searchParams: Promise<{ companyId?: string | string[] }>;
};

export default async function Page({ params, searchParams }: PageProps) {
	const { recordId } = await params;
	const { companyId } = await searchParams;
	const selectedCompanyId = Array.isArray(companyId) ? companyId[0] : companyId;

	return (
		<MasterSubscriberManagementCompanyPage
			companyId={selectedCompanyId}
			recordId={recordId}
			section="billing-and-invoices"
		/>
	);
}
