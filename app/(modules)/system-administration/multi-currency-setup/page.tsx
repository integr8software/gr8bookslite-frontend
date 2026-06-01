import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MultiCurrencySetupListPage } from "@/app/src/ui/modules/system-administration/multi-currency-setup/MultiCurrencySetupListPage";

const PageTitle = "Multi-Currency Setup";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationMultiCurrencySetupPage() {
	return <MultiCurrencySetupListPage />;
}
