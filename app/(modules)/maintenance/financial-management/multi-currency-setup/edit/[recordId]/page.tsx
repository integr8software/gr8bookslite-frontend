import { redirect } from "next/navigation";
import { MultiCurrencySetupHref } from "@/app/src/constants/modules/system-administration/multi-currency-setup/MultiCurrencySetupConstants";

export default async function MaintenanceFinancialManagementMultiCurrencySetupEditPage({
	params,
}: {
	params: Promise<{ recordId: string }>;
}) {
	const { recordId } = await params;

	redirect(`${MultiCurrencySetupHref}/edit/${recordId}`);
}

