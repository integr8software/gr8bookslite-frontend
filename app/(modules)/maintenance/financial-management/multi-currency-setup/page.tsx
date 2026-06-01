import { redirect } from "next/navigation";
import { MultiCurrencySetupHref } from "@/app/src/constants/modules/system-administration/multi-currency-setup/MultiCurrencySetupConstants";

export default function MaintenanceFinancialManagementMultiCurrencySetupPage() {
	redirect(MultiCurrencySetupHref);
}

